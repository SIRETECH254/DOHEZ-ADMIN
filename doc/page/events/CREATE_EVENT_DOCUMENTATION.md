# Create Event Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Form Inputs](#form-inputs)
- [Error Handling](#error-handling)
- [Planned Layout](#planned-layout)
- [Navigation Flow](#navigation-flow)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt, MdLocationOn, MdEvent, MdAccessTime } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineExclamation,
  HiOutlineSearch,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineCalendar,
  HiOutlineTicket,
  HiOutlineLocationMarker,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineClipboardCheck,
  HiOutlineDuplicate
} from 'react-icons/hi';
import { FiSearch } from 'react-icons/fi';
import { useCreateEvent } from '../../../tanstack/useProducts';
import { useGetServices } from '../../../tanstack/useServices';
import { useGetProductCategories } from '../../../tanstack/useProductCategories';
import { useGetProductVariants } from '../../../tanstack/useProductVariants';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useGetBranches } from '../../../tanstack/useBranches';
import { useSearchLocation } from '../../../tanstack/useLocations';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IProductCategory, IVariant, IVendor, IBranch, IService } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useCreateEvent`
- **Hook usage:** `const createEvent = useCreateEvent();`
- **Purpose:** Mutation hook to create a new event. Cache invalidation is handled by mutation `onSuccess`.

#### `useGetServices`, `useGetProductCategories`, `useGetProductVariants`, `useGetVendors`, `useGetBranches`, `useSearchLocation`
- **Hook usage:** `const { data, isLoading } = useGetServices(params);` (and similar for others)
- **Purpose:** Various hooks used to fetch data for form dropdowns and selections.

### Local Component State

#### `form`
- **Purpose:** Main object state holding all event details.
```tsx
const [form, setForm] = useState({
  name: '',
  details: '',
  service: '',
  category: '',
  vendor: '',
  branch: '',
  price: 0,
  startDate: '',
  endDate: '',
  venue: '',
  maxTicket: 0,
  openAt: '',
  location: { address: '', coordinates: { lat: 0, lng: 0 } },
  variants: [] as string[],
  selectedVariantOptions: [] as { variantId: string; optionId: string }[],
  images: [] as File[],
});
```

#### `activeTab` & `currentStep`
- **Purpose:** Manages the multi-step form navigation state.
```tsx
const [activeTab, setActiveTab] = useState('basic');
const [currentStep, setCurrentStep] = useState(1);
```

#### `categorySearch`, `serviceSearch`, `vendorSearch`, `locationSearch`
- **Purpose:** Manages various search inputs and debouncing for API calls.
```tsx
const [categorySearch, setCategorySearch] = useState('');
const [serviceSearch, setServiceSearch] = useState('');
const [vendorSearch, setVendorSearch] = useState('');
const [locationSearch, setLocationSearch] = useState('');
```

#### `previewUrls`
- **Purpose:** Manages the list of image preview URLs.
```tsx
const [previewUrls, setPreviewUrls] = useState<string[]>([]);
```

### Memoized Parameters

#### `Not Applicable`
- **Purpose:** This component uses `useEffect` for debouncing search inputs instead of memoized parameter objects.
```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedCategorySearch(categorySearch);
  }, 500);
  return () => clearTimeout(timer);
}, [categorySearch]);
```

## Functions Involved

### `validateTabNavigation()`
**purpose:** Ensures mandatory fields for the current step are filled before allowing navigation.

**process:**
1. Checks the target tab's step against the current step.
2. If navigating backwards (step < current), allows navigation.
3. If navigating forwards, validates required fields for each specific step (e.g., name for step 1, service for step 2, etc.).
4. Returns `true` if valid, `false` otherwise.

**function implementation:**
```tsx
  const validateTabNavigation = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (!targetTab) return false;
    if (targetTab.step < currentStep) return true;
    
    if (currentStep === 1) return !!form.name;
    if (currentStep === 2) return !!form.service;
    if (currentStep === 3) return !!form.category;
    if (currentStep === 4) return !!form.vendor && !!form.branch;
    if (currentStep === 5) return form.price > 0;
    if (currentStep === 6) return !!form.location.address;
    if (currentStep === 7) return !!form.venue;
    if (currentStep === 8) return !!form.startDate && !!form.endDate;
    
    return true;
  };
