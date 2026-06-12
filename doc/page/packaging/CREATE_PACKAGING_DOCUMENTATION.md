# Create Packaging Documentation

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
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useCreatePackaging } from '../../../tanstack/usePackaging';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useGetBranches } from '../../../tanstack/useBranches';
import type { IVendor, IBranch } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

- `useGetVendors`: Fetches the list of vendors for selection.
- `useGetBranches`: Fetches branches associated with the selected vendor.
- `useCreatePackaging`: Mutation hook to submit the new packaging data.

### Local Component State

- `form`: State object for the packaging data (name, price, isDefault, isActive, vendor, branch).
- `inlineError`: String for displaying form validation or API errors.

## Functions Involved

### `handleSubmit()`
**purpose:** Validates the form and executes the `createPackaging` mutation.

## API Integration

### `POST /api/packaging`
Creates a new packaging record.

### `GET /api/vendors`
Retrieves vendors for the dropdown.

### `GET /api/branches?vendorId=...`
Retrieves branches filtered by vendor.

## UI Structure
- **Back Link:** Navigation back to the packaging list.
- **Header:** Page title.
- **Form Card:** A centralized container for all inputs.
- **Actions:** Primary "Create Packaging" button and a "Cancel" button.

## Form Inputs

### `Packaging Name`
**Type:** Text
**Purpose:** Unique name for the packaging option.

### `Vendor`
**Type:** Select (Dropdown)
**Purpose:** Assign packaging to a specific vendor.

### `Branch`
**Type:** Select (Dropdown)
**Purpose:** Assign packaging to a specific branch (dependent on Vendor).

### `Price`
**Type:** Number
**Purpose:** Cost of the packaging.

### `Set as Default`
**Type:** Toggle/Switch
**Purpose:** Mark this as the default packaging for the selected branch.

### `Status`
**Type:** Toggle/Switch
**Purpose:** Enable or disable the packaging option.

## Error Handling
- Checks for required fields before submission.
- Displays API error messages in a red banner above the form.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [<-] Back to Packaging                                   │
├──────────────────────────────────────────────────────────┤
│ Create New Packaging                                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [ ERROR BANNER (if any) ]                               │
│                                                          │
│  Packaging Name: [________________]                      │
│                                                          │
│  Vendor: [Select Vendor  V]  Branch: [Select Branch V]   │
│                                                          │
│  Price ($): [_______]                                    │
│                                                          │
│  Set as Default: ( ) Status: ( )                         │
│                                                          │
│  [ Create Packaging ] [ Cancel ]                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Packaging                                                                    │
│ Create New Packaging                                                                   │
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
│ │   │     Create Packaging     │  │          Cancel          │                      │ │
│ │   └──────────────────────────┘  └──────────────────────────┘                      │ │
│ │                                                                                   │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/packaging/new`
- Success -> `/packaging`
- Cancel -> `/packaging`
