# Product Types List Screen Documentation

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
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetProductTypes, useDeleteProductType } from '../../../tanstack/useProductTypes';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IProductType, IService } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetProductTypes`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetProductTypes(params);`
- **Purpose:** Fetches the list of all product types based on search and pagination.

#### `useDeleteProductType`
- **Hook usage:** `const deleteProductType = useDeleteProductType();`
- **Purpose:** Mutation hook to delete a product type by ID. Cache invalidation is handled by mutation `onSuccess`.

### Local Component State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the search input and debounces it to reduce API calls.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `currentPage` & `itemsPerPage`
- **Purpose:** Manages pagination state.
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

#### `deleteModalOpen` & `itemToDelete`
- **Purpose:** Manages the visibility and data for the delete confirmation modal.
```tsx
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
```

### Memoized Parameters

#### `params`
- **Purpose:** Memoized object built from search and pagination states to prevent unnecessary API calls.
```tsx
const params = useMemo(() => ({
  page: currentPage,
  limit: itemsPerPage,
  search: debouncedSearch.trim() || undefined,
}), [debouncedSearch, currentPage, itemsPerPage]);
```

## Functions Involved

### `handleDeleteClick()`
**purpose:** Open delete confirmation modal. Sets the product type to delete and opens the modal.

**process:**
1. Sets the `itemToDelete` state with the ID and name.
2. Sets `deleteModalOpen` to `true`.

**function implementation:**
```tsx
  const handleDeleteClick = useCallback((id: string, name: string) => {
    setItemToDelete({ id, name });
    setDeleteModalOpen(true);
  }, []);
```

### `handleDeleteConfirm()`
**purpose:** Confirm and execute product type deletion. Calls the delete mutation and closes modal on success.

**process:**
1. Validates that an item is selected for deletion.
2. Calls `deleteProductType.mutateAsync(itemToDelete.id)`.
3. Sets `deleteModalOpen` to `false` and clears `itemToDelete` on success.
4. Logs any errors encountered during the deletion.

**function implementation:**
```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteProductType.mutateAsync(itemToDelete.id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Delete product type error:', err);
    }
  }, [itemToDelete, deleteProductType]);
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

### `GET /api/product-types`

#### API
```typescript
export const productTypeAPI = {
  // Get all product types
  getAllProductTypes: (params?: { page?: number, limit?: number, search?: string }) => api.get('/api/product-types', { params }),
};
```

#### Hook
```typescript
export const useGetProductTypes = (params?: { page?: number, limit?: number, search?: string }) => {
  return useQuery({
    queryKey: ['product-types', params],
    queryFn: async () => {
      const response = await productTypeAPI.getAllProductTypes(params);
      return response.data.data;
    },
  });
};
```

#### Contract
`data.data` contains `{ productTypes, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "productTypes": [
      {
        "_id": "650af123...",
        "name": "Dry Cleaning",
        "service": "650af123...",
        "order": 1,
        "slug": "dry-cleaning"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### `DELETE /api/product-types/:id`

#### API
```typescript
export const productTypeAPI = {
  // Delete product type
  deleteProductType: (id: string) => api.delete(`/api/product-types/${id}`),
};
```

#### Hook
```typescript
export const useDeleteProductType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productTypeAPI.deleteProductType(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-types'] });
    },
  });
};
```

## UI Structure
- **Container:** Standard padding container.
- **Header:** Contains title, Add Product Type button, and search bar.
- **Table:** Uses the project's `.table-container` and `.table` classes. Includes skeleton loading state.
- **Actions:** View, Edit, and Delete buttons for each product type.
- **Modals:** `ConfirmModal` for deletion confirmation.
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering product types by name.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search product types..."
  className="input-search"
/>
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
  <option value="5">5 per page</option>
  <option value="10">10 per page</option>
  <option value="25">25 per page</option>
  <option value="50">50 per page</option>
</select>
```

## Error Handling
- Displays an error icon and message if the `useGetProductTypes` hook returns an error.
- Empty state: Displays a "No product types found" message if the array is empty.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search ]                                [ Add Type ]   │
├──────────────────────────────────────────────────────────┤
│ Showing X types                                  [ Limit] │
├──────────────────────────────────────────────────────────┤
│ Table (Name, Service, Order, Actions)                    │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────┐
│ Product Types                                                             │
│ Manage types of products                                                  │
│                                                                           │
│ [ 🔍 Search... ]                                          [ + Add Type ]  │
│                                                                           │
│ Showing 50 types                                         [ ☰ 10/pg ]      │
│                                                                           │
│ Name             | Service          | Order | Actions                     │
│ ───────────────────────────────────────────────────────────────────────── │
│ Dry Cleaning     | Laundry Service  | 1     | 👁 ✏ 🗑                     │
│ Ironing          | Laundry Service  | 2     | 👁 ✏ 🗑                     │
│                                                                           │
│                                < 1 2 3 ... >                              │
└───────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/product-types`
- Add button -> `/product-types/new`
- View icon -> `/product-types/:id`
- Edit icon -> `/product-types/:id/edit`

## Future Enhancements
- Add bulk actions for product types.
- Add visual indicators for order sorting.
