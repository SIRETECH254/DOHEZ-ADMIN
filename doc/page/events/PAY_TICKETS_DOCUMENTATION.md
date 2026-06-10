# Pay Tickets Documentation

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
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { MdHourglassEmpty, MdSync, MdCheckCircle, MdError, MdCancel, MdArrowBack, MdRefresh } from 'react-icons/md';
import { HiOutlineTicket } from 'react-icons/hi';
import { API_BASE_URL } from '../../../api/config';
import { usePayTicketInvoices, useQueryMpesaStatus, useGetPaymentById } from '../../../tanstack/usePayments';
import { useAuth } from '../../../contexts/AuthContext';
import { formatCurrency } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetPaymentById`
- **Hook usage:** `const { data: paymentData } = useGetPaymentById(paymentId);`
- **Purpose:** Polls or fetches the current status of a payment record.

#### `useQueryMpesaStatus`
- **Hook usage:** `const { refetch: refetchMpesaStatus } = useQueryMpesaStatus(checkoutId);`
- **Purpose:** Manual fallback to query Safaricom's Daraja API for the transaction status.

#### `usePayTicketInvoices`
- **Hook usage:** `const payTicketInvoicesMutation = usePayTicketInvoices();`
- **Purpose:** Initiates an STK Push for the ticket invoices.

### Local Component State

#### `paymentId` & `checkoutId`
- **Purpose:** Track the identifiers needed for status lookups.

#### `socketStatus`
- **Purpose:** Captures real-time status updates received via WebSockets.
```tsx
const [socketStatus, setSocketStatus] = useState<PaymentStatusType | null>(null);
```

#### `isFallbackActive`
- **Purpose:** Indicates when the component is manually verifying status after a WebSocket timeout.

### Socket & Timers (Refs)
- **`socketRef`**: Stores the Socket.io instance.
- **`timeoutRef`**: Manages the 60-second fallback timer.
- **`statusRef`**: Keeps track of the current status for logic inside timers.

## Functions Involved

### `startTracking()`
**purpose:** Initialize Socket.io connection and set up listeners for payment updates.

**process:**
1. Disconnects any existing socket.
2. Connects to `API_BASE_URL`.
3. Subscribes to the specific `paymentId`.
4. Sets up listeners for `callback.received` and `payment.updated`.
5. Starts a 60-second `FALLBACK_TIMEOUT` to manually query status if no update is received.

### `handleMpesaResultCode()`
**purpose:** Map numeric Daraja result codes to internal `PaymentStatusType`.

**process:**
- `0`: Completed
- `1`: Failed (Insufficient balance)
- `1032`: Cancelled by user
- `1037`: Timeout
- `2001`: Wrong PIN

### `handleRetry()`
**purpose:** Re-initiate the payment process if the previous attempt failed or was cancelled.

**process:**
1. Resets local status states.
2. Calls `payTicketInvoicesMutation.mutateAsync` with invoice IDs and payer phone.
3. Updates `paymentId` and `checkoutId` with the new result.

## API Integration

### `POST /api/payments/pay-invoices` (via `usePayTicketInvoices`)

#### API
```typescript
export const paymentAPI = {
  payTicketInvoices: (data: any) => api.post('/api/payments/pay-invoices', data),
};
```

### `GET /api/payments/query-stk/:checkoutRequestId` (via `useQueryMpesaStatus`)

#### Hook
```typescript
export const useQueryMpesaStatus = (checkoutRequestId: string) => {
  return useQuery({
    queryKey: ['mpesa-status', checkoutRequestId],
    queryFn: async () => {
      const response = await api.get(`/api/payments/query-stk/${checkoutRequestId}`);
      return response.data;
    },
    enabled: false, // Manual trigger only
  });
};
```

## UI Structure
- **Container:** Standard padding container.
- **Status Header:** Large visual indicator showing the current state (Processing, Completed, etc.) with animated icons.
- **Ticket Summary:** List of tickets being paid for, including attendee names and prices.
- **Total Amount:** Highlighted block showing the final sum.
- **Help Text:** Dynamic guidance based on the current status.
- **Action Buttons:** Context-aware buttons (Try Again, Back to Events, View My Tickets).

## Form Inputs
- **Not Applicable:** This is a processing page. The only "input" is the "Try Again" button which re-uses the initial booking data.

## Error Handling
- **Invalid Data State:** Centered error message if `bookingData` is missing from the navigation state.
- **Fallback Verification:** Automatic fallback to Daraja query if WebSockets fail or time out.
- **Mutation Errors:** `inlineError` display if the STK push initiation fails.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                 [ Status Icon / Spinner ]                │
│                   PAYMENT STATUS LABEL                   │
│             (Helpful message based on status)            │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [ Ticket Summary List ]                                 │
│  Ticket #1 ... Price                                     │
│  Ticket #2 ... Price                                     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  TOTAL AMOUNT PAID: [ $$$ ]                              │
├──────────────────────────────────────────────────────────┤
│ [ Back to Events ]               [ View My Tickets ]     │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                       │
│                                      ( 🔄 )                                           │
│                                    PROCESSING                                         │
│                Please check your phone for the M-Pesa PIN prompt.                     │
│                                                                                       │
│  Hi Ticket Summary                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Ticket #TKT-001   John Doe                                           $ 1,500.00 │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│  Total Amount Paid                                                      $ 1,500.00    │
│                                                                                       │
│  [ < Back to Events ]                                                                 │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/events/pay-tickets` (triggered from `EventDetail`)
- "Back to Events" -> `/events`
- "View My Tickets" -> `/profile` (after completion)

## Future Enhancements
- Support for multiple payment methods (Card, PayPal).
- Enhanced socket reconnection logic.
- Audio notifications for status changes.
