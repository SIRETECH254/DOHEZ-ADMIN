# Task Detail Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetTaskById } from '../../../tanstack/useTasks';
import StatusBadge from '../../../components/ui/StatusBadge';
```

## Context and State Management

### TanStack Query

#### `useGetTaskById`
- **Hook usage:** `const { data: task, isLoading, isError, error } = useGetTaskById(taskId!);`
- **Purpose:** Fetches the details of a specific task by its ID for display.

## Functions Involved

### `TaskDetailSkeleton()`
**purpose:** Provides a visual loading skeleton that mirrors the layout of the loaded Task Detail page, improving perceived performance.

**process:**
1. Renders structure reflecting header, content areas (Image, Description, Meta Info), and metadata cards.
2. Uses `animate-pulse` to create a loading pulse effect.

**implementation:**
```tsx
const TaskDetailSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    {/* ... skeleton content ... */}
  </div>
);
```

## API Integration

### `GET /api/tasks/:taskId`

#### API
```typescript
export const taskAPI = {
  // Get single task
  getTaskById: (taskId: string) => api.get(`/api/tasks/${taskId}`),
}
```

#### Hook
```typescript
export const useGetTaskById = (taskId: string) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await taskAPI.getTaskById(taskId);
      return response.data.data.task;
    },
    enabled: !!taskId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains the task object with `_id`, `name`, `description`, `isActive`, `image`, etc.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "task": {
      "_id": "650af1234567890abcdef123",
      "name": "Laundry",
      "description": "Professional washing and ironing services",
      "isActive": true,
      "image": "https://res.cloudinary.com/demo/image/upload/v123/task.jpg",
      "imagePublicId": "tasks/task_image_123",
      "createdAt": "2023-09-20T12:00:00.000Z",
      "updatedAt": "2023-09-21T10:00:00.000Z",
      "__v": 0
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## UI Structure
- **Container:** Standard padding container with vertical spacing.
- **Header:** Contains back button, task name/ID, and "Edit" action button.
- **Content:** Two-column layout (Image area, Info area).
- **Badges:** `StatusBadge` used for Active/Inactive status.

## Planned Layout
```
┌──────────────────────────────────────────────┐
│  < Back  Task Name          [ Edit Button ]  │
├──────────────────────────────────────────────┤
│  [ Image ]  Description                      │
├──────────────────────────────────────────────┤
│  Status | Created At                         │
└──────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│ Laundry                                         [ Edit Task ] │
│ ID: 650af...                                                  │
│                                                               │
│ [ Image ]   Description                                       │
│             Professional washing...                           │
│                                                               │
│ Status         [ Active ]                                     │
│ Created At     09/20/2023                                     │
└───────────────────────────────────────────────────────────────┘
```

## Error Handling
- Displays a structured error screen with `FiAlertTriangle` if the task fetch fails (`isError`).
- Provides a "Back to Tasks" button on the error screen for easy recovery.
- Displays a "Task not found" message if the ID is invalid or returns no data.

## Navigation Flow
- Route: `/tasks/:taskId`.
- "Back" button -> `/tasks`.
- "Edit Task" button -> `/tasks/:taskId/edit`.

## Future Enhancements
- Add a list of services associated with this task.
- Include audit logs for task modifications.
