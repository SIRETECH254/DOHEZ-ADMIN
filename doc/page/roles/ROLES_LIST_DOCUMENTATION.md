# Roles List Page Documentation

## Table of Contents
- [Imports](#imports)
- [TanStack Query Integration](#tanstack-query-integration)
- [Page State](#page-state)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Table Structure](#table-structure)
- [Filtering and Search](#filtering-and-search)
- [Pagination](#pagination)
- [Error and Loading States](#error-and-loading-states)

## Imports
```tsx
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';

import { useGetAllRoles, useDeleteRole } from '../../../tanstack/useRoles';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
```

## Context and State Management

### TanStack Query

#### `useGetAllRoles`
- **Purpose:** Fetches roles from the API based on filters, search, and pagination.
- **Usage:** `const { data, isLoading, isError, error } = useGetAllRoles(params);`

#### `useDeleteRole`
- **Purpose:** Handles the deletion of a role.
- **Usage:** `const deleteRole = useDeleteRole();`

### Page State

#### Search
- **`searchTerm`**: Manages the input field value.
- **`debouncedSearch`**: Debounced version of `searchTerm` to limit API calls (500ms).
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### Filters
- **`filterStatus`**: Manages the active/inactive filter state.
```tsx
const [filterStatus, setFilterStatus] = useState<string>('all');
```

#### Pagination
- **`currentPage`**: Current page number.
- **`itemsPerPage`**: Number of items to display per page.
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

#### Deletion
- **`deleteModalOpen`**: Toggle state for the confirmation modal.
- **`roleToDelete`**: Stores the target role object for deletion.
```tsx
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null);
```

## Functions Involved

### `useEffect()` (Debounce)
**purpose:** Orchestrates the debouncing of the search input to reduce API calls by updating the `debouncedSearch` state after a 500ms delay.

**process:**
1. Sets up a timer that triggers after 500ms.
2. Updates `debouncedSearch` with the current `searchTerm` value.
3. Resets `currentPage` to 1 to ensure the user sees relevant results when search changes.
4. Clears the timer on component unmount or when `searchTerm` changes.

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

### `handleDeleteClick()`
**purpose:** Opens the delete confirmation modal and sets the role to be deleted.

**process:**
1. Sets `roleToDelete` with the target role ID and name.
2. Sets `deleteModalOpen` to `true` to display the modal.

**function implementation:**
```tsx
  const handleDeleteClick = useCallback((roleId: string, roleName: string) => {
    setRoleToDelete({ id: roleId, name: roleName });
    setDeleteModalOpen(true);
  }, []);
```

### `handleDeleteConfirm()`
**purpose:** Confirms and executes the role deletion via the `deleteRole` mutation.

**process:**
1. Checks if `roleToDelete` exists.
2. Calls `deleteRole.mutateAsync` with the ID.
3. On success, closes the modal and clears the target role state.

**function implementation:**
```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole.mutateAsync(roleToDelete.id);
      setDeleteModalOpen(false);
      setRoleToDelete(null);
    } catch (deleteError) {
      console.error('Delete role error:', deleteError);
    }
  }, [roleToDelete, deleteRole]);
```

### `handleStatusFilterChange()`
**purpose:** Handles changes to the status filter and resets pagination to the first page.

**function implementation:**
```tsx
  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };
```

## API Integration

### `GET /api/roles`

#### Interface
```tsx
export interface GetRolesParams extends PaginationParams {
  isActive?: boolean | string;
  search?: string;
}
```

#### Params
```json
{
  "page": "number",
  "limit": "number",
  "search": "string",
  "isActive": "boolean"
}
```

#### API
```typescript
export const roleAPI = {
  // Get all roles
  getAllRoles: (params?: GetRolesParams) => api.get('/api/roles', { params }),
}
```

#### Hook
```tsx
export const useGetAllRoles = (params?: GetRolesParams) => {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: async () => {
      const response = await roleAPI.getAllRoles(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "_id": "650af1234567890abcdef001",
        "name": "admin",
        "displayName": "Admin",
        "description": "Full system access for administrators",
        "permissions": ["*"],
        "isActive": true,
        "isSystemRole": true,
        "createdAt": "2026-05-20T08:00:00.000Z",
        "updatedAt": "2026-05-20T08:00:00.000Z",
        "__v": 0
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRoles": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### Contract
`data.data` contains `{ roles, pagination }`.

### `DELETE /api/roles/:roleId`

#### API
```typescript
export const roleAPI = {
  // Delete role
  deleteRole: (roleId: string) => api.delete(`/api/roles/${roleId}`),
}
```

#### Hook
```tsx
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      const response = await roleAPI.deleteRole(roleId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Roles                                                                                 │
│ Manage system roles and their permissions                                             │
│                                                                                       │
│ [ 🔍 Search roles... ]                                           [ + Add Role ]       │
│                                                                                       │
│ Showing 10 roles      [ 🔍 All Status ] [ ☰ 10/pg ]                                   │
│                                                                                       │
│ Display Name       | Name     | Description        | Status   | Actions               │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ Admin              | admin    | Full access...     | [Active] | 👁 ✏                 │
│ Staff              | staff    | Internal access... | [Active] | 👁 ✏ 🗑               │
│ Customer           | customer | Standard access... | [Active] | 👁 ✏ 🗑               │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## UI Structure
- **Page Container:** Padded div (`p-6`) with vertical spacing (`space-y-6`).
- **Header:** Contains the page title, description, search bar, and "Add Role" button.
- **Filters Row:** Displays total count and dropdowns for status and items per page.
- **Table Container:** Responsive table wrapper with shadow and rounded corners.
- **Pagination:** Shown below the table if more than one page exists.
- **Modals:** `ConfirmModal` for role deletion.

## Planned Layout
```
┌──────────────────────────────────────────────┐
│  Roles                                [ + ]  │
│  Manage system roles...                      │
├──────────────────────────────────────────────┤
│  [ Search roles...                         ] │
├──────────────────────────────────────────────┤
│  Showing X roles       [ Status ] [ Limit ]  │
├──────────────────────────────────────────────┤
│  Display Name | Name | Description | Status  │
│  ──────────────────────────────────────────  │
│  Admin        | admin | Full access | ACTIVE │
└──────────────────────────────────────────────┘
```

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering roles by name or display name.
**Applicable**: Uses `FiSearch` icon for visual context and debounces the input.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search roles..."
  className="input-search"
/>
```

### `Status Filter Dropdown`
**Purpose**: Allows filtering the list of roles by their active status (Active/Inactive).
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
  <option value="5">5 per page</option>
  <option value="10">10 per page</option>
  <option value="25">25 per page</option>
  <option value="50">50 per page</option>
  <option value="100">100 per page</option>
</select>
```

## Pagination
- Uses the `Pagination` component.
- Navigates through pages via the `onPageChange` callback.
- Synchronized with the API's `pagination` metadata.

## Error and Loading States
- **Loading:** skeleton rows are shown while `isLoading` is true.
- **Error:** An alert icon and error message are displayed if the API call fails.
- **Empty:** A "No roles found" message is shown when the result set is empty.
