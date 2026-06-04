# Product Modifier List Screen Documentation

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
import { useGetProductModifiers, useDeleteProductModifier } from '../../../tanstack/useProductModifiers';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IProductModifier } from '../../../types/api.types';
import { getInitials } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetProductModifiers`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetProductModifiers();`
- **Purpose:** Fetches the list of all product modifiers.

#### `useDeleteProductModifier`
- **Hook usage:** `const deleteProductModifier = useDeleteProductModifier();`
- **Purpose:** Mutation hook to delete a product modifier by ID.

### Local Component State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the search input and debounces it to reduce filter overhead.
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

#### `filteredModifiers` & `paginatedModifiers`
- **Purpose:** Filters and paginates the modifier list on the client side.
```tsx
const filteredModifiers = useMemo(() => {
  return allModifiers.filter((m: any) => m.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
}, [allModifiers, debouncedSearch]);

const paginatedModifiers = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return filteredModifiers.slice(startIndex, startIndex + itemsPerPage);
}, [filteredModifiers, currentPage, itemsPerPage]);
```

## Functions Involved

### `handleDeleteClick()`
**purpose:** Open delete confirmation modal. Sets the modifier to delete and opens the modal.

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
**purpose:** Confirm and execute modifier deletion. Calls the delete mutation and closes modal on success.

**process:**
1. Validates that an item is selected for deletion.
2. Calls `deleteProductModifier.mutateAsync(itemToDelete.id)`.
3. Sets `deleteModalOpen` to `false` and clears `itemToDelete` on success.
4. Logs any errors encountered during the deletion.

**function implementation:**
```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteProductModifier.mutateAsync(itemToDelete.id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Delete product modifier error:', err);
    }
  }, [itemToDelete, deleteProductModifier]);
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

### `GET /api/product-modifiers`

#### API
```typescript
export const productModifierAPI = {
  // Get all product modifiers
  getAllModifiers: () => api.get('/api/product-modifiers'),
};
```

#### Hook
```typescript
export const useGetProductModifiers = () => {
  return useQuery({
    queryKey: ['product-modifiers'],
    queryFn: async () => {
      const response = await productModifierAPI.getAllModifiers();
      return response.data.data;
    },
  });
};
```

#### Contract
`data` contains `{ modifiers: IProductModifier[] }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "modifiers": [
      {
        "_id": "650af123...",
        "name": "Size",
        "required": true,
        "options": [{ "name": "Small", "price": 0 }, ...],
        ...
      }
    ]
  }
}
```

---

### `DELETE /api/product-modifiers/:id`

#### API
```typescript
export const productModifierAPI = {
  // Delete product modifier
  deleteModifier: (id: string) => api.delete(`/api/product-modifiers/${id}`),
};
```

#### Hook
```typescript
export const useDeleteProductModifier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productModifierAPI.deleteModifier(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-modifiers'] }),
  });
};
```

## UI Structure
- **Container:** Standard padding container.
- **Header:** Contains title, Add Modifier button, and search bar.
- **Table:** Uses the project's `.table-container` and `.table` classes. Includes skeleton loading state.
- **Actions:** View, Edit, and Delete buttons for each modifier.
- **Modals:** `ConfirmModal` for deletion confirmation.
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering modifiers by name.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation:**
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search modifiers..."
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
- Displays an error icon and message if the `useGetProductModifiers` hook returns an error.
- Empty state: Displays a "No modifiers found" message if the array is empty.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search ]                                [ Add Mod ]    │
├──────────────────────────────────────────────────────────┤
│ Showing X modifiers                              [ Limit] │
├──────────────────────────────────────────────────────────┤
│ Table (Name, Required, Options Count, Actions)           │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────┐
│ Product Modifiers                                                         │
│ Manage modifiers for products                                             │
│                                                                           │
│ [ 🔍 Search... ]                                          [ + Add Mod ]   │
│                                                                           │
│ Showing 50 mods                                          [ ☰ 10/pg ]      │
│                                                                           │
│ Name             | Required | Options Count | Actions                     │
│ ───────────────────────────────────────────────────────────────────────── │
│ Size             | Yes      | 3             | 👁 ✏ 🗑                     │
│ Add-ons          | No       | 5             | 👁 ✏ 🗑                     │
│                                                                           │
│                                < 1 2 3 ... >                              │
└───────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/product-modifiers`
- Add button -> `/product-modifiers/new`
- View icon -> `/product-modifiers/:id`
- Edit icon -> `/product-modifiers/:id/edit`

## Future Enhancements
- Add bulk actions for modifiers.
