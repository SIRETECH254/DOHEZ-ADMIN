# Confirm Appointment Payment Documentation

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
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { MdHourglassEmpty, MdSync, MdCheckCircle, MdError, MdCancel, MdArrowBack, MdRefresh } from 'react-icons/md';
import { HiOutlineScissors, HiOutlineCalendar, HiOutlineClipboardCheck } from 'react-icons/hi';
import { API_BASE_URL } from '../../../api/config';
import { useConfirmAppointmentPayment, useQueryMpesaStatus, useGetPaymentById } from '../../../tanstack/usePayments';
import { useGetAppointmentById } from '../../../tanstack/useAppointments';
import { useAuth } from '../../../contexts/AuthContext';
import { formatCurrency } from '../../../utils';
import type { IAppointment } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetAppointmentById`
- **Hook usage:** `const { data: appointment } = useGetAppointmentById(appointmentId);`
- **Purpose:** Fetches appointment data to display the booking summary and determine the payer's phone number.

#### `useConfirmAppointmentPayment`
- **Hook usage:** `const confirmPaymentMutation = useConfirmAppointmentPayment();`
- **Purpose:** Initiates the M-Pesa STK Push for the booking fee confirmation.

#### `useQueryMpesaStatus`
- **Hook usage:** `const { refetch: refetchMpesaStatus } = useQueryMpesaStatus(checkoutId);`
- **Purpose:** Fallback mechanism to manually poll the M-Pesa transaction status if socket updates are missed.

### Local Component State

#### `paymentId` & `checkoutId`
- **Purpose:** Stores the identifiers returned by the payment initiation API for tracking.

#### `socketStatus`
- **Purpose:** Real-time payment status (`pending`, `processing`, `completed`, `failed`, `cancelled`) received via Socket.IO.
```tsx
const [socketStatus, setSocketStatus] = useState<PaymentStatusType | null>(null);
```

#### `socketError`
- **Purpose:** Captures specific error messages from the payment provider (e.g., "Insufficient balance").

### Socket.IO Tracking
- **Socket Instance:** Managed via `useRef` to maintain connection across re-renders.
- **Subscription:** Component emits `subscribe-to-payment` upon successful STK push initiation.

## Functions Involved

### `initiateConfirmation()`
**purpose:** Prepares the payload and triggers the STK push mutation.

**process:**
1. Formats the customer's phone number to E.164 format (e.g., 254...).
2. Sets `socketStatus` to 'processing'.
3. Calls `confirmPaymentMutation.mutateAsync`.
4. Stores `paymentId` and `checkoutId` then calls `startTracking()`.

### `startTracking()`
**purpose:** Sets up Socket.IO listeners and a fallback timeout for transaction monitoring.

**process:**
1. Connects to the Socket.IO server.
2. Listens for `callback.received` and `payment.updated` events.
3. Sets a 60-second fallback timer that triggers manual status querying (`refetchMpesaStatus`).

### `handleMpesaResultCode()`
**purpose:** Maps Safaricom result codes to internal payment statuses.

**process:**
- Code `0`: Completed
- Code `1`: Failed (Insufficient balance)
- Code `1032`: Cancelled (User cancelled)
- ... (and other codes)

## API Integration

### `POST /api/payments/appointments/confirm/:appointmentId`

#### API
```typescript
export const paymentAPI = {
  confirmAppointment: (appointmentId: string, data: { method: string, payerPhone: string }) =>
    api.post(`/api/payments/appointments/confirm/${appointmentId}`, data),
};
```

#### Hook
```typescript
export const useConfirmAppointmentPayment = () => {
  return useMutation({
    mutationFn: async ({ appointmentId, data }: { appointmentId: string; data: any }) => {
      const response = await paymentAPI.confirmAppointment(appointmentId, data);
      return response.data.data;
    },
  });
};
```

## UI Structure
- **Status Header:** Large visual area with an icon (spinner/check/error) and status text.
- **Booking Summary Card:** Displays customer name, appointment number, date, and service list.
- **Payment Breakdown Card:** Highlighted area showing the Booking Fee (Pay Now), Remaining Balance (At Branch), and Total Value.
- **Info Box:** Italicized guidance text explaining the M-Pesa STK push.
- **Footer Actions:** 
    - Processing: "Cancel Process" or "Back to Appointment".
    - Success: "View All Appointments".
    - Failure: "Try Again" button.

## Form Inputs

### `Retry Button`
**Purpose**: Resets the initiation state to allow re-triggering the STK push if a failure occurred.

**Input implementation**:
```tsx
<button
  onClick={handleRetry}
  className="flex-1 btn-primary py-4 flex items-center justify-center gap-2"
>
  <MdRefresh size={20} />
  Try Again
</button>
```

## Error Handling
- **Real-time Errors:** Captures result messages from the M-Pesa callback (e.g., "Wrong PIN entered").
- **Connection Errors:** Handles Socket.IO connection failures by relying on the manual fallback timeout.
- **Fallback Verification:** Automatically polls the API after 60 seconds if no socket update is received, ensuring the UI eventually reflects the true transaction state.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Status Banner (Animated Icon, Title, Description)        │
├──────────────────────────────────────────────────────────┤
│ Booking Summary Card (Customer, Services, Appt #)        │
├──────────────────────────────────────────────────────────┤
│ Payment Breakdown Card (Fee Now, Balance Later, Total)   │
├──────────────────────────────────────────────────────────┤
│ Info Box (Guidance Text)                                 │
├──────────────────────────────────────────────────────────┤
│ Actions Footer (Retry, Back, or View All)                │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                       │
│           [ 🔄 (Processing Icon) ]                                                    │
│               Processing Payment                                                      │
│      Please check the customer's phone for the PIN prompt.                            │
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 📋 Booking Summary                                          #APT-123              │ │
│ │ Customer: John Doe                                                                │ │
│ │ Scheduled For: Oct 27, 2023, 10:00 AM                                             │ │
│ │                                                                                   │ │
│ │ Services:                                                                         │ │
│ │ Haircut ........................................................... $50.00         │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Price Breakdown                                                                   │ │
│ │ Booking Fee (Pay Now) ............................................. $20.00         │ │
│ │ Remaining Balance (At Branch) ..................................... $30.00         │ │
│ │ ───────────────────────────────────────────────────────────────────────────────── │ │
│ │ Total Value ....................................................... $50.00         │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│ [ Back to Appointment ]                                                               │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/appointments/:id/confirm`
- On success: Navigate to `/appointments` or back to detail view.
- Retry: Resets state within the same route.

## Future Enhancements
- Support for other payment methods (Credit Card, PayPal).
- Display a QR code for manual payment if STK push fails.
