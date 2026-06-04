# Edit Product Modifier Screen Documentation

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
import { useGetProductModifierById, useUpdateProductModifier } from '../../../tanstack/useProductModifiers';
```

## Context and State Management

### TanStack Query

#### `useGetProductModifierById`
- **Hook usage:** `const { data: modifierData, isLoading, isError, error } = useGetProductModifierById(id!);`
- **Purpose:** Fetches the product modifier details for editing.

#### `useUpdateProductModifier`
- **Hook usage:** `const updateProductModifier = useUpdateProductModifier();`
- **Purpose:** Mutation hook to update an existing product modifier.

### Local Component State

#### `form`
- **Purpose:** Manages product modifier form data (name, required, minSelection, maxSelection, options).
```tsx
const [form, setForm] = useState({
  name: '',
  required: false,
  minSelection: 0,
  maxSelection: 1,
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
**purpose:** Synchronize form state with modifier data when it loads.

**process:**
1. Checks if `modifier` data has loaded.
2. Updates `form` state with `modifier` details.

**function implementation:**
```tsx
  useEffect(() => {
    if (modifier) {
      setForm({
        name: modifier.name || '',
        required: modifier.required || false,
        minSelection: modifier.minSelection || 0,
        maxSelection: modifier.maxSelection || 1,
        options: modifier.options?.map((o: any) => ({ name: o.name, price: o.price })) || [{ name: '', price: 0 }],
      });
    }
  }, [modifier]);
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
4. Calls `updateProductModifier.mutateAsync({ id: id!, data: form })`.
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
      await updateProductModifier.mutateAsync({ id: id!, data: form });
      navigate(`/product-modifiers/${id}`);
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to update modifier');
    }
  }, [form, updateProductModifier, id, navigate]);
```

## API Integration

### `GET /api/product-modifiers/:id`

#### Interface
```typescript
export interface GetProductModifierParams {
  // Add interface properties if available
}
```

#### API
```typescript
export const productModifierAPI = {
  // Get modifier by ID
  getModifierById: (id: string) => api.get(`/api/product-modifiers/${id}`),
};
```

#### Hook
```typescript
export const useGetProductModifierById = (id: string) => {
  return useQuery({
    queryKey: ['product-modifier', id],
    queryFn: async () => {
      const response = await productModifierAPI.getModifierById(id);
      return response.data.data;
    },
  });
};
```

#### Contract
`data` contains `{ modifier }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "modifier": {
      "_id": "650af123...",
      "name": "Size",
      "required": true,
      "minSelection": 1,
      "maxSelection": 1,
      "options": [{ "name": "Small", "price": 0 }, ...],
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `PUT /api/product-modifiers/:id`

#### Payload
```json
{
  "name": "string",
  "required": "boolean",
  "minSelection": "number",
  "maxSelection": "number",
  "options": [{ "name": "string", "price": "number" }]
}
```

#### API
```typescript
export const productModifierAPI = {
  // Update modifier
  updateModifier: (id: string, data: any) => api.put(`/api/product-modifiers/${id}`, data),
};
```

#### Hook
```typescript
export const useUpdateProductModifier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => productModifierAPI.updateModifier(id, data),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['product-modifier', variables.id] }),
  });
};
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Product modifier updated successfully",
  "data": {
    "modifier": { ... }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Screen shell:** `div` with `p-6` padding.
- **Header:** Contains "Back to Details" link and page title (Edit Modifier: [Name]).
- **Form:** White container (`bg-white rounded-3xl p-8`) with input fields pre-filled with existing data and save/cancel buttons.

## Form Inputs

### `Name Input`
**Purpose**: Collects the name of the product modifier, pre-filled with existing data.

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

### `Required Checkbox`
**Purpose**: Sets the required status of the modifier, pre-filled with existing data.

**Input implementation**:
```tsx
<input 
  type="checkbox" 
  checked={form.required} 
  onChange={(e) => setForm({...form, required: e.target.checked})} 
/>
```

### `Selection Constraints (Min/Max)`
**Purpose**: Collects minimum and maximum selection limits for the modifier, pre-filled with existing data.

**Input implementation**:
```tsx
<input 
  type="number" 
  value={form.minSelection} 
  onChange={(e) => setForm({...form, minSelection: Number(e.target.value)})} 
  className="input" 
/>
<input 
  type="number" 
  value={form.maxSelection} 
  onChange={(e) => setForm({...form, maxSelection: Number(e.target.value)})} 
  className="input" 
/>
```

### `Options List`
**Purpose**: Manages a dynamic list of modifier options with names and prices, pre-filled with existing options.

**Input implementation**:
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
- Displays loading/error states while fetching initial modifier data.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header (Back Link, Title)                                │
├──────────────────────────────────────────────────────────┤
│ Form (Name, Required, Selection, Options)                │
├──────────────────────────────────────────────────────────┤
│ Buttons (Save, Cancel)                                   │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────┐
│ < Back to Details                                        │
│ Edit Modifier: Size                                      │
│                                                          │
│ [  Name field  ]  [ Required (check) ]                   │
│ [  Min Select  ]  [ Max Select       ]                   │
│                                                          │
│ Options                                                  │
│ [ Option Name | Price ] [ - ]                            │
│ [ Option Name | Price ] [ - ]                            │
│                                                          │
│ [ Save Changes ] [ Cancel ]                              │
└──────────────────────────────────────────────────────────┘
```

## Navigation Flow
- "Back" button -> `/product-modifiers/:id`
- Successful update -> `/product-modifiers/:id`
- "Cancel" button -> `/product-modifiers/:id`

## Future Enhancements
- Add bulk actions for modifiers.
