# Users List Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Navigation Flow](#navigation-flow)

## Imports
```tsx
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import { useGetAllUsers, useDeleteUser } from '../../../tanstack/useUsers';
import StatusBadge from '../../../components/ui/StatusBadge';
```

## Context and State Management

### TanStack Query
- **Hooks:**
    - `useGetAllUsers()`: Fetches the list of all users from the API.
    - `useDeleteUser()`: Mutation hook to delete a user by ID.

## Functions Involved

### `handleDelete()`
**purpose:** Prompts the user for confirmation and triggers the user deletion mutation.

**process:**
1. Displays a browser confirmation dialog.
2. Calls `deleteUser.mutate(userId)` upon confirmation.

**function implementation:**
```tsx
  const handleDelete = useCallback((userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser.mutate(userId);
    }
  }, [deleteUser]);
```

## API Integration

### `GET /api/users`

#### API
```typescript
export const userAPI = {
  // Get all users (admin)
  getAllUsers: (params?: GetUsersParams) => api.get('/api/users', { params }),
  // Delete user (admin)
  deleteUser: (userId: string) => api.delete(`/api/users/${userId}`),
};
```

## UI Structure
- **Container:** Standard padding container.
- **Table:** Uses the project's `.table-container` and `.table` classes for a consistent look.
- **Actions:** Icons (`MdVisibility`, `MdEdit`, `MdDelete`) are used for View, Edit, and Delete operations.

## Navigation Flow
- Route: `/users`
- View icon -> `/users/:userId`
- Edit icon -> `/users/:userId/edit`
