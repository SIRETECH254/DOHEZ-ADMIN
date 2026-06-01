# Task List Screen Documentation

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

## Imports
```tsx
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetTasks, useDeleteTask } from '../../../tanstack/useTasks';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { ITask } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `Tasks`
- **Hooks usage:** 
  - `const { data, isLoading, isError, error } = useGetTasks(params);`
  - `const deleteTask = useDeleteTask();`

### Component State

#### `searchTerm`
- **Search state:** The raw input value from the search bar.
```tsx
const [searchTerm, setSearchTerm] = useState('');
```

#### `debouncedSearch`
- **Debounced search:** A version of `searchTerm` updated after 500ms, used to trigger API calls without hammering the server.
```tsx
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `filterStatus`
- **Filter state:** Tracks the selected status filter ('all', 'active', 'inactive').
```tsx
const [filterStatus, setFilterStatus] = useState<string>('all');
```

#### `currentPage` & `itemsPerPage`
- **Pagination state:** Tracks the current view index and the number of items to show.
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

#### `deleteModalOpen` & `taskToDelete`
- **Delete modal state:** Tracks whether the delete confirmation modal is visible and which task is selected for deletion.
```tsx
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [taskToDelete, setTaskToDelete] = useState<{ id: string; name: string; } | null>(null);
```

## Functions Involved

### `useEffect (Search Debounce)`
**purpose:** Implements debouncing on the `searchTerm` input to avoid excessive API requests while the user is typing.

**process:**
1. Sets a timer for 500ms when `searchTerm` changes.
2. Updates `debouncedSearch` when the timer expires.
3. Resets `currentPage` to 1 whenever the search changes to ensure results are visible from the start.

**function implementation:**
```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
    // Reset to page 1 when search changes
    setCurrentPage(1);
  }, 500);

  return () => clearTimeout(timer);
}, [searchTerm]);
```

### `handleDeleteClick()`
**purpose:** Prepares the UI for task deletion by opening the confirmation modal and storing the target task's details.

**process:**
1. Sets the task ID and name in the `taskToDelete` state.
2. Sets `deleteModalOpen` to `true`.

**function implementation:**
```tsx
const handleDeleteClick = useCallback((taskId: string, taskName: string) => {
  setTaskToDelete({ id: taskId, name: taskName });
  setDeleteModalOpen(true);
}, []);
```

### `handleDeleteCancel()`
**purpose:** Aborts the deletion process by closing the modal and clearing the selected task.

**process:**
1. Sets `deleteModalOpen` to `false`.
2. Clears `taskToDelete` state.

**function implementation:**
```tsx
const handleDeleteCancel = useCallback(() => {
  setDeleteModalOpen(false);
  setTaskToDelete(null);
}, []);
```

### `handleDeleteConfirm()`
**purpose:** Orchestrates the actual deletion of a task via the API and handles post-deletion state updates.

**process:**
1. Validates that a task is selected.
2. Calls the `deleteTask` mutation.
3. Closes the modal and clears the selected task on success.
4. Logs errors if the deletion fails.

**function implementation:**
```tsx
const handleDeleteConfirm = useCallback(async () => {
  if (!taskToDelete) return;

  try {
    await deleteTask.mutateAsync(taskToDelete.id);
    setDeleteModalOpen(false);
    setTaskToDelete(null);
  } catch (deleteError) {
    console.error('Delete task error:', deleteError);
  }
}, [taskToDelete, deleteTask]);
```

## API Integration

### `GET /api/tasks`

#### Interface
```tsx
export interface GetTasksParams extends PaginationParams {
  search?: string;
  all?: boolean | string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
```

#### Payload
```json
{
  "page": 1,
  "limit": 10,
  "all": true,
  "search": "laundry"
}
```

#### API
```typescript
export const taskAPI = {
  // Get all task categories
  getTasks: (params?: GetTasksParams) => api.get('/api/tasks', { params }),
}
```

#### Hook
```tsx
export const useGetTasks = (params?: GetTasksParams) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const response = await taskAPI.getTasks(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ tasks, pagination }`.

#### Response
```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": {
    "tasks": [
      {
        "_id": "string",
        "name": "string",
        "description": "string",
        "image": "string",
        "isActive": true,
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTasks": 48,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### `DELETE /api/tasks/:id`

#### API
```typescript
export const taskAPI = {
  // Delete task category
  deleteTask: (taskId: string) => api.delete(`/api/tasks/${taskId}`),
}
```

#### Hook
```tsx
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await taskAPI.deleteTask(taskId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
};
```

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable. Errors are logged to the console in the `handleDeleteConfirm` function.

## UI Structure
- **Layout:** Padded container (`p-6`) with a vertical stack of elements.
- **Header:** Contains the page title, description, search input, and "Add Task" link.
- **Filters:** A secondary bar for status filtering and items-per-page selection.
- **Table:** A responsive table displaying Task name (with avatar/initials), description, status badge, and action buttons.
- **Pagination:** Footer pagination component if total pages > 1.
- **Feedback:** Loading state (skeleton rows), error message banner, and empty state message.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering tasks by name.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search tasks..."
  className="input-search"
/>
```

### `Status Filter Dropdown`
**Purpose**: Allows filtering the list of tasks by their active/inactive status.
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
- Displays a `FiAlertTriangle` icon along with the error message from the API response (`(error as any)?.response?.data?.message`).
- Deletion errors are logged to the console within `handleDeleteConfirm`.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search ]                                [ Add Task ]   │
├──────────────────────────────────────────────────────────┤
│ Showing X tasks        [Status Filter] [Items Per Page]  │
├──────────────────────────────────────────────────────────┤
│ Table (Task, Description, Status, Actions)               │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Tasks                                                                                 │
│ Manage main task categories and services                                              │
│                                                                                       │
│ [ 🔍 Search tasks... ]                                           [ + Add Task ]       │
│                                                                                       │
│ Showing 48 tasks                         [ 🔍 All Status ] [ ☰ 10 per page ]          │
│                                                                                       │
│ Task               | Description                   | Status       | Actions           │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ 👤 Laundry         | Cleaning and ironin...        | [Active]     | 👁 ✏ 🗑            │
│ 👤 House Cleaning  | Deep cleaning services...     | [Active]     | 👁 ✏ 🗑            │
│ 👤 Car Wash        | Exterior and interior...      | [Inactive]   | 👁 ✏ 🗑            │
│ 👤 Plumping        | Fixing leaks and pipe...      | [Active]     | 👁 ✏ 🗑            │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- **Add Task:** Navigates to `/tasks/new`.
- **View Details:** Navigates to `/tasks/:taskId`.
- **Edit Task:** Navigates to `/tasks/:taskId/edit`.
