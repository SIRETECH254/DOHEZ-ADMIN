# Edit Product Category Screen Documentation

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
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { useGetProductCategoryById, useUpdateProductCategory } from '../../../tanstack/useProductCategories';
import { useGetProductTypes } from '../../../tanstack/useProductTypes';
import type { IProductType } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetProductCategoryById`
- **Hook usage:** `const { data: categoryData, isLoading, isError, error } = useGetProductCategoryById(id!);`
- **Purpose:** Fetches the product category details for editing.

#### `useUpdateProductCategory`
- **Hook usage:** `const updateProductCategory = useUpdateProductCategory();`
- **Purpose:** Mutation hook to update an existing product category.

#### `useGetProductTypes`
- **Hook usage:** `const { data: productTypesData, isLoading: isLoadingTypes } = useGetProductTypes({});`
- **Purpose:** Fetches product types for selection when editing a category.

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

### `useEffect` (Data Sync)
**purpose:** Synchronize form state with category data when it loads.

**process:**
1. Checks if `category` data has loaded.
2. Updates `form` state with `category` details.

**function implementation:**
```tsx
  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        details: category.details || '',
        productType: typeof category.productType === 'string' ? category.productType : (category.productType as IProductType)?._id || '',
        sort: category.sort || 0,
      });
      setPreviewUrl(category.icon || null);
    }
  }, [category]);
```

### `handleSubmit()`
**purpose:** Orchestrates local validation, calls the update function from TanStack Query, and manages navigation.

**process:**
1. Prevents default form submission.
2. Resets `inlineError`.
3. Validates required fields (`name`, `productType`).
4. Calls `updateProductCategory.mutateAsync({ id: id!, data: formData })`.
5. Navigates back to the detail view upon success.
6. Sets `inlineError` if the API request fails.

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
      await updateProductCategory.mutateAsync({ id: id!, data: formData });
      navigate(`/product-categories/${id}`);
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to update product category');
    }
  }, [form, icon, updateProductCategory, id, navigate]);
```

## API Integration

### `GET /api/product-categories/:id`

#### API
```typescript
export const productCategoryAPI = {
  // Get product category by ID
  getCategoryById: (id: string) => api.get(`/api/product-categories/${id}`),
};
```

#### Hook
```typescript
export const useGetProductCategoryById = (id: string) => {
  return useQuery({
    queryKey: ['product-category', id],
    queryFn: async () => {
      const response = await productCategoryAPI.getCategoryById(id);
      return response.data.data;
    },
  });
};
```

#### Contract
`data.data` contains `{ category }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "650af123...",
      "name": "Shirts",
      "details": "...",
      "productType": { "_id": "...", "name": "Laundry Service" },
      "sort": 1
    }
  }
}
```

---

### `PUT /api/product-categories/:id`

#### API
```typescript
export const productCategoryAPI = {
  // Update product category
  updateCategory: (id: string, formData: FormData) => api.put(`/api/product-categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
```

#### Hook
```typescript
export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: FormData }) => productCategoryAPI.updateCategory(id, data),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['product-category', variables.id] }),
  });
};
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Product category updated successfully",
  "data": {
    "category": { ... }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Screen shell:** `div` with `p-6` padding.
- **Header:** Contains "Back to Details" link and page title (Edit Product Category: [Name]).
- **Form:** White container (`bg-white rounded-3xl p-8`) with icon upload, input fields pre-filled with existing data, and save/cancel buttons.

## Form Inputs
- Same fields as `CreateProductCategory`, pre-filled with data from the API.

## Error Handling
- Displays `inlineError` banner if form validation fails or API returns an error.
- Displays loading/error states while fetching initial category data.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header (Back Link, Title)                                │
├──────────────────────────────────────────────────────────┤
│ Icon Upload (Preview)                                    │
├──────────────────────────────────────────────────────────┤
│ Form (Name, Type, Order, Details)                        │
├──────────────────────────────────────────────────────────┤
│ Buttons (Save, Cancel)                                   │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────┐
│ < Back to Details                                        │
│ Edit Product Category: Shirts                            │
│                                                          │
│                      [ Icon ]                            │
│                                                          │
│ [  Name field  ]  [  Product Type dropdown  ]            │
│ [  Sort field  ]                                         │
│                                                          │
│ [  Details textarea                        ]             │
│                                                          │
│ [ Save Changes ] [ Cancel ]                              │
└──────────────────────────────────────────────────────────┘
```

## Navigation Flow
- "Back" button -> `/product-categories/:id`
- Successful update -> `/product-categories/:id`
- "Cancel" button -> `/product-categories/:id`

## Future Enhancements
- (Same as `CreateProductCategory`)
