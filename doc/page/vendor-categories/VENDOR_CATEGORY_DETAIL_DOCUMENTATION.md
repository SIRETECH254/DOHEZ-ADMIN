# Vendor Category Detail Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Display State](#display-state)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Detail Fields](#detail-fields)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)

## Imports
```tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';

import { useGetVendorCategoryById } from '../../../tanstack/useVendorCategories';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IVendorType } from '../../../types/api.types';
```

## Context and State Management

### Context

#### `TanStack Query`
- **Hook usage on detail screen:** `const { data: categoryData, isLoading, isError, error } = useGetVendorCategoryById(id!);`

**`useGetVendorCategoryById` hook (from `useVendorCategories.ts`):**
```tsx
export const useGetVendorCategoryById = (idOrSlug: string) => {
  return useQuery({
    queryKey: ['vendorCategory', idOrSlug],
    queryFn: async () => {
      const response = await vendorCategoryAPI.getVendorCategoryById(idOrSlug);
      return response.data.data;
    },
    enabled: !!idOrSlug,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### `Redux`
- **Redux slice:** Not directly used for vendor categories; relies on TanStack Query for server state management.

### Display State

#### `category`
- **Category data:** derived from `categoryData?.category` and used to populate the fields.
```tsx
const category = categoryData?.category;
```

#### `isLoading`
- **Loading state:** triggers the `VendorCategoryDetailSkeleton` component.

## Functions Involved

### `VendorCategoryDetailSkeleton()`
**purpose:** Renders an animated loading state.

**process:**
1. Displays header placeholders for back button and title.
2. Displays card placeholders for image and text fields.

### `new Date().toLocaleDateString()`
**purpose:** Formats the registration date.

**implementation:**
```tsx
new Date(category.createdAt).toLocaleDateString(undefined, { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})
```

## API Integration

### `GET /api/vendor-categories/:idOrSlug`

#### Interface
```tsx
export interface IVendorCategory {
  _id: string;
  vendorType?: string | IVendorType | null;
  name: string;
  description?: string;
  slug: string;
  image?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### API
```typescript
export const vendorCategoryAPI = {
  // Fetch single vendor category details by ID or Slug.
  getVendorCategoryById: (idOrSlug: string) => api.get(`/api/vendor-categories/${idOrSlug}`),
}
```

#### Contract
`data.data` contains `{ category }`.

#### Response
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "string",
      "vendorType": "string | IVendorType",
      "name": "string",
      "description": "string",
      "slug": "string",
      "image": "string | null",
      "isActive": true,
      "createdAt": "string"
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## UI Structure
- **Screen shell:** padded `div` within authenticated dashboard.
- **Typography:** bold headers; uppercase labels for metadata.
- **Layout helpers:** flexbox for header; responsive grid for field pairs.
- **Feedback:** animated skeleton during fetch; centered error screen for failures.

## Planned Layout
```
┌───────────────────────────────┐
│           Header              │
│ [<-] Category Name     [Edit] │
├───────────────────────────────┤
│                               │
│  ┌─────────────────────────┐  │
│  │    Category Card        │  │
│  │  ┌───────┐              │  │
│  │  │ Image │ [Slug]       │  │
│  │  └───────┘ [Status]     │  │
│  │                         │  │
│  │  [Description Section]  │  │
│  │                         │  │
│  │  [Timeline Section]     │  │
│  └─────────────────────────┘  │
│                               │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│ (<-)  Food & Drinks                    [Edit] │
│       ID: 650af456                            │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │                                           │ │
│ │  ┌───────────┐  VENDOR TYPE               │ │
│ │  │           │  [ Product Vendor   ]      │ │
│ │  │   IMAGE   │                            │ │
│ │  │           │  STATUS                    │ │
│ │  └───────────┘  ( ACTIVE )                │ │
│ │                                           │ │
│ │ ----------------------------------------- │ │
│ │                                           │ │
│ │ SLUG                                      │ │
│ │ food-drinks                               │ │
│ │                                           │ │
│ │ ----------------------------------------- │ │
│ │                                           │ │
│ │ DESCRIPTION                               │ │
│ │ Restaurants, cafes...                     │ │
│ │                                           │ │
│ │ ----------------------------------------- │ │
│ │                                           │ │
│ │ CREATED AT                                │ │
│ │ May 25, 2026                              │ │
│ │                                           │ │
│ └───────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

## Detail Fields

### `Status`
**Purpose**: Indicates if the category is enabled.
**Implementation**:
```tsx
<StatusBadge 
  status={category.isActive} 
  type="vendor-category-status" 
/>
```

## Error Handling
- Centered error component with navigation recovery.
- Safe check for `category` availability before rendering content.

## Navigation Flow
- Route: `/vendor-categories/:id`.
- Back Button ➞ `/vendor-categories`.
- Edit Button ➞ `/vendor-categories/:id/edit`.
- Error Recovery Button ➞ `/vendor-categories`.
