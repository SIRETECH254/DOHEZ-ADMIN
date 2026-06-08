# Payment Status Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Navigation Flow](#navigation-flow)

## Imports
```tsx
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { MdHourglassEmpty, MdSync, MdCheckCircle, MdError, MdCancel, MdArrowBack, MdRefresh } from 'react-icons/md';
import { FiPackage } from 'react-icons/fi';
import { API_BASE_URL } from '../../../api/config';
import { usePayInvoice, useQueryMpesaStatus, useGetPaymentById } from '../../../tanstack/usePayments';
import { useGetInvoiceById } from '../../../tanstack/useInvoices';
import { useGetOrderById } from '../../../tanstack/useOrders';
import { useAuth } from '../../../contexts/AuthContext';
import { formatCurrency } from '../../../utils';
import type { IOrderItem ,IOrder} from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetInvoiceById`, `useGetOrderById`, `useGetPaymentById`
- **Purpose:** Fetches details for the invoice, order, and payment based on ID parameters from the URL.

#### `usePayInvoice`
- **Hook usage:** `const payInvoiceMutation = usePayInvoice();`
- **Purpose:** Mutation hook to initiate the STK Push payment.

#### `useQueryMpesaStatus`
- **Hook usage:** `const { refetch: refetchMpesaStatus } = useQueryMpesaStatus(checkoutId);`
- **Purpose:** Manually refetches M-Pesa status via Daraja API, triggered only as a fallback.
- **Config:** `enabled: false` (to prevent premature automatic execution).

### Local Component State

#### `paymentId` & `checkoutId`
- **Purpose:** Stores IDs returned after successfully initiating an STK Push.
```tsx
const [paymentId, setPaymentId] = useState<string>('');
const [checkoutId, setCheckoutId] = useState<string>('');
```

#### `socketStatus` & `socketError`
- **Purpose:** Tracks current UI state ('processing', 'completed', 'failed', 'cancelled') and error messages.
```tsx
const [socketStatus, setSocketStatus] = useState<PaymentStatusType | null>(null);
const [socketError, setSocketError] = useState<string | null>(null);
```

#### `isFallbackActive` & `hasInitiated`
- **Purpose:** Tracks fallback polling status and whether payment initiation has occurred.
```tsx
const [isFallbackActive, setIsFallbackActive] = useState(false);
const [hasInitiated, setHasInitiated] = useState(false);
```

### Refs (Socket & Timer)

#### `socketRef` & `timeoutRef`
- **Purpose:** Manages the Socket.IO connection for real-time updates and the 60-second fallback timer that triggers `refetchMpesaStatus`.
```tsx
const socketRef = useRef<Socket | null>(null);
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

## Functions Involved

### `clearPaymentTimers()`
**purpose:** Clears the fallback timeout and disconnects the Socket.IO instance to prevent memory leaks and redundant updates.

**process:**
1. Clears `timeoutRef` if active.
2. Disconnects `socketRef` if active.

**function implementation:**
```tsx
  const clearPaymentTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch (err) {
        console.error('Error disconnecting Socket.IO:', err);
      }
      socketRef.current = null;
    }
  }, []);
```

### `handleMpesaResultCode()`
**purpose:** Interprets the M-Pesa callback result code and updates the UI state accordingly.

**process:**
1. Evaluates the numeric result code.
2. Updates `socketStatus` to 'completed', 'failed', or 'cancelled' based on the result.
3. Sets appropriate error messages for failures.
4. Clears timers and sockets on final statuses.

**function implementation:**
```tsx
  const handleMpesaResultCode = useCallback(
    (resultCode: number, resultMessage: string) => {
      console.log(`M-Pesa Result: ${resultCode} - ${resultMessage}`);
      
      switch (resultCode) {
        case 0:
          setSocketStatus('completed');
          clearPaymentTimers();
          break;
        case 1:
          setSocketStatus('failed');
          setSocketError('Insufficient M-Pesa balance');
          clearPaymentTimers();
          break;
        case 1032:
          setSocketStatus('cancelled');
          setSocketError('Payment cancelled by user');
          clearPaymentTimers();
          break;
        case 1037:
          setSocketStatus('failed');
          setSocketError('Payment timeout - could not reach your phone');
          clearPaymentTimers();
          break;
        case 2001:
          setSocketStatus('failed');
          setSocketError('Wrong PIN entered');
          clearPaymentTimers();
          break;
        case 9999:
          setSocketStatus('processing');
          break;
        default:
          setSocketStatus('failed');
          setSocketError(resultMessage || `Transaction failed (Code: ${resultCode})`);
          clearPaymentTimers();
          break;
      }
    },
    [clearPaymentTimers]
  );
