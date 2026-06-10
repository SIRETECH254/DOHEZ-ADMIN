# Ticket List Documentation

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
import { useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetTickets, useDeleteTicket } from '../../../tanstack/useTickets';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { ITicket } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetTickets`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetTickets(params);`
- **Purpose:** Fetches the list of all tickets based on search, filters, and pagination.

#### `useDeleteTicket`
- **Hook usage:** `const deleteTicket = useDeleteTicket();`
- **Purpose:** Mutation hook to delete a ticket by ID. Cache invalidation is handled by mutation `onSuccess`.

### Local Component State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the search input and debounces it to reduce API calls.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `filterStatus`
- **Purpose:** Manages filtering tickets by their status.
```tsx
const [filterStatus, setFilterStatus] = useState<string>('all');
```

#### `currentPage` & `itemsPerPage`
- **Purpose:** Manages pagination state.
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

#### `deleteModalOpen` & `ticketToDelete`
- **Purpose:** Manages the visibility and data for the delete confirmation modal.
```tsx
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [ticketToDelete, setTicketToDelete] = useState<{ id: string; number: string; } | null>(null);
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
**purpose:** Open delete confirmation modal. Sets the ticket to delete and opens the modal.

**process:**
1. Sets the `ticketToDelete` state with the ticket's ID and number.
2. Sets `deleteModalOpen` to `true`.

**function implementation:**
```tsx
  const handleDeleteClick = useCallback((ticketId: string, ticketNumber: string) => {
    setTicketToDelete({ id: ticketId, number: ticketNumber });
    setDeleteModalOpen(true);
  }, []);
```

### `handleDeleteCancel()`
**purpose:** Close delete confirmation modal. Clears the ticket to delete and closes the modal.

**process:**
1. Sets `deleteModalOpen` to `false`.
2. Sets `ticketToDelete` to `null`.

**function implementation:**
```tsx
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setTicketToDelete(null);
  }, []);
```

### `handleDeleteConfirm()`
**purpose:** Confirm and execute ticket deletion. Calls the delete mutation and closes modal on success.

**process:**
1. Validates that a ticket is selected for deletion.
2. Calls `deleteTicket.mutateAsync(ticketToDelete.id)`.
3. Sets `deleteModalOpen` to `false` and clears `ticketToDelete` on success.
4. Logs any errors encountered during the deletion.

**function implementation:**
```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!ticketToDelete) return;

    try {
      await deleteTicket.mutateAsync(ticketToDelete.id);
      setDeleteModalOpen(false);
      setTicketToDelete(null);
    } catch (err) {
      console.error('Delete ticket error:', err);
    }
  }, [ticketToDelete, deleteTicket]);
```

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

## API Integration

### `GET /api/tickets`

#### Interface
```typescript
export interface GetTicketsParams extends PaginationParams {
  search?: string;
  status?: string;
}
```

#### API
```typescript
export const ticketAPI = {
  // Get all tickets
  getTickets: (params?: GetTicketsParams) => api.get('/api/tickets', { params }),
};
```

#### Hook
```typescript
export const useGetTickets = (params?: GetTicketsParams) => {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: async () => {
      const response = await ticketAPI.getTickets(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ tickets, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "_id": "650af1234567890abcdef123",
        "ticketNumber": "TKT-12345",
        "details": { "name": "John Doe" },
        "event": { "name": "Summer Concert" },
        "status": "BOOKED"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalTickets": 1
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `DELETE /api/tickets/:ticketId`

#### API
```typescript
export const ticketAPI = {
  // Delete ticket
  deleteTicket: (ticketId: string) => api.delete(`/api/tickets/${ticketId}`),
};
```

#### Hook
```typescript
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await ticketAPI.deleteTicket(ticketId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: any) => console.error('Error deleting ticket:', error),
  });
};
```

## UI Structure
- **Container:** Standard padding container.
- **Header:** Contains title, description, search bar, and filter controls.
- **Table:** Uses the project's `.table-container` and `.table` classes. Includes skeleton loading state with `animate-pulse` during fetch.
- **Actions:** Outline icons used with color coding:
    - View: `HiOutlineEye` (green)
    - Edit Status: `HiOutlinePencil` (blue)
    - Delete: `HiOutlineTrash` (red)
- **Modals:** `ConfirmModal` for deletion confirmation.
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering tickets by number or customer name.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search ticket number or customer name..."
  className="input-search"
/>
```

### `Status Filter Dropdown`
**Purpose**: Allows filtering the list of tickets by their status.
**Applicable**: Uses `FiFilter` icon for visual context.

**Input implementation**:
```tsx
<select
  value={filterStatus}
  onChange={(e) => handleStatusFilterChange(e.target.value)}
  className="input-select pl-10"
>
  <option value="all">All Status</option>
  <option value="PENDING">Pending</option>
  <option value="BOOKED">Booked</option>
  <option value="CANCELLED">Cancelled</option>
  <option value="USED">Used</option>
  <option value="EXPIRED">Expired</option>
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
  <option value="10">10 per page</option>
  <option value="25">25 per page</option>
  <option value="50">50 per page</option>
</select>
```

## Error Handling
- The component displays a prominent error banner if `isError` is true during data fetching.
- API error messages are retrieved from `(error as any)?.response?.data?.message` and displayed to the user.
- Inputs maintain local state during user interactions, ensuring a responsive interface even if API calls take time.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search ]                                               │
├──────────────────────────────────────────────────────────┤
│ Showing X tickets        [Status Filter] [Limit]         │
├──────────────────────────────────────────────────────────┤
│ Table (Ticket #, Customer, Event, Status, Actions)       │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Tickets                                                                               │
│ Manage event tickets and bookings                                                     │
│                                                                                       │
│ [ 🔍 Search ticket number or customer name... ]                                       │
│                                                                                       │
│ Showing 50 tickets      [ 🔍 All Status ] [ ☰ 10/pg ]                                 │
│                                                                                       │
│ Ticket Number      | Customer Name   | Event         | Status   | Actions             │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ TKT-001            | John Doe        | Summer Jazz   | [Booked] | 👁 ✏ 🗑             │
│ TKT-002            | Jane Smith      | Rock Fest     | [Used]   | 👁 ✏ 🗑             │
│ TKT-003            | Bob Wilson      | Tech Talk     | [Pend.]  | 👁 ✏ 🗑             │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/tickets`
- View icon -> `/tickets/:ticketId`
- Edit icon -> `/tickets/:ticketId/edit`

## Future Enhancements
- Bulk status updates.
- Export tickets to CSV/PDF.
- QR code scanning for status verification.