```

### `handleTabChange()`
**purpose:** Switches between form tabs directly via the header indicator.

**process:**
1. Calls `validateTabNavigation` with the target key.
2. If valid, updates `activeTab` to the target key.
3. Updates `currentStep` based on the target tab's definition.

**function implementation:**
```tsx
  const handleTabChange = (key: string) => {
    if (validateTabNavigation(key)) {
      setActiveTab(key);
      setCurrentStep(TABS.find(t => t.key === key)?.step || 1);
    }
  };
```

### `goToNextStep()`
**purpose:** Sequential navigation to the next tab.

**process:**
1. Finds the index of the current active tab.
2. Identifies the next tab in the `TABS` array.
3. Validates navigation to the next tab.
4. If valid, updates `activeTab` and `currentStep`, and clears `inlineError`.
5. If invalid, sets a generic `inlineError` message.

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
**purpose:** Sequential navigation to the previous tab.

**process:**
1. Finds the index of the current active tab.
2. If not at the first step, identifies the previous tab.
3. Updates `activeTab` and `currentStep`.
4. Clears any existing `inlineError`.

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

### `toggleVariantOption()`
**purpose:** Manages the selection of variant options and keeps the list of active variants synchronized.

**process:**
1. Toggles the presence of the `variantId` and `optionId` pair in `selectedVariantOptions`.
2. Checks if the specific `variantId` still has any options selected.
3. Updates the `variants` array (list of variant IDs) based on whether they have selected options.

**function implementation:**
```tsx
  const toggleVariantOption = (variantId: string, optionId: string) => {
    setForm(prev => {
      const isSelected = prev.selectedVariantOptions.some(
        so => so.variantId === variantId && so.optionId === optionId
      );
      
      let nextSelectedOptions;
      if (isSelected) {
        nextSelectedOptions = prev.selectedVariantOptions.filter(
          so => !(so.variantId === variantId && so.optionId === optionId)
        );
      } else {
        nextSelectedOptions = [...prev.selectedVariantOptions, { variantId, optionId }];
      }

      const hasOptionsSelected = nextSelectedOptions.some(so => so.variantId === variantId);
      let nextVariants = prev.variants;
      if (hasOptionsSelected && !prev.variants.includes(variantId)) {
        nextVariants = [...prev.variants, variantId];
      } else if (!hasOptionsSelected && prev.variants.includes(variantId)) {
        nextVariants = prev.variants.filter(id => id !== variantId);
      }

      return { ...prev, selectedVariantOptions: nextSelectedOptions, variants: nextVariants };
    });
  };
```

### `handleImageChange()`
**purpose:** Manages file selection for event photos and generates preview URLs.

**process:**
1. Extracts files from the input event.
2. Appends new files to the `form.images` array.
3. Creates local object URLs for each file and appends them to `previewUrls` for display.

**function implementation:**
```tsx
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setForm(prev => ({ ...prev, images: [...prev.images, ...files] }));
      const newUrls = files.map(f => URL.createObjectURL(f));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };
```

### `handleSubmit()`
**purpose:** Final submission of the form data to the API.

**process:**
1. Clears `inlineError`.
2. Initialises a new `FormData` object.
3. Iterates through the `form` state, appending images individually and stringifying objects/arrays.
4. Executes the `createEvent.mutateAsync` call.
5. Navigates to `/events` on success or sets `inlineError` on failure.

**function implementation:**
```tsx
  const handleSubmit = async () => {
    setInlineError(null);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'images') {
        form.images.forEach(img => formData.append('images', img));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    try {
      await createEvent.mutateAsync(formData);
      navigate('/events');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to create event');
    }
  };
```

## API Integration

### `POST /api/products`

#### API
```typescript
export const productAPI = {
  // Create product (event)
  createProduct: (data: FormData) => api.post('/api/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
```

#### Hook
```typescript
export const useCreateEvent = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await productAPI.createProduct(formData);
      return response.data.data;
    },
    onSuccess: () => {
      console.log('Event created successfully');
    },
    onError: (error: any) => console.error('Error creating event:', error),
  });
};
```

#### Contract
Returns confirmation of event creation on success.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Product created",
  "data": {
    "_id": "650af1234567890abcdef123",
    "name": "Summer Concert",
    "details": "...",
    "price": 100,
    "category": "...",
    "service": "..."
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/services`

