# Product Category Detail Screen Documentation

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
import { useGetProductCategoryById } from '../../../tanstack/useProductCategories';
import type { IProductType } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetProductCategoryById`
- **Hook usage:** `const { data: categoryData, isLoading, isError, error } = useGetProductCategoryById(id!);`
- **Purpose:** Fetches the product category details for display.

## Functions Involved

### `ProductCategoryDetailSkeleton()`
**purpose:** Displays a loading skeleton while the category data is being fetched.

### `navigate`
**purpose:** Used to redirect the user to the product category list or the edit product category page.

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
      "productType": { "_id": "...", "name": "Laundry Service" },
      "sort": 1,
      "details": "..."
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Screen shell:** `div` with `p-6` padding.
- **Header:** Contains a back button, category name, category ID, and an "Edit Product Category" button.
- **Detail View:** White container displaying:
  - Product Category icon (or fallback initials).
  - Category details (Product Type, Sort Order).
  - Details area.

## Error Handling
- Handles loading state (`isLoading`).
- Handles error state (`isError`) by showing an alert icon and the error message, along with a "Back to List" button.
- Handles empty category state ("Product category not found").

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header (Back, Title, Edit Button)                        │
├──────────────────────────────────────────────────────────┤
│ Detail View (Icon, Details (Type, Sort Order))           │
├──────────────────────────────────────────────────────────┤
│ Details Area                                             │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────┐
│ < Back to List                      Edit Product Category│
│ Shirts                                                   │
│ ID: 650af...                                             │
│                                                          │
│ [ Icon ]   Type: Laundry Service                         │
│            Sort: 1                                       │
│                                                          │
│ Details                                                  │
│ [ Detailed description text...                         ] │
└──────────────────────────────────────────────────────────┘
```

## Navigation Flow
- "Back" button -> `/product-categories`
- "Edit" button -> `/product-categories/:id/edit`

## Future Enhancements
- Add list of associated products.
