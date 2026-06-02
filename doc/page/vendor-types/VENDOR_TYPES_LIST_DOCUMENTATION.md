# Vendor Types List Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Display State](#display-state)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Table Columns](#table-implementation)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)

## Imports
```tsx
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';

import { useGetVendorTypes, useDeleteVendorType } from '../../../tanstack/useVendorTypes';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IVendorType } from '../../../types/api.types';
```

## Context and State Management

### Context

#### `TanStack Query`
- **Hook usage on list screen:** `const { data, isLoading, isError, error } = useGetVendorTypes(params);`

**`useGetVendorTypes` hook (from `useVendorTypes.ts`):**
```tsx
export const useGetVendorTypes = (params?: GetVendorTypesParams) => {
  return useQuery({
    queryKey: ['vendorTypes', params],
    queryFn: async () => {
      const response = await vendorTypeAPI.getVendorTypes(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### `Redux`
- **Redux slice:** Not directly used for vendor types; relies on TanStack Query for server state management.

### Display State

#### `searchTerm` & `debouncedSearch`
- **Search state:** handles immediate input and debounced value to minimize API calls.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
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
const [typeToDelete, setTypeToDelete] = useState<{ id: string; name: string } | null>(null);
```

## Functions Involved

### `useEffect (Debounce)`
**purpose:** Delays API calls until the user finishes typing.

**process:**
1. Sets a timer for 500ms when `searchTerm` changes.
2. Updates `debouncedSearch` and resets `currentPage` to 1.
3. Clears the timer on component unmount or search change.

**implementation:**
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
3. Sets `all` query param based on `filterStatus`.

**implementation:**
```tsx
const params = useMemo(() => {
  const apiParams: any = {
    page: currentPage,
    limit: itemsPerPage,
  };

  if (debouncedSearch.trim()) {
    apiParams.search = debouncedSearch.trim();
  }

  if (filterStatus !== 'all') {
    apiParams.all = filterStatus === 'active' ? 'true' : 'false';
  }

  return apiParams;
}, [debouncedSearch, filterStatus, currentPage, itemsPerPage]);
```

### `handleDeleteClick()`
**purpose:** Opens the delete confirmation modal and sets the vendor type to be deleted.

**process:**
1. Receives the ID and name of the vendor type.
2. Sets `typeToDelete` state.
3. Opens the modal by setting `deleteModalOpen` to `true`.

**implementation:**
```tsx
const handleDeleteClick = useCallback((id: string, name: string) => {
  setTypeToDelete({ id, name });
  setDeleteModalOpen(true);
}, []);
```

### `handleDeleteCancel()`
**purpose:** Closes the delete confirmation modal.

**process:**
1. Closes the modal by setting `deleteModalOpen` to `false`.
2. Clears the `typeToDelete` state.

**implementation:**
```tsx
const handleDeleteCancel = useCallback(() => {
  setDeleteModalOpen(false);
  setTypeToDelete(null);
}, []);
```

### `handleDeleteConfirm()`
**purpose:** Executes the deletion of a vendor type.

**process:**
1. Calls `deleteVendorType.mutateAsync`.
2. Closes the modal and clears selection on success.
3. Errors are handled by the mutation's `onError` callback.

**implementation:**
```tsx
const handleDeleteConfirm = useCallback(async () => {
  if (!typeToDelete) return;

  try {
    await deleteVendorType.mutateAsync(typeToDelete.id);
    setDeleteModalOpen(false);
    setTypeToDelete(null);
  } catch (deleteError) {
    console.error('Delete vendor type error:', deleteError);
  }
}, [typeToDelete, deleteVendorType]);
```

### `handleStatusFilterChange()`
**purpose:** Updates the status filter state.

**process:**
1. Sets the `filterStatus` state to the new value.
2. Resets `currentPage` to 1.

**implementation:**
```tsx
const handleStatusFilterChange = (value: string) => {
  setFilterStatus(value);
  setCurrentPage(1);
};
```

### `handleItemsPerPageChange()`
**purpose:** Updates the pagination size.

**process:**
1. Sets the `itemsPerPage` state to the new value.
2. Resets `currentPage` to 1.

**implementation:**
```tsx
const handleItemsPerPageChange = (value: string) => {
  setItemsPerPage(Number(value));
  setCurrentPage(1);
};
```

## API Integration

### `GET /api/vendor-types`

#### Interface
```tsx
export interface GetVendorTypesParams extends PaginationParams {
  search?: string;
  all?: boolean | string;
}
```

#### API
```typescript
export const vendorTypeAPI = {
  // Fetch all vendor types.
  getVendorTypes: (params?: GetVendorTypesParams) => api.get('/api/vendor-types', { params }),
}
```

#### Hook
```typescript
export const useGetVendorTypes = (params?: GetVendorTypesParams) => {
  return useQuery({
    queryKey: ['vendorTypes', params],
    queryFn: async () => {
      const response = await vendorTypeAPI.getVendorTypes(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ vendorTypes, pagination }`.

#### Response
```json
{
  "success": true,
  "data": {
    "vendorTypes": [
      {
        "_id": "string",
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
      "totalTypes": 1
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
- **Branding:** Vendor type icons/avatars with initials fallback.
- **Feedback:** skeleton rows for loading; alert banner for errors.

## Planned Layout
```
┌───────────────────────────────┐
│            Header             │
│   “Vendor Types” (Title)      │
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
│  Vendor Types                                 │
│  Manage categories...                         │
│                                               │
│  [ Search...              ]   [ + Add Type ]  │
│                                               │
│  Showing 5 items        [ All Status v ] [ 10 ]│
│                                               │
│  ┌──────────────────────────────────────────┐ │
│  │ NAME           DESCRIPTION      STATUS   │ │
│  │ ---------------------------------------- │ │
│  │ (VT) Product   Physical goods   (Active) │ │
│  │ (VT) Service   Pro services     (Active) │ │
│  │ ...                                      │ │
│  └──────────────────────────────────────────┘ │
│                                               │
│  <  1  2  3  >                                │
└───────────────────────────────────────────────┘
```

## Form Inputs

### `Search Input`
**Purpose**: Filters the vendor type list by name.
**Applicable**: Uses debounced state to minimize API calls.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search vendor types..."
  className="input-search"
/>
```

### `Status Filter`
**Purpose**: Filters vendor types by active/inactive status.
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

### `Items Per Page`
**Purpose**: Sets the number of items displayed per table page.
**Applicable**: Resets pagination to page 1 on change.

**Input implementation**:
```tsx
<select
  value={itemsPerPage}
  onChange={(e) => handleItemsPerPageChange(e.target.value)}
  className="input-select pl-10"
>
  <option value="5">5 per page</option>
  <option value="10">10 per page</option>
  <option value="25">25 per page</option>
  <option value="50">50 per page</option>
  <option value="100">100 per page</option>
</select>
```

## Error Handling
- TanStack Query extracts API error messages.
- `ConfirmModal` manages deletion safety.
- Debounced search prevents rapid-fire API requests.

## Navigation Flow
- Route: `/vendor-types`.
- Add Button ➞ `/vendor-types/new`.
- Eye Icon ➞ `/vendor-types/:id`.
- Pencil Icon ➞ `/vendor-types/:id/edit`.
- Delete Icon ➞ Opens confirmation modal.