#### API
```typescript
export const serviceAPI = {
  getServices: (params?: any) => api.get('/api/services', { params }),
};
```

#### Hook
```typescript
export const useGetServices = (params?: any) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: async () => {
      const response = await serviceAPI.getServices(params);
      return response.data.data;
    },
  });
};
```

#### Contract
`data.data` contains `{ services, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "services": [
      { "_id": "...", "name": "Concert" }
    ],
    "pagination": { "total": 1, "page": 1, "limit": 10 }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/product-categories`

#### API
```typescript
export const productCategoryAPI = {
  getProductCategories: (params?: any) => api.get('/api/product-categories', { params }),
};
```

#### Hook
```typescript
export const useGetProductCategories = (params?: any) => {
  return useQuery({
    queryKey: ['product-categories', params],
    queryFn: async () => {
      const response = await productCategoryAPI.getProductCategories(params);
      return response.data.data;
    },
  });
};
```

#### Contract
`data.data` contains `{ categories, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "categories": [
      { "_id": "...", "name": "Music" }
    ],
    "pagination": { "total": 1, "page": 1, "limit": 10 }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/vendors` & `GET /api/branches`

#### API
```typescript
export const vendorAPI = {
  getVendors: (params?: any) => api.get('/api/vendors', { params }),
};

export const branchAPI = {
  getBranches: (params?: any) => api.get('/api/branches', { params }),
};
```

#### Hook
```typescript
export const useGetVendors = (params?: any) => {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: async () => {
      const response = await vendorAPI.getVendors(params);
      return response.data.data;
    },
  });
};

export const useGetBranches = (params?: any) => {
  return useQuery({
    queryKey: ['branches', params],
    queryFn: async () => {
      const response = await branchAPI.getBranches(params);
      return response.data.data;
    },
  });
};
```

#### Contract
`data.data` contains `{ vendors/branches, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "vendors": [ { "_id": "...", "name": "Main Vendor" } ],
    "pagination": { "total": 1, "page": 1, "limit": 10 }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/locations/search`

#### Hook
```typescript
export const useSearchLocation = (query: string) => {
  return useQuery({
    queryKey: ['location-search', query],
    queryFn: async () => {
      const response = await api.get('/api/locations/search', { params: { query } });
      return response.data.data;
    },
    enabled: !!query,
  });
};
```

#### Contract
Returns an array of matching locations.

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "place_id": "...",
      "formatted_address": "123 Event St, City",
      "geometry": { "location": { "lat": 0, "lng": 0 } }
    }
  ]
}
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Standard padding container with max width.
- **Header:** Title, step indicator, and "Back to Events" link.
- **Progress:** Visual progress bar at the top of the form area.
- **Tabs:** Horizontal step indicator for navigation.
- **Forms:** Dynamic content rendering based on `activeTab`.

## Form Inputs

### `Event Name Input`
**Purpose**: Collects the public title of the event.
**Applicable**: Standard required text input.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={form.name} 
  onChange={e => setForm({...form, name: e.target.value})} 
  className="input" 
  placeholder="e.g. Summer Concert" 
  required 
/>
```

### `Service Search Input`
**Purpose**: Filters and allows selection of a service from the API.
**Applicable**: Uses `HiOutlineSearch` icon and debounce for API calls.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={serviceSearch} 
  onChange={e => setServiceSearch(e.target.value)} 
  className="input pr-10" 
  placeholder="Type to search service..." 
/>
```

### `Base Price Input`
**Purpose**: Sets the ticket price for the event.
**Applicable**: Uses `HiOutlineCurrencyDollar` icon for currency context.

**Input implementation**:
```tsx
<input 
  type="number" 
  value={form.price} 
  onChange={e => setForm({...form, price: Number(e.target.value)})} 
  className="input pl-10" 
  placeholder="0.00" 
  required 
/>
```

### `Location Search Input`
**Purpose**: Searches for physical addresses via Google Places integration.
**Applicable**: Uses `FiSearch` icon and result dropdown.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={locationSearch} 
  onChange={e => setLocationSearch(e.target.value)} 
  className="input pl-10" 
  placeholder="Search address or venue location..." 
