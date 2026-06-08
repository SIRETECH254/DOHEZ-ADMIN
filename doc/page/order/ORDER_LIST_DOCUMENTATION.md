# Orders List Documentation

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
import { useNavigate } from 'react-router-dom';
import { HiOutlineEye } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { formatDistanceToNow, format, differenceInHours } from 'date-fns';
import { useGetOrders } from '../../../tanstack/useOrders';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import type { IOrder, IUser, IBranch } from '../../../types/api.types';
import { formatCurrency, getInitials } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetOrders`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetOrders(params);`
- **Purpose:** Fetches the list of orders based on search, status filters, and pagination.

### Local Component State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the search input and debounces it to reduce API calls.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `filterStatus` & `filterPaymentStatus`
- **Purpose:** Manages filtering orders by fulfillment status and payment status.
```tsx
const [filterStatus, setFilterStatus] = useState<string>('all');
const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
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
    apiParams.q = debouncedSearch.trim();
  }

  if (filterStatus !== 'all') {
    apiParams.status = filterStatus;
  }

  if (filterPaymentStatus !== 'all') {
    apiParams.paymentStatus = filterPaymentStatus;
  }

  return apiParams;
}, [debouncedSearch, filterStatus, filterPaymentStatus, currentPage, itemsPerPage]);
```

## Functions Involved

### `formatCreatedAt()`
**purpose:** Formats order creation date. Uses "time ago" if within 24 hours, otherwise displays an exact date/time string.

**process:**
1. Calculates difference in hours from now.
2. Returns formatted string using `date-fns`.

**function implementation:**
```tsx
  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString);
    const hoursDiff = Math.abs(differenceInHours(new Date(), date));
    
    if (hoursDiff >= 24) {
      return format(date, 'MMM d, yyyy h:mm a');
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };
```

### `handleStatusFilterChange()`
**purpose:** Handles filter changes for order status. Resets to page 1.

**function implementation:**
```tsx
  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };
```

### `handlePaymentStatusFilterChange()`
**purpose:** Handles filter changes for payment status. Resets to page 1.

**function implementation:**
```tsx
  const handlePaymentStatusFilterChange = (value: string) => {
    setFilterPaymentStatus(value);
    setCurrentPage(1);
  };
```

### `handleItemsPerPageChange()`
**purpose:** Handles items per page changes. Resets to page 1.

**function implementation:**
```tsx
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };
```

## API Integration

### `GET /api/orders`

#### Hook
```tsx
export const useGetOrders = (params?: GetOrdersParams) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await orderAPI.getOrders(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ orders, pagination }`.

## UI Structure
- **Container:** Standard padding container.
- **Header:** Contains title, description, search bar, and filter controls.
- **Table:** Uses the project's `.table-container` and `.table` classes. Includes skeleton loading state with `animate-pulse` during fetch.
- **Actions:** Eye icon (`HiOutlineEye`) for viewing order details.
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering orders by ID or Customer.
**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search by Order ID or Customer..."
  className="input-search"
/>
```

### `Filter Dropdowns` (Status, Payment, Items per page)
**Purpose**: Allows filtering and pagination controls.
**Input implementation**: Uses `select` elements with `input-select` class.

## Error Handling
- The component displays a prominent alert if `isError` is true during data fetching using `FiAlertTriangle`.
- API error messages are retrieved from `(error as any)?.response?.data?.message` and displayed.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search ]                                               │
├──────────────────────────────────────────────────────────┤
│ Showing X orders   [Status] [Payment] [Limit]            │
├──────────────────────────────────────────────────────────┤
│ Table (Customer, Branch, Total, Status, Pay, Created, Actions) │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Orders                                                                                │
│ Monitor and manage all customer orders                                                │
│                                                                                       │
│ [ 🔍 Search by Order ID or Customer... ]                                              │
│                                                                                       │
│ Showing 50 orders     [ 🔍 All Statuses ] [ 🔍 All Pay ] [ ☰ 10/pg ]                  │
│                                                                                       │
│ Customer           | Branch     | Total     | Status   | Pay    | Created | Actions   │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ 👤 John Doe        | Branch A   | KES 500   | [Placed] | [Paid] | 3 mins  | 👁       │
│ 👤 Jane Smith      | Branch B   | KES 200   | [Conf.]  | [Unpd] | 2 hrs   | 👁       │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/orders`
- View icon -> `/orders/:orderId`

## Future Enhancements
- Add bulk order status updates.
- Implement more granular error notifications.
- Include order export functionality.
