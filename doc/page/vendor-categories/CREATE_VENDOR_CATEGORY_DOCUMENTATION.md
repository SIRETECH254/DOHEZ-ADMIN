# Create Vendor Category Documentation

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
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';

import { useCreateVendorCategory } from '../../../tanstack/useVendorCategories';
import { useGetVendorTypes } from '../../../tanstack/useVendorTypes';
import type { IVendorType } from '../../../types/api.types';
```

## Context and State Management

### Context

#### `TanStack Query`
- **Hook usage on create screen:** `const createCategory = useCreateVendorCategory();`

**`useCreateVendorCategory` mutation (from `useVendorCategories.ts`):**
```tsx
export const useCreateVendorCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVendorCategoryPayload | FormData) => {
      const response = await vendorCategoryAPI.createVendorCategory(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorCategories'] });
    },
  });
};
```

#### `Redux`
- **Redux slice:** Not directly used for vendor categories; relies on TanStack Query for server state management.

### Form State

#### `form`
- **Form state:** object `{ name, description, vendorType, isActive }` managed with `useState`.
```tsx
const [form, setForm] = useState({
  name: '',
  description: '',
  vendorType: '',
  isActive: true,
})
```

#### `image` & `previewUrl`
- **Media state:** stores the file and a local URL for the preview.
```tsx
const [image, setImage] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
```

#### `inlineError`
- **Inline error state:** stores local validation or API error messages.
```tsx
const [inlineError, setInlineError] = useState<string | null>(null)
```

## Functions Involved

### `handleSubmit()`
**purpose:** Orchestrates local validation, prepares the `FormData` payload, and calls the creation mutation.

**process:**
1. Prevents the default browser form submission.
2. Validates `name` and `vendorType` presence.
3. Constructs a `FormData` object and appends text fields and image.
4. Calls `createCategory.mutateAsync`.
5. Navigates back to the list on success.

**function implementation:**
```tsx
const handleSubmit = useCallback(async (e: React.FormEvent) => {
  e.preventDefault();
  setInlineError(null);

  if (!form.name || !form.vendorType) {
    setInlineError('Category name and vendor type are required.');
    return;
  }

  const formData = new FormData();
  formData.append('name', form.name.trim());
  formData.append('description', form.description.trim());
  formData.append('vendorType', form.vendorType);
  formData.append('isActive', String(form.isActive));
  if (image) {
    formData.append('image', image);
  }

  try {
    await createCategory.mutateAsync(formData);
    navigate('/vendor-categories');
  } catch (err: any) {
    const errorMessage = err?.response?.data?.message || 'Failed to create category';
    setInlineError(errorMessage);
  }
}, [form, image, createCategory, navigate]);
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
    setPreviewUrl(null);
  }
};
```

## API Integration

### `POST /api/vendor-categories`

#### Interface
```tsx
export interface CreateVendorCategoryPayload {
  vendorType?: string;
  name: string;
  description?: string;
  isActive?: boolean;
}
```

#### Payload
```json
{
  "name": "string",
  "description": "string",
  "vendorType": "string",
  "isActive": "boolean",
  "image": "File"
}
```

#### API
```typescript
export const vendorCategoryAPI = {
  // Create a new vendor category (handles FormData for images).
  createVendorCategory: (data: CreateVendorCategoryPayload | FormData) =>
    data instanceof FormData
      ? api.post('/api/vendor-categories', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/vendor-categories', data),
}
```

#### Contract
`data.data` contains the created `{ category }`.

#### Response
```json
{
  "success": true,
  "message": "Vendor category created successfully",
  "data": {
    "category": {
      "_id": "string",
      "vendorType": "string",
      "name": "string",
      "description": "string",
      "slug": "string",
      "image": "string",
      "isActive": true,
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## UI Structure
- **Screen shell:** padded `div` with centered form card.
- **Typography:** bold header; standard form labels.
- **Layout helpers:** vertical stack for fields; flexbox for image upload.
- **Feedback:** image preview with initials fallback; inline error banner.

## Planned Layout
```
┌───────────────────────────────┐
│         Back Button           │
├───────────────────────────────┤
│            Header             │
│   “Create New Category”       │
├───────────────────────────────┤
│       Image Upload Card       │
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
│  (<-) Back to Categories                      │
│                                               │
│  Create New Category                          │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │                                         │  │
│  │            [ Image Preview ]            │  │
│  │           (Click to upload)             │  │
│  │                                         │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  Category Name                                │
│  [_________________________________________]  │
│                                               │
│  Vendor Type                                  │
│  [ Select a vendor type                 [v]]  │
│                                               │
│  Description                                  │
│  [_________________________________________]  │
│  [_________________________________________]  │
│                                               │
│  Status: [ (O) Active ]                       │
│                                               │
│        [     Create Category         ]        │
└───────────────────────────────────────────────┘
```

## Form Inputs

### `Image Field`
**Purpose**: Collects the category's visual representation.
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
**Implementation**:
```tsx
<input 
  type="text" 
  value={form.name} 
  onChange={(e) => setForm({...form, name: e.target.value})} 
  className="input" 
  placeholder="e.g. Food & Drinks" 
  required 
/>
```

### `Vendor Type Select`
**Purpose**: Links the category to its parent vendor type.
**Implementation**:
```tsx
<select 
  value={form.vendorType} 
  onChange={(e) => setForm({...form, vendorType: e.target.value})} 
  className="input"
  required
>
  <option value="">Select a vendor type</option>
  {vendorTypes.map((type) => (
    <option key={type._id} value={type._id}>{type.name}</option>
  ))}
</select>
```

### `Status Toggle`
**Purpose**: Toggles active state.
**Implementation**:
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
**Purpose**: Triggers the vendor category creation process.
**Applicable**: Disables when creation is in progress.

**Input implementation**:
```tsx
<button 
  type="submit" 
  className="btn-primary flex-1" 
  disabled={createCategory.isPending}
>
  {createCategory.isPending ? 'Creating...' : 'Create Category'}
</button>
```

## Error Handling
- Checks for required fields before submission.
- Catches API errors and displays them in a banner.
- Invalidates the `vendorCategories` query on success to refresh the list.

## Navigation Flow
- Route: `/vendor-categories/new`.
- Back Link ➞ `/vendor-categories`.
- Cancel Button ➞ `/vendor-categories`.
- Success ➞ `/vendor-categories`.

## Future Enhancements
- Add validation to ensure category name uniqueness per vendor type.
- Introduce categorized icon sets based on vendor type.
- Add bulk category import/export feature.