```

### `startTracking()`
**purpose:** Initializes the socket connection and sets the fallback timer for status verification.

**process:**
1. Calls `clearPaymentTimers()` to ensure a clean state.
2. Connects to the Socket.IO server.
3. Subscribes to the specific payment ID on connection.
4. Sets up listeners for `callback.received` and `payment.updated` events.
5. Sets a 60-second fallback timer that triggers `refetchMpesaStatus()` if the transaction remains pending.

**function implementation:**
```tsx
  const startTracking = useCallback(
    (targetPaymentId: string, _targetCheckoutId: string) => {
      clearPaymentTimers();
      
      try {
        socketRef.current = io(API_BASE_URL, {
          transports: ['websocket'],
          forceNew: true,
          reconnection: true,
        });

        socketRef.current.on('connect', () => {
          socketRef.current?.emit('subscribe-to-payment', String(targetPaymentId));
        });

        socketRef.current.on('callback.received', (payload: any) => {
          const code = payload.CODE ?? payload.code ?? payload.resultCode;
          const message = payload.message || payload.resultDesc || 'Processed';
          handleMpesaResultCode(Number(code), message);
        });

        socketRef.current.on('payment.updated', (payload: any) => {
          if (String(payload.paymentId) !== String(targetPaymentId)) return;
          if (payload.status) {
            const status = payload.status.toLowerCase();
            if (status === 'success' || status === 'completed') setSocketStatus('completed');
            else if (status === 'failed') setSocketStatus('failed');
            else if (status === 'cancelled') setSocketStatus('cancelled');
            if (['success', 'completed', 'failed', 'cancelled'].includes(status)) {
              clearPaymentTimers();
            }
          }
        });
      } catch (err) {
        console.error('Socket connection error:', err);
      }

      timeoutRef.current = setTimeout(async () => {
        if (currentStatus === 'completed' || currentStatus === 'failed' || currentStatus === 'cancelled') return;
        try {
          setIsFallbackActive(true);
          const { data: statusData } = await refetchMpesaStatus();
          const code = statusData?.resultCode ?? statusData?.CODE ?? -1;
          const desc = statusData?.resultDesc ?? statusData?.message ?? 'Unknown status';
          handleMpesaResultCode(Number(code), desc);
        } catch (error) {
          setSocketStatus('failed');
          setSocketError('Could not verify status. Please check your M-Pesa messages.');
        } finally {
          setIsFallbackActive(false);
        }
      }, FALLBACK_TIMEOUT);
    },
    [handleMpesaResultCode, clearPaymentTimers, refetchMpesaStatus, currentStatus]
  );
```

### `initiatePayment()`
**purpose:** Orchestrates the initial payment initiation by calling the STK push mutation.

**process:**
1. Validates `invoiceId`, `amount`, and `phone`.
2. Sets component state `hasInitiated` to true and `socketStatus` to 'processing'.
3. Calls `payInvoiceMutation.mutateAsync` to start STK push.
4. On success, sets IDs and calls `startTracking()`.
5. On failure, sets error state.

**function implementation:**
```tsx
  const initiatePayment = async () => {
    if (hasInitiated || !invoiceId) return;
    
    // ... (Phone normalization, validation logic)

    setHasInitiated(true);
    setSocketStatus('processing');
    setSocketError(null);

    try {
      const result = await payInvoiceMutation.mutateAsync({
        invoiceId,
        method: 'mpesa_stk',
        amount,
        payerPhone: phone,
      });

      if (result?.paymentId) {
        setPaymentId(result.paymentId);
        const cId = result.daraja?.checkoutRequestId || result.checkoutId || '';
        setCheckoutId(cId);
        startTracking(result.paymentId, cId);
      }
    } catch (err: any) {
      setSocketStatus('failed');
      setSocketError(err?.response?.data?.message || 'Failed to initiate STK push');
    }
  };
```

### `handleRetry()`
**purpose:** Resets state to allow the user to initiate a new payment attempt.

**process:**
1. Resets `hasInitiated`, `socketStatus`, and `socketError` to initial states.

**function implementation:**
```tsx
  const handleRetry = () => {
    setHasInitiated(false);
    setSocketStatus(null);
    setSocketError(null);
  };
