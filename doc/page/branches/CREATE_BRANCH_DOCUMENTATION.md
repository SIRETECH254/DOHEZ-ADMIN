# Create Branch Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Form Inputs](#form-inputs)
- [Error Handling](#error-handling)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Navigation Flow](#navigation-flow)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineLocationMarker, 
  HiOutlineClipboardCheck, 
  HiOutlinePhotograph,
  HiOutlinePencilAlt,
  HiOutlineOfficeBuilding,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineExclamation
} from 'react-icons/hi';
import { useCreateBranch } from '../../../tanstack/useBranches';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useSearchLocation } from '../../../tanstack/useLocations';
import type { IVendor, ILocationResult, WorkingHours } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useCreateBranch`
- **Hook usage:** `const createBranch = useCreateBranch();`
- **Purpose:** Mutation hook to create a new branch.

#### `useGetVendors`
- **Hook usage:** `const { data: vendorsData, isLoading: isSearchingVendors } = useGetVendors({ search: debouncedVendorSearchQuery, limit: 5 });`
- **Purpose:** Fetches vendors for selection during branch creation.

#### `useSearchLocation`
- **Hook usage:** `const { data: locationResults, isLoading: isSearchingLocation } = useSearchLocation(debouncedLocationQuery);`
- **Purpose:** Fetches location search results.

### Local Component State

#### `activeTab` & `currentStep`
- **Purpose:** Manages the wizard wizard tab/step.
```tsx
const [activeTab, setActiveTab] = useState('owner');
const [currentStep, setCurrentStep] = useState(1);
```

#### `form`
- **Purpose:** Stores the full branch creation payload.
```tsx
const [form, setForm] = useState({
  vendorId: '',
  name: '',
  email: '',
  phone: '',
  location: { address: '', coordinates: { lat: 0, lng: 0 } },
  workingHours: { ... }, 
});
```

#### `cover` & `coverPreviewUrl`
- **Purpose:** Manages the cover image file and its local preview URL.
```tsx
const [cover, setCover] = useState<File | null>(null);
const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
```

#### `galleryFiles` & `galleryPreviews`
- **Purpose:** Manages the gallery image files and their preview URLs.
```tsx
const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
```

#### `inlineError`
- **Purpose:** Manages local form validation/API errors.
```tsx
const [inlineError, setInlineError] = useState<string | null>(null);
```

#### `vendorSearchQuery` & `debouncedVendorSearchQuery`
- **Purpose:** Manages vendor search input and debouncing.
```tsx
const [vendorSearchQuery, setVendorSearchQuery] = useState('');
const [debouncedVendorSearchQuery, setDebouncedVendorSearchQuery] = useState('');
```

#### `locationQuery` & `debouncedLocationQuery`
- **Purpose:** Manages location search input and debouncing.
```tsx
const [locationQuery, setLocationQuery] = useState('');
const [debouncedLocationQuery, setDebouncedLocationQuery] = useState('');
```

## Functions Involved

### `handleCoverChange()`
**purpose:** Handles cover image file selection and sets its preview URL.

**process:**
1. Extracts the file from the event.
2. Updates `cover` state and sets `coverPreviewUrl` using `URL.createObjectURL`.

**function implementation:**
```tsx
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

### `handleGalleryChange()`
**purpose:** Handles gallery image file selection and sets preview URLs.

**process:**
1. Extracts files from the event.
2. Updates `galleryFiles` and `galleryPreviews` states.

**function implementation:**
```tsx
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };
```

### `validateTabNavigation()`
**purpose:** Checks if the user has filled required fields to proceed to the next step.

**process:**
1. Validates required fields based on the current step.

**function implementation:**
```tsx
  const validateTabNavigation = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (!targetTab) return false;
    
    if (targetTab.step < currentStep) return true;
    
    if (currentStep === 1) return !!form.vendorId;
    if (currentStep === 2) return !!(form.name && form.email && form.phone);
    // ... validation for other steps
    return true;
  };
```

### `goToNextStep()`
**purpose:** Navigates to the next wizard step if validation passes.

**process:**
1. Finds the next tab.
2. Validates tab navigation.
3. Updates `activeTab` and `currentStep` if valid, otherwise sets `inlineError`.

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
```

### `goToPrevStep()`
**purpose:** Navigates to the previous wizard step.

**process:**
1. Finds the previous tab.
2. Updates `activeTab` and `currentStep`.

**function implementation:**
```tsx
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

### `handleSubmit()`
**purpose:** Constructs `FormData`, triggers `createBranch` mutation, and navigates.

**process:**
1. Validates required fields.
2. Creates `FormData` instance and appends form fields and files.
3. Calls `createBranch.mutateAsync(formData)`.
4. Navigates to `/branches` on success.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'summary') return;
    
    setInlineError(null);

    // ... validation logic

    const formData = new FormData();
    // ... appending formData

    try {
      await createBranch.mutateAsync(formData);
      navigate('/branches');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to create branch';
      setInlineError(errorMessage);
    }
  }, [form, cover, galleryFiles, createBranch, navigate, activeTab]);
