# Laundry Detail Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Error Handling](#error-handling)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Navigation Flow](#navigation-flow)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdEdit } from 'react-icons/md';
import { 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineOfficeBuilding, 
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineClipboardList,
  HiOutlineCurrencyDollar
} from 'react-icons/hi';
import { useGetLaundryById } from '../../../tanstack/useLaundries';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatCurrency } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetLaundryById`
- **Hook usage:** `const { data: laundryData, isLoading } = useGetLaundryById(id || '');`
- **Purpose:** Fetches the details of a specific laundry booking by its ID.

### URL Parameters
- `id`: The unique identifier for the laundry booking, retrieved from the route.

## API Integration

### `GET /api/laundries/:id`
Fetches a single laundry booking's data, including customer details, vendor/branch information, services, and payment status.

## UI Structure
- **Header:** Contains back button, "Laundry Details" title, laundry number, Edit Booking button, and status badge.
- **Main Content (Grid):**
    - **Left Column (2/3 width):**
        - **Customer Information:** Avatar, name, ID, email, and phone.
        - **Pickup & Branch:** Pickup address, date, time, vendor name, and branch name.
        - **Requested Services:** List of services with their individual prices.
    - **Right Column (1/3 width):**
        - **Payment Status:** Summary of booking fee, amount paid, and remaining balance. Includes a "Pay Balance Now" button.
        - **Metadata:** Created and last updated timestamps.

## Error Handling
- Shows a loading message while data is being fetched.
- Displays a "Laundry booking not found" message with a back button if the laundry is missing.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [<-] Laundry Details  #LND-XXX           [ Edit ] [Stat] │
├──────────────────────────┬───────────────────────────────┤
│ Customer Information     │ Payment Status                │
│ [Avatar] Name            │ Booking Fee: Paid             │
│ Email, Phone             │ Remaining: KES XXX            │
│                          │ [ Pay Balance Now ]           │
├──────────────────────────┤                               │
│ Pickup & Branch          │ Metadata                      │
│ Address: ...             │ Created: ...                  │
│ Date: ... Time: ...      │ Updated: ...                  │
│ Vendor / Branch          │                               │
├──────────────────────────┤                               │
│ Requested Services       │                               │
│ Service A      KES XXX   │                               │
│ Service B      KES XXX   │                               │
└──────────────────────────┴───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ← Laundry Details                                                     [ ✏ Edit ] [BADGE] │
│   #LND-12345                                                                          │
│                                                                                       │
│ ┌──────────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│ │ 👤 Customer Information              │  │ 💰 Payment Status                       │ │
│ │ 👤 John Doe                          │  │ Booking Fee: PAID                       │ │
│ │ 📧 john@doe.com  📞 +254...          │  │ Amount Paid: KES 50                     │ │
│ └──────────────────────────────────────┘  │ Remaining:   KES 1,200                  │ │
│ ┌──────────────────────────────────────┐  │ [ Pay Balance Now ]                     │ │
│ │ 📍 Pickup & Branch                   │  └─────────────────────────────────────────┘ │
│ │ Address: 123 Main St                 │  ┌─────────────────────────────────────────┐ │
│ │ Date: 2024-06-15  Time: 10:00 AM     │  │ ℹ Metadata                              │ │
│ │ Service Provider: Sparkle Laundry    │  │ Created: Jun 12, 2024 10:00             │ │
│ │ Branch: Downtown                     │  │ Updated: Jun 12, 2024 10:05             │ │
│ └──────────────────────────────────────┘  └─────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐                                              │
│ │ 📋 Requested Services                │                                              │
│ │ Regular Wash             KES 500     │                                              │
│ │ Ironing                  KES 200     │                                              │
│ └──────────────────────────────────────┘                                              │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/laundries/:id`
- Back Button -> `/laundries`
- Edit Booking -> `/laundries/:id/edit`
- Pay Balance Now -> `/payment/laundry?laundryId=...&amount=...&phone=...`

## Future Enhancements
- Activity log/history for status changes.
- Downloadable invoice/receipt in PDF format.
- Ability to add notes to the booking.
