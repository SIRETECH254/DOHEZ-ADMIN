# Create Vendor Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Wizard Configuration](#wizard-configuration)
- [Context and State Management](#context-and-state-management)
- [Tab Configuration (7 Steps)](#tab-configuration-7-steps)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)

## Imports
```tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { HiCheck, HiOutlineLocationMarker, HiOutlineClipboardCheck } from 'react-icons/hi';
import { useRegisterVendor } from '../../../tanstack/useVendors';
import { useGetVendorCategories } from '../../../tanstack/useVendorCategories';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import { useGetServices } from '../../../tanstack/useServices';
import { useSearchLocation } from '../../../tanstack/useLocations';
```

## Wizard Configuration
The form is divided into 7 distinct steps (tabs):
1. **Basic Info**: Vendor Name, Email, Phone, Details.
2. **Branding**: Logo and Cover image uploads.
3. **Location**: Address search and selection using the Location API.
4. **Ownership**: Choosing the vendor owner from system users.
5. **Business Info**: KRA PIN and Registration Number.
6. **Service & Status**: Primary Service, Category, and Active/Inactive toggle.
7. **Summary**: Final read-only review of all data before submission.

## Context and State Management

### TanStack Query

#### `useRegisterVendor`
- **Hook usage:** `const registerVendor = useRegisterVendor();`
- **Purpose:** Handles vendor registration submission.

#### `useGetVendorCategories`
- **Hook usage:** `const { data: categoriesData, ... } = useGetVendorCategories({...});`
- **Purpose:** Fetches categories for the vendor creation step.

#### `useGetAllUsers`
- **Hook usage:** `const { data: usersData, ... } = useGetAllUsers({...});`
- **Purpose:** Fetches users to assign as vendor owner.

#### `useGetServices`
- **Hook usage:** `const { data: servicesData, ... } = useGetServices({...});`
- **Purpose:** Fetches primary services for the vendor.

#### `useSearchLocation`
- **Hook usage:** `const { data: locationResults, ... } = useSearchLocation(debouncedLocationQuery);`
- **Purpose:** Powers dynamic address search.

### Local Component State

#### `activeTab` & `currentStep`
- **Purpose:** Tracks the current step in the wizard.
```tsx
const [activeTab, setActiveTab] = useState('basic');
const [currentStep, setCurrentStep] = useState(1);
```

#### `form`
- **Purpose:** Main form object storing all vendor details.
```tsx
const [form, setForm] = useState({
  userId: '',
  name: '',
  description: '',
  categoryId: '',
  serviceId: '',
  phone: '',
  email: '',
  kraPin: '',
  regNo: '',
  location: '',
  isActive: true,
});
```

#### `logo` & `cover`
- **Purpose:** Stores file objects for logo and cover image uploads.
```tsx
const [logo, setLogo] = useState<File | null>(null);
const [cover, setCover] = useState<File | null>(null);
```

#### `inlineError`
- **Purpose:** Stores local validation or API error messages.
```tsx
const [inlineError, setInlineError] = useState<string | null>(null);
```

### Search State
- **Purpose:** Manages input state and debounced values for searches (Location, Owner, Service, Category).
```tsx
const [locationQuery, setLocationQuery] = useState('');
const [ownerSearchQuery, setOwnerSearchQuery] = useState('');
const [serviceSearchQuery, setServiceSearchQuery] = useState('');
const [categorySearchQuery, setCategorySearchQuery] = useState('');
```

## Functions Involved

### `renderStepHeader()`
**purpose:** Displays the visual progress bar, current step, and step markers.

**process:**
1. Calculates the progress percentage based on the `currentStep` and `TABS` length.
2. Renders the progress bar with Tailwind CSS utilities.
3. Renders the step markers, showing completion status (checkmarks) or active state.

**function implementation:**
```tsx
  const renderStepHeader = () => {
    const progress = (currentStep / TABS.length) * 100;
    
    return (
      <div className="bg-white border-b border-gray-100 space-y-4 p-4 rounded-t-3xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-y-3">
          <div className="flex flex-row items-center gap-x-2">
            <div className="h-6 w-6 rounded-full items-center justify-center bg-brand-primary text-white text-xs font-bold flex">
              {currentStep}
            </div>
            <span className="text-sm font-semibold text-brand-primary uppercase tracking-wider">
              {TABS.find(tab => tab.key === activeTab)?.label}
            </span>
          </div>
       
          <div className="flex flex-row items-center gap-x-3 md:gap-x-5">
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              const isCompleted = currentStep > tab.step;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className="items-center flex flex-col"
                  disabled={!validateTabNavigation(tab.key)}
                  type="button"
                >
                  <div className="items-center flex flex-col">
                    <div className={`h-7 w-7 rounded-full items-center justify-center flex transition-all ${
                      isActive 
                        ? 'bg-brand-primary ring-4 ring-brand-primary/20 shadow-lg' 
                        : isCompleted 
                          ? 'bg-brand-primary/40' 
                          : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <HiCheck className="w-5 h-5 text-white" />
                      ) : (
                        <span className={`text-sm font-bold ${
                          isActive ? 'text-white' : 'text-gray-400'
                        }`}>
                          {tab.step}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };
```

### `validateTabNavigation()`
**purpose:** Determines if forward navigation is permitted based on field validation for the current step.

**process:**
1. Allows backward navigation at any time.
2. For forward steps, checks required fields in `form` (e.g., Step 1 needs name, email, phone).
3. Returns a boolean indicating if the step is valid to proceed.

**function implementation:**
```tsx
  const validateTabNavigation = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (!targetTab) return false;
    
    // Can always go back
    if (targetTab.step < currentStep) return true;
    
    // Forwards validation
    if (currentStep === 1) {
      return !!(form.name && form.email && form.phone);
    }
    if (currentStep === 4) return !!form.userId;
    if (currentStep === 6) return !!form.serviceId;
    if (currentStep === 7) return !!form.categoryId;
    
    return true;
  };
```

### `handleSubmit()`
**purpose:** Finalizes the vendor registration process by preparing `FormData` and sending it to the API.

**process:**
1. Validates all required fields before submission.
2. Prepares `FormData` from the `form` state, including image uploads.
3. Calls the `registerVendor` mutation.
4. Handles navigation on success and error display on failure.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab !== 'summary') return;
    
    setInlineError(null);

    if (!form.name || !form.userId || !form.categoryId || !form.email || !form.phone || !form.serviceId) {
      setInlineError('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'serviceId') {
        formData.append('service', String(value));
      } else {
        formData.append(key, String(value));
      }
    });
    if (logo) formData.append('logo', logo);
    if (cover) formData.append('cover', cover);

    try {
      await registerVendor.mutateAsync(formData);
      navigate('/vendors');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to register vendor';
      setInlineError(errorMessage);
    }
  }, [form, logo, cover, registerVendor, navigate, activeTab]);
```

### `handleImageChange()` / `handleCoverChange()`
**purpose:** Handles file input for logo and cover image, updates state, and generates preview URLs.

**process:**
1. Extracts the file from the input event.
2. Updates `logo` or `cover` state with the file.
3. Generates a temporary local object URL for previewing.

**function implementation:**
```tsx
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setLogo(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setCover(file);
    if (file) {
      setCoverPreviewUrl(URL.createObjectURL(file));
    } else {
      setCoverPreviewUrl(null);
    }
  };
```

### `triggerFileInput()` / `triggerCoverInput()`
**purpose:** Utility functions to programmatically trigger the hidden file input elements for logo and cover image uploads.

**function implementation:**
```tsx
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const triggerCoverInput = useCallback(() => {
    coverInputRef.current?.click();
  }, []);
```

### `handleTabChange()`
**purpose:** Changes the active wizard tab if the current step passes validation.

**process:**
1. Checks `validateTabNavigation()` for the target tab.
2. If valid, updates `activeTab` and `currentStep`.

**function implementation:**
```tsx
  const handleTabChange = (key: string) => {
    if (validateTabNavigation(key)) {
      setActiveTab(key);
      const step = TABS.find(t => t.key === key)?.step || 1;
      setCurrentStep(step);
    }
  };
```

### `goToNextStep()` / `goToPrevStep()`
**purpose:** Controls navigation between wizard steps.

**process:**
- `goToNextStep`: Finds the next tab index, validates it, and updates state. Sets `inlineError` if validation fails.
- `goToPrevStep`: Finds the previous tab index and updates state.

**function implementation:**
```tsx
  const goToNextStep = () => {
    const currentIndex = TABS.findIndex(t => t.key === activeTab);
    if (currentIndex < TABS.length - 1) {
      const nextTab = TABS[currentIndex + 1];
      if (validateTabNavigation(nextTab.key)) {
        setActiveTab(nextTab.key);
        setCurrentStep(nextTab.step);
        setInlineError(null);
      } else {
        setInlineError('Please fill in required fields to continue.');
      }
    }
  };

  const goToPrevStep = () => {
    const currentIndex = TABS.findIndex(t => t.key === activeTab);
    if (currentIndex > 0) {
      const prevTab = TABS[currentIndex - 1];
      setActiveTab(prevTab.key);
      setCurrentStep(prevTab.step);
      setInlineError(null);
    }
  };
```

## API Integration

### `POST /api/vendors/register`

#### Interface
```typescript
export interface RegisterVendorPayload {
  userId: string;
  name: string;
  description?: string;
  categoryId: string;
  phone: string;
  email: string;
  location: string;
  workingHours: string;
  logo?: File;
  banner?: File;
}
```

#### API
```typescript
export const vendorAPI = {
  // Register a new vendor profile
  registerVendor: (data: RegisterVendorPayload | FormData) => 
    api.post('/api/vendors/register', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};
```

#### Hook
```typescript
export const useRegisterVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await vendorAPI.registerVendor(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      console.log('Vendor registered successfully');
    },
    onError: (error: any) => console.error('Error registering vendor:', error),
  });
};
```

#### Contract
`data.data` contains the registered `{ vendor, branch }`.

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Vendor registered successfully",
  "data": {
    "vendor": {
      "_id": "650af1234567890abcdef999",
      "name": "Quick Laundry",
      "email": "contact@quick.com"
    },
    "branch": {
      "_id": "650af1234567890abcdef888",
      "name": "Quick Laundry - Main Branch"
    }
  }
}
```

#### Form Inputs




### `GET /api/users`

#### API
```typescript
export const userAPI = {
  // Get all users (admin)
  getAllUsers: (params?: { search?: string, limit?: number }) => api.get('/api/users', { params }),
};
```

#### Hook
```typescript
export const useGetAllUsers = (params?: { search?: string, limit?: number }) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await userAPI.getAllUsers(params);
      return response.data.data;
    },
  });
};
```

#### Contract
`data.data` contains `{ users, pagination }`.

---

### `GET /api/services`

#### API
```typescript
export const serviceAPI = {
  // Get all services
  getAllServices: (params?: { search?: string, limit?: number }) => api.get('/api/services', { params }),
};
```

#### Hook
```typescript
export const useGetServices = (params?: { search?: string, limit?: number }) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: async () => {
      const response = await serviceAPI.getAllServices(params);
      return response.data.data;
    },
  });
};
```

#### Contract
`data.data` contains `{ services, pagination }`.

---

### `GET /api/vendor-categories`

#### API
```typescript
export const vendorCategoryAPI = {
  // Get all vendor categories
  getAllVendorCategories: (params?: { search?: string, limit?: number }) => api.get('/api/vendor-categories', { params }),
};
```

#### Hook
```typescript
export const useGetVendorCategories = (params?: { search?: string, limit?: number }) => {
  return useQuery({
    queryKey: ['vendor-categories', params],
    queryFn: async () => {
      const response = await vendorCategoryAPI.getAllVendorCategories(params);
      return response.data.data;
    },
  });
};
```

#### Contract
`data.data` contains `{ categories, pagination }`.

---

### `GET /api/locations/search`

#### API
```typescript
export const locationAPI = {
  // Search for locations
  searchLocation: (query: string) => api.get(`/api/locations/search?query=${query}`),
};
```

#### Hook
```typescript
export const useSearchLocation = (query: string) => {
  return useQuery({
    queryKey: ['location', query],
    queryFn: async () => {
      const response = await locationAPI.searchLocation(query);
      return response.data.data;
    },
    enabled: !!query,
  });
};
```

#### Contract
`data.data` contains an array of `ILocationResult`.


## UI Structure
- **Screen Shell:** Max-width container (`max-w-5xl`) centered on the page.
- **Wizard Card:** A large white card containing the stepper header and step content.
- **Progress Tracking:** A persistent header showing current step label and a % progress bar.
- **Animations:** Tabs use `animate-fadeIn` for smooth transitions.

## Planned Layout (Wizard)
```
┌──────────────────────────────────────────────────┐
│ [<-] Back to Vendors                             │
│ Register New Vendor           Step 1 of 7        │
├──────────────────────────────────────────────────┤
│ (1)---(2)---(3)---(4)---(5)---(6)---(7)          │
│ [=========== Progress 15% ===========]          │
├──────────────────────────────────────────────────┤
│                                                  │
│          [ Step-Specific Content ]               │
│                                                  │
├──────────────────────────────────────────────────┤
│ [ Previous ]                     [ Continue ]    │
└──────────────────────────────────────────────────┘
```

## Form Inputs

### `Vendor Name Field`
**Purpose**: Collects the name of the new vendor business.
**Applicable**: Required field.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={form.name} 
  onChange={(e) => setForm({...form, name: e.target.value})} 
  className="input" 
  placeholder="e.g. Quick Laundry" 
  required 
/>
```

