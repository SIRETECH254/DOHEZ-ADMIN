# Edit Product Type Screen Documentation

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
import { MdArrowBack } from 'react-icons/md';
import { useGetProductTypeById, useUpdateProductType } from '../../../tanstack/useProductTypes';
import { useGetServices } from '../../../tanstack/useServices';
import type { IService } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetProductTypeById`
- **Hook usage:** `const { data: productTypeData, isLoading, isError, error } = useGetProductTypeById(id!);`
- **Purpose:** Fetches the product type details for editing.

#### `useUpdateProductType`
- **Hook usage:** `const updateProductType = useUpdateProductType();`
- **Purpose:** Mutation hook to update an existing product type.

#### `useGetServices`
- **Hook usage:** `const { data: servicesData, isLoading: isLoadingServices } = useGetServices({ all: true });`
- **Purpose:** Fetches services for selection when editing a product type.

### Local Component State

#### `form`
- **Purpose:** Manages product type form data (name, description, service, order).
```tsx
const [form, setForm] = useState({
  name: '',
  description: '',
  service: '',
  order: 0,
});
```

#### `inlineError`
- **Purpose:** Stores local validation or API error messages.
```tsx
const [inlineError, setInlineError] = useState<string | null>(null);
```

## Functions Involved

### `useEffect` (Data Sync)
**purpose:** Synchronize form state with product type data when it loads.

**process:**
1. Checks if `productType` data has loaded.
2. Updates `form` state with `productType` details.

**function implementation:**
```tsx
  useEffect(() => {
    if (productType) {
      setForm({
        name: productType.name || '',
        description: productType.details || '',
        service: typeof productType.service === 'string' ? productType.service : (productType.service as IService)?._id || '',
        order: productType.order || 0,
      });
    }
  }, [productType]);
```

### `handleSubmit()`
**purpose:** Orchestrates local validation, calls the update function from TanStack Query, and manages navigation.

**process:**
1. Prevents default form submission.
2. Resets `inlineError`.
3. Validates required fields (`name`, `service`).
4. Calls `updateProductType.mutateAsync({ id: id!, data: payload })`.
5. Navigates back to the detail view upon success.
6. Sets `inlineError` if the API request fails.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name || !form.service) {
      setInlineError('Name and Service are required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      details: form.description.trim(),
      service: form.service,
      order: form.order,
    };

    try {
      await updateProductType.mutateAsync({ id: id!, data: payload });
      navigate(`/product-types/${id}`);
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to update product type');
    }
  }, [form, updateProductType, id, navigate]);
```

## API Integration

### `GET /api/product-types/:id`

#### API
```typescript
export const productTypeAPI = {
  // Get product type by ID
  getProductTypeById: (id: string) => api.get(`/api/product-types/${id}`),
};
```

#### Hook
```typescript
export const useGetProductTypeById = (id: string) => {
  return useQuery({
    queryKey: ['product-type', id],
    queryFn: async () => {
      const response = await productTypeAPI.getProductTypeById(id);
      return response.data.data;
    },
  });
};
```

#### Contract
`data.data` contains `{ productType }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "productType": {
      "_id": "650af123...",
      "name": "Dry Cleaning",
      "details": "...",
      "service": "...",
      "order": 1
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `PUT /api/product-types/:id`

#### Payload
```json
{
  "name": "string",
  "details": "string",
  "service": "string",
  "order": "number"
}
```

#### API
```typescript
export const productTypeAPI = {
  // Update product type
  updateProductType: (id: string, data: any) => api.put(`/api/product-types/${id}`, data),
};
```

#### Hook
```typescript
export const useUpdateProductType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => productTypeAPI.updateProductType(id, data),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['product-type', variables.id] }),
  });
};
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Product type updated successfully",
  "data": {
    "productType": { ... }
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
  // Get all services
  getAllServices: (params?: { all?: boolean }) => api.get('/api/services', { params }),
};
```

#### Hook
```typescript
export const useGetServices = (params?: { all?: boolean }) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: async () => {
      const response = await serviceAPI.getAllServices(params);
      return response.data.data;
    },
  });
};
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Screen shell:** `div` with `p-6` padding.
- **Header:** Contains "Back to Details" link and page title (Edit Product Type: [Name]).
- **Form:** White container (`bg-white rounded-3xl p-8`) with input fields pre-filled with existing data and save/cancel buttons.

## Form Inputs

### `Name Input`
**Purpose**: Collects the name of the product type, pre-filled with existing data.

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

### `Service Dropdown`
**Purpose**: Allows selecting the service associated with the product type, pre-filled with existing data.

**Input implementation**:
```tsx
<select 
  value={form.service} 
  onChange={(e) => setForm({...form, service: e.target.value})} 
  className="input" 
  required 
  disabled={isLoadingServices}
>
  <option value="">Select a service</option>
  {services.map((s: IService) => (
    <option key={s._id} value={s._id}>{s.name}</option>
  ))}
</select>
```

### `Order Input`
**Purpose**: Collects the display order of the product type, pre-filled with existing data.

**Input implementation**:
```tsx
<input 
  type="number" 
  value={form.order} 
  onChange={(e) => setForm({...form, order: Number(e.target.value)})} 
  className="input" 
/>
```

### `Description Textarea`
**Purpose**: Collects an optional description for the product type, pre-filled with existing data.

**Input implementation**:
```tsx
<textarea 
  value={form.description} 
  onChange={(e) => setForm({...form, description: e.target.value})} 
  className="input min-h-[100px] py-3" 
/>
```

## Error Handling
- Displays `inlineError` banner if form validation fails or API returns an error.
- Displays loading/error states while fetching initial product type data.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header (Back Link, Title)                                │
├──────────────────────────────────────────────────────────┤
│ Form (Name, Service, Order, Description)                 │
├──────────────────────────────────────────────────────────┤
│ Buttons (Save, Cancel)                                   │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────┐
│ < Back to Details                                        │
│ Edit Product Type: Dry Cleaning                          │
│                                                          │
│ [  Name field  ]  [  Service dropdown   ]                │
│ [  Order field ]                                         │
│                                                          │
│ [  Description textarea                        ]         │
│                                                          │
│ [ Save Changes ] [ Cancel ]                              │
└──────────────────────────────────────────────────────────┘
```

## Navigation Flow
- "Back" button -> `/product-types/:id`
- Successful update -> `/product-types/:id`
- "Cancel" button -> `/product-types/:id`

## Future Enhancements
- Add image upload for icon/logo.
- Add real-time input validation.
