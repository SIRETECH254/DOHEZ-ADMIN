# Role Detail Documentation

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
import { useGetRoleById } from '../../../tanstack/useRoles';
import StatusBadge from '../../../components/ui/StatusBadge';
```

## Context and State Management

### TanStack Query

#### `useGetRoleById`
- **Hook usage:** `const { data: role, isLoading, isError, error } = useGetRoleById(roleId!);`
- **Purpose:** Fetches the details of a specific role by its ID for display.

## Functions Involved

### `RoleDetailSkeleton()`
**purpose:** Provides a visual loading skeleton that mirrors the layout of the loaded Role Detail page, improving perceived performance.

**process:**
1. Renders structure reflecting header, content areas (Description, Permissions), and metadata cards.
2. Uses `animate-pulse` to create a loading pulse effect.

**implementation:**
```tsx
const RoleDetailSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    {/* ... skeleton content ... */}
  </div>
);
```

## API Integration

### `GET /api/roles/:roleId`

#### API
```typescript
export const roleAPI = {
  // Get single role
  getRole: (roleId: string) => api.get(`/api/roles/${roleId}`),
}
```

#### Hook
```typescript
export const useGetRoleById = (roleId: string) => {
  return useQuery({
    queryKey: ['role', roleId],
    queryFn: async () => {
      const response = await roleAPI.getRole(roleId);
      return response.data.data;
    },
    enabled: !!roleId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains the role object with `name`, `displayName`, `description`, `permissions`, `isActive`, `isSystemRole`, etc.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "650af1234567890abcdef001",
    "name": "admin",
    "displayName": "Admin",
    "description": "Full system access for administrators",
    "permissions": ["*"],
    "isActive": true,
    "isSystemRole": true,
    "createdAt": "2026-05-20T08:00:00.000Z",
    "updatedAt": "2026-05-20T08:00:00.000Z"
  }
}
```

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## UI Structure
- **Container:** Standard padding container with vertical spacing.
- **Header:** Contains back button, role name/system name, and "Edit" action button.
- **Content:** Two-column grid layout (Large main info area, Small status/meta info area).
- **Badges:** `StatusBadge` used for Active/Inactive and System/Custom role status.

## Planned Layout
```
┌──────────────────────────────────────────────┐
│  < Back  Role Name          [ Edit Button ]  │
├──────────────────────────────────────────────┤
│  Description                                 │
│  [ Perms ] [ Perms ]                         │
├──────────────────────────────────────────────┤
│  Status | Role Type | Dates                  │
└──────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│ Admin                                         [ Edit Role ]   │
│ System Name: admin                                            │
│                                                               │
│ Description                                                   │
│ Full system access for administrators.                        │
│                                                               │
│ Permissions                                                   │
│ [ * ] [ manage_users ]                                        │
│                                                               │
│ Status         [ Active ]                                     │
│ Role Type      [ System Role ]                                │
│ Created At     05/20/2026                                     │
└───────────────────────────────────────────────────────────────┘
```

## Error Handling
- Displays a structured error screen with `FiAlertTriangle` if the role fetch fails (`isError`).
- Provides a "Back to Roles" button on the error screen for easy recovery.
- Displays a "Role not found" message if the ID is invalid or returns no data.

## Navigation Flow
- Route: `/roles/:roleId`.
- "Back" button -> `/roles`.
- "Edit Role" button -> `/roles/:roleId/edit`.

## Future Enhancements
- Add a list of users assigned to this specific role.
- Implement permission-based view restrictions within the UI itself.
