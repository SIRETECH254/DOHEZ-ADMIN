# Packaging Detail Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Error Handling](#error-handling)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Navigation Flow](#navigation-flow)

## Imports
```tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle, FiPackage, FiDollarSign, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useGetPackagingById } from '../../../tanstack/usePackaging';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IVendor, IBranch } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetPackagingById`
- **Hook usage:** `const { data: packagingData, isLoading, isError, error } = useGetPackagingById(id!);`
- **Purpose:** Fetches the details of a specific packaging item by its ID.

### URL Parameters
- `id`: The unique identifier for the packaging item.

## API Integration

### `GET /api/packaging/:id`
Fetches a single packaging item's data, including price, status, default setting, and associated vendor/branch.

## UI Structure
- **Header:** Contains back button, "Packaging Name" title, ID, and Edit button.
- **Main Info Card:**
    - Icon placeholder (`FiPackage`).
    - **Grid Info:**
        - **Price:** Formatted currency.
        - **Status:** Active/Inactive badge.
        - **Type:** Default vs Optional label.
    - **Associated Entities:** Vendor and Branch information cards.
    - **Footer Info:** Creation date.

## Error Handling
- `PackagingDetailSkeleton`: Pulse animation while loading.
- Error banner with `FiAlertTriangle` if fetch fails.
- "Packaging not found" message if the ID doesn't match any records.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [<-] Package Name   ID: XXXX               [ Edit Pack. ]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  Price: $XX.XX                             │
│  │  [ICON]  │  Status: [ACTIVE]                          │
│  │          │  Type: [DEFAULT]                           │
│  └──────────┘                                            │
│                                                          │
├──────────────────────────┬───────────────────────────────┤
│ Vendor Information       │ Branch Information            │
│ Name: ...                │ Name: ...                     │
│ Associated Vendor        │ Associated Branch             │
├──────────────────────────┴───────────────────────────────┤
│ Created on [Date]                                        │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ← Standard Box                                                     [ ✏ Edit Packaging ] │
│   ID: 650af...                                                                        │
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                                   │ │
│ │   ┌───────────┐  💵 Price         Status          Type                            │ │
│ │   │           │  $5.00           [ACTIVE]        [ DEFAULT PACKAGING ]           │ │
│ │   │  [ 📦 ]   │                                                                   │ │
│ │   │           │  ───────────────────────────────────────────────────────────────  │ │
│ │   └───────────┘  Vendor Information           Branch Information                  │ │
│ │                  Sparkle Laundry              Downtown Branch                     │ │
│ │                  Associated Vendor            Associated Branch                   │ │
│ │                                                                                   │ │
│ │   🕒 Created on June 12, 2024                                                     │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/packaging/:id`
- Back Button -> `/packaging`
- Edit Packaging -> `/packaging/:id/edit`
