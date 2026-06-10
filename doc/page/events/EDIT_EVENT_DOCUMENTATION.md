# Edit Event Documentation

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
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt, MdLocationOn, MdAccessTime } from 'react-icons/md';
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
import { useGetProductById, useUpdateProduct } from '../../../tanstack/useProducts';
import { useGetServices } from '../../../tanstack/useServices';
import { useGetProductCategories } from '../../../tanstack/useProductCategories';
import { useGetProductVariants } from '../../../tanstack/useProductVariants';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useGetBranches } from '../../../tanstack/useBranches';
import { useSearchLocation } from '../../../tanstack/useLocations';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IProductCategory, IVariant, IVendor, IBranch, IProduct, IService } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetProductById`
- **Hook usage:** `const { data: productData, isLoading: isProductLoading } = useGetProductById(id!);`
- **Purpose:** Fetches the existing event data by ID for editing.

#### `useUpdateProduct`
- **Hook usage:** `const updateEvent = useUpdateProduct();`
- **Purpose:** Mutation hook to update the event. Cache invalidation is handled by mutation `onSuccess`.

#### `useGetServices`, `useGetProductCategories`, `useGetProductVariants`, `useGetVendors`, `useGetBranches`, `useSearchLocation`
- **Purpose:** Various hooks used to fetch data for form dropdowns and selections.

### Local Component State

#### `form`
- **Purpose:** Main object state holding all event details. Initialised with product data from API.
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

#### `existingImages`
- **Purpose:** Manages the list of images already associated with the event on the server.
```tsx
const [existingImages, setExistingImages] = useState<{ url: string; publicId: string }[]>([]);
```

#### `previewUrls`
- **Purpose:** Manages the local object URLs for newly selected images.
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
2. If valid, updates `activeTab` to the target key and `currentStep` accordingly.

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
1. Finds the index of the current active tab and identifies the next tab.
2. Validates navigation.
3. Updates `activeTab` and `currentStep`, and clears `inlineError` if valid.
4. Sets generic `inlineError` if invalid.

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

### `removeImage()`
**purpose:** Removes an image from either the existing list (server-side) or the new selection list (client-side).

**process:**
1. Checks if the image is `isExisting`.
2. Filters `existingImages` if true.
3. Filters `form.images` and `previewUrls` if false.

**function implementation:**
```tsx
  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
        setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    }
  };
```

### `handleSubmit()`
**purpose:** Submits the updated event data and current list of existing images to the API.

**process:**
1. Clears `inlineError`.
2. Initialises `FormData`.
3. Appends form fields, handling files and stringifying objects.
4. Appends the `existingImages` list as a JSON string.
5. Executes `updateEvent.mutateAsync`.
6. Navigates to the event detail page on success.

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
    formData.append('existingImages', JSON.stringify(existingImages));

    try {
      await updateEvent.mutateAsync({ productId: id!, data: formData });
      navigate(`/events/${id}`);
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to update event');
    }
  };
```

## API Integration

### `PATCH /api/products/:productId`

#### API
```typescript
export const productAPI = {
  // Update product (event)
  updateProduct: (id: string, data: FormData) => api.patch(`/api/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
```

#### Hook
```typescript
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: FormData }) => {
      const response = await productAPI.updateProduct(productId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
```

#### Contract
Returns updated event details on success.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Product updated",
  "data": {
    "_id": "...",
    "name": "Updated Concert Name",
    // ...
  }
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
/>
```

## Error Handling
- Displays a global loading spinner while `isProductLoading` is true.
- Displays an `inlineError` banner if validation fails during navigation or submission.
- API error messages are retrieved from `(error as any)?.response?.data?.message`.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [ Back to Events ]                       Step X of Y     │
├──────────────────────────────────────────────────────────┤
│ Page Header (Edit Event)                                 │
├──────────────────────────────────────────────────────────┤
│ [ Step Progress Header ]                                 │
│ [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ] [ 7 ] [ 8 ] [ 9 ] [ 10 ] [ 11 ] │
├──────────────────────────────────────────────────────────┤
│ [ Progress Bar ]                                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│             Dynamic Form Content Area                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ [ Previous / Cancel ]                [ Continue / Save ] │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ < Back to Events                                                     Step 1 of 11     │
│                                                                                       │
│ Edit Event                                                                            │
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │  1 Basic Info  [ (1) ] [ (2) ] [ (3) ] [ (4) ] [ (5) ] [ (6) ] [ (7) ] ... [ (11) ] │ │
│ │  ─────────────────────────────────────────────────────────────────────────────────  │ │
│ │  [Progress Bar: 9%]                                                               │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│  Event Name *                                                                         │
│  [ Existing Event Name                         ]                                      │
│                                                                                       │
│  ───────────────────────────────────────────────────────────────────────────────────  │
│  [ Previous ]                                                          [ Continue ]   │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/events/:id/edit`
- Back to Events -> `/events`
- Save Changes -> `/events/:id`

## Future Enhancements
- Implement "Reset Changes" button to revert to the last saved state.
- Add image re-ordering functionality.
