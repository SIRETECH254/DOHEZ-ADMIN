# Vendors List Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Filter and Pagination State](#filter-and-pagination-state)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Table Columns](#table-columns)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetVendors, useDeleteVendor } from '../../../tanstack/useVendors';
import { useGetVendorCategories } from '../../../tanstack/useVendorCategories';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IVendor, IVendorCategory } from '../../../types/api.types';
import { getInitials } from '../../../utils';
```

## Context and State Management

### TanStack Query (Server State)

#### `useGetVendors`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetVendors(params);`
- **Purpose:** Fetches the paginated list of vendors based on search and filter parameters.

#### `useGetVendorCategories`
- **Hook usage:** `const { data: categoriesData } = useGetVendorCategories({ all: true });`
- **Purpose:** Fetches all vendor categories for the filter dropdown.

#### `useDeleteVendor`
- **Hook usage:** `const deleteVendor = useDeleteVendor();`
- **Purpose:** Handles the deletion of a vendor record.

### Filter and Pagination State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the search input value and a debounced version to limit API requests.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `filterCategory` & `filterStatus`
- **Purpose:** Manages the selected category and active/inactive status filters.
```tsx
const [filterCategory, setFilterCategory] = useState<string>('all');
const [filterStatus, setFilterStatus] = useState<string>('all');
```

#### `currentPage` & `itemsPerPage`
- **Purpose:** Tracks the current page and number of items shown per page for pagination.
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

#### `deleteModalOpen` & `vendorToDelete`
- **Purpose:** Controls the visibility of the delete confirmation modal and identifies the target vendor.
```tsx
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [vendorToDelete, setVendorToDelete] = useState<{ id: string; name: string; } | null>(null);
```

## Functions Involved

### `useEffect` (Search Debounce)
**Purpose:** Updates the `debouncedSearch` state after 500ms of inactivity in the search input.
```tsx
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);
```

### `handleDeleteConfirm()`
**Purpose:** Executes the vendor deletion via the TanStack mutation.
```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!vendorToDelete) return;

    try {
      await deleteVendor.mutateAsync(vendorToDelete.id);
      setDeleteModalOpen(false);
      setVendorToDelete(null);
    } catch (e) {
      console.error('Delete vendor error:', e);
    }
  }, [vendorToDelete, deleteVendor]);
```

### `params` (Memoized API Parameters)
**Purpose:** Constructs the parameters object for the API request based on current UI state.
```tsx
  const params = useMemo(() => {
    const apiParams: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (debouncedSearch.trim()) {
      apiParams.search = debouncedSearch.trim();
    }

    if (filterCategory !== 'all') {
      apiParams.categoryId = filterCategory;
    }

    if (filterStatus !== 'all') {
      apiParams.isActive = filterStatus === 'active';
    }

    return apiParams;
  }, [debouncedSearch, filterCategory, filterStatus, currentPage, itemsPerPage]);
```

## API Integration

### `GET /api/vendors`
**Purpose:** Retrieve a list of vendors.
**Parameters:** `page`, `limit`, `search`, `categoryId`, `isActive`.

### `DELETE /api/vendors/:id`
**Purpose:** Remove a vendor by ID.

## UI Structure
- **Screen Shell:** Padded container (`p-6`) with vertical spacing (`space-y-6`).
- **Header:** Title, subtitle, search bar, and "Add Vendor" button.
- **Filter Bar:** Category selector, Status selector, and Items Per Page selector.
- **Table:** Responsive table showing vendor details and action buttons.
- **Pagination:** Bottom-aligned pagination controls.
- **Modals:** Centered confirmation modal for deletions.

## Planned Layout
```
┌──────────────────────────────────────────────────┐
│ Headers: "Vendors" / "Manage vendor profiles..." │
├──────────────────────────────────────────────────┤
│ [ Search vendors... ]           [ + Add Vendor ] │
├──────────────────────────────────────────────────┤
│ Showing X vendors       [Category] [Status] [Per]│
├──────────────────────────────────────────────────┤
│ Table: Name | Email | Phone | Category | Status  │
├──────────────────────────────────────────────────┤
│ Pagination: < Prev  1 2 3 ... Next >             │
└──────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────┐
│ Vendors                                          │
│ Manage vendor profiles and branches              │
│                                                  │
│ [ Search...                     ]  [ Add Vendor ]│
│                                                  │
│ Showing 45 vendors       [All Cat] [Active] [10 ]│
│                                                  │
│ NAME          EMAIL        STATUS       ACTIONS  │
│ ──────────────────────────────────────────────── │
│ Quick Laundry contact@ql.com [Active]  [👁] [✎] [🗑]│
│ Super Clean   info@sc.com    [Inactive][👁] [✎] [🗑]│
│                                                  │
│ < Previous  Page 1 of 5   Next >                 │
└──────────────────────────────────────────────────┘
```

## Table Columns

### `Name`
**Purpose**: Displays vendor logo/initials and name.
**Implementation**: Uses `getInitials` utility if logo is missing.

### `Status`
**Purpose**: Shows if the vendor is currently active.
**Implementation**: Uses `StatusBadge` component with type `vendor-status`.

### `Actions`
**Purpose**: Navigation to detail/edit pages and triggering deletion.
**Icons**: `HiOutlineEye` (View), `HiOutlinePencil` (Edit), `HiOutlineTrash` (Delete).

## Error Handling
- **Global Error Banner:** Shown in the table body if the API request fails.
- **Delete Error:** Logged to console and prevents modal closure if the deletion fails.
- **Loading State:** Skeleton rows are shown while data is fetching.

## Navigation Flow
- Route: `/vendors`.
- "Add Vendor" ➞ `/vendors/new`.
- "View" Icon ➞ `/vendors/:id`.
- "Edit" Icon ➞ `/vendors/:id/edit`.

## Future Enhancements
- Bulk selection and actions.
- Advanced filtering (e.g., by branch count or verification status).
- Export to CSV/Excel functionality.
