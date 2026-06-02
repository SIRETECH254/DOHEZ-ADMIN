# Edit Vendor Type Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Form State](#form-state)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Inputs](#form-inputs)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)

## Imports
```tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';

import { useGetVendorTypeById, useUpdateVendorType } from '../../../tanstack/useVendorTypes';
```

## Context and State Management

### Context

#### `TanStack Query`
- **Hook usage on edit vendor type screen:** `const { data: typeData, isLoading, isError, error } = useGetVendorTypeById(id!);`

**`useGetVendorTypeById` hook (from `useVendorTypes.ts`):**
```tsx
export const useGetVendorTypeById = (idOrSlug: string) => {
  return useQuery({
    queryKey: ['vendorType', idOrSlug],
    queryFn: async () => {
      const response = await vendorTypeAPI.getVendorTypeById(idOrSlug);
      return response.data.data;
    },
    enabled: !!idOrSlug,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### `Redux`
- **Redux slice:** Not directly used for vendor types; relies on TanStack Query for server state management.

### Display State

#### `form`
- **Form state:** managed with `useState`, containing fields for `name`, `description`, and `isActive`.
```tsx
const [form, setForm] = useState({
  name: '',
  description: '',
  isActive: true,
});
```

#### `image` & `previewUrl`
- **Media state:** stores the file and a preview URL (either from existing data or local upload).
```tsx
const [image, setImage] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
```

#### `inlineError`
- **Inline error state:** stores local validation or API error messages.
```tsx
const [inlineError, setInlineError] = useState<string | null>(null);
```

## Functions Involved

### `useEffect (Pre-fill)`
**purpose:** Populates the form state once the vendor type data is successfully fetched.

**process:**
1. Checks if the `vendorType` object is available.
2. Updates `form` state with existing values.
3. Updates `previewUrl` with the existing image URL.

**function implementation:**
```tsx
useEffect(() => {
  if (vendorType) {
    setForm({
      name: vendorType.name || '',
      description: vendorType.description || '',
      isActive: vendorType.isActive,
    });
    setPreviewUrl(vendorType.image || null);
  }
}, [vendorType]);
```

### `handleSubmit()`
**purpose:** Orchestrates validation, prepares the payload (FormData for image, JSON otherwise), and calls the update mutation.

**process:**
1. Validates required fields.
2. Appends fields to `FormData` if a new `image` is selected.
3. Calls `updateVendorType.mutateAsync`.
4. Navigates back to the detail page on success.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name) {
      setInlineError('Vendor type name is required.');
      return;
    }

    let payload: FormData | typeof form;

    if (image) {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('isActive', String(form.isActive));
      formData.append('image', image);
      payload = formData;
    } else {
      payload = form;
    }

    try {
      await updateVendorType.mutateAsync({ id: id!, data: payload });
      navigate(`/vendor-types/${id}`);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update vendor type';
      setInlineError(errorMessage);
    }
  }, [form, image, updateVendorType, id, navigate]);
```

### `handleImageChange()`
**purpose:** Processes the selected file and generates a preview to provide immediate visual feedback.

**process:**
1. Extracts the first file from the input event.
2. Updates the `image` state.
3. Creates a local blob URL using `URL.createObjectURL` for the preview.

**function implementation:**
```tsx
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setImage(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(vendorType?.image || null);
    }
  };
```

## API Integration

### `PUT /api/vendor-types/:vendorTypeId`

#### Interface
```tsx
export interface UpdateVendorTypePayload {
  name?: string;
  description?: string;
  isActive?: boolean;
  image?: string | null;
}
```

#### Payload
```json
{
  "name": "string",
  "description": "string",
  "isActive": "boolean",
  "image": "File | string | null"
}
```

