# Edit Laundry Documentation

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
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineLocationMarker, 
  HiOutlineClipboardCheck, 
  HiOutlineOfficeBuilding,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlinePencilAlt
} from 'react-icons/hi';
import { useGetLaundryById, useUpdateLaundry } from '../../../tanstack/useLaundries';
import type { IProduct } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';
import StatusBadge from '../../../components/ui/StatusBadge';
```

## Context and State Management

### TanStack Query

#### `useGetLaundryById`
- **Hook usage:** `const { data: laundryData, isLoading: isLoadingLaundry } = useGetLaundryById(id || '');`
- **Purpose:** Fetches the current data for the laundry booking being edited.

#### `useUpdateLaundry`
- **Hook usage:** `const updateLaundry = useUpdateLaundry();`
- **Purpose:** Mutation hook to save changes to the laundry booking.

### Local Component State

- `activeTab`: Current step in the edit process ('status', 'vendor', 'service', 'location', 'pickup', 'summary').
- `currentStep`: Numeric step indicator.
- `form`: State object holding the modifiable booking fields (status, pickup date, location).

## Functions Involved

### `validateTabNavigation()`
**purpose:** Ensures valid navigation between edit steps.

### `handleSubmit()`
**purpose:** Submits the updated data to the API.

## API Integration

### `PUT /api/laundries/:id` (via `useUpdateLaundry`)
Updates the laundry booking. Currently allows updating status, pickup date, and location address.

## UI Structure
- **Stepper Header:** Visual progress indicator tailored for the edit flow.
- **Form Content:** Step-by-step modification sections.
- **Navigation Buttons:** "Cancel/Previous" and "Save Changes" buttons.

## Form Inputs

### `Step 1: Booking Status`
- Grid of selectable status buttons (PENDING, CONFIRMED, PICKED_UP, IN_PROGRESS, COMPLETED, DELIVERED).

### `Step 2: Vendor & Branch` (Read-only)
- Displays assigned vendor and branch details (cannot be changed).

### `Step 3: Services` (Read-only)
- Displays booked services (cannot be changed after booking).

### `Step 4: Location` (Modifiable)
- Shows current pickup location address.

### `Step 5: Pickup Date & Phone` (Modifiable)
- Date and time pickers for scheduled pickup.

### `Step 6: Summary`
- Review all changes and current metadata.

## Error Handling
- Displays loading state while laundry data is being fetched.
- Inline error messages for API mutation failures.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [<-] Back to Laundries                                   │
├──────────────────────────────────────────────────────────┤
│ Edit Laundry Booking                   Step X of 6       │
├──────────────────────────────────────────────────────────┤
│ [ Step Progress Bar ]                                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│        [ Active Step Content ]                           │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ [ Previous ]                           [ Save Changes ]  │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Laundries                                                                    │
│ Edit Laundry Booking                                                  Step 1 of 6      │
│                                                                                        │
│ ┌─(1)─(2)─(3)─(4)─(5)─(6)─┐                                                            │
│ │    STATUS               │                                                            │
│ └─────────────────────────┘                                                            │
│                                                                                        │
│ Update Laundry Status                                                                  │
│                                                                                        │
│ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                       │
│ │ PENDING          │  │ CONFIRMED   [ ✔ ]│  │ PICKED UP        │                       │
│ └──────────────────┘  └──────────────────┘  └──────────────────┘                       │
│ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                       │
│ │ IN PROGRESS      │  │ COMPLETED        │  │ DELIVERED        │                       │
│ └──────────────────┘  └──────────────────┘  └──────────────────┘                       │
│                                                                                        │
│ [ Previous ]                                                            [ Continue ]   │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/laundries/:id/edit`
- Success -> `/laundries`
- Cancel -> `/laundries`

## Future Enhancements
- Ability to modify services (with price recalculation).
- Integration with driver assignment.
- SMS notification preview when status changes.
