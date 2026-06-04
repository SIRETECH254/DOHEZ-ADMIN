# Product Modifier Detail Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Error Handling](#error-handling)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Navigation Flow](#navigation-flow)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetProductModifierById } from '../../../tanstack/useProductModifiers';
```

## Context and State Management

### TanStack Query

#### `useGetProductModifierById`
- **Hook usage:** `const { data: modifier, isLoading, isError, error } = useGetProductModifierById(id!);`
- **Purpose:** Fetches the product modifier details for display.

## Functions Involved

### `ProductModifierDetailSkeleton()`
**purpose:** Displays a loading skeleton while the modifier data is being fetched.

### `navigate`
**purpose:** Used to redirect the user to the product modifier list or the edit product modifier page.

## API Integration

### `GET /api/product-modifiers/:id`

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

## UI Structure
- **Screen shell:** `div` with `p-6` padding.
- **Header:** Contains a back button, modifier name, modifier ID, and an "Edit Modifier" button.
- **Detail View:** White container displaying:
  - Modifier details (Required, Min Selection, Max Selection).
  - Options list area.

## Error Handling
- Handles loading state (`isLoading`).
- Handles error state (`isError`) by showing an alert icon and the error message, along with a "Back to List" button.
- Handles empty modifier state ("Modifier not found").

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header (Back, Title, Edit Button)                        │
├──────────────────────────────────────────────────────────┤
│ Detail View (Details (Required, Min/Max Selection))      │
├──────────────────────────────────────────────────────────┤
│ Options List Area                                        │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────┐
│ < Back to List                          Edit Modifier    │
│ Size                                                     │
│ ID: 650af...                                             │
│                                                          │
│ Required: Yes                                            │
│ Min Selection: 1                                         │
│ Max Selection: 1                                         │
│                                                          │
│ Options                                                  │
│ [ Option Name | Price ]                                  │
│ [ Option Name | Price ]                                  │
└──────────────────────────────────────────────────────────┘
```

## Navigation Flow
- "Back" button -> `/product-modifiers`
- "Edit" button -> `/product-modifiers/:id/edit`

## Future Enhancements
- Add visual indicators for required status.
