# Create Product Modifier Screen Documentation

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
import { useCreateProductModifier } from '../../../tanstack/useProductModifiers';
```

## Context and State Management

### TanStack Query

#### `useCreateProductModifier`
- **Hook usage:** `const createProductModifier = useCreateProductModifier();`
- **Purpose:** Mutation hook to create a new product modifier.

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
4. Calls `createProductModifier.mutateAsync(form)`.
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
      await createProductModifier.mutateAsync(form);
      navigate('/product-modifiers');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to create modifier');
    }
  }, [form, createProductModifier, navigate]);
```

## API Integration

### `POST /api/product-modifiers`

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
  // Create product modifier
  createModifier: (data: any) => api.post('/api/product-modifiers', data),
};
```

#### Hook
```typescript
export const useCreateProductModifier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productModifierAPI.createModifier,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-modifiers'] }),
  });
};
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Standard padding container.
- **Header:** Contains "Back to Modifiers" link and page title.
- **Form:** White container (`bg-white rounded-3xl p-8`) with input fields for general settings, and dynamic inputs for options.

## Form Inputs

### `Name Input`
**Purpose**: Collects the name of the product modifier.
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

### `Required Checkbox`
**Purpose**: Sets the required status of the modifier.

**Input implementation**:
```tsx
<input 
  type="checkbox" 
  checked={form.required} 
  onChange={(e) => setForm({...form, required: e.target.checked})} 
/>
```

### `Selection Constraints (Min/Max)`
**Purpose**: Collects minimum and maximum selection limits for the modifier.

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
**Purpose**: Manages a dynamic list of modifier options with names and prices.

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

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header (Back Link, Title)                                │
├──────────────────────────────────────────────────────────┤
│ Form (Name, Required, Selection, Options)                │
├──────────────────────────────────────────────────────────┤
│ Buttons (Create, Cancel)                                 │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────┐
│ < Back to Product Modifiers                              │
│ Create New Modifier                                      │
│                                                          │
│ [  Name field  ]  [ Required (check) ]                   │
│ [  Min Select  ]  [ Max Select       ]                   │
│                                                          │
│ Options                                                  │
│ [ Option Name | Price ] [ - ]                            │
│ [ Option Name | Price ] [ - ]                            │
│                                                          │
│ [ Create ] [ Cancel ]                                    │
└──────────────────────────────────────────────────────────┘
```

## Navigation Flow
- "Back" button -> `/product-modifiers`
- Successful creation -> `/product-modifiers`

## Future Enhancements
- Add drag-and-drop to reorder options.
- Add real-time validation feedback.
