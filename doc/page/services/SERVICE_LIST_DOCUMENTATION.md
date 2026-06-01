# Service List Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Inputs](#form-inputs)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)

## Imports
```tsx
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetServices, useDeleteService } from '../../../tanstack/useServices';
import { useGetTasks } from '../../../tanstack/useTasks';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IService, ITask } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `Services`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetServices(params);`
- **Purpose:** Fetches the list of services based on search, task category, status, and pagination.

#### `Tasks`
- **Hook usage:** `const { data: tasksData } = useGetTasks({ all: true });`
- **Purpose:** Fetches task categories to populate the filter dropdown.

#### `Delete Service`
- **Hook usage:** `const deleteService = useDeleteService();`
- **Purpose:** Mutation hook to delete a service.

### Component State

#### `searchTerm` & `debouncedSearch`
- **Search state:** tracks raw input and debounced value for API triggers.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `filterStatus` & `filterTask`
- **Filter state:** tracks active/inactive status and parent task selection.
```tsx
const [filterStatus, setFilterStatus] = useState<string>('all');
const [filterTask, setFilterTask] = useState<string>('all');
```

#### `currentPage` & `itemsPerPage`
- **Pagination state:** tracks current page index and record limit.
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

#### `deleteModalOpen` & `serviceToDelete`
- **Modal state:** tracks visibility and targets for the deletion confirmation modal.
```tsx
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [serviceToDelete, setServiceToDelete] = useState<{ id: string; name: string; } | null>(null);
```

## Functions Involved

### `useEffect (Search Debounce)`
**purpose:** Delays the API call until the user has stopped typing for 500ms.

**process:**
1. Sets a timer on `searchTerm` change.
2. Updates `debouncedSearch` when timer expires.
3. Resets `currentPage` to 1 to ensure results are visible from the start.

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

### `handleDeleteConfirm()`
**purpose:** Orchestrates the deletion of a service through the API and updates the local state.

**process:**
1. Validates that a service is selected.
2. Calls `deleteService.mutateAsync`.
3. Closes the confirmation modal.
4. Resets the `serviceToDelete` state.

**function implementation:**
```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!serviceToDelete) return;

    try {
      await deleteService.mutateAsync(serviceToDelete.id);
      setDeleteModalOpen(false);
      setServiceToDelete(null);
    } catch (deleteError) {
      console.error('Delete service error:', deleteError);
    }
  }, [serviceToDelete, deleteService]);
```

## API Integration

### `GET /api/services`

#### Interface
```tsx
export interface GetServicesParams extends PaginationParams {
  task?: string;
  search?: string;
  all?: boolean | string;
}
```

#### API
```typescript
export const serviceAPI = {
  getServices: (params?: GetServicesParams) => api.get('/api/services', { params }),
}
```

#### Hook
```tsx
export const useGetServices = (params?: GetServicesParams) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: async () => {
      const response = await serviceAPI.getServices(params);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
```

#### Contract
`data.data` contains `{ services, pagination }`.

#### Response
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "_id": "string",
        "task": { "_id": "...", "name": "Laundry" },
        "name": "Dry Cleaning",
        "isActive": true,
        "image": "..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalServices": 1
    }
  }
}
```

## UI Structure
- **Container:** Standard padding container.
- **Header:** Title, "Add Service" button, and search input.
- **Filters:** Selection bar for Task Category, Status, and items per page.
- **Table:** Displays service details (image, name, task name, status) and actions (View, Edit, Delete).
- **Pagination:** Footer component for navigating result pages.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Services Header (Title, Description)      [ Add Service ]│
├──────────────────────────────────────────────────────────┤
│ [ 🔍 Search services... ]                                │
├──────────────────────────────────────────────────────────┤
│ Showing X services    [Task Filter] [Status Filter] [Pg] │
├──────────────────────────────────────────────────────────┤
│ Table (Service Name, Task Category, Status, Actions)     │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Services                                                                              │
│ Manage individual services under task categories                                      │
│                                                                                       │
│ [ 🔍 Search services... ]                                        [ + Add Service ]    │
│                                                                                       │
│ Showing 48 services      [ 🔍 All Tasks ] [ 🔍 All Status ] [ ☰ 10 per page ]         │
│                                                                                       │
│ Service            | Task Category      | Status       | Actions                      │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ 👤 Suit Wash       | Laundry            | [Active]     | 👁 ✏ 🗑                       │
│ 👤 House Cleaning  | Cleaning           | [Active]     | 👁 ✏ 🗑                       │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Form Inputs

### `Search Input`
**Purpose**: Collects name search query.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search services..."
  className="input-search"
/>
```

### `Task Filter`
**Purpose**: Filters the list by parent task category.
**Applicable**: Dropdown populated from `tasks` data.

**Input implementation**:
```tsx
<select
  value={filterTask}
  onChange={(e) => handleTaskFilterChange(e.target.value)}
  className="input-select pl-10"
>
  <option value="all">All Tasks</option>
  {tasks.map((task: ITask) => (
    <option key={task._id} value={task._id}>
      {task.name}
    </option>
  ))}
</select>
```

### `Status Filter`
**Purpose**: Filters the list by Active/Inactive status.
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

## Error Handling
- Displays an error banner with `FiAlertTriangle` and API message if data fetching fails.
- Mutation errors are logged to the console.
- Inputs maintain state during async operations.

## Navigation Flow
- Create ➞ `/services/new`
- Detail ➞ `/services/:id`
- Edit ➞ `/services/:id/edit`
