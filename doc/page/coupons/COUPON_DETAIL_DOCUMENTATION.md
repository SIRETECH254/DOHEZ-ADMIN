# Coupon Detail Documentation

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
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTicket, HiOutlineCalendar, HiOutlineUsers, HiOutlineTag } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetCouponById } from '../../../tanstack/useCoupons';
import StatusBadge from '../../../components/ui/StatusBadge';
```

## Context and State Management

### TanStack Query

#### `useGetCouponById`
- **Hook usage:** `const { data: couponData, isLoading, isError, error } = useGetCouponById(id || '');`
- **Purpose:** Fetches the detailed information of a specific coupon by its ID.

### URL Parameters
- `id`: The unique identifier for the coupon.

## API Integration

### `GET /api/coupons/:id`
Fetches all details of the coupon, including discount rules, usage statistics, validity limits, and target restrictions (products/categories).

## UI Structure
- **Header:** Back button, Coupon Name, Coupon Code (monospace), and Edit Coupon button.
- **Main Content (Grid):**
    - **Left Column (2/3 width):**
        - **Basic Info & Discount:** Displays discount value (percentage or fixed), status, description, minimum order, and maximum discount.
        - **Targets Section:** Lists applicable and excluded products and categories.
    - **Right Column (1/3 width):**
        - **Usage Statistics:** Total uses vs. usage limit with a progress bar.
        - **Validity & Limits:** First-time only flag, expiry status, and expiry date.
        - **Scope:** Associated Vendor and Branch information.

## Error Handling
- `CouponDetailSkeleton`: Pulse animation during data fetch.
- Error banner if fetch fails.
- "Coupon not found" message if ID is invalid.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [<-] Coupon Name      CODE123             [ Edit Coup. ] │
├──────────────────────────┬───────────────────────────────┤
│ Basic Info & Discount    │ Usage Statistics              │
│ [Val%] Status: [Stat]    │ Total Uses: X / Limit         │
│ Description: ...         │ [==== Usage Bar ====]         │
│ Min Order: KES XXX       ├───────────────────────────────┤
│ Max Disc:  KES XXX       │ Validity & Limits             │
├──────────────────────────┤ First-time Only: Yes/No       │
│ Targets Section          │ Has Expiry: Yes/No            │
│ Products: [List]         │ Expiry Date: [Date]           │
│ Categories: [List]       ├───────────────────────────────┤
│                          │ Scope                         │
│                          │ Vendor: ...  Branch: ...      │
└──────────────────────────┴───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ← Summer Sale 2024                                                 [ ✏ Edit Coupon ]  │
│   SUMMER24                                                                            │
│                                                                                       │
│ ┌──────────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│ │ 🏷 Basic Info & Discount              │  │ 👥 Usage Statistics                     │ │
│ │ ┌─────────┐ Type: percentage         │  │ Total Uses                              │ │
│ │ │   15%   │ Status: [ACTIVE]         │  │ 12 / 100                                │ │
│ │ └─────────┘                          │  │ [===-------------]                      │ │
│ │ Description: Summer discount for all │  └─────────────────────────────────────────┘ │
│ │ products                             │  ┌─────────────────────────────────────────┐ │
│ │ ──────────────────────────────────── │  │ 📅 Validity & Limits                    │ │
│ │ Min Order: 1,000 | Max Disc: 500     │  │ First-time Only: No                     │ │
│ └──────────────────────────────────────┘  │ Has Expiry: Yes                         │ │
│ ┌──────────────────────────────────────┐  │ Expiry Date: Dec 31, 2024               │ │
│ │ 🎫 Application Targets               │  └─────────────────────────────────────────┘ │
│ │ Products                             │  ┌─────────────────────────────────────────┐ │
│ │ [Applicable: Item A]                 │  │ 🏷 Scope                                │ │
│ │ [Excluded:   Item B]                 │  │ Vendor: Global                          │ │
│ │ Categories                           │  │ Branch: Global                          │ │
│ │ All applicable                       │  └─────────────────────────────────────────┘ │
│ └──────────────────────────────────────┘                                              │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/coupons/:id`
- Back Button -> `/coupons`
- Edit Coupon -> `/coupons/:id/edit`
