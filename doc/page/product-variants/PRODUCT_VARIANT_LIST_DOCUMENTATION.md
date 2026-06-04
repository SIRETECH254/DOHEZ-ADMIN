# Product Variant List Screen Documentation

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
import { useGetProductVariants, useDeleteProductVariant } from '../../../tanstack/useProductVariants';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IVariant } from '../../../types/api.types';
import { getInitials } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetProductVariants`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetProductVariants(params);`
- **Purpose:** Fetches the list of all product variants based on search and pagination.

#### `useDeleteProductVariant`
- **Hook usage:** `const deleteProductVariant = useDeleteProductVariant();`
- **Purpose:** Mutation hook to delete a product variant by ID.

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
**purpose:** Open delete confirmation modal. Sets the variant to delete and opens the modal.

**process:**
1. Sets the `itemToDelete` state with the variant ID and name.
2. Sets `deleteModalOpen` to `true`.

**function implementation:**
```tsx
  const handleDeleteClick = useCallback((id: string, name: string) => {
    setItemToDelete({ id, name });
    setDeleteModalOpen(true);
  }, []);
```

### `handleDeleteConfirm()`
**purpose:** Confirm and execute variant deletion. Calls the delete mutation and closes modal on success.

**process:**
1. Validates that an item is selected for deletion.
2. Calls `deleteProductVariant.mutateAsync(itemToDelete.id)`.
3. Sets `deleteModalOpen` to `false` and clears `itemToDelete` on success.
4. Logs any errors encountered during the deletion.

**function implementation:**
```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteProductVariant.mutateAsync(itemToDelete.id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Delete product variant error:', err);
    }
  }, [itemToDelete, deleteProductVariant]);
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

### `GET /api/product-variants`

#### Interface
```typescript
export interface GetProductVariantsParams extends PaginationParams {
  search?: string;
}
```

#### API
```typescript
export const productVariantAPI = {
  // Get all product variants
  getAllVariants: (params?: GetProductVariantsParams) => api.get('/api/product-variants', { params }),
};
```

#### Hook
```typescript
export const useGetProductVariants = (params?: GetProductVariantsParams) => {
  return useQuery({
    queryKey: ['product-variants', params],
    queryFn: async () => {
      const response = await productVariantAPI.getAllVariants(params);
      return response.data.data;
    },
  });
};
```

#### Contract
`data` contains `{ variants, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "variants": [
      {
        "_id": "650af123...",
        "name": "Small - Red",
        "options": [{ "name": "Small", "price": 0 }, ...],
        ...
      }
    ],
    "pagination": { ... }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `DELETE /api/product-variants/:id`

#### API
```typescript
export const productVariantAPI = {
  // Delete product variant
  deleteVariant: (id: string) => api.delete(`/api/product-variants/${id}`),
};
```

#### Hook
```typescript
export const useDeleteProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productVariantAPI.deleteVariant(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-variants'] }),
  });
};
```

#### Contract
Returns confirmation of deletion on success.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Product variant deleted"
}
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Standard padding container.
- **Header:** Contains title, Add Variant button, and search bar.
- **Table:** Uses the project's `.table-container` and `.table` classes. Includes skeleton loading state.
- **Actions:** View, Edit, and Delete buttons for each variant.
- **Modals:** `ConfirmModal` for deletion confirmation.
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering variants by name.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation:**
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search variants..."
  className="input-search"
/>
```

### `Items Per Page Dropdown`
**Purpose**: Adjusts the number of results shown per page.
**Applicable**: Uses `FiList` icon for visual context.

**Input implementation:**
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
- Displays an error icon and message if the `useGetProductVariants` hook returns an error.
- Empty state: Displays a "No product variants found" message if the array is empty.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search ]                                [ Add Var ]    │
├──────────────────────────────────────────────────────────┤
│ Showing X variants                               [ Limit] │
├──────────────────────────────────────────────────────────┤
│ Table (Name, Options Count, Actions)                     │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────┐
│ Product Variants                                                          │
│ Manage variations of products                                             │
│                                                                           │
│ [ 🔍 Search... ]                                          [ + Add Var ]   │
│                                                                           │
│ Showing 50 vars                                          [ ☰ 10/pg ]      │
│                                                                           │
│ Name             | Options Count | Actions                                │
│ ───────────────────────────────────────────────────────────────────────── │
│ Small - Red      | 2             | 👁 ✏ 🗑                                 │
│ Large - Blue     | 2             | 👁 ✏ 🗑                                 │
│                                                                           │
│                                < 1 2 3 ... >                              │
└───────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/product-variants`
- Add button -> `/product-variants/new`
- View icon -> `/product-variants/:id`
- Edit icon -> `/product-variants/:id/edit`

## Future Enhancements
- Add bulk actions for variants.