```

## API Integration

### `GET /api/invoices/:invoiceId`

#### API
```typescript
export const invoiceAPI = {
  // Get invoice by ID
  getInvoiceById: (invoiceId: string) => api.get(`/api/invoices/${invoiceId}`),
};
```

#### Hook
```typescript
export const useGetInvoiceById = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await invoiceAPI.getInvoiceById(invoiceId);
      return response.data.data;
    },
    enabled: !!invoiceId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains the `IInvoice` object.

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/orders/:orderId`

#### API
```typescript
export const orderAPI = {
  // Get detailed order by ID
  getOrderById: (orderId: string) => api.get(`/api/orders/${orderId}`),
};
```

#### Hook
```typescript
export const useGetOrderById = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await orderAPI.getOrderById(orderId);
      return response.data.data;
    },
    enabled: !!orderId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ order }`.

#### Error Handling
API returns a message in `response.data.message`.

---

### `POST /api/payments/pay`

#### Interface
```typescript
export interface PayInvoicePayload {
  invoiceId: string;
  method: string;
  amount: number;
  payerPhone: string;
}
```

#### API
```typescript
export const paymentAPI = {
  // Initiate payment for an invoice
  payInvoice: (data: PayInvoicePayload) =>
    api.post('/api/payments/pay', data),
};
```

#### Hook
```typescript
export const usePayInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PayInvoicePayload) => {
      const response = await paymentAPI.payInvoice(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      console.log('Invoice paid successfully');
    },
    onError: (error: any) => console.error('Error paying invoice:', error),
  });
};
```

#### Contract
Returns payment initiation details including `paymentId` and `checkoutId`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "paymentId": "650af...",
    "checkoutId": "ws_CO_..."
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/payments/mpesa/:checkoutId`

#### API
```typescript
export const paymentAPI = {
  // Query M-Pesa status
  queryMpesaByCheckoutId: (checkoutId: string) => api.get(`/api/payments/mpesa/${checkoutId}`),
};
```

#### Hook
```typescript
export const useQueryMpesaStatus = (checkoutId: string) => {
  return useQuery({
    queryKey: ['payment', 'mpesa', checkoutId],
    queryFn: async () => {
      const response = await paymentAPI.queryMpesaByCheckoutId(checkoutId);
      return response.data.data;
    },
    enabled: false,
    staleTime: 0,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
Returns the current status of the M-Pesa transaction.

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/payments/:paymentId`

#### API
```typescript
export const paymentAPI = {
  // Get single payment details (Admin)
  getPaymentById: (paymentId: string) => api.get(`/api/payments/${paymentId}`),
};
```

#### Hook
```typescript
export const useGetPaymentById = (paymentId: string) => {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: async () => {
      const response = await paymentAPI.getPaymentById(paymentId);
      return response.data.data;
    },
    enabled: !!paymentId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains the `IPayment` object.

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Standard padding container with a centered white card.
- **Status Header:** Dynamic header displaying an icon and message based on the `currentStatus`. Includes an optional loader for fallback status checks.
- **Summary:** Shows order items and price breakdown using a table and list format.
- **Actions:** Context-aware buttons (Retry for failed/cancelled, Back to Orders for success/other).

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Status Header (Icon, Message, Fallback Indicator)        │
├──────────────────────────────────────────────────────────┤
│ Order Summary (Items Table, Price Breakdown)             │
├──────────────────────────────────────────────────────────┤
│ Info Box (Instructions/Support info)                     │
├──────────────────────────────────────────────────────────┤
│ Actions (Retry/Back to Orders/Continue Shopping)         │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Payment Status                                                                        │
│                                                                                       │
│ [ 🔄 Processing ]                                                                     │
│ Please check your phone for the M-Pesa PIN prompt.                                    │
│                                                                                       │
│ Order Items                                                                           │
│ Product          | Qty | Price                                                        │
│ ─────────────────────────────────────────────────────────────                         │
│ Item Name        | 1   | KES 500                                                      │
│                                                                                       │
│ Price Breakdown                                                                       │
│ Subtotal         : KES 500                                                            │
│ Total Amount     : KES 500                                                            │
│                                                                                       │
│ ⚠ If you don't see the prompt, ensure your phone is unlocked and try again.           │
│                                                                                       │
│ [ Go to Orders ]                                                                      │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/payment?invoiceId=...&orderId=...`
- On completion: Provides links back to `/orders` or `/` (home).