#### API
```typescript
export const vendorTypeAPI = {
  // Update vendor type details (handles both JSON and FormData).
  updateVendorType: (vendorTypeId: string, vendorTypeData: UpdateVendorTypePayload | FormData) =>
    vendorTypeData instanceof FormData
      ? api.put(`/api/vendor-types/${vendorTypeId}`, vendorTypeData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/vendor-types/${vendorTypeId}`, vendorTypeData),
}
```

#### Update Function
```tsx
const useUpdateVendorType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateVendorTypePayload | FormData }) => {
      const response = await vendorTypeAPI.updateVendorType(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorTypes'] });
      queryClient.invalidateQueries({ queryKey: ['vendorType', variables.id] });
      console.log('Vendor type updated successfully');
    },
    onError: (error: any) => console.error('Error updating vendor type:', error),
  });
};
```

#### Contract
`data.data` contains the updated `{ vendorType }`.

#### Response
```json
{
  "success": true,
  "message": "Vendor type updated successfully",
  "data": {
    "vendorType": {
      "_id": "string",
      "name": "string",
      "slug": "string",
      "isActive": true
    }
  }
}
```

#### Cache Invalidation
On success, `['vendorTypes']` and `['vendorType', id]` queries are invalidated to ensure the UI reflects the latest data.


## Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## UI Structure
- Standard form layout mirroring `CreateVendorType` but pre-filled with data.

## Planned Layout
```
┌───────────────────────────────┐
│         Back Button           │
├───────────────────────────────┤
│            Header             │
│   “Edit Vendor Type: [Name]”  │
├───────────────────────────────┤
│       Image Update Card       │
├───────────────────────────────┤
│     Vendor Type Name Input    │
├───────────────────────────────┤
│       Description Input       │
├───────────────────────────────┤
│         Status Toggle         │
├───────────────────────────────┤
│        Primary Button         │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│  (<-) Back to Details                         │
│                                               │
│  Edit Vendor Type: Electronics                │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │                                         │  │
│  │            [ Current Image ]            │  │
│  │           (Click to change)             │  │
│  │                                         │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  Vendor Type Name                             │
│  [ Electronics_____________________________]  │
│                                               │
│  Description                                  │
│  [ Devices and gadgets_____________________]  │
│                                               │
│  Status: [ (O) Active ]                       │
│                                               │
│        [       Save Changes        ]          │
└───────────────────────────────────────────────┘
```


## Form Inputs

### `Image Field`
**Purpose**: Collects the vendor type's visual representation, allowing updates to existing images.
**Applicable**: Hidden file input triggered by clicking the preview image; supports image previews.

**Input implementation**:
```tsx
<div 
  onClick={triggerFileInput}
  className="relative group cursor-pointer"
>
  <input 
    type="file"
    ref={fileInputRef}
    onChange={handleImageChange}
    accept="image/*"
    className="hidden"
  />
  {/* Preview and Camera Overlay JSX... */}
</div>
```

### `Name Field`
**Purpose**: Collects the primary name of the vendor type.
**Applicable**: Required field, pre-filled from API data.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={form.name} 
  onChange={(e) => setForm({...form, name: e.target.value})} 
  className="input" 
  required 
/>
```

### `Description Field`
**Purpose**: Collects optional details about the vendor type.
**Applicable**: Textarea for multi-line input, pre-filled from API data.

**Input implementation**:
```tsx
<textarea 
  value={form.description} 
  onChange={(e) => setForm({...form, description: e.target.value})} 
  className="input min-h-[100px] py-3" 
/>
```

### `Status Toggle`
**Purpose**: Toggles the vendor type's active/inactive state.
**Applicable**: Uses a custom toggle switch UI.

**Input implementation**:
```tsx
<label className="relative inline-flex items-center cursor-pointer">
  <input 
    type="checkbox" 
    checked={form.isActive} 
    onChange={(e) => setForm({...form, isActive: e.target.checked})} 
    className="sr-only peer" 
  />
  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
  <span className="ml-3 text-sm text-gray-700 font-medium">{form.isActive ? 'Active' : 'Inactive'}</span>
</label>
```

### `Submit Button`
**Purpose**: Triggers the vendor type update process.
**Applicable**: Disables when update is in progress.

**Input implementation**:
```tsx
<button 
  type="submit" 
  className="btn-primary flex-1" 
  disabled={updateVendorType.isPending}
>
  {updateVendorType.isPending ? 'Saving...' : 'Save Changes'}
</button>
```

## Error Handling
- Displays `inlineError` banner for validation and API failures.
- Loading and error states for initial data fetch.

## Navigation Flow
- Back Link ➞ `/vendor-types/:id`.
- Cancel Button ➞ `/vendor-types/:id`.
- Success ➞ `/vendor-types/:id`.
