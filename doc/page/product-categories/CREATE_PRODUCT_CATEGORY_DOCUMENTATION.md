# Create Product Category Screen Documentation

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
import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { useCreateProductCategory } from '../../../tanstack/useProductCategories';
import { useGetProductTypes } from '../../../tanstack/useProductTypes';
import type { IProductType } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useCreateProductCategory`
- **Hook usage:** `const createProductCategory = useCreateProductCategory();`
- **Purpose:** Mutation hook to create a new product category.

#### `useGetProductTypes`
- **Hook usage:** `const { data: productTypesData, isLoading: isLoadingTypes } = useGetProductTypes({});`
- **Purpose:** Fetches product types for selection when creating a category.

### Local Component State

#### `form`
- **Purpose:** Manages product category form data (name, details, productType, sort).
```tsx
const [form, setForm] = useState({
  name: '',
  details: '',
  productType: '',
  sort: 0,
});
```

#### `icon` & `previewUrl`
- **Purpose:** Manages the uploaded icon file and its preview URL.
```tsx
const [icon, setIcon] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
```

#### `inlineError`
- **Purpose:** Stores local validation or API error messages.
```tsx
const [inlineError, setInlineError] = useState<string | null>(null);
```

## Functions Involved

### `handleIconChange()`
**purpose:** Handles icon file selection and sets its preview URL.

**process:**
1. Extracts the file from the event.
2. Updates `icon` state and sets `previewUrl` using `URL.createObjectURL`.

**function implementation:**
```tsx
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setIcon(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };
```

### `handleSubmit()`
**purpose:** Orchestrates local validation, calls the create function, and manages navigation.

**process:**
1. Prevents default form submission.
2. Resets `inlineError`.
3. Validates required fields (`name`, `productType`).
4. Constructs `FormData` (including icon file).
5. Calls `createProductCategory.mutateAsync(formData)`.
6. Navigates to `/product-categories` upon success.
7. Sets `inlineError` if the API request fails.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name || !form.productType) {
      setInlineError('Name and Product Type are required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('details', form.details.trim());
    formData.append('productType', form.productType);
    formData.append('sort', String(form.sort));
    if (icon) {
      formData.append('icon', icon);
    }

    try {
      await createProductCategory.mutateAsync(formData);
      navigate('/product-categories');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to create product category');
    }
  }, [form, icon, createProductCategory, navigate]);
```

## API Integration

### `POST /api/product-categories`

#### API
```typescript
export const productCategoryAPI = {
  // Create product category
  createCategory: (formData: FormData) => api.post('/api/product-categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
```

#### Hook
```typescript
export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => productCategoryAPI.createCategory(formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-categories'] }),
  });
};
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Screen shell:** `div` with `p-6` padding.
- **Header:** Contains "Back to Product Categories" link and page title.
- **Form:** White container (`bg-white rounded-3xl p-8`) with icon upload, input fields, and submit/cancel buttons.

## Form Inputs

### `Name Input`
**Purpose**: Collects the name of the product category.

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

### `Product Type Dropdown`
**Purpose**: Allows selecting the product type associated with the category.

**Input implementation**:
```tsx
<select 
  value={form.productType} 
  onChange={(e) => setForm({...form, productType: e.target.value})} 
  className="input" 
  required 
  disabled={isLoadingTypes}
>
  <option value="">Select a product type</option>
  {productTypes.map((pt: IProductType) => (
    <option key={pt._id} value={pt._id}>{pt.name}</option>
  ))}
</select>
```

### `Sort Order Input`
**Purpose**: Collects the display order of the product category.

**Input implementation**:
```tsx
<input 
  type="number" 
  value={form.sort} 
  onChange={(e) => setForm({...form, sort: Number(e.target.value)})} 
  className="input" 
/>
```

### `Details Textarea`
**Purpose**: Collects an optional description/details for the category.

**Input implementation**:
```tsx
<textarea 
  value={form.details} 
  onChange={(e) => setForm({...form, details: e.target.value})} 
  className="input min-h-[100px] py-3" 
/>
```

## Error Handling
- Displays `inlineError` banner if form validation fails or API returns an error.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header (Back Link, Title)                                │
├──────────────────────────────────────────────────────────┤
│ Icon Upload (Preview)                                    │
├──────────────────────────────────────────────────────────┤
│ Form (Name, Type, Order, Details)                        │
├──────────────────────────────────────────────────────────┤
│ Buttons (Create, Cancel)                                 │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────┐
│ < Back to Product Categories                             │
│ Create New Product Category                              │
│                                                          │
│                      [ Icon ]                            │
│                                                          │
│ [  Name field  ]  [  Product Type dropdown  ]            │
│ [  Sort field  ]                                         │
│                                                          │
│ [  Details textarea                        ]             │
│                                                          │
│ [ Create ] [ Cancel ]                                    │
└──────────────────────────────────────────────────────────┘
```

## Navigation Flow
- "Back" button -> `/product-categories`
- Successful creation -> `/product-categories`

## Future Enhancements
- Add drag-and-drop for icon upload.
- Implement real-time input validation.