/>
```

### `Start Date Input`
**Purpose**: Captures the event's start date and time.
**Applicable**: Uses `HiOutlineCalendar` icon.

**Input implementation**:
```tsx
<input 
  type="datetime-local" 
  value={form.startDate} 
  onChange={e => setForm({...form, startDate: e.target.value})} 
  className="input pl-10" 
/>
```

### `End Date Input`
**Purpose**: Captures the event's end date and time.
**Applicable**: Uses `HiOutlineCalendar` icon.

**Input implementation**:
```tsx
<input 
  type="datetime-local" 
  value={form.endDate} 
  onChange={e => setForm({...form, endDate: e.target.value})} 
  className="input pl-10" 
/>
```

### `Event Details Textarea`
**Purpose**: Captures a detailed description of the event.
**Applicable**: Multiline textarea.

**Input implementation**:
```tsx
<textarea 
  value={form.details} 
  onChange={e => setForm({...form, details: e.target.value})} 
  className="input min-h-[120px] py-3" 
  placeholder="Tell us about the event..." 
/>
```

### `Max Tickets Input`
**Purpose**: Defines the capacity/limit of tickets available for the event.
**Applicable**: Uses `HiOutlineTicket` icon.

**Input implementation**:
```tsx
<input 
  type="number" 
  value={form.maxTicket} 
  onChange={e => setForm({...form, maxTicket: Number(e.target.value)})} 
  className="input pl-10" 
  placeholder="500" 
  required 
/>
```

### `Image Upload Input`
**Purpose**: Allows users to select and upload multiple event photos.
**Applicable**: Hidden file input triggered by a dashed-border dropzone.

**Input implementation**:
```tsx
<input 
  type="file" 
  multiple 
  onChange={handleImageChange} 
  accept="image/*" 
  className="absolute inset-0 opacity-0 cursor-pointer" 
/>
```

### `Variant Option Button`
**Purpose**: Toggles selection of specific variant options (e.g., VIP, Early Bird).
**Applicable**: Card-based toggle button with checkmark indicator.

**Input implementation**:
```tsx
<button 
  key={option._id} 
  type="button" 
  onClick={() => toggleVariantOption(v._id, option._id)} 
  className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 bg-white ${isOptionSelected ? 'border-brand-primary shadow-md' : 'border-gray-200'}`}
>
  {/* Option content */}
</button>
```

## Error Handling
- The component displays an `inlineError` banner if validation fails during step navigation or submission.
- API error messages are retrieved from `(error as any)?.response?.data?.message` and displayed to the user.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [ Back to Events ]                       Step X of Y     │
├──────────────────────────────────────────────────────────┤
│ Page Header (Title)                                      │
├──────────────────────────────────────────────────────────┤
│ [ Step Progress Header ]                                 │
│ [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ] [ 7 ] [ 8 ] [ 9 ] [ 10 ] [ 11 ] │
├──────────────────────────────────────────────────────────┤
│ [ Progress Bar ]                                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│             Dynamic Form Content Area                    │
│          (Rendered based on activeTab state)             │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ [ Previous / Cancel ]                [ Continue / Publish ] │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ < Back to Events                                                     Step 1 of 11     │
│                                                                                       │
│ Create New Event                                                                      │
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │  1 Basic Info  [ (1) ] [ (2) ] [ (3) ] [ (4) ] [ (5) ] [ (6) ] [ (7) ] ... [ (11) ] │ │
│ │  ─────────────────────────────────────────────────────────────────────────────────  │ │
│ │  [Progress Bar: 9%]                                                               │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│  Event Name *                                                                         │
│  [ Summer Concert                              ]                                      │
│                                                                                       │
│  Event Details                                                                        │
│  [ Tell us about the event...                  ]                                      │
│  [                                             ]                                      │
│                                                                                       │
│  ───────────────────────────────────────────────────────────────────────────────────  │
│  [ Previous ]                                                          [ Continue ]   │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/events`
- "Add New Event" -> `/events/new` (renders `CreateEvent`)
- Publish -> `/events`

## Future Enhancements
- Implement auto-saving draft functionality to `localStorage`.
- Use a robust library like `react-hook-form` for complex validation.
- Add advanced image cropping functionality.
