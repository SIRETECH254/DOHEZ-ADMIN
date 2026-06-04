# Create Product Type Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
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
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useCreateProductType } from '../../../tanstack/useProductTypes';
import { useGetServices } from '../../../tanstack/useServices';
import type { IService } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useCreateProductType`
- **Hook usage:** `const createProductType = useCreateProductType();`
- **Purpose:** Mutation hook to create a new product type.

#### `useGetServices`
- **Hook usage:** `const { data: servicesData, isLoading: isLoadingServices } = useGetServices({ all: true });`
- **Purpose:** Fetches services for selection when creating a product type.

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

### `handleSubmit()`
**purpose:** Orchestrates local validation, calls the create function from TanStack Query, and manages navigation.

**process:**
1. Prevents default form submission.
2. Resets `inlineError`.
3. Validates required fields (`name`, `service`).
4. Calls `createProductType.mutateAsync(payload)`.
5. Navigates to `/product-types` upon success.
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
      await createProductType.mutateAsync(payload);
      navigate('/product-types');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to create product type');
    }
  }, [form, createProductType, navigate]);
```

## API Integration

### `POST /api/product-types`

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
  // Create product type
  createProductType: (data: any) => api.post('/api/product-types', data),
};
```

#### Hook
```typescript
export const useCreateProductType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productTypeAPI.createProductType,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-types'] }),
  });
};
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
- **Header:** Contains "Back to Product Types" link and page title.
- **Form:** White container (`bg-white rounded-3xl p-8`) with input fields and submit/cancel buttons.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header (Back Link, Title)                                │
├──────────────────────────────────────────────────────────┤
│ Form (Name, Service, Order, Description)                 │
├──────────────────────────────────────────────────────────┤
│ Buttons (Create, Cancel)                                 │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────┐
│ < Back to Product Types                                  │
│ Create New Product Type                                  │
│                                                          │
│ [  Name field  ]  [  Service dropdown   ]                │
│ [  Order field ]                                         │
│                                                          │
│ [  Description textarea                        ]         │
│                                                          │
│ [ Create ] [ Cancel ]                                    │
└──────────────────────────────────────────────────────────┘
```

## Form Inputs

### `Name Input`
**Purpose**: Collects the name of the product type.
**Applicable**: Required field.

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
**Purpose**: Allows selecting the service associated with the product type.
**Applicable**: Required field; shows loading state when services are fetching.

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
**Purpose**: Collects the display order of the product type.

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
**Purpose**: Collects an optional description for the product type.

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

## Navigation Flow
- "Back" button -> `/product-types`
- Successful creation -> `/product-types`

## Future Enhancements
- Add image upload for icon/logo.
- Add real-time input validation.
