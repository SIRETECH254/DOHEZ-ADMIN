# Coupon List Documentation

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
import { FiSearch, FiAlertTriangle, FiFilter, FiList } from 'react-icons/fi';
import { useGetAllCoupons, useDeleteCoupon } from '../../../tanstack/useCoupons';
import StatusBadge from '../../../components/ui/StatusBadge';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Pagination from '../../../components/ui/Pagination';
import type { ICoupon } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetAllCoupons`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetAllCoupons(params);`
- **Purpose:** Fetches the list of discount coupons based on search, filters, and pagination.

#### `useDeleteCoupon`
- **Hook usage:** `const deleteCoupon = useDeleteCoupon();`
- **Purpose:** Mutation hook to delete a coupon by ID.

### Local Component State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the search input and debounces it to reduce API calls.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `filterStatus`
- **Purpose:** Manages filtering coupons by active/inactive status.
```tsx
const [filterStatus, setFilterStatus] = useState<string>('all');
```

#### `currentPage` & `itemsPerPage`
- **Purpose:** Manages pagination state.
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

#### `deleteModalOpen` & `couponToDelete`
- **Purpose:** Manages the visibility and data for the delete confirmation modal.
```tsx
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [couponToDelete, setCouponToDelete] = useState<{ id: string; name: string; } | null>(null);
```

### Memoized Parameters

#### `params`
- **Purpose:** Memoized object built from filters, search, and pagination states to prevent unnecessary API calls.
```tsx
const params = useMemo(() => {
  const apiParams: any = { page: currentPage, limit: itemsPerPage };
  if (debouncedSearch.trim()) apiParams.search = debouncedSearch.trim();
  if (filterStatus !== 'all') apiParams.isActive = filterStatus === 'active';
  return apiParams;
}, [debouncedSearch, filterStatus, currentPage, itemsPerPage]);
```

## Functions Involved

### `handleDeleteClick()`
**purpose:** Open delete confirmation modal. Sets the coupon item to delete and opens the modal.

### `handleDeleteConfirm()`
**purpose:** Confirm and execute coupon deletion. Calls the delete mutation and closes modal on success.

### `handleStatusFilterChange()`
**purpose:** Handle filter changes for status. Resets to page 1.

### `handleItemsPerPageChange()`
**purpose:** Handle items per page changes. Resets to page 1.

## API Integration

### `GET /api/coupons` (via `useGetAllCoupons`)
Fetches all discount coupons with optional search, status filtering, and pagination.

### `DELETE /api/coupons/:id` (via `useDeleteCoupon`)
Deletes a specific coupon.

## UI Structure
- **Container:** Standard padding container.
- **Header:** Title, search bar, Add Coupon button, and filters (Status, Limit).
- **Table:** Displays Name, Code (monospaced), Used count, Branch, and Status (badge).
- **Actions:** View, Edit, and Delete icons.
- **Modals:** `ConfirmModal` for deletion.
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Search coupons by name or code.
**Applicable**: Uses `FiSearch` icon.

### `Status Filter Dropdown`
**Purpose**: Filter items by active/inactive status.
**Applicable**: Uses `FiFilter` icon.

### `Items Per Page Dropdown`
**Purpose**: Adjust number of results per page.
**Applicable**: Uses `FiList` icon.

## Error Handling
- Displays an error banner with `FiAlertTriangle` if the fetch fails.
- Mutation error handling logs errors to the console.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Page Header (Title, Description)                         │
├──────────────────────────────────────────────────────────┤
│ [ Search coupons... ]                    [ Add Coupon ]  │
├──────────────────────────────────────────────────────────┤
│ Showing X coupons        [Status Filter] [Limit]         │
├──────────────────────────────────────────────────────────┤
│ Table (Name, Code, Used, Branch, Status, Actions)        │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Coupons                                                                               │
│ Manage discount coupons                                                               │
│                                                                                       │
│ [ 🔍 Search coupons... ]                                            [ + Add Coupon ]  │
│                                                                                       │
│ Showing 50 coupons             [ 🔍 All Status ] [ ☰ 10/pg ]                          │
│                                                                                       │
│ Name               | Code      | Used | Branch      | Status | Actions                │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ Summer Sale 2024   | SUMMER24  | 12   | All         | [ACT.] | 👁 ✏ 🗑                │
│ Welcome Offer      | WELCOME   | 145  | Downtown    | [ACT.] | 👁 ✏ 🗑                │
│ Expired Deal       | OLDDEAL   | 10   | Westside    | [INACT]| 👁 ✏ 🗑                │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/coupons`
- Add Coupon -> `/coupons/new`
- View icon -> `/coupons/:id`
- Edit icon -> `/coupons/:id/edit`

## Future Enhancements
- Bulk coupon activation/deactivation.
- Export coupon usage statistics to CSV.
- Sorting by usage count or expiry date.
