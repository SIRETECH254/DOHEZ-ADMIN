# Vendor Detail Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Components](#components)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetVendorById } from '../../../tanstack/useVendors';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IVendorCategory } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query (Server State)

#### `useGetVendorById`
- **Hook usage:** `const { data: vendorData, isLoading, isError, error } = useGetVendorById(id!);`
- **Purpose:** Fetches the full details of a specific vendor using the ID from the URL parameters.

### URL Parameters

#### `id`
- **Purpose:** The unique identifier for the vendor, extracted from the route.
```tsx
const { id } = useParams<{ id: string }>();
```

## Functions Involved

### `VendorDetailSkeleton`
**Purpose:** A sub-component that renders a placeholder UI while the vendor data is being fetched.
**Implementation:** Uses Tailwind's `animate-pulse` class for a loading effect.

## API Integration

### `GET /api/vendors/:id`
**Purpose:** Retrieve details for a single vendor.
**Contract:** Returns an object containing the `vendor` data.

## UI Structure
- **Screen Shell:** Padded container (`p-6`) with vertical spacing (`space-y-6`).
- **Header:** Back button, Vendor Name, ID, and "Edit Vendor" button.
- **Content Card:** A white rounded card (`rounded-3xl`) containing the logo and details.
- **Layout:** Flexbox layout (mobile-first) switching between column and row for logo/info.
- **Grid:** Responsive grid for displaying vendor attributes.

## Planned Layout
```
┌──────────────────────────────────────────────────┐
│ [<-] Vendor Name                [ ✎ Edit Vendor ]│
│      ID: 12345                                   │
├──────────────────────────────────────────────────┤
│ ┌──────────┐  Category: Laundry                  │
│ │          │  Status: [Active]                   │
│ │   LOGO   │  Email: contact@example.com         │
│ │          │  Phone: +254...                     │
│ └──────────┘                                     │
│ ──────────────────────────────────────────────── │
│ Description:                                     │
│ Lorem ipsum dolor sit amet...                    │
└──────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────┐
│ (<-) Quick Laundry             [ Edit Vendor ]   │
│      ID: 65f...                                  │
│                                                  │
│ ┌──────────────┐  CATEGORY                       │
│ │              │  Laundry Services               │
│ │              │                                 │
│ │     LOGO     │  STATUS                         │
│ │              │  [ Active ]                     │
│ │              │                                 │
│ └──────────────┘  EMAIL                          │
│                   quick@laundry.com              │
│                                                  │
│ DESCRIPTION       PHONE                          │
│ Best laundry in.. +254 712 345 678               │
└──────────────────────────────────────────────────┘
```

## Components

### `StatusBadge`
**Purpose**: Displays the vendor's active/inactive status with an icon.
**Usage**: `<StatusBadge status={vendor.isActive} type="vendor-status" />`

### `Logo Placeholder`
**Purpose**: Displays the first two initials of the vendor name if no logo is provided.
**Implementation**: `vendor.name.substring(0, 2).toUpperCase()`

## Error Handling
- **isError State:** Displays a centered error message with an icon and a "Back to Vendors" button if the API call fails.
- **Not Found:** Shows a simple message if the vendor object is null after a successful fetch.

## Navigation Flow
- Route: `/vendors/:id`.
- Back Button ➞ `/vendors`.
- "Edit Vendor" ➞ `/vendors/:id/edit`.

## Future Enhancements
- Tabbed interface for related data (Branches, Orders, Services).
- Direct actions like "Verify Vendor" or "Deactivate Vendor".
- Map integration showing the vendor's primary location.
