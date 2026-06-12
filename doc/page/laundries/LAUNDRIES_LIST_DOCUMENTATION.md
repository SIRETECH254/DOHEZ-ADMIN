# Laundries List Documentation

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
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { formatDistanceToNow, format, differenceInHours } from 'date-fns';
import { useGetLaundries, useDeleteLaundry } from '../../../tanstack/useLaundries';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { ILaundry } from '../../../types/api.types';
import { getInitials } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetLaundries`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetLaundries(params);`
- **Purpose:** Fetches the list of laundry bookings based on search, filters, and pagination.

#### `useDeleteLaundry`
- **Hook usage:** `const deleteLaundry = useDeleteLaundry();`
- **Purpose:** Mutation hook to delete a laundry booking by ID.

### Local Component State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the search input and debounces it to reduce API calls.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `filterStatus`
- **Purpose:** Manages filtering laundries by booking status.
```tsx
const [filterStatus, setFilterStatus] = useState<string>('all');
```

#### `currentPage` & `itemsPerPage`
- **Purpose:** Manages pagination state.
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

#### `deleteModalOpen` & `laundryToDelete`
- **Purpose:** Manages the visibility and data for the delete confirmation modal.
```tsx
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [laundryToDelete, setLaundryToDelete] = useState<{ id: string; number: string; } | null>(null);
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

### `handleDeleteClick()`
**purpose:** Open delete confirmation modal. Sets the laundry to delete and opens the modal.

### `handleDeleteCancel()`
**purpose:** Close delete confirmation modal. Clears the laundry to delete and closes the modal.

### `handleDeleteConfirm()`
**purpose:** Confirm and execute laundry deletion. Calls the delete mutation and closes modal on success.

### `handleStatusFilterChange()`
**purpose:** Handle filter changes for status. Resets to page 1.

### `handleItemsPerPageChange()`
**purpose:** Handle items per page changes. Resets to page 1.

### `formatPickUpDate()`
**purpose:** Formats the pickup date and time for display, showing relative time for recent/future dates within 24 hours.

**function implementation:**
```tsx
  const formatPickUpDate = (pickUpDate: { day: string; hour: string }) => {
    if (!pickUpDate?.day || !pickUpDate?.hour) return 'N/A';
    
    const datePart = pickUpDate.day.split('T')[0];
    const date = new Date(`${datePart}T${pickUpDate.hour}`);
    
    if (isNaN(date.getTime())) return 'Invalid Date';

    const hoursDiff = Math.abs(differenceInHours(new Date(), date));
    
    if (hoursDiff >= 24) {
      return format(date, 'MMM d, yyyy h:mm a');
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };
```

## API Integration

### `GET /api/laundries` (via `useGetLaundries`)
Fetches laundry bookings with optional search, status filter, and pagination.

### `DELETE /api/laundries/:id` (via `useDeleteLaundry`)
Deletes a specific laundry booking.

## UI Structure
- **Container:** Standard padding container.
- **Header:** Title, search bar, Book Laundry button, and filters (Status, Limit).
- **Table:** Displays Customer (with avatar/initials), Laundry Number, Branch, Status (badge), and Pickup time.
- **Actions:** View, Edit, and Delete icons.
- **Modals:** `ConfirmModal` for deletion.
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Search bookings by laundry number.
**Applicable**: Uses `FiSearch` icon.

### `Status Filter Dropdown`
**Purpose**: Filter bookings by status (PENDING, CONFIRMED, etc.).
**Applicable**: Uses `FiFilter` icon.

### `Items Per Page Dropdown`
**Purpose**: Adjust number of results per page.
**Applicable**: Uses `FiList` icon.

## Error Handling
- Displays an error banner with `FiAlertTriangle` if the fetch fails.
- Error messages are retrieved from the API response if available.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search by # ]                        [ Book Laundry ]  │
├──────────────────────────────────────────────────────────┤
│ Showing X laundries      [Status Filter] [Limit]         │
├──────────────────────────────────────────────────────────┤
│ Table (Customer, Laundry #, Branch, Status, Pickup, Act.)│
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Laundries                                                                             │
│ Manage laundry bookings and status                                                    │
│                                                                                       │
│ [ 🔍 Search by laundry number... ]                                 [ + Book Laundry ] │
│                                                                                       │
│ Showing 25 laundries           [ 🔍 All Status ] [ ☰ 10/pg ]                          │
│                                                                                       │
│ Customer           | Laundry # | Branch      | Status      | Pickup       | Actions   │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ 👤 John Doe        | LND-001   | Downtown    | [PENDING]   | in 2 hours   | 👁 ✏ 🗑    │
│ 👤 Jane Smith      | LND-002   | Westside    | [CONFIRMED] | Jun 15, 2:00 | 👁 ✏ 🗑    │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/laundries`
- Book Laundry -> `/laundries/new`
- View icon -> `/laundries/:id`
- Edit icon -> `/laundries/:id/edit`

## Future Enhancements
- Bulk status updates.
- Export laundry reports.
- Advanced date range filtering.
