# Vendor Type Detail Documentation

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

import { useGetVendorTypeById } from '../../../tanstack/useVendorTypes';
import StatusBadge from '../../../components/ui/StatusBadge';
```

## Context and State Management

### Context

#### `TanStack Query`
- **Hook usage on vendor type detail screen:** `const { data: typeData, isLoading, isError, error } = useGetVendorTypeById(id!);`

**`useGetVendorTypeById` hook (from `useVendorTypes.ts`):**
```tsx
export const useGetVendorTypeById = (idOrSlug: string) => {
  return useQuery({
    queryKey: ['vendorType', idOrSlug],
    queryFn: async () => {
      const response = await vendorTypeAPI.getVendorTypeById(idOrSlug);
      return response.data.data;
    },
    enabled: !!idOrSlug,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### `Redux`
- **Redux slice:** Not directly used for vendor types; relies on TanStack Query for server state management.

### Display State

#### `vendorType`
- **Type data:** derived from `typeData?.vendorType` and used to populate the fields.
```tsx
const vendorType = typeData?.vendorType;
```

#### `isLoading`
- **Loading state:** triggers the `VendorTypeDetailSkeleton` component.

## Functions Involved

### `VendorTypeDetailSkeleton()`
**purpose:** Renders an animated loading state.

**process:**
1. Displays header placeholders for back button and title.
2. Displays card placeholders for image and text fields.

### `new Date().toLocaleDateString()`
**purpose:** Formats the registration date.

**implementation:**
```tsx
new Date(vendorType.createdAt).toLocaleDateString(undefined, { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})
```

## API Integration

### `GET /api/vendor-types/:idOrSlug`

#### Interface
```tsx
export interface IVendorType {
  _id: string;
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
export const vendorTypeAPI = {
  // Fetch single vendor type details by ID or Slug.
  getVendorTypeById: (idOrSlug: string) => api.get(`/api/vendor-types/${idOrSlug}`),
}
```

#### Contract
`data.data` contains `{ vendorType }`.

#### Response
```json
{
  "success": true,
  "data": {
    "vendorType": {
      "_id": "string",
      "name": "string",
      "description": "string",
      "slug": "string",
      "image": "string",
      "isActive": true,
      "createdAt": "string"
    }
  }
}
```

## UI Structure
- **Screen shell:** padded `div` within authenticated dashboard.
- **Typography:** bold headers; uppercase labels for metadata.
- **Layout helpers:** flexbox for header; responsive grid for field pairs.
- **Feedback:** animated skeleton during fetch; centered error screen for failures.

## Planned Layout
```
┌───────────────────────────────┐
│           Header              │
│ [<-] Vendor Type Name  [Edit] │
├───────────────────────────────┤
│                               │
│  ┌─────────────────────────┐  │
│  │    Vendor Type Card     │  │
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
│ (<-)  Product Vendor                   [Edit] │
│       ID: 650af123                            │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │                                           │ │
│ │  ┌───────────┐  SLUG                      │ │
│ │  │           │  [ product-vendor    ]     │ │
│ │  │   IMAGE   │                            │ │
│ │  │           │  STATUS                    │ │
│ │  └───────────┘  ( ACTIVE )                │ │
│ │                                           │ │
│ │ ----------------------------------------- │ │
│ │                                           │ │
│ │ DESCRIPTION                               │ │
│ │ Vendors selling physical goods...          │ │
│ │                                           │ │
│ │ ----------------------------------------- │ │
│ │                                           │ │
│ │ CREATED AT                                │ │
│ │ May 20, 2026                              │ │
│ │                                           │ │
│ └───────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

## Detail Fields

### `Status`
**Purpose**: Indicates if the vendor type is enabled.
**Implementation**:
```tsx
<StatusBadge 
  status={vendorType.isActive} 
  type="vendor-type-status" 
/>
```

## Error Handling
- Centered error component with navigation recovery.
- Safe check for `vendorType` availability before rendering content.

## Navigation Flow
- Route: `/vendor-types/:id`.
- Back Button ➞ `/vendor-types`.
- Edit Button ➞ `/vendor-types/:id/edit`.
