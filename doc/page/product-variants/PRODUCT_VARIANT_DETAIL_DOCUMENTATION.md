# Product Variant Detail Screen Documentation

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
import { useGetProductVariantById } from '../../../tanstack/useProductVariants';
```

## Context and State Management

### TanStack Query

#### `useGetProductVariantById`
- **Hook usage:** `const { data: modifier, isLoading, isError, error } = useGetProductVariantById(id!);`
- **Purpose:** Fetches the product variant details for display.

## Functions Involved

### `ProductVariantDetailSkeleton()`
**purpose:** Displays a loading skeleton while the variant data is being fetched.

### `navigate`
**purpose:** Used to redirect the user to the product variant list or the edit product variant page.

## API Integration

### `GET /api/product-variants/:id`

#### Interface
```typescript
export interface GetProductVariantParams {
  id: string;
}
```

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

## UI Structure
- **Screen shell:** `div` with `p-6` padding.
- **Header:** Contains a back button, variant name, variant ID, and an "Edit Variant" button.
- **Detail View:** White container displaying:
  - Variant details (Options list).

## Error Handling
- Handles loading state (`isLoading`).
- Handles error state (`isError`) by showing an alert icon and the error message, along with a "Back to List" button.
- Handles empty variant state ("Variant not found").

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
│ < Back to List                          Edit Variant     │
│ Small - Red                                              │
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
- "Back" button -> `/product-variants`
- "Edit" button -> `/product-variants/:id/edit`

## Future Enhancements
- Add visual indicators for required status.
