# Products List Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Form Inputs](#form-inputs)
- [Error Handling](#error-handling)
- [Planned Layout](#planned-layout)
- [Navigation Flow](#navigation-flow)

## Imports
```tsx
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetProducts, useDeleteProduct } from '../../../tanstack/useProducts';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IProduct } from '../../../types/api.types';
import { getInitials } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetProducts`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetProducts(params);`
- **Purpose:** Fetches the list of products based on search, status filter, and pagination.

#### `useDeleteProduct`
- **Hook usage:** `const deleteProduct = useDeleteProduct();`
- **Purpose:** Mutation hook to delete a product by ID. Invalidates `['products']` query cache on success.

### Local Component State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the search input and debounces it to reduce API calls (500ms delay).

#### `filterStatus`
- **Purpose:** Manages filtering products by active/inactive status.

#### `currentPage` & `itemsPerPage`
- **Purpose:** Manages pagination state. Resets to page 1 on filter/items-per-page changes.

#### `deleteModalOpen` & `itemToDelete`
- **Purpose:** Manages the visibility and data for the delete confirmation modal.

### Memoized Parameters

#### `params`
- **Purpose:** Memoized object built from status filter, debounced search, and pagination states.

## Functions Involved

### `handleDeleteClick()`
**purpose:** Open delete confirmation modal. Sets the product to delete and opens the modal.

**process:**
1. Sets the `itemToDelete` state with the product's ID and name.
2. Sets `deleteModalOpen` to `true`.

**function implementation:**
```tsx
  const handleDeleteClick = useCallback((id: string, name: string) => {
    setItemToDelete({ id, name });
    setDeleteModalOpen(true);
  }, []);
```

### `handleDeleteConfirm()`
**purpose:** Confirm and execute product deletion. Calls the delete mutation and closes modal on success.

**process:**
1. Validates that a product is selected for deletion.
2. Calls `deleteProduct.mutateAsync(itemToDelete.id)`.
3. Sets `deleteModalOpen` to `false` and clears `itemToDelete` on success.
4. Logs any errors encountered during the deletion.

**function implementation:**
```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteProduct.mutateAsync(itemToDelete.id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Delete product error:', err);
    }
  }, [itemToDelete, deleteProduct]);
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
  status?: boolean;
}
```

#### API
```typescript
export const productAPI = {
  // Get all products (admin)
  getAllProducts: (params?: GetProductsParams) => api.get('/api/products', { params }),
};
```

#### Hook
```typescript
export const useGetProducts = (params?: GetProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await productAPI.getAllProducts(params);
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
        "name": "Product Name",
        "price": 10.00,
        "offerPrice": 8.00,
        "status": true,
        "images": [{"url": "..."}]
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
  // Delete product (admin)
  deleteProduct: (productId: string) => api.delete(`/api/products/${productId}`),
};
```

#### Hook
```typescript
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await productAPI.deleteProduct(productId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      console.log('Product deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting product:', error),
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
- **Container:** Standard padding container.
- **Header:** Title, search bar, Add Product button, status/limit filters.
- **Table:** Uses project's `.table-container` and `.table` classes. Includes skeleton loader.
- **Actions:** Icons for View (green), Edit (blue), Delete (red).
- **Modals:** `ConfirmModal` for deletion.
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering products by name.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search products..."
  className="input-search"
/>
```

### `Status Filter Dropdown`
**Purpose**: Allows filtering the list of products by their status (Active/Inactive).
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

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search ]                                [ Add Product ]│
├──────────────────────────────────────────────────────────┤
│ Showing X products    [Status Filter] [Limit]            │
├──────────────────────────────────────────────────────────┤
│ Table (Name, Price, Status, Actions)                     │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Products                                                                              │
│ Manage all products                                                                   │
│                                                                                       │
│ [ 🔍 Search products... ]                                        [ + Add Product ]    │
│                                                                                       │
│ Showing 50 products   [ 🔍 All Status ] [ ☰ 10/pg ]                                   │
│                                                                                       │
│ Name               | Price           | Status   | Actions                             │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ 📦 Product A       | $10.00          | [Active] | 👁 ✏ 🗑                             │
│ 📦 Product B       | $20.00          | [Active] | 👁 ✏ 🗑                             │
│ 📦 Product C       | $15.00          | [Inact.] | 👁 ✏ 🗑                             │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/products`
- Add Product button -> `/products/new`
- View icon -> `/products/:productId`
- Edit icon -> `/products/:productId/edit`
