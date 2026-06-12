# Packaging List Documentation

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
import { useGetPackaging, useDeletePackaging } from '../../../tanstack/usePackaging';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IPackaging } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetPackaging`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetPackaging(params);`
- **Purpose:** Fetches the list of packaging options based on search, filters, and pagination.

#### `useDeletePackaging`
- **Hook usage:** `const deletePackaging = useDeletePackaging();`
- **Purpose:** Mutation hook to delete a packaging item by ID.

### Local Component State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the search input and debounces it to reduce API calls.
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
```

#### `filterStatus`
- **Purpose:** Manages filtering packaging items by active/inactive status.
```tsx
const [filterStatus, setFilterStatus] = useState<string>('all');
```

#### `currentPage` & `itemsPerPage`
- **Purpose:** Manages pagination state.
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

#### `deleteModalOpen` & `packagingToDelete`
- **Purpose:** Manages the visibility and data for the delete confirmation modal.
```tsx
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [packagingToDelete, setPackagingToDelete] = useState<{ id: string; name: string; } | null>(null);
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
    apiParams.isActive = filterStatus === 'active';
  }

  return apiParams;
}, [debouncedSearch, filterStatus, currentPage, itemsPerPage]);
```

## Functions Involved

### `handleDeleteClick()`
**purpose:** Open delete confirmation modal. Sets the packaging item to delete and opens the modal.

### `handleDeleteCancel()`
**purpose:** Close delete confirmation modal. Clears the item to delete and closes the modal.

### `handleDeleteConfirm()`
**purpose:** Confirm and execute packaging deletion. Calls the delete mutation and closes modal on success.

### `handleStatusFilterChange()`
**purpose:** Handle filter changes for status. Resets to page 1.

### `handleItemsPerPageChange()`
**purpose:** Handle items per page changes. Resets to page 1.

## API Integration

### `GET /api/packaging` (via `useGetPackaging`)
Fetches all packaging options with optional search, status filtering, and pagination.

### `DELETE /api/packaging/:id` (via `useDeletePackaging`)
Deletes a specific packaging option.

## UI Structure
- **Container:** Standard padding container.
- **Header:** Title, search bar, Add Packaging button, and filters.
- **Table:** Displays Name, Price, Default status (Yes/No badge), and Status (Active/Inactive badge).
- **Actions:** View, Edit, and Delete icons.
- **Modals:** `ConfirmModal` for deletion.
- **Pagination:** Custom `Pagination` component.

## Form Inputs

### `Search Input`
**Purpose**: Search packaging items by name.
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
│ [ Search packaging... ]                [ Add Packaging ] │
├──────────────────────────────────────────────────────────┤
│ Showing X items          [Status Filter] [Limit]         │
├──────────────────────────────────────────────────────────┤
│ Table (Name, Price, Default, Status, Actions)            │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Packaging                                                                             │
│ Manage packaging options for products and orders                                      │
│                                                                                       │
│ [ 🔍 Search packaging... ]                                         [ + Add Packaging ] │
│                                                                                       │
│ Showing 10 items               [ 🔍 All Status ] [ ☰ 10/pg ]                          │
│                                                                                       │
│ Name               | Price   | Default | Status    | Actions                          │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ Standard Box       | $5.00   | [ Yes ] | [ACTIVE]  | 👁 ✏ 🗑                          │
│ Bubble Wrap        | $2.50   | [ No  ] | [ACTIVE]  | 👁 ✏ 🗑                          │
│ Eco-friendly Bag   | $1.00   | [ No  ] | [INACT.]  | 👁 ✏ 🗑                          │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/packaging`
- Add Packaging -> `/packaging/new`
- View icon -> `/packaging/:id`
- Edit icon -> `/packaging/:id/edit`

## Future Enhancements
- Bulk activation/deactivation of packaging items.
- Sorting options for price and name.
- Image upload for packaging types.
