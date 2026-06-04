# Product Type Detail Screen Documentation

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
import { useGetProductTypeById } from '../../../tanstack/useProductTypes';
import type { IService } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetProductTypeById`
- **Hook usage:** `const { data: productTypeData, isLoading, isError, error } = useGetProductTypeById(id!);`
- **Purpose:** Fetches the product type details for display.

## Functions Involved

### `ProductTypeDetailSkeleton()`
**purpose:** Displays a loading skeleton while the product type data is being fetched.

### `navigate`
**purpose:** Used to redirect the user to the product type list or the edit product type page.

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
      "service": { "_id": "...", "name": "Laundry Service" },
      "order": 1,
      "slug": "dry-cleaning",
      "details": "..."
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Screen shell:** `div` with `p-6` padding.
- **Header:** Contains a back button, product type name, product type ID, and an "Edit Product Type" button.
- **Detail View:** White container displaying:
  - Product Type icon (or fallback initials).
  - Product Type details (Service, Order, Slug).
  - Description area.

## Error Handling
- Handles loading state (`isLoading`).
- Handles error state (`isError`) by showing an alert icon and the error message, along with a "Back to List" button.
- Handles empty product type state ("Product type not found").

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header (Back, Title, Edit Button)                        │
├──────────────────────────────────────────────────────────┤
│ Detail View (Icon, Details (Service, Order, Slug))       │
├──────────────────────────────────────────────────────────┤
│ Description Area                                         │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────┐
│ < Back to List                          Edit Product Type│
│ Dry Cleaning                                             │
│ ID: 650af...                                             │
│                                                          │
│ [ Icon ]   Service: Laundry Service                      │
│            Order: 1                                      │
│            Slug: dry-cleaning                            │
│                                                          │
│ Description                                              │
│ [ Detailed description text...                         ] │
└──────────────────────────────────────────────────────────┘
```

## Navigation Flow
- "Back" button -> `/product-types`
- "Edit" button -> `/product-types/:id/edit`

## Future Enhancements
- Add operational hours display (if applicable).
- Add list of associated products.