### `Email Field`
**Purpose**: Collects the official contact email for the vendor.
**Applicable**: Required field, type email validation.

**Input implementation**:
```tsx
<input 
  type="email" 
  value={form.email} 
  onChange={(e) => setForm({...form, email: e.target.value})} 
  className="input" 
  placeholder="contact@example.com" 
  required 
/>
```

### `Phone Field`
**Purpose**: Collects the official contact phone number for the vendor.
**Applicable**: Required field.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={form.phone} 
  onChange={(e) => setForm({...form, phone: e.target.value})} 
  className="input" 
  placeholder="+254..." 
  required 
/>
```

### `Description Field`
**Purpose**: Collects a detailed description of vendor services.
**Applicable**: Optional field, text area for longer content.

**Input implementation**:
```tsx
<textarea 
  value={form.description} 
  onChange={(e) => setForm({...form, description: e.target.value})} 
  className="input min-h-[100px] py-3" 
  placeholder="Describe the vendor..." 
/>
```

### `Location Search Input`
**Purpose**: Used to search for a physical address via the Location API.
**Applicable**: Updates `locationQuery` which triggers a debounced API call.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={locationQuery} 
  onChange={(e) => setLocationQuery(e.target.value)} 
  className="input pr-10" 
  placeholder="Type to search address..." 
/>
```

