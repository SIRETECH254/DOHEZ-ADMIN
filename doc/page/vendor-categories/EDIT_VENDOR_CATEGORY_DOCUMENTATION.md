# Edit Vendor Category Documentation

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

import { useGetVendorCategoryById, useUpdateVendorCategory } from '../../../tanstack/useVendorCategories';
import { useGetVendorTypes } from '../../../tanstack/useVendorTypes';
import type { IVendorType } from '../../../types/api.types';
```

## Context and State Management

### Context

#### `TanStack Query`
- **Hook usage on edit category screen:** `const { data: categoryData, isLoading, isError, error } = useGetVendorCategoryById(id!);`

**`useGetVendorCategoryById` hook (from `useVendorCategories.ts`):**
```tsx
export const useGetVendorCategoryById = (idOrSlug: string) => {
  return useQuery({
    queryKey: ['vendorCategory', idOrSlug],
    queryFn: async () => {
      const response = await vendorCategoryAPI.getVendorCategoryById(idOrSlug);
      return response.data.data;
    },
    enabled: !!idOrSlug,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### `Redux`
- **Redux slice:** Not directly used for vendor categories; relies on TanStack Query for server state management.

### Form State

#### `form`
- **Form state:** managed with `useState`, containing fields for `name`, `description`, `vendorType`, and `isActive`.
```tsx
const [form, setForm] = useState({
  name: '',
  description: '',
  vendorType: '',
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
**purpose:** Populates the form state once the category data is successfully fetched.

**process:**
1. Checks if the `category` object is available.
2. Updates `form` state with existing values.
3. Updates `previewUrl` with the existing image URL.

**function implementation:**
```tsx
useEffect(() => {
  if (category) {
    setForm({
      name: category.name || '',
      description: category.description || '',
      vendorType: typeof category.vendorType === 'string' ? category.vendorType : category.vendorType?._id || '',
      isActive: category.isActive,
    });
    setPreviewUrl(category.image || null);
  }
}, [category]);
```

### `handleSubmit()`
**purpose:** Orchestrates validation, prepares the payload (FormData for image, JSON otherwise), and calls the update mutation.

**process:**
1. Validates required fields.
2. Appends fields to `FormData` if a new `image` is selected.
3. Calls `updateCategory.mutateAsync`.
4. Navigates back to the detail page on success.

**function implementation:**
```tsx
const handleSubmit = useCallback(async (e: React.FormEvent) => {
  e.preventDefault();
  setInlineError(null);

  if (!form.name || !form.vendorType) {
    setInlineError('Category name and vendor type are required.');
    return;
  }

  let payload: FormData | any;

  if (image) {
    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('description', form.description.trim());
    formData.append('vendorType', form.vendorType);
    formData.append('isActive', String(form.isActive));
    formData.append('image', image);
    payload = formData;
  } else {
    payload = form;
  }

  try {
    await updateCategory.mutateAsync({ id: id!, data: payload });
    navigate(`/vendor-categories/${id}`);
  } catch (err: any) {
    const errorMessage = err?.response?.data?.message || 'Failed to update category';
    setInlineError(errorMessage);
  }
}, [form, image, updateCategory, id, navigate]);
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
    setPreviewUrl(category?.image || null);
  }
};
```

## API Integration

### `PUT /api/vendor-categories/:categoryId`

#### Interface
```tsx
export interface UpdateVendorCategoryPayload {
  name?: string;
  description?: string;
  vendorType?: string;
  isActive?: boolean;
  image?: string | null;
}
```

#### Payload
```json
{
  "name": "string",
  "description": "string",
  "vendorType": "string",
  "isActive": "boolean",
  "image": "File | string | null"
}
```

#### API
```typescript
export const vendorCategoryAPI = {
  // Update vendor category details (handles both JSON and FormData).
  updateVendorCategory: (categoryId: string, data: UpdateVendorCategoryPayload | FormData) =>
    data instanceof FormData
      ? api.put(`/api/vendor-categories/${categoryId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/vendor-categories/${categoryId}`, data),
}
```

#### Update Function
```tsx
const useUpdateVendorCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateVendorCategoryPayload | FormData }) => {
      const response = await vendorCategoryAPI.updateVendorCategory(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorCategories'] });
      queryClient.invalidateQueries({ queryKey: ['vendorCategory', variables.id] });
      console.log('Vendor category updated successfully');
    },
    onError: (error: any) => console.error('Error updating vendor category:', error),
  });
};
```

#### Contract
`data.data` contains the updated `{ category }`.

#### Response
```json
{
  "success": true,
  "message": "Vendor category updated successfully",
  "data": {
    "category": {
      "_id": "string",
      "name": "string",
      "slug": "string",
      "isActive": true
    }
  }
}
```

#### Cache Invalidation
On success, `['vendorCategories']` and `['vendorCategory', id]` queries are invalidated to ensure the UI reflects the latest data.

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## UI Structure
- Standard form layout mirroring `CreateVendorCategory` but pre-filled with data.

## Planned Layout
```
┌───────────────────────────────┐
│         Back Button           │
├───────────────────────────────┤
│            Header             │
│   “Edit Category: [Name]”     │
├───────────────────────────────┤
│       Image Update Card       │
├───────────────────────────────┤
│     Category Name Input       │
├───────────────────────────────┤
│    Vendor Type Dropdown       │
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
│  Edit Category: Food & Drinks                 │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │                                         │  │
│  │            [ Current Image ]            │  │
│  │           (Click to change)             │  │
│  │                                         │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  Category Name                                │
│  [ Food & Drinks___________________________]  │
│                                               │
│  Vendor Type                                  │
│  [ Product Vendor                       [v]]  │
│                                               │
│  Description                                  │
│  [ Restaurant, cafes...____________________]  │
│                                               │
│  Status: [ (O) Active ]                       │
│                                               │
│        [       Save Changes        ]          │
└───────────────────────────────────────────────┘
```

## Form Inputs

### `Image Field`
**Purpose**: Collects the category's visual representation, allowing updates.
**Applicable**: Hidden file input triggered by clicking the preview image; supports image previews.

**Input implementation**:
```tsx
<div onClick={triggerFileInput} className="relative group cursor-pointer">
  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
  {/* Preview and Camera Overlay JSX... */}
