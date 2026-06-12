# Edit Packaging Documentation

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

## Imports
```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useGetPackagingById, useUpdatePackaging } from '../../../tanstack/usePackaging';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useGetBranches } from '../../../tanstack/useBranches';
import type { IVendor, IBranch } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

- `useGetPackagingById`: Fetches the current packaging data to populate the form.
- `useGetVendors`: Fetches vendors for the dropdown.
- `useGetBranches`: Fetches branches filtered by the selected vendor.
- `useUpdatePackaging`: Mutation hook to save the changes.

### Local Component State

- `form`: State object initialized with fetched data.
- `inlineError`: String for displaying errors.

## Functions Involved

### `handleSubmit()`
**purpose:** Validates input and executes the `updatePackaging` mutation.

## API Integration

### `GET /api/packaging/:id`
Retrieves existing packaging details.

### `PUT /api/packaging/:id`
Updates the packaging record.

## UI Structure
- **Back Link:** Navigation back to the packaging detail page.
- **Header:** "Edit Packaging: [Name]".
- **Form Card:** Centralized container for inputs.
- **Actions:** "Save Changes" and "Cancel" buttons.

## Form Inputs

### `Packaging Name`
**Type:** Text
**Purpose:** Update the name.

### `Vendor`
**Type:** Select (Dropdown)
**Purpose:** Change the assigned vendor.

### `Branch`
**Type:** Select (Dropdown)
**Purpose:** Change the assigned branch (dependent on Vendor).

### `Price`
**Type:** Number
**Purpose:** Update the price.

### `Set as Default`
**Type:** Toggle/Switch
**Purpose:** Update default status.

### `Status`
**Type:** Toggle/Switch
**Purpose:** Update active/inactive status.

## Error Handling
- Displays loading state while fetching initial data.
- Displays error message if fetch or update fails.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [<-] Back to Details                                     │
├──────────────────────────────────────────────────────────┤
│ Edit Packaging: Standard Box                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [ ERROR BANNER (if any) ]                               │
│                                                          │
│  Packaging Name: [Standard Box____]                      │
│                                                          │
│  Vendor: [Sparkle Laundry V]  Branch: [Downtown Br V]    │
│                                                          │
│  Price ($): [5.00___]                                    │
│                                                          │
│  Set as Default: (x) Status: (x)                         │
│                                                          │
│  [ Save Changes ] [ Cancel ]                             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Details                                                                      │
│ Edit Packaging: Standard Box                                                           │
│                                                                                        │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                                   │ │
│ │   Packaging Name *                                                                 │ │
│ │   [ Standard Box                      ]                                           │ │
│ │                                                                                   │ │
│ │   Vendor *                       Branch *                                         │ │
│ │   [ Sparkle Laundry         V ]  [ Downtown Branch           V ]                  │ │
│ │                                                                                   │ │
│ │   Price ($) *                                                                     │ │
│ │   [ 5.00          ]                                                               │ │
│ │                                                                                   │ │
│ │   Set as Default                 Status                                           │ │
│ │   ( ● ) Default                  ( ● ) Active                                     │ │
│ │                                                                                   │ │
│ │   ┌──────────────────────────┐  ┌──────────────────────────┐                      │ │
│ │   │       Save Changes       │  │          Cancel          │                      │ │
│ │   └──────────────────────────┘  └──────────────────────────┘                      │ │
│ │                                                                                   │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/packaging/:id/edit`
- Success -> `/packaging/:id`
- Cancel -> `/packaging/:id`