### `Owner Search Input`
**Purpose**: Searches the user database to find a profile to link as the vendor owner.
**Applicable**: Updates `ownerSearchQuery` which triggers a debounced user search.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={ownerSearchQuery} 
  onChange={(e) => setOwnerSearchQuery(e.target.value)} 
  className="input pr-10" 
  placeholder="Search by name or email..." 
/>
```

### `KRA PIN Field`
**Purpose**: Collects the Kenya Revenue Authority PIN for business verification.
**Applicable**: Optional business detail field.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={form.kraPin} 
  onChange={(e) => setForm({...form, kraPin: e.target.value})} 
  className="input" 
  placeholder="e.g. A012345678X" 
/>
```

### `Registration Number Field`
**Purpose**: Collects the business registration number.
**Applicable**: Optional business detail field.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={form.regNo} 
  onChange={(e) => setForm({...form, regNo: e.target.value})} 
  className="input" 
  placeholder="e.g. CPR/2024/123456" 
/>
```

### `Service Search Input`
**Purpose**: Searches for a primary service to associate with the vendor.
**Applicable**: Updates `serviceSearchQuery` which triggers a debounced service search.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={serviceSearchQuery} 
  onChange={(e) => setServiceSearchQuery(e.target.value)} 
  className="input pr-10" 
  placeholder="Search for a service..." 
/>
```