```

## API Integration

### `POST /api/branches`

#### API
```typescript
export const branchAPI = {
  // Create a new branch
  createBranch: (formData: FormData) => api.post('/api/branches', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
```

#### Hook
```typescript
export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await branchAPI.createBranch(formData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: (error: any) => console.error('Error creating branch:', error),
  });
};
```

#### Payload
`FormData` (vendorId, name, email, phone, location (JSON string), workingHours (JSON string), cover (file), gallery (files)).

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Branch created successfully",
  "data": {
    "branch": {
      "_id": "650af123...",
      "name": "...",
      ...
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/vendors`

#### API
```typescript
export const vendorAPI = {
  // Search vendors
  getVendors: (params?: { search?: string, limit?: number }) => api.get('/api/vendors', { params }),
};
```

#### Hook
```typescript
export const useGetVendors = (params?: { search?: string, limit?: number }) => {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: async () => {
      const response = await vendorAPI.getVendors(params);
      return response.data.data;
    },
  });
};
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/locations`

#### API
```typescript
export const locationAPI = {
  // Search locations
  searchLocation: (query: string) => api.get(`/api/locations?query=${query}`),
};
```

#### Hook
```typescript
export const useSearchLocation = (query: string) => {
  return useQuery({
    queryKey: ['locations', query],
    queryFn: async () => {
      const response = await locationAPI.searchLocation(query);
      return response.data.data;
    },
    enabled: !!query,
  });
};
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Wizard Layout:** Multi-step form with a progress bar and navigation buttons (Back, Continue, Create Branch).
- **Tabs:** Divided into sections: Vendor, Basic Info, Branding, Gallery, Location, Working Hours, Summary.
- **Interactive:** Searchable dropdowns for Vendors and Locations.

## Form Inputs

### `Vendor Search Input`
**Purpose**: Collects search query for selecting a vendor.
**Applicable**: Uses `HiOutlineSearch` icon for visual context.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={vendorSearchQuery} 
  onChange={(e) => setVendorSearchQuery(e.target.value)} 
  className="input pr-10" 
  placeholder="Search by name or email..." 
/>
```

### `Branch Name Input`
**Purpose**: Collects the branch name.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={form.name} 
  onChange={(e) => setForm({...form, name: e.target.value})} 
  className="input" 
  placeholder="e.g. Nairobi CBD Branch" 
  required 
/>
```

### `Email Input`
**Purpose**: Collects the branch email address.

**Input implementation**:
```tsx
<input 
  type="email" 
  value={form.email} 
  onChange={(e) => setForm({...form, email: e.target.value})} 
  className="input" 
  placeholder="branch@example.com" 
  required 
/>
```

### `Phone Input`
**Purpose**: Collects the branch contact phone number.

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

### `Location Search Input`
**Purpose**: Collects search query for selecting a location.
**Applicable**: Uses `HiOutlineLocationMarker` icon for visual context.

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

### `Working Hours Time Inputs`
**Purpose**: Collects start and end times for each day of the week.

**Input implementation**:
```tsx
<input 
  type="time" 
  value={(form.workingHours as any)[day].start} 
  onChange={(e) => setForm({
    ...form, 
    workingHours: {
      ...form.workingHours,
      [day]: { ...(form.workingHours as any)[day], start: e.target.value }
    }
  })}
  className="input-time"
/>
```

## Error Handling
- Displays `inlineError` if required fields are missing during step transition or form submission.
- Handles API errors from `createBranch` mutation.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Step Progress)                       │
├──────────────────────────────────────────────────────────┤
│ Tab Navigation (Progress Bar)                            │
├──────────────────────────────────────────────────────────┤
│ Form Content Area (Based on active tab)                  │
├──────────────────────────────────────────────────────────┤
│ Navigation Controls (Back/Cancel, Continue/Create)       │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Add New Branch                                                       Step 1 of 7      │
│ [ Progress Bar ]                                                                      │
│                                                                                       │
│ [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ] [ 7 ]                                             │
│                                                                                       │
│ Vendor                                                                                │
│ Search Vendor                                                                         │
│ [ 🔍 Search... ]                                                                      │
│                                                                                       │
│ [ Selected Vendor Card ]                                                              │
│                                                                                       │
│ [ Vendor 1 ] [ Vendor 2 ]                                                             │
│                                                                                       │
│ [ Cancel ]                                                        [ Continue ]        │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- "Back to Branches" button -> `/branches`
- Successful creation -> `/branches`

## Future Enhancements
- Implement real-time validation feedback.
- Add map view for location selection.
- Improve file upload UX (drag-and-drop).
