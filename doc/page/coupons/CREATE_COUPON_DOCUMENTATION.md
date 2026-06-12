# Create Coupon Documentation

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
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineExclamation, 
  HiOutlineTicket, 
  HiOutlineCurrencyDollar, 
  HiOutlineCalendar, 
  HiOutlineUsers,
  HiOutlineFilter,
  HiOutlineOfficeBuilding,
  HiOutlineClipboardCheck,
  HiOutlinePencilAlt
} from 'react-icons/hi';
import {FiSearch} from "react-icons/fi"
import { useCreateCoupon } from '../../../tanstack/useCoupons';
import { useGetProducts } from '../../../tanstack/useProducts';
import { useGetProductCategories } from '../../../tanstack/useProductCategories';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useGetBranches } from '../../../tanstack/useBranches';
import type { IProduct, IProductCategory, IVendor, IBranch } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

- `useCreateCoupon`: Mutation hook to submit the new coupon.
- `useGetProducts`, `useGetProductCategories`, `useGetVendors`, `useGetBranches`: Queries used to search and select targets and scope for the coupon.

### Local Component State

- `activeTab`: Current wizard step ('basic', 'discount', 'limits', 'targets', 'scope', 'summary').
- `currentStep`: Numeric step indicator.
- `form`: State object for the multi-step form data.
- Search states for products, categories, vendors, and branches.

## Functions Involved

### `validateTabNavigation()`
**purpose:** Ensures the user cannot skip steps without filling required fields (e.g., name and discount value).

### `toggleItem()`
**purpose:** Utility to add/remove IDs from applicable/excluded lists.

### `handleSubmit()`
**purpose:** Final submission of the coupon data.

## API Integration

### `POST /api/coupons`
Creates a new discount coupon.

## UI Structure
- **Stepper Header:** Progress bar and step indicators (1-6).
- **Tabbed Wizard Content:**
    - **Basic Info:** Name and description.
    - **Discount Rules:** Type (percentage/fixed), value, min/max amounts.
    - **Usage Limits:** Expiry date, usage limit, audience (first-time).
    - **Targets:** Searchable lists to select applicable/excluded products and categories.
    - **Scope:** Searchable lists to select vendor and branch scope.
    - **Summary:** Review all entered data before confirmation.
- **Wizard Navigation:** "Cancel/Previous" and "Continue/Create Coupon" buttons.

## Form Inputs

### `Step 1: Basic Info`
- Coupon Name (Required).
- Details / Description.

### `Step 2: Discount Rules`
- Discount Type (Select).
- Discount Value (Number, Required).
- Minimum Order Amount (Number).
- Maximum Discount Amount (Number, only if percentage).

### `Step 3: Usage Limits`
- Set Expiry Date (Toggle + Date picker).
- Usage Limit (Toggle + Number).
- First-Time Customers Only (Toggle).

### `Step 4: Targets`
- Product selection (Applicable/Excluded buttons).
- Category selection (Applicable/Excluded buttons).

### `Step 5: Scope`
- Vendor selection (Select one or "All").
- Branch selection (Select one or "All").

## Error Handling
- Inline error banner for API failures.
- Step validation prevents moving forward if required fields are empty.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [<-] Back to Coupons                                     │
├──────────────────────────────────────────────────────────┤
│ Create New Coupon                      Step X of 6       │
├──────────────────────────────────────────────────────────┤
│ [ Step Stepper & Progress Bar ]                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│        [ Active Wizard Step Content ]                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ [ Previous ]                           [ Continue ]      │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Coupons                                                                      │
│ Create New Coupon                                                     Step 2 of 6      │
│                                                                                        │
│ ┌─(1)─(2)─(3)─(4)─(5)─(6)─┐                                                            │
│ │    DISCOUNT RULES       │                                                            │
│ └─────────────────────────┘                                                            │
│                                                                                        │
│ Discount Type                  Discount Value (%)                                      │
│ [ Percentage (%)        V ]    [ 15             ]                                      │
│                                                                                        │
│ Minimum Order (KES)            Maximum Discount (KES)                                  │
│ [ 1,000           ]            [ 500             ]                                     │
│                                                                                        │
│ [ Previous ]                                                            [ Continue ]   │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/coupons/new`
- Success -> `/coupons`
- Cancel -> `/coupons`