### `Category Search Input`
**Purpose**: Searches for a vendor category to associate with the vendor.
**Applicable**: Updates `categorySearchQuery` which triggers a debounced category search.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={categorySearchQuery} 
  onChange={(e) => setCategorySearchQuery(e.target.value)} 
  className="input pr-10" 
  placeholder="Search for a category..." 
/>
```

### `Account Status Toggle`
**Purpose**: Determines if the vendor account is active upon creation.
**Applicable**: Boolean toggle switch.

**Input implementation**:
```tsx
<input 
  type="checkbox" 
  checked={form.isActive} 
  onChange={(e) => setForm({...form, isActive: e.target.checked})} 
  className="sr-only peer" 
/>
```

### `Image Uploads (Logo & Cover)`
**Purpose**: Handles file upload for vendor branding assets.
**Applicable**: Uses `ref` to link to visual buttons.

**Input implementation**:
```tsx
<input 
  type="file" 
  ref={fileInputRef} 
  onChange={handleImageChange} 
  accept="image/*" 
  className="hidden" 
/>
<input 
  type="file" 
  ref={coverInputRef} 
  onChange={handleCoverChange} 
  accept="image/*" 
  className="hidden" 
/>
```

## Error Handling
- **Validation Banners:** Shows an inline error with a shake animation if validation fails.
- **API Feedback:** Displays server-side errors during the final submission.

## Navigation Flow
- Forward navigation is restricted until current step requirements are met.
- Backward navigation is always permitted.
- Completion on Step 7 redirects to the Vendors list.
