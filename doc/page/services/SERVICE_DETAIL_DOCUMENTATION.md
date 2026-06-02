# Service Detail Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Display State](#display-state)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Detail Fields](#detail-fields)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';

import { useGetServiceById } from '../../../tanstack/useServices';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { ITask } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `Service`
- **Hook usage on service detail screen:** `const { data: serviceData, isLoading, isError, error } = useGetServiceById(serviceId!);`

**`useGetServiceById` hook (from `useServices.ts`):**
```tsx
export const useGetServiceById = (serviceId: string) => {
  return useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const response = await serviceAPI.getServiceById(serviceId);
      return response.data.data;
    },
    enabled: !!serviceId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### `Redux`
- **Redux slice:** Not directly used for service details; relies on TanStack Query for server state management.

### Display State

#### `service`
- **Service data:** derived from `serviceData?.service` and used to populate the detail fields.
```tsx
const service = serviceData?.service;
```

#### `isLoading`
- **Loading state:** boolean from TanStack Query to determine if the skeleton UI should be displayed.
```tsx
if (isLoading) return <ServiceDetailSkeleton />;
```

#### `isError`
- **Error state:** boolean from TanStack Query to trigger the error recovery UI.
```tsx
if (isError) { ... }
```

## Functions Involved

### `ServiceDetailSkeleton`
**purpose:** Renders an animated placeholder UI using Tailwind's `animate-pulse` while the service data is being fetched.

**process:**
1. Renders a header skeleton with back button and title placeholders.
2. Renders a card skeleton with image and multiple text field placeholders.

### `new Date().toLocaleDateString()`
**purpose:** Formats the service's `createdAt` timestamp into a human-readable date string.

**process:**
1. Converts the `service.createdAt` string into a `Date` object.
2. Formats it using `toLocaleDateString` with options for `year`, `month`, and `day`.

**implementation:**
```tsx
new Date(service.createdAt).toLocaleDateString(undefined, { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})
```

### `Safe Task Rendering`
**purpose:** Handles the polymorphic nature of the `task` field, which can be either a string ID or a populated `ITask` object.

**process:**
1. Checks if `service.task` is an object.
2. Displays the task name if it's an object; otherwise, shows a fallback message.

**implementation:**
```tsx
{typeof service.task === 'object' && service.task !== null 
  ? (service.task as ITask).name 
  : 'Task Name Unavailable'}
```

## API Integration

### `GET /api/services/:serviceId`

#### Interface
```tsx
export interface IService {
  _id: string;
  task: string | ITask;
  name: string;
  description?: string;
  image?: string | null;
  imagePublicId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### API
```typescript
export const serviceAPI = {
  // Fetch single service details by ID.
  getServiceById: (serviceId: string) => api.get(`/api/services/${serviceId}`),
}
```

#### Hook
```tsx
export const useGetServiceById = (serviceId: string) => {
  return useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const response = await serviceAPI.getServiceById(serviceId);
      return response.data.data;
    },
    enabled: !!serviceId,
  });
};
```

#### Contract
`data.data` contains `{ service }`.

#### Response
```json
{
  "success": true,
  "data": {
    "service": {
      "_id": "string",
      "task": {
        "_id": "string",
        "name": "string"
      },
      "name": "string",
      "description": "string",
      "isActive": true,
      "image": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

#### Error Handling
API error messages are extracted from `error.response.data.message` and displayed via a centered error component.

## UI Structure
- **Screen shell:** padded `div` with a vertical stack of header and content card.
- **Typography:** Bold headers for titles and uppercase labels for metadata.
- **Layout helpers:** Two-column grid for key-value pairs (Task, Status).
- **Branding:** Service name in large font; image or stylized initials placeholder.
- **Feedback:** Full-page skeleton during load; stylized error screen with recovery button.

## Planned Layout
```
┌───────────────────────────────┐
│           Header              │
│ [<-] Service Name    [Edit]   │
├───────────────────────────────┤
│                               │
│  ┌─────────────────────────┐  │
│  │      Service Card       │  │
│  │  ┌───────┐              │  │
│  │  │ Image │ [Metadata]   │  │
│  │  └───────┘ [Status]     │  │
│  │                         │  │
│  │  [Description Section]  │  │
│  │                         │  │
│  │  [Timeline Section]     │  │
│  └─────────────────────────┘  │
│                               │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│ (<-)  Service Name                     [Edit] │
│       ID: 123456                              │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │                                           │ │
│ │  ┌───────────┐  TASK CATEGORY             │ │
│ │  │           │  [ Laundry          ]      │ │
│ │  │   PHOTO   │                            │ │
│ │  │           │  STATUS                    │ │
│ │  └───────────┘  ( ACTIVE )                │ │
│ │                                           │ │
│ │ ----------------------------------------- │ │
│ │                                           │ │
│ │ DESCRIPTION                               │ │
│ │ Detailed explanation of the service...     │ │
│ │                                           │ │
│ │ ----------------------------------------- │ │
│ │                                           │ │
│ │ CREATED AT                                │ │
│ │ June 2, 2026                              │ │
│ │                                           │ │
│ └───────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

## Detail Fields

### `Task Category`
**Purpose**: Displays the parent task category the service belongs to.
**Applicable**: Handles populated objects or raw IDs gracefully.

**Implementation**:
```tsx
<p className="text-gray-900 font-medium">
  {typeof service.task === 'object' && service.task !== null 
    ? (service.task as ITask).name 
    : 'Task Name Unavailable'}
</p>
```

### `Status`
**Purpose**: Shows if the service is currently enabled or disabled.
**Applicable**: Uses `StatusBadge` for consistent color coding.

**Implementation**:
```tsx
<StatusBadge 
  status={service.isActive ? 'ACTIVE' : 'INACTIVE'} 
  type="service-status" 
/>
```

### `Description`
**Purpose**: Displays additional information about the service.
**Applicable**: Uses italicized fallback text if no description exists.

**Implementation**:
```tsx
<p className="text-gray-900 leading-relaxed text-sm">
  {service.description || (
    <span className="text-gray-400 italic">No description provided.</span>
  )}
</p>
```

### `Created At`
**Purpose**: Shows the date when the service was first registered.
**Applicable**: Formatted using locale-aware date strings.

**Implementation**:
```tsx
<p className="text-gray-900 text-sm">
  {new Date(service.createdAt).toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}
</p>
```

## Error Handling
- Centered error screen with `FiAlertTriangle` icon.
- Displays specific error message from the API.
- "Back to Services" button provided for navigational recovery.
- Safe access patterns for polymorphic data fields.

## Navigation Flow
- Route: `/services/:serviceId`.
- Back Button (<-) ➞ `/services`.
- Edit Button (HiOutlinePencil) ➞ `/services/:serviceId/edit`.
- Error Recovery Button ➞ `/services`.

## Future Enhancements
- Add "Associated Products" list to show which items use this service.
- Introduce audit logs for tracking service modifications.
- Enable direct status toggle from the detail view.
