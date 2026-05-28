# Profile Detail Documentation

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
import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdVerified, 
  MdOutlineChevronRight, 
  MdShoppingBag, 
  MdEvent, 
  MdConfirmationNumber, 
  MdLocalLaundryService, 
  MdLocationOn, 
  MdLock,
  MdEdit
} from 'react-icons/md';

import { useAuth } from '../../../contexts/AuthContext';
import { useGetProfile } from '../../../tanstack/useUsers';
```

## Context and State Management

### Context

#### `Auth`
- **Hook usage:** `const { user: authUser } = useAuth();`
- Provides the initial user data from the authentication state (rehydrated from localStorage).

#### `TanStack Query`
- **Hook usage:** `const { data: profileData, isLoading } = useGetProfile();`
- Fetches the most recent user profile data from the `/api/users/profile` endpoint.

### Memoized Data

#### `user`
- **purpose:** Consolidates user data from AuthContext and TanStack Query to ensure the most accurate profile is displayed.
- **process:** Prefers `profileData.user` if available (from the latest API call), otherwise falls back to `authUser` (from context).
- **implementation:**
```tsx
const user = useMemo(() => profileData?.user || authUser, [profileData, authUser]);
```

#### `fullName`
- **purpose:** Formats the user's first and last name for display.
- **implementation:**
```tsx
const fullName = useMemo(() => {
  if (!user) return 'User';
  return `${user.firstName} ${user.lastName}`;
}, [user]);
```

#### `roleDisplay`
- **purpose:** Joins all user roles into a comma-separated string of display names.
- **implementation:**
```tsx
const roleDisplay = useMemo(() => {
  if (!user || !user.roles || user.roles.length === 0) return 'User';
  return user.roles.map(r => r.displayName).join(', ');
}, [user]);
```

## Functions Involved

### `handleEditProfile()`
**purpose:** Navigates the user to the profile editing screen.

**process:**
1. Triggers the `navigate` function with the path `/profile/edit`.

**function implementation:**
```tsx
  const handleEditProfile = useCallback(() => {
    navigate('/profile/edit');
  }, [navigate]);
```

### `handleAction()`
**purpose:** A placeholder handler for various quick actions (Orders, Appointments, etc.) that will be implemented in future phases.

**process:**
1. Currently logs the action ID to the console for development tracking.

**function implementation:**
```tsx
  const handleAction = useCallback((action: string) => {
    console.log(`Action clicked: ${action}`);
  }, []);
```

## API Integration

### `GET /api/users/profile`

#### API
```typescript
export const userAPI = {
  // Get current user profile
  getProfile: () => api.get('/api/users/profile'),
}
```

#### Query Hook
```tsx
export const useGetProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
```

#### Contract
`data.data` contains a `user` object.

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "avatar": "string",
      "roles": [...],
      "isVerified": true
    }
  }
}
```

## UI Structure
- **Screen container:** Centered layout with a maximum width (`max-w-2xl`).
- **Profile Card:** A prominent card with a white background, containing user identity information.
- **Avatar:** Large circular image with initials fallback.
- **Verification Status:** Verified badge icon and a status chip (Verified Account / Pending Verification).
- **Quick Actions:** A vertical list of large, interactive buttons with icons and chevron indicators.

## Planned Layout
```
┌─────────────────────────────────┐
│         [ Profile Card ]        │
│              (Avatar)           │
│           [Full Name]           │
│             [Roles]             │
│        [Email & Phone]          │
│        (Verified Status)        │
│                                 │
│        [ Edit Profile ]         │
├─────────────────────────────────┤
│         Quick Actions           │
├─────────────────────────────────┤
│ [Icon] My Orders            [>] │
├─────────────────────────────────┤
│ [Icon] My Appointments      [>] │
├─────────────────────────────────┤
│ [Icon] My Tickets           [>] │
├─────────────────────────────────┤
│ [Icon] My Laundry           [>] │
├─────────────────────────────────┤
│ [Icon] My Address           [>] │
├─────────────────────────────────┤
│ [Icon] Change Password      [>] │
└─────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│               Profile Detail                  │
│                                               │
│        ┌─────────────────────────────┐        │
│        │            ( JD )           │        │
│        │          John Doe           │        │
│        │           Customer          │        │
│        │      john.doe@example.com   │        │
│        │          +254 700 000       │        │
│        │      [✓ Verified Account]   │        │
│        │                             │        │
│        │       [ Edit Profile ]      │        │
│        └─────────────────────────────┘        │
│                                               │
│  Quick Actions                                │
│  ┌─────────────────────────────────────────┐  │
│  │ (🛍️) My Orders                       (>) │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │ (📅) My Appointments                 (>) │  │
│  └─────────────────────────────────────────┘  │
│  ...                                          │
└───────────────────────────────────────────────┘
```

## Error Handling
- If `profileData` is missing, the component falls back to `authUser`.
- If both are missing, an error alert is displayed: "User profile not found."
- **Loading State:** A skeleton screen (`ProfileSkeleton`) is shown while the profile data is being fetched, matching the exact layout of the page with Tailwind's `animate-pulse`.

## Navigation Flow
- Route: `/profile`.
- "Edit Profile" button ➞ `/profile/edit`.
- Quick Actions ➞ (To be implemented).

## Future Enhancements
- Link each quick action to its respective page (e.g., `/orders`, `/appointments`).
- Add a "Logout" button to the profile page for easier access.
- Implement profile picture upload functionality directly from the profile card.
