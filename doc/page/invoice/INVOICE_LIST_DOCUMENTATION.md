# Invoices List Documentation

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
import { useGetInvoices } from '../../../tanstack/useInvoices';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import type { IInvoice } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetInvoices`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetInvoices(params);`
- **Purpose:** Fetches the list of invoices based on search, payment status filters, and pagination.

### Local Component State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the search input and debounces it to reduce API calls.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `filterPaymentStatus`
- **Purpose:** Manages filtering invoices by payment status.
```tsx
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
    apiParams.search = debouncedSearch.trim();
  }

  if (filterPaymentStatus !== 'all') {
    apiParams.paymentStatus = filterPaymentStatus;
  }

  return apiParams;
}, [debouncedSearch, filterPaymentStatus, currentPage, itemsPerPage]);
```

## Functions Involved

### `handlePaymentStatusFilterChange()`
**purpose:** Handle filter changes for payment status. Resets to page 1 when filters change.

**process:**
1. Updates the `filterPaymentStatus` state.
2. Sets `currentPage` to 1.

**function implementation:**
```tsx
  const handlePaymentStatusFilterChange = (value: string) => {
    setFilterPaymentStatus(value);
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

### `GET /api/invoices`

#### API
```typescript
export const invoiceAPI = {
  // List all invoices
  getInvoices: (params?: any) => api.get('/api/invoices', { params }),
};
```

#### Hook
```tsx
export const useGetInvoices = (params?: any) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const response = await invoiceAPI.getInvoices(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ invoices, pagination }`.

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Standard padding container.
- **Header:** Contains title, description, search bar, and filter controls.
- **Table:** Uses the project's `.table-container` and `.table` classes. Includes skeleton loading state with `animate-pulse` during fetch.
- **Actions:** View icon (`HiOutlineEye`) for navigating to invoice details.
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering invoices by invoice number.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search by Invoice #..."
  className="input-search"
/>
```

### `Payment Status Filter Dropdown`
**Purpose**: Allows filtering the list of invoices by payment status.
**Applicable**: Uses `FiFilter` icon for visual context.

**Input implementation**:
```tsx
<select
  value={filterPaymentStatus}
  onChange={(e) => handlePaymentStatusFilterChange(e.target.value)}
  className="input-select pl-10"
>
  <option value="all">All Payment Status</option>
  <option value="PAID">Paid</option>
  <option value="PENDING">Pending</option>
  <option value="CANCELLED">Cancelled</option>
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
- The component displays a prominent alert if `isError` is true during data fetching using `FiAlertTriangle`.
- API error messages are retrieved from `(error as any)?.response?.data?.message` and displayed to the user.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search ]                                               │
├──────────────────────────────────────────────────────────┤
│ Showing X invoices    [Payment Status Filter] [Limit]    │
├──────────────────────────────────────────────────────────┤
│ Table (Invoice #, Branch, Total, Balance, Status, Created, Actions) │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Invoices                                                                              │
│ View and manage billing records                                                       │
│                                                                                       │
│ [ 🔍 Search by Invoice #... ]                                                         │
│                                                                                       │
│ Showing 50 invoices     [ 🔍 All Payment Status ] [ ☰ 10/pg ]                         │
│                                                                                       │
│ Invoice # | Branch   | Total     | Balance    | Status    | Created    | Actions      │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ INV-001   | Branch A | KES 500   | KES 0      | [Paid]    | 06/08/2026 | 👁          │
│ INV-002   | Branch B | KES 200   | KES 200    | [Pending] | 06/07/2026 | 👁          │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/invoices`
- View icon -> `/invoices/:invoiceId`

## Future Enhancements
- Implement more granular error notifications using toast components.
- Include invoice export functionality (PDF/Print).
