# Product Category List Screen Documentation

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
import { useGetProductCategories, useDeleteProductCategory } from '../../../tanstack/useProductCategories';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IProductCategory, IProductType } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetProductCategories`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetProductCategories(params);`
- **Purpose:** Fetches the list of product categories based on search and pagination.

#### `useDeleteProductCategory`
- **Hook usage:** `const deleteProductCategory = useDeleteProductCategory();`
- **Purpose:** Mutation hook to delete a product category by ID.

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
**purpose:** Open delete confirmation modal. Sets the category to delete and opens the modal.

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
**purpose:** Confirm and execute category deletion. Calls the delete mutation and closes modal on success.

**process:**
1. Validates that an item is selected for deletion.
2. Calls `deleteProductCategory.mutateAsync(itemToDelete.id)`.
3. Sets `deleteModalOpen` to `false` and clears `itemToDelete` on success.
4. Logs any errors encountered during the deletion.

**function implementation:**
```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteProductCategory.mutateAsync(itemToDelete.id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Delete product category error:', err);
    }
  }, [itemToDelete, deleteProductCategory]);
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

### `GET /api/product-categories`

#### API
```typescript
export const productCategoryAPI = {
  // Get all product categories
  getAllCategories: (params?: { page?: number, limit?: number, search?: string }) => api.get('/api/product-categories', { params }),
};
```

#### Hook
```typescript
export const useGetProductCategories = (params?: { page?: number, limit?: number, search?: string }) => {
  return useQuery({
    queryKey: ['product-categories', params],
    queryFn: async () => {
      const response = await productCategoryAPI.getAllCategories(params);
      return response.data.data;
    },
  });
};
```

#### Contract
`data.data` contains `{ categories, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "650af123...",
        "name": "Shirts",
        "productType": "650af123...",
        "sort": 1
      }
    ],
    "pagination": { ... }
  }
}
```

---

### `DELETE /api/product-categories/:id`

#### API
```typescript
export const productCategoryAPI = {
  // Delete product category
  deleteCategory: (id: string) => api.delete(`/api/product-categories/${id}`),
};
```

#### Hook
```typescript
export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productCategoryAPI.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-categories'] }),
  });
};
```

## UI Structure
- **Container:** Standard padding container.
- **Header:** Contains title, Add Category button, and search bar.
- **Table:** Uses the project's `.table-container` and `.table` classes. Includes skeleton loading state.
- **Actions:** View, Edit, and Delete buttons for each category.
- **Modals:** `ConfirmModal` for deletion confirmation.
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering categories by name.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation:**
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search categories..."
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
- Displays an error icon and message if the `useGetProductCategories` hook returns an error.
- Empty state: Displays a "No product categories found" message if the array is empty.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search ]                                [ Add Cat ]    │
├──────────────────────────────────────────────────────────┤
│ Showing X categories                             [ Limit] │
├──────────────────────────────────────────────────────────┤
│ Table (Name, Type, Sort, Actions)                        │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────┐
│ Product Categories                                                        │
│ Manage categories of products                                             │
│                                                                           │
│ [ 🔍 Search... ]                                          [ + Add Cat ]   │
│                                                                           │
│ Showing 50 cats                                          [ ☰ 10/pg ]      │
│                                                                           │
│ Name             | Type             | Sort | Actions                      │
│ ───────────────────────────────────────────────────────────────────────── │
│ Shirts           | Laundry Service  | 1    | 👁 ✏ 🗑                      │
│ Pants            | Laundry Service  | 2    | 👁 ✏ 🗑                      │
│                                                                           │
│                                < 1 2 3 ... >                              │
└───────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/product-categories`
- Add button -> `/product-categories/new`
- View icon -> `/product-categories/:id`
- Edit icon -> `/product-categories/:id/edit`

## Future Enhancements
- Add bulk actions for categories.
- Add visual indicators for sort order.
