# Vendor Categories List Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Display State](#display-state)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Inputs](#form-inputs)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';

import { useGetVendorCategories, useDeleteVendorCategory } from '../../../tanstack/useVendorCategories';
import { useGetVendorTypes } from '../../../tanstack/useVendorTypes';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IVendorCategory, IVendorType } from '../../../types/api.types';
```

## Context and State Management

### Context

#### `TanStack Query`
- **Hook usage on list screen:** `const { data, isLoading, isError, error } = useGetVendorCategories(params);`

**`useGetVendorCategories` hook (from `useVendorCategories.ts`):**
```tsx
export const useGetVendorCategories = (params?: GetVendorCategoriesParams) => {
  return useQuery({
    queryKey: ['vendorCategories', params],
    queryFn: async () => {
      const response = await vendorCategoryAPI.getVendorCategories(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### `Redux`
- **Redux slice:** Not directly used for vendor categories; relies on TanStack Query for server state management.

### Display State

#### `searchTerm` & `debouncedSearch`
- **Search state:** handles immediate input and debounced value to minimize API calls.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `filterVendorType`
- **Filter state:** manages the vendor type classification filter.
```tsx
const [filterVendorType, setFilterRole] = useState<string>('all');
```

#### `filterStatus`
- **Filter state:** manages the 'active'/'inactive'/'all' status filter.
```tsx
const [filterStatus, setFilterStatus] = useState<string>('all');
```

#### `pagination`
- **Pagination state:** tracks `currentPage` and `itemsPerPage`.
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

#### `deleteModal`
- **Modal state:** controls visibility and targets for the delete confirmation.
```tsx
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
```

## Functions Involved

### `useEffect (Debounce)`
**purpose:** Delays API calls until the user finishes typing.

**process:**
1. Sets a timer for 500ms when `searchTerm` changes.
2. Updates `debouncedSearch` and resets `currentPage` to 1.
3. Clears the timer on component unmount or search change.

**function implementation:**
```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
    setCurrentPage(1);
  }, 500);

  return () => clearTimeout(timer);
}, [searchTerm]);
```

### `useMemo (Params)`
**purpose:** Consolidates all filters and pagination into a single params object.

**process:**
1. Appends `page` and `limit`.
2. Trims and appends `search` if present.
3. Sets `vendorType` filter if not "all".

**function implementation:**
```tsx
const params = useMemo(() => {
  const apiParams: any = {
    page: currentPage,
    limit: itemsPerPage,
    all: true,
  };

  if (debouncedSearch.trim()) {
    apiParams.search = debouncedSearch.trim();
  }

  if (filterVendorType !== 'all') {
    apiParams.vendorType = filterVendorType;
  }

  return apiParams;
}, [debouncedSearch, filterVendorType, filterStatus, currentPage, itemsPerPage]);
```

### `handleDeleteClick()`
**purpose:** Opens the delete confirmation modal and sets the category to be deleted.

**process:**
1. Receives the ID and name of the category.
2. Sets `categoryToDelete` state.
3. Opens the modal by setting `deleteModalOpen` to `true`.

**function implementation:**
```tsx
const handleDeleteClick = useCallback((id: string, name: string) => {
  setCategoryToDelete({ id, name });
  setDeleteModalOpen(true);
}, []);
```

### `handleDeleteCancel()`
**purpose:** Closes the delete confirmation modal.

**process:**
1. Closes the modal by setting `deleteModalOpen` to `false`.
2. Clears the `categoryToDelete` state.

**function implementation:**
```tsx
const handleDeleteCancel = useCallback(() => {
  setDeleteModalOpen(false);
  setCategoryToDelete(null);
}, []);
```

### `handleDeleteConfirm()`
**purpose:** Executes the deletion of a vendor category.

**process:**
1. Calls `deleteVendorCategory.mutateAsync`.
2. Closes the modal and clears selection on success.
3. Errors are handled by the mutation's `onError` callback.

**function implementation:**
```tsx
const handleDeleteConfirm = useCallback(async () => {
  if (!categoryToDelete) return;

  try {
    await deleteVendorCategory.mutateAsync(categoryToDelete.id);
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  } catch (deleteError) {
    console.error('Delete vendor category error:', deleteError);
  }
}, [categoryToDelete, deleteVendorCategory]);
```

## API Integration

### `GET /api/vendor-categories`

#### Interface
```tsx
export interface GetVendorCategoriesParams extends PaginationParams {
  search?: string;
  all?: boolean | string;
  vendorType?: string;
}
```

#### Payload
```json
{
  "page": "number",
  "limit": "number",
  "search": "string",
  "vendorType": "string"
}
```

#### API
```typescript
export const vendorCategoryAPI = {
  // Fetch all vendor categories.
  getVendorCategories: (params?: GetVendorCategoriesParams) => api.get('/api/vendor-categories', { params }),
}
```

#### Hook
```tsx
export const useGetVendorCategories = (params?: GetVendorCategoriesParams) => {
  return useQuery({
    queryKey: ['vendorCategories', params],
    queryFn: async () => {
      const response = await vendorCategoryAPI.getVendorCategories(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ categories, pagination }`.

#### Response
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "string",
        "vendorType": { "_id": "string", "name": "string" },
        "name": "string",
        "description": "string",
        "slug": "string",
        "image": "string | null",
        "isActive": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCategories": 1
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## UI Structure
- **Screen shell:** padded `div` with dashboard context.
- **Typography:** semi-bold headers and standard table text.
- **Layout helpers:** flexbox for header controls; overflow-x-auto container for the table.
- **Branding:** Category icons with initials fallback.
- **Feedback:** skeleton rows for loading; alert banner for errors.

## Planned Layout
```
┌───────────────────────────────┐
│            Header             │
│   “Vendor Categories” (Title) │
├───────────────────────────────┤
│ [ Search ]          [ + Add ] │
├───────────────────────────────┤
│ Stats | [ Filter ] [ Limit ]  │
├───────────────────────────────┤
│                               │
│        Data Table             │
│                               │
├───────────────────────────────┤
│        Pagination             │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│  Vendor Categories                            │
│  Manage categories...                         │
│                                               │
│  [ Search...              ]   [ + Add Cat  ]  │
│                                               │
│  Showing 5 items    [ All Types v ] [ All Stat v ]│
│                                               │
│  ┌──────────────────────────────────────────┐ │
│  │ NAME           VENDOR TYPE      STATUS   │ │
│  │ ---------------------------------------- │ │
│  │ (CT) Food      Product Vendor   (Active) │ │
│  │ (CT) Beauty    Service Vendor   (Active) │ │
│  │ ...                                      │ │
│  └──────────────────────────────────────────┘ │
│                                               │
│  <  1  2  3  >                                │
└───────────────────────────────────────────────┘
```

## Form Inputs

### `Search Input`
**Purpose**: Filters the category list by name.
**Applicable**: Uses debounced state to minimize API calls.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search categories..."
  className="input-search"
/>
```

### `Vendor Type Filter`
**Purpose**: Filters categories by their parent vendor type.
**Applicable**: Resets pagination to page 1 on change.

**Input implementation**:
```tsx
<select
  value={filterVendorType}
  onChange={(e) => handleVendorTypeFilterChange(e.target.value)}
  className="input-select pl-10"
>
  <option value="all">All Vendor Types</option>
  {vendorTypes.map((type) => (
    <option key={type._id} value={type._id}>{type.name}</option>
  ))}
</select>
```

### `Status Filter`
**Purpose**: Filters categories by active/inactive status.
**Applicable**: Resets pagination to page 1 on change.

**Input implementation**:
```tsx
<select
  value={filterStatus}
  onChange={(e) => handleStatusFilterChange(e.target.value)}
  className="input-select pl-10"
>
  <option value="all">All Status</option>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
</select>
```

## Error Handling
- TanStack Query extracts API error messages.
- `ConfirmModal` manages deletion safety.
- Debounced search prevents rapid-fire API requests.

## Navigation Flow
- Route: `/vendor-categories`.
- Add Button ➞ `/vendor-categories/new`.
- Eye Icon ➞ `/vendor-categories/:id`.
- Pencil Icon ➞ `/vendor-categories/:id/edit`.
- Delete Icon ➞ Opens confirmation modal.

## Future Enhancements
- Add "Associated Products" count to the list view.
- Introduce audit logs for tracking category modifications.
- Enable direct status toggle from the list view.