</div>
```

### `Name Field`
**Purpose**: Collects the primary name of the category.
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

### `Vendor Type Select`
**Purpose**: Links the category to its parent vendor type.
**Applicable**: Required dropdown selection, pre-filled from API data.

**Input implementation**:
```tsx
<select 
  value={form.vendorType} 
  onChange={(e) => setForm({...form, vendorType: e.target.value})} 
  className="input"
  required
  disabled={isLoadingTypes}
>
  <option value="">Select a vendor type</option>
  {vendorTypes.map((type) => (
    <option key={type._id} value={type._id}>{type.name}</option>
  ))}
</select>
```

### `Status Toggle`
**Purpose**: Toggles the category's active/inactive state.
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
  <div className="status-toggle-ui"></div>
  <span>{form.isActive ? 'Active' : 'Inactive'}</span>
</label>
```

### `Submit Button`
**Purpose**: Triggers the vendor category update process.
**Applicable**: Disables when update is in progress.

**Input implementation**:
```tsx
<button 
  type="submit" 
  className="btn-primary flex-1" 
  disabled={updateCategory.isPending}
>
  {updateCategory.isPending ? 'Saving...' : 'Save Changes'}
</button>
```

## Error Handling
- Displays `inlineError` banner for validation and API failures.
- Loading and error states for initial data fetch.

## Navigation Flow
- Back Link ➞ `/vendor-categories/:id`.
- Cancel Button ➞ `/vendor-categories/:id`.
- Success ➞ `/vendor-categories/:id`.
