# Create Product Variant Screen Documentation

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
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdRemove } from 'react-icons/md';
import { useCreateProductVariant } from '../../../tanstack/useProductVariants';
```

## Context and State Management

### TanStack Query

#### `useCreateProductVariant`
- **Hook usage:** `const createProductVariant = useCreateProductVariant();`
- **Purpose:** Mutation hook to create a new product variant.

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

### `handleOptionChange()`
**purpose:** Updates specific option field (name or price) at a given index.

**process:**
1. Creates a copy of the `form.options` array.
2. Updates the specific option at the given index with the new field value.
3. Updates the `form` state with the new options array.

**function implementation:**
```tsx
  const handleOptionChange = (index: number, field: string, value: string | number) => {
    const newOptions = [...form.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setForm({ ...form, options: newOptions });
  };
```

### `addOption()`
**purpose:** Adds a new option to the list.

**process:**
1. Adds a new empty option object `{ name: '', price: 0 }` to the `form.options` array.

**function implementation:**
```tsx
  const addOption = () => {
    setForm({ ...form, options: [...form.options, { name: '', price: 0 }] });
  };
```

### `removeOption()`
**purpose:** Removes an existing option from the list.

**process:**
1. Filters out the option at the specified index from the `form.options` array.

**function implementation:**
```tsx
  const removeOption = (index: number) => {
    setForm({ ...form, options: form.options.filter((_, i) => i !== index) });
  };
```

### `handleSubmit()`
**purpose:** Orchestrates local validation, calls the create function, and manages navigation.

**process:**
1. Prevents default form submission.
2. Resets `inlineError`.
3. Validates that `name` is filled and all options have `name` defined.
4. Calls `createProductVariant.mutateAsync(form)`.
5. Navigates back to the list on success.
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
      await createProductVariant.mutateAsync(form);
      navigate('/product-variants');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to create variant');
    }
  }, [form, createProductVariant, navigate]);
```

## API Integration

### `POST /api/product-variants`

#### Interface
```typescript
export interface CreateProductVariantParams {
  name: string;
  options: { name: string; price: number }[];
}
```

#### API
```typescript
export const productVariantAPI = {
  // Create product variant
  createVariant: (data: CreateProductVariantParams) => api.post('/api/product-variants', data),
};
```

#### Hook
```typescript
export const useCreateProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productVariantAPI.createVariant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-variants'] }),
  });
};
```

#### Contract
`data` contains the created variant.

#### Response (201 Created)
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

## UI Structure
- **Container:** Standard padding container.
- **Header:** Contains "Back to Product Variants" link and page title.
- **Form:** White container (`bg-white rounded-3xl p-8`) with input fields for general settings, and dynamic inputs for options.

## Form Inputs

### `Name Input`
**Purpose**: Collects the name of the product variant.
**Applicable**: Required field.

**Input implementation:**
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
**Purpose**: Manages a dynamic list of variant options with names and prices.

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

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header (Back Link, Title)                                │
├──────────────────────────────────────────────────────────┤
│ Form (Name, Options)                                     │
├──────────────────────────────────────────────────────────┤
│ Buttons (Create, Cancel)                                 │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────┐
│ < Back to Product Variants                               │
│ Create New Product Variant                               │
│                                                          │
│ [  Name field  ]                                         │
│                                                          │
│ Options                                                  │
│ [ Option Name | Price ] [ - ]                            │
│ [ Option Name | Price ] [ - ]                            │
│                                                          │
│ [ Create ] [ Cancel ]                                    │
└──────────────────────────────────────────────────────────┘
```

## Navigation Flow
- "Back" button -> `/product-variants`
- Successful creation -> `/product-variants`

## Future Enhancements
- Add drag-and-drop to reorder options.
- Add real-time input validation.
