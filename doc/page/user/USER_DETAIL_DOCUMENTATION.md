# User Detail Documentation

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
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdVerified } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetUserById } from '../../../tanstack/useUsers';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IUser, IRole, IProduct } from '../../../types/api.types';
import { getInitials } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetUserById`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetUserById(userId!);`
- **Purpose:** Fetches the specific user's detailed information, including populated roles, vendor, branch, and services.

## Functions Involved

### `handleBack()`
**purpose:** Returns the user to the main Users List page.
**process:**
1. Triggered by clicking the back button in the header.
2. Executes `navigate('/users')` using the `useNavigate` hook from `react-router-dom`.

**function implementation:**
```tsx
onClick={() => navigate('/users')}
```

### `handleEdit()`
**purpose:** Redirects the user to the Edit User page for the currently viewed user.
**process:**
1. Triggered by clicking the "Edit User" button in the header.
2. Appends the `user._id` to the route and executes `navigate(`/users/${user._id}/edit`)`.

**function implementation:**
```tsx
onClick={() => navigate(`/users/${user._id}/edit`)}
```

## API Integration

### `GET /api/users/:userId`

#### Interface
```typescript
export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[] | IRole[];
  phone: string;
  isActive: boolean;
  isVerified: boolean;
  avatar?: string | null;
  vendor?: string | IVendor;
  branch?: string | IBranch;
  workingHours?: WorkingHours;
  services?: string[] | IProduct[];
  createdAt: string;
  lastLoginAt?: string;
}
```

#### API
```typescript
export const userAPI = {
  // Get user by ID (admin)
  getUserById: (userId: string) => api.get(`/api/users/${userId}`),
}
```

#### Hook
```tsx
export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await userAPI.getUserById(userId);
      return response.data.data;
    },
    enabled: !!userId,
  });
};
```

#### Contract
`data.data` contains `{ user }`.

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "650af123...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "isVerified": true,
      "roles": [ { "_id": "...", "name": "staff", "displayName": "Staff" } ],
      "vendor": { "name": "Gold Star Services" },
      "branch": { "name": "Nairobi CBD" },
      "workingHours": { "monday": { "start": "08:00", "end": "17:00" } },
      "services": [ { "_id": "...", "name": "Hair Cut" } ]
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## UI Structure
- **Screen shell:** Full-height container with a max-width centered card.
- **Loading State:** Full-page skeleton with `animate-pulse` mirroring the identity card and association sections.
- **Error State:** Centered layout featuring a large `FiAlertTriangle` and the specific API error message.
- **Identity Card:** Top section with avatar (or initials), verification badge, large typography for name, and badges for Status and Roles.
- **Summary Grid:** Sub-header section for Phone Number, Member Since, and Last Login timestamps.
- **Work Association:** Conditional section (Vendor/Branch) highlighted with soft backgrounds.
- **Staff Panels:** Conditional sections for Weekly Schedule and Assigned Services (rendered as tags).

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [ ← ] User Details (Title)                   [ Edit ]    │
├──────────────────────────────────────────────────────────┤
│ identity card                                            │
│ [ Avatar ]  [ Name ]                       [ Status ]    │
│ [ Verified ] [ Email ]                     [ Roles ]     │
├──────────────────────────────────────────────────────────┤
│ summary info                                             │
│ [ Phone ]           [ Joined ]            [ Last Login ] │
├──────────────────────────────────────────────────────────┤
│ work association (Conditional)                           │
│ [ Primary Vendor ]             [ Assigned Branch ]       │
├──────────────────────────────────────────────────────────┤
│ weekly schedule (Staff Only)                             │
│ [ Mon: HH:MM - HH:MM ]  [ Tue: HH:MM - HH:MM ]           │
│ ...                                                      │
├──────────────────────────────────────────────────────────┤
│ assigned services (Staff Only)                           │
│ [ Service A ] [ Service B ] [ Service C ]                │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ [ ← ] User Details                                                     [ Edit User ]  │
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 👤 John Doe (✔)                                Status: [ACTIVE]                   │ │
│ │ john.doe@example.com                           Roles: [Super Admin] [Staff]       │ │
│ │                                                                                   │ │
│ │ Phone Number             Member Since           Last Login                        │ │
│ │ +254 700 000 000         05/29/2026             05/29/2026, 10:30 AM              │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│ Work Association                                                                      │
│ ┌───────────────────────────────┐     ┌───────────────────────────────────────────┐   │
│ │ PRIMARY VENDOR                │     │ ASSIGNED BRANCH                           │   │
│ │ Gold Star Services            │     │ Nairobi CBD                               │   │
│ └───────────────────────────────┘     └───────────────────────────────────────────┘   │
│                                                                                       │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ Weekly Schedule                                                                       │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                   │
│ │ Monday       │ │ Tuesday      │ │ Wednesday    │ │ Thursday     │                   │
│ │ 08:00 - 17:00│ │ 08:00 - 17:00│ │ 08:00 - 17:00│ │ Off          │                   │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘                   │
│                                                                                       │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ Assigned Services                                                                     │
│ ( Hair Cut )  ( Beard Trim )  ( Facial )  ( Massage )                                 │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Error Handling
- Centered error view appears if `isError` is true.
- Displays `FiAlertTriangle` in gold/accent color.
- Shows dynamic error message from API or fallback.
- Provides "Back to Users" button for immediate navigation.

## Navigation Flow
- Route: `/users/:userId`.
- Success Redirect: Navigate to `/users` on back, or `/users/:userId/edit` on Edit.

## Future Enhancements
- Add "Recent Activity" timeline for the user.
- Implement "Reset Password" trigger directly from details.
- Add "Assign Role" modal directly on this page.
