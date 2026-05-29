# Users List Documentation

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
import React, { useCallback ,useState,useMemo ,useEffect} from 'react';
import { useNavigate ,Link} from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch ,FiFilter ,FiList ,FiAlertTriangle} from 'react-icons/fi';
import { useGetAllUsers, useDeleteUser } from '../../../tanstack/useUsers';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IUser, IRole }  from '../../../types/api.types';
import { getInitials } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetAllUsers`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetAllUsers(params);`
- **Purpose:** Fetches the list of all users based on search, filters, and pagination.

#### `useDeleteUser`
- **Hook usage:** `const deleteUser = useDeleteUser();`
- **Purpose:** Mutation hook to delete a user by ID. Cache invalidation is handled by mutation `onSuccess`.

### Local Component State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the search input and debounces it to reduce API calls.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `filterRole` & `filterStatus`
- **Purpose:** Manages filtering users by role and status.
```tsx
const [filterRole, setFilterRole] = useState<string>('all');
const [filterStatus, setFilterStatus] = useState<string>('all');
```

#### `currentPage` & `itemsPerPage`
- **Purpose:** Manages pagination state.
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

#### `deleteModalOpen` & `userToDelete`
- **Purpose:** Manages the visibility and data for the delete confirmation modal.
```tsx
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; } | null>(null);
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

  if (filterRole !== 'all') {
    apiParams.role = filterRole;
  }

  if (filterStatus !== 'all') {
    apiParams.status = filterStatus === 'active' ? 'active' : 'inactive';
  }

  return apiParams;
}, [debouncedSearch, filterRole, filterStatus, currentPage, itemsPerPage]);
```

## Functions Involved

### `handleDeleteClick()`
**purpose:** Open delete confirmation modal. Sets the user to delete and opens the modal.

**process:**
1. Sets the `userToDelete` state with the user's ID and name.
2. Sets `deleteModalOpen` to `true`.

**function implementation:**
```tsx
  const handleDeleteClick = useCallback((userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteModalOpen(true);
  }, []);
```

### `handleDeleteCancel()`
**purpose:** Close delete confirmation modal. Clears the user to delete and closes the modal.

**process:**
1. Sets `deleteModalOpen` to `false`.
2. Sets `userToDelete` to `null`.

**function implementation:**
```tsx
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  }, []);
```

### `handleDeleteConfirm()`
**purpose:** Confirm and execute user deletion. Calls the delete mutation and closes modal on success.

**process:**
1. Validates that a user is selected for deletion.
2. Calls `deleteUser.mutateAsync(userToDelete.id)`.
3. Sets `deleteModalOpen` to `false` and clears `userToDelete` on success.
4. Logs any errors encountered during the deletion.

**function implementation:**
```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete) return;

    try {
      await deleteUser.mutateAsync(userToDelete.id);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (deleteError) {
      console.error('Delete user error:', deleteError);
    }
  }, [userToDelete, deleteUser]);
```

### `handleRoleFilterChange()`
**purpose:** Handle filter changes for roles. Resets to page 1 when filters change.

**process:**
1. Updates the `filterRole` state.
2. Sets `currentPage` to 1.

**function implementation:**
```tsx
  const handleRoleFilterChange = (value: string) => {
    setFilterRole(value);
    setCurrentPage(1);
  };
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

### `GET /api/users`

#### Interface
```typescript
export interface GetUsersParams extends PaginationParams {
  search?: string;
  role?: string;
  status?: 'active' | 'inactive';
}
```

#### API
```typescript
export const userAPI = {
  // Get all users (admin)
  getAllUsers: (params?: GetUsersParams) => api.get('/api/users', { params }),
};
```

#### Hook
```typescript
export const useGetAllUsers = (params?: GetUsersParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await userAPI.getAllUsers(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ users, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "650af1234567890abcdef123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+254700000000",
        "roles": [{"_id": "...", "name": "admin", "displayName": "Admin"}],
        "isActive": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalUsers": 1
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `DELETE /api/users/:userId`

#### API
```typescript
export const userAPI = {
  // Delete user (admin)
  deleteUser: (userId: string) => api.delete(`/api/users/${userId}`),
};
```

#### Hook
```typescript
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await userAPI.deleteUser(userId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log('User deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting user:', error),
  });
};
```

#### Contract
Returns confirmation of deletion on success.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "User deleted"
}
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Standard padding container.
- **Header:** Contains title, Add User button, search bar, and filter controls.
- **Table:** Uses the project's `.table-container` and `.table` classes. Includes skeleton loading state with `animate-pulse` during fetch.
- **Actions:** Outline icons used with color coding:
    - View: `HiOutlineEye` (green)
    - Edit: `HiOutlinePencil` (blue)
    - Delete: `HiOutlineTrash` (red)
- **Modals:** `ConfirmModal` for deletion confirmation.
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering users by name or email.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search users..."
  className="input-search"
/>
```

### `Role Filter Dropdown`
**Purpose**: Allows filtering the list of users by their assigned role.
**Applicable**: Uses `FiFilter` icon for visual context.

**Input implementation**:
```tsx
<select
  value={filterRole}
  onChange={(e) => handleRoleFilterChange(e.target.value)}
  className="input-select pl-10"
>
  <option value="all">All Roles</option>
  {roles.map((role) => (
    <option key={role.name} value={role.name}>
      {role.displayName}
    </option>
  ))}
</select>
```

### `Status Filter Dropdown`
**Purpose**: Allows filtering the list of users by their account status (Active/Inactive).
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

## Error Handling
- The component displays a prominent error banner if `isError` is true during data fetching.
- API error messages are retrieved from `(error as any)?.response?.data?.message` and displayed to the user.
- The delete mutation includes `onError` handling that logs errors to the console, allowing for future expansion to show UI-based error notifications (e.g., toast messages).
- Inputs maintain local state during user interactions, ensuring a responsive interface even if API calls take time.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search ]                                [ Add User ]   │
├──────────────────────────────────────────────────────────┤
│ Showing X users    [Role Filter] [Status Filter] [Limit] │
├──────────────────────────────────────────────────────────┤
│ Table (Name, Email, Phone, Roles, Status, Actions)       │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Users                                                                                 │
│ Manage user accounts and permissions                                                  │
│                                                                                       │
│ [ 🔍 Search users... ]                                           [ + Add User ]       │
│                                                                                       │
│ Showing 50 users      [ 🔍 All Roles ] [ 🔍 All Status ] [ ☰ 10/pg ]                  │
│                                                                                       │
│ Name               | Email           | Phone       | Roles        | Status | Actions    │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ 👤 John Doe        | john@do.com     | +254...     | [Admin]      | [Active] | 👁 ✏ 🗑  │
│ 👤 Jane Smith      | jane@s.com      | +254...     | [Customer]   | [Active] | 👁 ✏ 🗑  │
│ 👤 Bob Wilson      | bob@w.com       | +254...     | [Staff]      | [Inact.] | 👁 ✏ 🗑  │
│ 👤 Alice Brown     | alice@b.com     | +254...     | [Vendor]     | [Active] | 👁 ✏ 🗑  │
│ 👤 Charlie Davis   | charlie@d.com   | +254...     | [Customer]   | [Active] | 👁 ✏ 🗑  │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/users`
- Add User button -> `/users/new`
- View icon -> `/users/:userId`
- Edit icon -> `/users/:userId/edit`

## Future Enhancements
- Integrate `react-hook-form` for complex validation if edit/creation flows expand.
- Add bulk actions (delete, activate/deactivate) with a checkbox selector.
- Include user export functionality (CSV/PDF) for reporting.
- Implement more granular error notifications using toast components.
