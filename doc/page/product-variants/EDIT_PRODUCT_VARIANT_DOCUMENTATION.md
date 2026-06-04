# Edit Product Variant Screen Documentation

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
import { MdArrowBack, MdRemove } from 'react-icons/md';
import { useGetProductVariantById, useUpdateProductVariant } from '../../../tanstack/useProductVariants';
```

## Context and State Management

### TanStack Query

#### `useGetProductVariantById`
- **Hook usage:** `const { data: variantData, isLoading, isError, error } = useGetProductVariantById(id!);`
- **Purpose:** Fetches the product variant details for editing.

#### `useUpdateProductVariant`
- **Hook usage:** `const updateProductVariant = useUpdateProductVariant();`
- **Purpose:** Mutation hook to update an existing product variant.

### Local Component State

#### `form`
- **Purpose:** Manages product variant form data (name, options).
```tsx
const [form, setForm] = useState({
  name: '',
  options: [{ name: '', price: 0 }],
});
```

#### `inlineError`
- **Purpose:** Stores local validation or API error messages.
```tsx
const [inlineError, setInlineError] = useState<string | null>(null);
```

## Functions Involved

### `useEffect` (Data Sync)
**purpose:** Synchronize form state with variant data when it loads.

**process:**
1. Checks if `variant` data has loaded.
2. Updates `form` state with `variant` details.

**function implementation:**
```tsx
  useEffect(() => {
    if (variant) {
      setForm({
        name: variant.name || '',
        options: variant.options?.map((o: any) => ({ name: o.name, price: o.price })) || [{ name: '', price: 0 }],
      });
    }
  }, [variant]);
```

### `handleOptionChange()`
**purpose:** Updates specific option field (name or price) at a given index.

**function implementation:**
```tsx
  const handleOptionChange = (index: number, field: string, value: string | number) => {
    const newOptions = [...form.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setForm({ ...form, options: newOptions });
  };
```

### `addOption()` / `removeOption()`
**purpose:** Adds a new option to the list or removes an existing one.

**function implementation:**
```tsx
  const addOption = () => {
    setForm({ ...form, options: [...form.options, { name: '', price: 0 }] });
  };

  const removeOption = (index: number) => {
    setForm({ ...form, options: form.options.filter((_, i) => i !== index) });
  };
```

### `handleSubmit()`
**purpose:** Orchestrates local validation, calls the update function, and manages navigation.

**process:**
1. Prevents default form submission.
2. Resets `inlineError`.
3. Validates that `name` is filled and all options have `name` defined.
4. Calls `updateProductVariant.mutateAsync({ id: id!, data: form })`.
5. Navigates back to the detail view upon success.
6. Sets `inlineError` if the API request fails.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name || form.options.some(o => !o.name)) {
      setInlineError('Name and all options are required.');
      return;
    }

    try {
      await updateProductVariant.mutateAsync({ id: id!, data: form });
      navigate(`/product-variants/${id}`);
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to update variant');
    }
  }, [form, updateProductVariant, id, navigate]);
```

## API Integration

### `GET /api/product-variants/:id`

#### API
```typescript
export const productVariantAPI = {
  // Get variant by ID
  getVariantById: (id: string) => api.get(`/api/product-variants/${id}`),
};
```

#### Hook
```typescript
export const useGetProductVariantById = (id: string) => {
  return useQuery({
    queryKey: ['product-variant', id],
    queryFn: async () => {
      const response = await productVariantAPI.getVariantById(id);
      return response.data.data;
    },
  });
};
```

#### Contract
`data` contains `{ variant }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "variant": {
      "_id": "650af123...",
      "name": "Small - Red",
      "options": [{ "name": "Small", "price": 0 }, ...],
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `PUT /api/product-variants/:id`

#### Payload
```json
{
  "name": "string",
  "options": [{ "name": "string", "price": "number" }]
}
```

#### API
```typescript
export const productVariantAPI = {
  // Update variant
  updateVariant: (id: string, data: any) => api.put(`/api/product-variants/${id}`, data),
};
```

#### Hook
```typescript
export const useUpdateProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => productVariantAPI.updateVariant(id, data),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['product-variant', variables.id] }),
  });
};
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Product variant updated successfully",
  "data": {
    "variant": { ... }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Screen shell:** `div` with `p-6` padding.
- **Header:** Contains "Back to Details" link and page title (Edit Variant: [Name]).
- **Form:** White container (`bg-white rounded-3xl p-8`) with input fields pre-filled with existing data and save/cancel buttons.

## Form Inputs

### `Name Input`
**Purpose**: Collects the name of the product variant, pre-filled with existing data.

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

### `Options List`
**Purpose**: Manages a dynamic list of variant options with names and prices, pre-filled with existing options.

**Input implementation:**
```tsx
{form.options.map((option, index) => (
  <div key={index} className="flex gap-2">
    <input 
      type="text" 
      value={option.name} 
      onChange={(e) => handleOptionChange(index, 'name', e.target.value)} 
      className="input" 
      placeholder="Option Name" 
      required 
    />
    <input 
      type="number" 
      value={option.price} 
      onChange={(e) => handleOptionChange(index, 'price', Number(e.target.value))} 
      className="input" 
      placeholder="Price" 
      required 
    />
    <button type="button" onClick={() => removeOption(index)} className="btn-secondary"><MdRemove/></button>
  </div>
))}
<button type="button" onClick={addOption} className="btn-secondary">Add Option</button>
```

## Error Handling
- Displays `inlineError` banner if validation fails or API returns an error.
- Displays loading/error states while fetching initial variant data.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header (Back Link, Title)                                │
├──────────────────────────────────────────────────────────┤
│ Form (Name, Options)                                     │
├──────────────────────────────────────────────────────────┤
│ Buttons (Save, Cancel)                                   │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────┐
│ < Back to Details                                        │
│ Edit Variant: Small - Red                                │
│                                                          │
│ [  Name field  ]                                         │
│                                                          │
│ Options                                                  │
│ [ Option Name | Price ] [ - ]                            │
│ [ Option Name | Price ] [ - ]                            │
│                                                          │
│ [ Save Changes ] [ Cancel ]                              │
└──────────────────────────────────────────────────────────┘
```

## Navigation Flow
- "Back" button -> `/product-variants/:id`
- Successful update -> `/product-variants/:id`
- "Cancel" button -> `/product-modifiers/:id`

## Future Enhancements
- Add drag-and-drop to reorder options.
