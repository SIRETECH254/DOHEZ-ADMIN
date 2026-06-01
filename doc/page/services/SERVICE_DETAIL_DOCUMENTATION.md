# Service Detail Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)

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

#### `Service Data`
- **Hook usage:** `const { data: serviceData, isLoading, isError, error } = useGetServiceById(serviceId!);`
- **Purpose:** Fetches the detailed information for a single service. The service object is extracted via `serviceData?.service`.

### Component Constants
- **service:** Extracted from the hook result for easier access.
```tsx
const service = serviceData?.service;
```

## Functions Involved

### `Skeleton Component`
**purpose:** Renders an animated placeholder UI while the service data is being loaded.

### `Data Mapping (Safe Task Access)`
**purpose:** Safely extracts the task name from the `service.task` field, which can be either an ID string or a populated object.

**process:**
1. Checks if `service.task` is an object.
2. Renders the task name if it's an object; otherwise, shows a fallback message.

**implementation:**
```tsx
{typeof service.task === 'object' && service.task !== null 
  ? (service.task as ITask).name 
  : 'Task Name Unavailable'}
```

## API Integration

### `GET /api/services/:serviceId`

#### API
```typescript
export const serviceAPI = {
  getServiceById: (serviceId: string) => api.get(`/api/services/${serviceId}`),
};
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

#### Response
```json
{
  "success": true,
  "data": {
    "service": {
      "_id": "...",
      "task": { "_id": "...", "name": "Laundry" },
      "name": "Suit Wash",
      "description": "...",
      "isActive": true,
      "image": "...",
      "createdAt": "..."
    }
  }
}
```

## UI Structure
- **Header:** Navigational back button and primary Edit action.
- **Card Layout:** Uses a two-column responsive grid on larger screens.
- **Visuals:** Large service image or initials placeholder.
- **Details Section:** Organized into blocks for Category, Status, Description, and Creation Date.

## Error Handling
- Renders a centered error screen with a `FiAlertTriangle` icon if the API request fails.
- Provides a "Back to Services" button for easy recovery.

## Navigation Flow
- Back Button ➞ `/services`
- Edit Button ➞ `/services/:serviceId/edit`
