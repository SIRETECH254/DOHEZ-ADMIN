# Pay Appointment Documentation

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
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { MdHourglassEmpty, MdSync, MdCheckCircle, MdError, MdCancel, MdArrowBack, MdRefresh } from 'react-icons/md';
import { HiOutlineScissors, HiOutlineCalendar, HiOutlineClipboardCheck } from 'react-icons/hi';
import { API_BASE_URL } from '../../../api/config';
import { usePayAppointmentInvoice, useQueryMpesaStatus, useGetPaymentById } from '../../../tanstack/usePayments';
import { useGetAppointmentById } from '../../../tanstack/useAppointments';
import { useAuth } from '../../../contexts/AuthContext';
import { formatCurrency } from '../../../utils';
import type { IAppointment } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetAppointmentById`
- **Hook usage:** `const { data: appointment } = useGetAppointmentById(appointmentId);`
- **Purpose:** Retrieves appointment details to calculate the remaining balance and get customer info.

#### `usePayAppointmentInvoice`
- **Hook usage:** `const payAppointmentMutation = usePayAppointmentInvoice();`
- **Purpose:** Initiates the M-Pesa STK push for the remaining balance of the appointment.

#### `useQueryMpesaStatus`
- **Hook usage:** `const { refetch: refetchMpesaStatus } = useQueryMpesaStatus(checkoutId);`
- **Purpose:** Polling fallback for transaction status verification.

### Local Component State

#### `paymentId` & `checkoutId`
- **Purpose:** Tracking IDs for the initiated STK push.

#### `socketStatus`
- **Purpose:** Manages the real-time lifecycle of the payment process (`pending`, `processing`, `completed`, `failed`, `cancelled`).
```tsx
const [socketStatus, setSocketStatus] = useState<PaymentStatusType | null>(null);
```

#### `socketError`
- **Purpose:** Stores specific failure messages from the payment callback.

### Socket.IO Integration
- Component connects to `API_BASE_URL` and listens for payment updates specifically for the `paymentId` generated during the session.

## Functions Involved

### `initiatePayment()`
**purpose:** Triggers the STK push for the remaining balance.

**process:**
1. Formats the customer's phone number.
2. Calls `payAppointmentMutation.mutateAsync`.
3. Sets up real-time tracking via `startTracking()`.

### `startTracking()`
**purpose:** Attaches socket listeners for asynchronous transaction feedback.

**process:**
- Listens for `callback.received` and `payment.updated` events.
- Executes `handleMpesaResultCode()` upon receiving results.
- Starts a 60-second safety timer for manual polling.

### `handleMpesaResultCode()`
**purpose:** Interprets Daraja API result codes into human-readable UI states.

**process:**
- Code `0`: Completed (Success)
- Code `1032`: Cancelled by user.
- Code `1`: Insufficient balance.
- Code `1037`: Timeout.

## API Integration

### `POST /api/payments/appointments/pay`

#### API
```typescript
export const paymentAPI = {
  payAppointmentInvoice: (data: { appointmentId: string, method: string, payerPhone: string }) =>
    api.post('/api/payments/appointments/pay', data),
};
```

#### Hook
```typescript
export const usePayAppointmentInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { appointmentId: string; method: string; payerPhone: string }) => {
      const response = await paymentAPI.payAppointmentInvoice(data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
```

## UI Structure
- **Status Header:** Dynamic banner showing payment progress.
- **Booking Summary Card:** Contextual information about the appointment being paid.
- **Price Breakdown Card:**
    - Booking Fee (Paid)
    - Remaining Balance (Pay Now)
    - Total Appointment Value
- **Info Box:** Disclaimer about M-Pesa STK push requirements.
- **Actions Area:** Conditional buttons for navigation or retry.

## Form Inputs

### `Retry Button`
**Purpose**: Allows the admin to re-initiate the payment process if a failure occurs.

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
- **Callback Feedback:** Immediate UI updates based on socket events.
- **Manual Verification:** Polling triggered after 1 minute of inactivity ensures the UI doesn't hang in a "Processing" state indefinitely.
- **Mutation Errors:** `catch` block on `mutateAsync` handles pre-push failures (e.g., validation or server errors).

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Payment Status Banner (Processing/Success/Error)         │
├──────────────────────────────────────────────────────────┤
│ Booking Summary Card (Details of appointment)            │
├──────────────────────────────────────────────────────────┤
│ Price Breakdown Card (Fee Already Paid vs. Pay Now)      │
├──────────────────────────────────────────────────────────┤
│ Disclaimer/Info Box                                      │
├──────────────────────────────────────────────────────────┤
│ Footer Actions (Back, Retry, View All)                   │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                       │
│           [ ✅ (Success Icon) ]                                                       │
│               Confirmed                                                               │
│        The payment has been successfully processed.                                   │
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 📋 Booking Summary                                          #APT-123              │ │
│ │ Customer: Jane Smith                                                              │ │
│ │                                                                                   │ │
│ │ Services:                                                                         │ │
│ │ Service A ......................................................... $25.00         │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Price Breakdown                                                                   │ │
│ │ Booking Fee (Already Paid) ........................................ $10.00         │ │
│ │ Remaining Balance (Pay Now) ........................................ $15.00         │ │
│ │ ───────────────────────────────────────────────────────────────────────────────── │ │
│ │ Total Appointment Value ........................................... $25.00         │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│ [ Back to Appointment ]                             [ View All Appointments ]         │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/appointments/:id/pay`
- On success: Options to return to detail view or all appointments.
- Cancel: Return to detail view.

## Future Enhancements
- Support for Partial Payments.
- Cash/Manual payment entry for administrative overrides.
