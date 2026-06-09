# Appointments List Documentation

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
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetAppointments } from '../../../tanstack/useAppointments';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import type { IAppointment, IUser, IBranch } from '../../../types/api.types';
import { getInitials } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetAppointments`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetAppointments(params);`
- **Purpose:** Fetches the list of all appointments based on search, filters, and pagination.

### Local Component State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the search input and debounces it to reduce API calls.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `filterStatus`
- **Purpose:** Manages filtering appointments by status.
```tsx
const [filterStatus, setFilterStatus] = useState<string>('all');
```

#### `currentPage` & `itemsPerPage`
- **Purpose:** Manages pagination state.
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
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

  if (filterStatus !== 'all') {
    apiParams.status = filterStatus;
  }

  return apiParams;
}, [debouncedSearch, filterStatus, currentPage, itemsPerPage]);
```

## Functions Involved

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

### `getCustomerName()`
**purpose:** Safely retrieves the customer's full name from the customer object.

**function implementation:**
```tsx
  const getCustomerName = (customer: any) => {
    if (typeof customer === 'object' && customer !== null) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown Customer';
    }
    return 'Unknown Customer';
  };
```

### `getBranchName()`
**purpose:** Safely retrieves the branch name from the branch object.

**function implementation:**
```tsx
  const getBranchName = (branch: any) => {
    if (typeof branch === 'object' && branch !== null) {
      return branch.name || 'Unknown Branch';
    }
    return 'Unknown Branch';
  };
```

### `getCustomerInitials()`
**purpose:** Generates initials for the customer based on their first and last name.

**function implementation:**
```tsx
  const getCustomerInitials = (customer: any) => {
    if (typeof customer === 'object' && customer !== null) {
      const first = customer.firstName?.[0] || '';
      const last = customer.lastName?.[0] || '';
      return (first + last).toUpperCase() || '?';
    }
    return '?';
  };
```

## API Integration

### `GET /api/appointments`

#### Hook
```typescript
export const useGetAppointments = (params?: GetAppointmentsParams) => {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: async () => {
      const response = await appointmentAPI.getAppointments(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data` contains `{ appointments, pagination }`.

#### Response (200 OK Example)
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "_id": "650af1234567890abcdef123",
        "appointmentNumber": "APT-12345",
        "customer": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "branch": {
          "name": "Main Branch"
        },
        "status": "PENDING",
        "overallStartTime": "2023-10-27T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalAppointments": 1
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Standard padding container (`p-6 space-y-6`).
- **Header:** Contains title, description, Add Appointment button, search bar, and filter controls.
- **Table:** Uses the project's `.table-container` and `.table` classes. Includes skeleton loading state with `animate-pulse` during fetch.
- **Actions:** 
    - View: `HiOutlineEye` (brand-primary)
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering appointments by customer name or appointment number.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search by customer name or appointment number..."
  className="input-search"
/>
```

### `Status Filter Dropdown`
**Purpose**: Allows filtering the list of appointments by their status (Pending, Confirmed, etc.).
**Applicable**: Uses `FiFilter` icon for visual context.

**Input implementation**:
```tsx
<select
  value={filterStatus}
  onChange={(e) => handleStatusFilterChange(e.target.value)}
  className="input-select pl-10"
>
  <option value="all">All Status</option>
  {APPOINTMENT_STATUSES.map((status) => (
    <option key={status.value} value={status.value}>
      {status.label}
    </option>
  ))}
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
- API error messages are retrieved from `(error as any)?.response?.data?.message` and displayed to the user using the `FiAlertTriangle` icon.
- Inputs maintain local state during user interactions, ensuring a responsive interface even if API calls take time.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search ]                           [ Add Appointment ] │
├──────────────────────────────────────────────────────────┤
│ Showing X appointments             [Status Filter] [Limit] │
├──────────────────────────────────────────────────────────┤
│ Table (Customer, Branch, Status, Start Time, Actions)    │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Appointments                                                                          │
│ Manage customer bookings and schedules                                                 │
│                                                                                       │
│ [ 🔍 Search by customer name... ]                          [ + Add Appointment ]      │
│                                                                                       │
│ Showing 50 appointments                         [ 🔍 All Status ] [ ☰ 10/pg ]         │
│                                                                                       │
│ Customer           | Branch          | Status      | Start Time   | Actions           │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ 👤 John Doe        | Main Branch     | [Pending]   | 10/27, 10:00 | 👁                 │
│ 👤 Jane Smith      | West Side       | [Confirmed] | 10/27, 11:30 | 👁                 │
│ 👤 Bob Wilson      | Downtown        | [Completed] | 10/26, 09:00 | 👁                 │
│ 👤 Alice Brown     | Main Branch     | [Cancelled] | 10/25, 14:00 | 👁                 │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/appointments`
- Add Appointment button -> `/appointments/new`
- View icon -> `/appointments/:id`

## Future Enhancements
- Implement inline editing for appointment status.
- Add date range filtering for appointments.
- Include appointment export functionality (CSV/PDF).
- Implement bulk status update actions.
