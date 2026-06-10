# Event List Documentation

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
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd, MdEvent } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetProducts, useDeleteProduct } from '../../../tanstack/useProducts';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IProduct } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetProducts`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetProducts(params);`
- **Purpose:** Fetches the list of all events (products) based on search, filters, and pagination.

#### `useDeleteProduct`
- **Hook usage:** `const deleteProduct = useDeleteProduct();`
- **Purpose:** Mutation hook to delete an event by ID. Cache invalidation is handled by mutation `onSuccess`.

### Local Component State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the search input and debounces it to reduce API calls.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `filterStatus`
- **Purpose:** Manages filtering events by their active/inactive status.
```tsx
const [filterStatus, setFilterStatus] = useState<string>('all');
```

#### `currentPage` & `itemsPerPage`
- **Purpose:** Manages pagination state.
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

#### `deleteModalOpen` & `eventToDelete`
- **Purpose:** Manages the visibility and data for the delete confirmation modal.
```tsx
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [eventToDelete, setEventToDelete] = useState<{ id: string; name: string; } | null>(null);
```

### Memoized Parameters

#### `params`
- **Purpose:** Memoized object built from filters, search, and pagination states to prevent unnecessary API calls.
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
    apiParams.status = filterStatus === 'active';
  }

  return apiParams;
}, [debouncedSearch, filterStatus, currentPage, itemsPerPage]);
```

## Functions Involved

### `handleDeleteClick()`
**purpose:** Open delete confirmation modal. Sets the event to delete and opens the modal.

**process:**
1. Sets the `eventToDelete` state with the event's ID and name.
2. Sets `deleteModalOpen` to `true`.

**function implementation:**
```tsx
  const handleDeleteClick = useCallback((eventId: string, eventName: string) => {
    setEventToDelete({ id: eventId, name: eventName });
    setDeleteModalOpen(true);
  }, []);
```

### `handleDeleteCancel()`
**purpose:** Close delete confirmation modal. Clears the event to delete and closes the modal.

**process:**
1. Sets `deleteModalOpen` to `false`.
2. Sets `eventToDelete` to `null`.

**function implementation:**
```tsx
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  }, []);
```

### `handleDeleteConfirm()`
**purpose:** Confirm and execute event deletion. Calls the delete mutation and closes modal on success.

**process:**
1. Validates that an event is selected for deletion.
2. Calls `deleteProduct.mutateAsync(eventToDelete.id)`.
3. Sets `deleteModalOpen` to `false` and clears `eventToDelete` on success.
4. Logs any errors encountered during the deletion.

**function implementation:**
```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!eventToDelete) return;

    try {
      await deleteProduct.mutateAsync(eventToDelete.id);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (err) {
      console.error('Delete event error:', err);
    }
  }, [eventToDelete, deleteProduct]);
```

### `handleStatusFilterChange()`
**purpose:** Handle filter changes for status. Resets to page 1 when filters change.

**process:**
1. Updates the `filterStatus` state.
2. Sets `currentPage` to 1.

**function implementation:**
```tsx
  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };
```

### `handleItemsPerPageChange()`
**purpose:** Handle items per page changes. Resets to page 1 when changes occur.

**process:**
1. Updates the `itemsPerPage` state.
2. Sets `currentPage` to 1.

**function implementation:**
```tsx
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };
```

## API Integration

### `GET /api/products`

#### Interface
```typescript
export interface GetProductsParams extends PaginationParams {
  search?: string;
  category?: string;
  vendor?: string;
  branch?: string;
  status?: boolean;
}
```

#### API
```typescript
export const productAPI = {
  // Get all products/events
  getProducts: (params?: GetProductsParams) => api.get('/api/products', { params }),
};
```

#### Hook
```typescript
export const useGetProducts = (params?: GetProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await productAPI.getProducts(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ products, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "650af1234567890abcdef123",
        "name": "Summer Concert",
        "price": 1500,
        "venue": "City Park",
        "startDate": "2026-07-15T18:00:00.000Z",
        "status": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalProducts": 1
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `DELETE /api/products/:productId`

#### API
```typescript
export const productAPI = {
  // Delete product
  deleteProduct: (id: string) => api.delete(`/api/products/${id}`),
};
```

#### Hook
```typescript
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productAPI.deleteProduct(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
```

#### Contract
Returns confirmation of deletion on success.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Product deleted"
}
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Standard padding container with space-y-6 spacing.
- **Header:** Contains title, description, Add Event button, and search bar.
- **Table:** Uses the project's `.table-container` and `.table` classes. Includes skeleton loading state with `animate-pulse` during fetch.
- **Actions:** Outline icons used with color coding:
    - View: `HiOutlineEye` (green)
    - Edit: `HiOutlinePencil` (blue)
    - Delete: `HiOutlineTrash` (red)
- **Modals:** `ConfirmModal` for deletion confirmation.
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering events by name.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search events..."
  className="input-search"
/>
```

### `Status Filter Dropdown`
**Purpose**: Allows filtering the list of events by their status (Active/Inactive).
**Applicable**: Uses `FiFilter` icon for visual context.

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

### `Items Per Page Dropdown`
**Purpose**: Adjusts the number of results shown per page.
**Applicable**: Uses `FiList` icon for visual context.

**Input implementation**:
```tsx
<select
  value={itemsPerPage}
  onChange={(e) => handleItemsPerPageChange(e.target.value)}
  className="input-select pl-10"
>
  <option value="10">10 per page</option>
  <option value="25">25 per page</option>
  <option value="50">50 per page</option>
</select>
```

## Error Handling
- The component displays a prominent error banner if `isError` is true during data fetching.
- API error messages are retrieved from `(error as any)?.response?.data?.message` and displayed using the `FiAlertTriangle` icon.
- The delete mutation includes `console.error` logging for failures.
- Buttons are disabled during pending mutations to prevent duplicate requests.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search ]                                [ Add Event ]  │
├──────────────────────────────────────────────────────────┤
│ Showing X events        [Status Filter] [Limit]          │
├──────────────────────────────────────────────────────────┤
│ Table (Event, Amount, Venue, Date, Status, Actions)      │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Events                                                                                │
│ Manage ticketing events and performances                                              │
│                                                                                       │
│ [ 🔍 Search events... ]                                          [ + Add Event ]      │
│                                                                                       │
│ Showing 50 events      [ 🔍 All Status ] [ ☰ 10/pg ]                                 │
│                                                                                       │
│ Event              | Amount    | Venue       | Date         | Status   | Actions      │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ 🎫 Summer Jazz     | $1500.00  | City Park   | 15/07/2026   | [Active] | 👁 ✏ 🗑       │
│ 🎫 Tech Summit     | $500.00   | Expo Center | 20/08/2026   | [Active] | 👁 ✏ 🗑       │
│ 🎫 Piano Solo      | $200.00   | Music Hall  | 05/09/2026   | [Inact.] | 👁 ✏ 🗑       │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/events`
- Add Event button -> `/events/new`
- View icon -> `/events/:eventId`
- Edit icon -> `/events/:eventId/edit`

## Future Enhancements
- Add date range filtering for upcoming events.
- Implement bulk delete functionality.
- Export event list to CSV/Excel.
- Add venue-based filtering.
