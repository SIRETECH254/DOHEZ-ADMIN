# Receipts List Documentation

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
import { format } from 'date-fns';
import { useGetReceipts } from '../../../tanstack/useReceipts';
import Pagination from '../../../components/ui/Pagination';
import type { IReceipt } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetReceipts`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetReceipts(params);`
- **Purpose:** Fetches the list of all receipts based on search, payment method filters, and pagination.

### Local Component State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the search input and debounces it to reduce API calls.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `filterPaymentMethod`
- **Purpose:** Manages filtering receipts by payment method.
```tsx
const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
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

  if (filterPaymentMethod !== 'all') {
    apiParams.paymentMethod = filterPaymentMethod;
  }

  return apiParams;
}, [debouncedSearch, filterPaymentMethod, currentPage, itemsPerPage]);
```

## Functions Involved

### `formatIssuedAt()`
**purpose:** Formats receipt issued date.

**function implementation:**
```tsx
  const formatIssuedAt = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
```

### `handlePaymentMethodFilterChange()`
**purpose:** Handle filter changes for payment method. Resets to page 1 when filters change.

**process:**
1. Updates the `filterPaymentMethod` state.
2. Sets `currentPage` to 1.

**function implementation:**
```tsx
  const handlePaymentMethodFilterChange = (value: string) => {
    setFilterPaymentMethod(value);
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

### `GET /api/receipts`

#### API
```tsx
export const receiptAPI = {
  // Get all receipts
  getReceipts: (params?: any) => api.get('/api/receipts', { params }),
};
```

#### Hook
```tsx
export const useGetReceipts = (params?: any) => {
  return useQuery({
    queryKey: ['receipts', params],
    queryFn: async () => {
      const response = await receiptAPI.getReceipts(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ receipts, pagination }`.

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Standard padding container.
- **Header:** Contains title, description, search bar, and filter controls.
- **Table:** Uses the project's `.table-container` and `.table` classes. Includes skeleton loading state with `animate-pulse` during fetch.
- **Actions:** View icon (`HiOutlineEye`) for navigating to receipt details.
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering receipts by receipt number.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search by Receipt #..."
  className="input-search"
/>
```

### `Payment Method Filter Dropdown`
**Purpose**: Allows filtering the list of receipts by payment method.
**Applicable**: Uses `FiFilter` icon for visual context.

**Input implementation**:
```tsx
<select
  value={filterPaymentMethod}
  onChange={(e) => handlePaymentMethodFilterChange(e.target.value)}
  className="input-select pl-10"
>
  <option value="all">All Methods</option>
  <option value="mpesa">M-Pesa</option>
  <option value="paystack">Paystack</option>
  <option value="cash">Cash</option>
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
│ Showing X receipts    [Payment Method Filter] [Limit]    │
├──────────────────────────────────────────────────────────┤
│ Table (Receipt #, Amount, Payment Method, Branch, Issued At, Actions) │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Receipts                                                                              │
│ View and manage payment receipts                                                      │
│                                                                                       │
│ [ 🔍 Search by Receipt #... ]                                                         │
│                                                                                       │
│ Showing 50 receipts     [ 🔍 All Methods ] [ ☰ 10/pg ]                                │
│                                                                                       │
│ Receipt # | Amount    | Method    | Branch   | Issued At  | Actions                   │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ REC-001   | KES 500   | M-Pesa    | Branch A | 06/08/2026 | 👁                       │
│ REC-002   | KES 200   | Cash      | Branch B | 06/07/2026 | 👁                       │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/receipts`
- View icon -> `/receipts/:receiptId`

## Future Enhancements
- Implement more granular error notifications using toast components.
- Include receipt export functionality (PDF/Print).
