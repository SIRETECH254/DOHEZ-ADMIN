# Edit Coupon Documentation

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
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineExclamation, 
  HiOutlineTicket, 
  HiOutlineCurrencyDollar, 
  HiOutlineCalendar, 
  HiOutlineUsers,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineOfficeBuilding,
  HiOutlineClipboardCheck,
  HiOutlinePencilAlt
} from 'react-icons/hi';
import { useGetCouponById, useUpdateCoupon } from '../../../tanstack/useCoupons';
import { useGetProducts } from '../../../tanstack/useProducts';
import { useGetProductCategories } from '../../../tanstack/useProductCategories';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useGetBranches } from '../../../tanstack/useBranches';
import type { IProduct, IProductCategory, IVendor, IBranch } from '../../../types/api.types';
import StatusBadge from '../../../components/ui/StatusBadge';
```

## Context and State Management

### TanStack Query

- `useGetCouponById`: Fetches the current coupon data.
- `useUpdateCoupon`: Mutation hook to save the changes.
- `useGetProducts`, `useGetProductCategories`, `useGetVendors`, `useGetBranches`: Used for updating selection lists in the wizard.

### Local Component State

- `activeTab`: Current wizard step.
- `currentStep`: Numeric indicator.
- `form`: State object initialized with existing coupon data.
- Search states for filtering options in the wizard.

## Functions Involved

### `validateTabNavigation()`
**purpose:** Validates requirements for each step during the edit process.

### `handleSubmit()`
**purpose:** Executes the update mutation with the modified form data.

## API Integration

### `GET /api/coupons/:id`
Retrieves existing coupon details.

### `PUT /api/coupons/:id`
Updates the coupon record.

## UI Structure
- **Stepper Header:** Progress indicator (Steps 1-6).
- **Tabbed Wizard Content:**
    - **Basic Info:** Name, description, and Active/Inactive toggle.
    - **Discount Rules:** Type, value, min/max amounts.
    - **Usage Limits:** Expiry, total usage limit, audience.
    - **Targets:** Applicable/Excluded products and categories.
    - **Scope:** Vendor and Branch scope.
    - **Summary:** Review modifications.
- **Wizard Navigation:** "Cancel/Previous" and "Continue/Save Changes" buttons.

## Form Inputs

### `Step 1: Basic Info`
- Coupon Name (Required).
- Details / Description.
- Status Toggle (Active/Inactive).

### `Step 2: Discount Rules`
- Discount Type and Value.
- Minimum and Maximum Amounts.

### `Step 3: Usage Limits`
- Expiry Date settings.
- Usage Limit settings.
- Audience settings.

### `Step 4: Targets`
- Modifiable lists for products and categories.

### `Step 5: Scope`
- Modifiable scope for Vendor and Branch.

## Error Handling
- `EditCouponSkeleton` for initial data loading.
- Inline error banner for mutation failures.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [<-] Back to Coupons                                     │
├──────────────────────────────────────────────────────────┤
│ Edit Coupon                            Step X of 6       │
├──────────────────────────────────────────────────────────┤
│ [ Step Stepper & Progress Bar ]                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│        [ Active Wizard Step Content ]                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ [ Previous ]                           [ Save Changes ]  │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Coupons                                                                      │
│ Edit Coupon                                                           Step 1 of 6      │
│                                                                                        │
│ ┌─(1)─(2)─(3)─(4)─(5)─(6)─┐                                                            │
│ │    BASIC INFO           │                                                            │
│ └─────────────────────────┘                                                            │
│                                                                                        │
│ Coupon Name *                  Details / Description                                   │
│ [ Summer Sale 2024       ]     [ Special summer discount...   ]                        │
│                                                                                        │
│ Status                                                                                 │
│ [ ( ● ) Active           ]                                                             │
│                                                                                        │
│ [ Previous ]                                                            [ Continue ]   │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/coupons/:id/edit`
- Success -> `/coupons`
- Cancel -> `/coupons`
