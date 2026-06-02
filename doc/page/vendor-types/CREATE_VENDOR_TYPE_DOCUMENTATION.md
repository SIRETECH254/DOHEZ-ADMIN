# Create Vendor Type Documentation

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
import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';

import { useCreateVendorType } from '../../../tanstack/useVendorTypes';
```

## Context and State Management

### Context

#### `TanStack Query`
- **Hook usage on create vendor type screen:** `const createVendorType = useCreateVendorType();`

**`useCreateVendorType` mutation (from `useVendorTypes.ts`):**
```tsx
export const useCreateVendorType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVendorTypePayload | FormData) => {
      const response = await vendorTypeAPI.createVendorType(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorTypes'] });
    },
  });
};
```

#### `Redux`
- **Redux slice:** Not directly used for vendor types; relies on TanStack Query for server state management.

### Form State

#### `form`
- **Form state:** object `{ name, description, isActive }` managed with `useState`.
```tsx
const [form, setForm] = useState({
  name: '',
  description: '',
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
2. Checks if the `name` field is populated; if not, sets a local `inlineError`.
3. Resets `inlineError`.
4. Constructs a `FormData` object and appends text fields.
5. Appends the `image` file if selected.
6. Calls `createVendorType.mutateAsync`.
7. Navigates back to the list on success.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name) {
      setInlineError('Vendor type name is required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('description', form.description.trim());
    formData.append('isActive', String(form.isActive));
    if (image) {
      formData.append('image', image);
    }

    try {
      await createVendorType.mutateAsync(formData);
      navigate('/vendor-types');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to create vendor type';
      setInlineError(errorMessage);
    }
  }, [form, image, createVendorType, navigate]);
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

### `POST /api/vendor-types`

#### Interface
```tsx
export interface CreateVendorTypePayload {
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
  "isActive": "boolean",
  "image": "File"
}
```

#### API
```typescript
export const vendorTypeAPI = {
  // Create a new vendor type (handles FormData for images).
  createVendorType: (vendorTypeData: CreateVendorTypePayload | FormData) =>
    vendorTypeData instanceof FormData
      ? api.post('/api/vendor-types', vendorTypeData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/vendor-types', vendorTypeData),
}
```

#### Create Function
```tsx
const useCreateVendorType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVendorTypePayload | FormData) => {
      const response = await vendorTypeAPI.createVendorType(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorTypes'] });
    },
  });
};
```

#### Contract
`data.data` contains the created `{ vendorType }`.

#### Response
```json
{
  "success": true,
  "message": "Vendor type created successfully",
  "data": {
    "vendorType": {
      "_id": "string",
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

#### Cache Invalidation
On success, `['vendorTypes']` queries are invalidated to ensure the UI reflects the latest data.

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
│   “Create Vendor Type”        │
├───────────────────────────────┤
│       Image Upload Card       │
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
│  (<-) Back to Vendor Types                    │
│                                               │
│  Create New Vendor Type                       │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │                                         │  │
│  │            [ Image Preview ]            │  │
│  │           (Click to upload)             │  │
│  │                                         │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  Vendor Type Name                             │
│  [_________________________________________]  │
│                                               │
│  Description                                  │
│  [_________________________________________]  │
│  [_________________________________________]  │
│                                               │
│  Status: [ (O) Active ]                       │
│                                               │
│        [     Create Vendor Type      ]        │
└───────────────────────────────────────────────┘
```

## Form Inputs

### `Image Field`
**Purpose**: Collects the vendor type's visual representation.
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
**Applicable**: Required field.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={form.name} 
  onChange={(e) => setForm({...form, name: e.target.value})} 
  className="input" 
  placeholder="e.g. Product Vendor" 
  required 
/>
```

### `Description Field`
**Purpose**: Collects optional details about the vendor type.
**Applicable**: Textarea for multi-line input.

**Input implementation**:
```tsx
<textarea 
  value={form.description} 
  onChange={(e) => setForm({...form, description: e.target.value})} 
  className="input min-h-[100px] py-3" 
  placeholder="Describe the vendor type..." 
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
**Purpose**: Triggers the vendor type creation process.
**Applicable**: Disables when creation is in progress.

**Input implementation**:
```tsx
<button 
  type="submit" 
  className="btn-primary flex-1" 
  disabled={createVendorType.isPending}
>
  {createVendorType.isPending ? 'Creating...' : 'Create Vendor Type'}
</button>
```

## Error Handling
- Checks for required fields before submission.
- Catches API errors and displays them in a banner.
- Invalidates the `vendorTypes` query on success to refresh the list.

## Navigation Flow
- Route: `/vendor-types/new`.
- Back Link ➞ `/vendor-types`.
- Cancel Button ➞ `/vendor-types`.
- Success ➞ `/vendor-types`.
