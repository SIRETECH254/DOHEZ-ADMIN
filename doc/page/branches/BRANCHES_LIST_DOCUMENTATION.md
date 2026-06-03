# Branches List Screen Documentation

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
import { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd, MdLocationOn } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetBranches, useDeleteBranch } from '../../../tanstack/useBranches';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IBranch, IVendor } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetBranches`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetBranches(params);`
- **Purpose:** Fetches the list of branches based on pagination and search filters.

#### `useDeleteBranch`
- **Hook usage:** `const deleteBranch = useDeleteBranch();`
- **Purpose:** Mutation hook to delete a branch by ID. Cache invalidation is handled by mutation `onSuccess`.

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

#### `deleteModalOpen` & `branchToDelete`
- **Purpose:** Manages the visibility and data for the delete confirmation modal.
```tsx
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [branchToDelete, setBranchToDelete] = useState<{ id: string; name: string; } | null>(null);
```

### Memoized Parameters

#### `params`
- **Purpose:** Memoized object built from search and pagination states to prevent unnecessary API calls.
```tsx
const params = useMemo(() => {
  const apiParams: any = {
    page: currentPage,
    limit: itemsPerPage,
  };

  if (debouncedSearch.trim()) {
    apiParams.search = debouncedSearch.trim();
  }

  return apiParams;
}, [debouncedSearch, currentPage, itemsPerPage]);
```

## Functions Involved

### `handleDeleteClick()`
**purpose:** Open delete confirmation modal. Sets the branch to delete and opens the modal.

**process:**
1. Sets the `branchToDelete` state with the branch's ID and name.
2. Sets `deleteModalOpen` to `true`.

**function implementation:**
```tsx
  const handleDeleteClick = useCallback((branchId: string, branchName: string) => {
    setBranchToDelete({ id: branchId, name: branchName });
    setDeleteModalOpen(true);
  }, []);
```

### `handleDeleteCancel()`
**purpose:** Close delete confirmation modal. Clears the branch to delete and closes the modal.

**process:**
1. Sets `deleteModalOpen` to `false`.
2. Sets `branchToDelete` to `null`.

**function implementation:**
```tsx
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setBranchToDelete(null);
  }, []);
```

### `handleDeleteConfirm()`
**purpose:** Confirm and execute branch deletion. Calls the delete mutation and closes modal on success.

**process:**
1. Validates that a branch is selected for deletion.
2. Calls `deleteBranch.mutateAsync(branchToDelete.id)`.
3. Sets `deleteModalOpen` to `false` and clears `branchToDelete` on success.
4. Logs any errors encountered during the deletion.

**function implementation:**
```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!branchToDelete) return;

    try {
      await deleteBranch.mutateAsync(branchToDelete.id);
      setDeleteModalOpen(false);
      setBranchToDelete(null);
    } catch (deleteError) {
      console.error('Delete branch error:', deleteError);
    }
  }, [branchToDelete, deleteBranch]);
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

### `useEffect` (Search Debounce)
**purpose:** Debounce search input.

**process:**
1. Sets a timer to update `debouncedSearch` and reset `currentPage` to 1 after a delay.

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

### `params` (Memoized)
**purpose:** Build API query parameters.

**process:**
1. Creates an object with `page`, `limit`, and `search` (if present).

**function implementation:**
```tsx
  const params = useMemo(() => {
    const apiParams: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (debouncedSearch.trim()) {
      apiParams.search = debouncedSearch.trim();
    }

    return apiParams;
  }, [debouncedSearch, currentPage, itemsPerPage]);
```

## API Integration

### `GET /api/branches`

#### Interface
```typescript
export interface GetBranchesParams extends PaginationParams {
  search?: string;
}
```

#### API
```typescript
export const branchAPI = {
  // Get all branches
  getAllBranches: (params?: GetBranchesParams) => api.get('/api/branches', { params }),
};
```

#### Hook
```typescript
export const useGetBranches = (params?: GetBranchesParams) => {
  return useQuery({
    queryKey: ['branches', params],
    queryFn: async () => {
      const response = await branchAPI.getAllBranches(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ branches, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "branches": [
      {
        "_id": "650af1234567890abcdef123",
        "name": "Nairobi CBD Branch",
        "email": "cbd@example.com",
        "phone": "+254700000000",
        "vendorId": "650af123...",
        "cover": "..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalBranches": 1
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `DELETE /api/branches/:branchId`

#### API
```typescript
export const branchAPI = {
  // Delete branch
  deleteBranch: (branchId: string) => api.delete(`/api/branches/${branchId}`),
};
```

#### Hook
```typescript
export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (branchId: string) => {
      const response = await branchAPI.deleteBranch(branchId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      console.log('Branch deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting branch:', error),
  });
};
```

#### Contract
Returns confirmation of deletion on success.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Branch deleted"
}
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Screen shell:** `div` with `p-6` padding and `space-y-6`.
- **Page header:** Includes page title, search bar, and "Add Branch" button.
- **Filters/Info:** Shows total branches and items per page selector.
- **Branches table:** Displays branches with cover images, vendor, email, and phone information.
- **Actions:** View, Edit, and Delete buttons for each branch.
- **Pagination:** Bottom pagination component.
- **Delete Confirmation:** `ConfirmModal` for deleting branches.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering branches by name.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search branches..."
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
- Displays an error icon (`FiAlertTriangle`) and message if the `useGetBranches` hook returns an error.
- Empty state: Displays a "No branches found" message if the branches array is empty.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search ]                                [ Add Branch ] │
├──────────────────────────────────────────────────────────┤
│ Showing X branches                                [ Limit] │
├──────────────────────────────────────────────────────────┤
│ Table (Name, Vendor, Email, Phone, Actions)              │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Branches                                                                              │
│ Manage vendor branches and locations                                                  │
│                                                                                       │
│ [ 🔍 Search branches... ]                                        [ + Add Branch ]     │
│                                                                                       │
│ Showing 50 branches                                          [ ☰ 10/pg ]              │
│                                                                                       │
│ Name               | Vendor          | Email           | Phone       | Actions        │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ 📍 CBD Branch      | Tech Vendor     | cbd@v.com       | +254...     | 👁 ✏ 🗑        │
│ 📍 Westlands       | Food Vendor     | west@v.com      | +254...     | 👁 ✏ 🗑        │
│ 📍 Karen Branch    | Tech Vendor     | karen@v.com     | +254...     | 👁 ✏ 🗑        │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/branches`
- Add Branch button -> `/branches/new`
- View icon -> `/branches/:id`
- Edit icon -> `/branches/:id/edit`

## Future Enhancements
- Add advanced filtering options (e.g., by vendor).
- Add bulk deletion capabilities.
- Add export to CSV/Excel functionality.
