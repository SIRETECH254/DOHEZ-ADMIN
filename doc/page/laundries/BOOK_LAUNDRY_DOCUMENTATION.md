# Book Laundry Documentation

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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineLocationMarker, 
  HiOutlineClipboardCheck, 
  HiOutlineOfficeBuilding,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlinePencilAlt
} from 'react-icons/hi';
import { FiSearch, FiAlertTriangle } from 'react-icons/fi';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useGetBranches } from '../../../tanstack/useBranches';
import { useGetProducts } from '../../../tanstack/useProducts';
import { useSearchLocation } from '../../../tanstack/useLocations';
import { useBookLaundry } from '../../../tanstack/usePayments';
import type { IVendor, IBranch, IProduct, ILocationResult } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';
```

## Context and State Management

### TanStack Query

- `useGetVendors`: Fetches available vendors.
- `useGetBranches`: Fetches branches for a selected vendor.
- `useGetProducts`: Fetches available laundry services (products) for a selected branch.
- `useSearchLocation`: Searches for physical addresses using location services.
- `useBookLaundry`: Mutation hook to submit the booking and initiate payment.

### Local Component State

- `activeTab`: Current step in the booking process ('vendor', 'service', 'location', 'pickup', 'summary').
- `currentStep`: Numeric step indicator.
- `form`: Complete booking data object.
- `vendorSearch`, `serviceSearch`, `locationQuery`: Input states for searching vendors, services, and addresses.
- `debouncedLocationQuery`: Debounced version of location query to optimize API calls.

## Functions Involved

### `handleServiceToggle()`
**purpose:** Add or remove a service from the selection.

### `validateTabNavigation()`
**purpose:** Validates if the current step is complete before allowing navigation to the next step.

### `handleSubmit()`
**purpose:** Submits the booking form and navigates to the payment confirmation page.

## API Integration

### `POST /api/payments/laundry/book` (via `useBookLaundry`)
Submits the laundry booking details and returns IDs needed for payment processing.

## UI Structure
- **Stepper Header:** Visual progress indicator with steps: Vendor & Branch, Services, Location, Pickup, and Summary.
- **Form Content:** Dynamic area that renders different inputs based on the `activeTab`.
- **Navigation Buttons:** "Cancel/Previous" and "Continue/Confirm & Pay" buttons at the bottom.

## Form Inputs

### `Step 1: Vendor & Branch`
- Vendor search and selection list.
- Branch selection list (appears after vendor is selected).

### `Step 2: Services`
- Service search and toggleable list of available laundry products.

### `Step 3: Location`
- Google-style address search and selection.

### `Step 4: Pickup & Phone`
- Date picker for pickup day.
- Time picker for pickup hour.
- Phone number input for M-Pesa payment.

### `Step 5: Summary`
- Review all selected options and final cost breakdown.

## Error Handling
- Inline error messages displayed if validation fails or API returns an error.
- Loading skeletons used during data fetching.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [<-] Back to Laundries                                   │
├──────────────────────────────────────────────────────────┤
│ Book New Laundry                       Step X of 5       │
├──────────────────────────────────────────────────────────┤
│ [ Step Progress Bar ]                                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│        [ Active Step Content ]                           │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ [ Previous ]                              [ Continue ]   │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Laundries                                                                    │
│ Book New Laundry                                                      Step 2 of 5      │
│                                                                                        │
│ ┌─(1)─(2)─(3)─(4)─(5)─┐                                                                │
│ │    SERVICES         │                                                                │
│ └─────────────────────┘                                                                │
│                                                                                        │
│ [ 🔍 Search Services... ]                                                              │
│                                                                                        │
│ ┌──────────────────────────┐  ┌──────────────────────────┐                             │
│ │ Regular Wash             │  │ Dry Cleaning      [ ✔ ]  │                             │
│ │ KES 500                  │  │ KES 1,200                │                             │
│ └──────────────────────────┘  └──────────────────────────┘                             │
│ ┌──────────────────────────┐  ┌──────────────────────────┐                             │
│ │ Ironing Only             │  │ Duvet Wash               │                             │
│ │ KES 200                  │  │ KES 800                  │                             │
│ └──────────────────────────┘  └──────────────────────────┘                             │
│                                                                                        │
│ [ Previous ]                                                            [ Continue ]   │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/laundries/new`
- Success -> `/payment/laundry?laundryId=...&invoiceId=...`
- Cancel -> `/laundries`

## Future Enhancements
- Save favorite locations for the customer.
- Recurring booking options.
- Map view for location selection.
