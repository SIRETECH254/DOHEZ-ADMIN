# Branch Detail Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { MdLocationOn } from 'react-icons/md';
import { useGetBranchById } from '../../../tanstack/useBranches';
import type { IBranch, IVendor } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query
- **`useGetBranchById(id)`**: Fetches the branch details for the specific ID provided in the URL params.

## Functions Involved

### `BranchDetailSkeleton()`
**purpose:** Displays a loading skeleton while the branch data is being fetched.

### `navigate`
**purpose:** Used to redirect the user to the branches list or the edit branch page.

## API Integration

### `GET /api/branches/:id`
- **Purpose:** Fetches the detailed information of a specific branch.

## UI Structure
- **Screen shell:** `div` with `p-6` padding and `space-y-6`.
- **Header:** Contains a back button, branch name, and branch ID.
- **Edit Action:** "Edit Branch" button navigates to the edit page.
- **Detail View:** White container displaying:
  - Branch cover image (or fallback icon if missing).
  - Branch details (Vendor name, email, phone, address).

## Error Handling
- Handles loading state (`isLoading`).
- Handles error state (`isError`) by showing an alert icon and the error message, along with a "Back to Branches" button.
- Handles empty branch state ("Branch not found").

## Navigation Flow
- "Back" button -> `/branches`
- "Edit" button -> `/branches/:id/edit`

## Future Enhancements
- Add map view of the branch location.
- Add operational hours display.
- Add gallery image carousel.
