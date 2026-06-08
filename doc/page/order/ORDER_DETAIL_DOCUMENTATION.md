# Order Detail Documentation

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
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { FiAlertTriangle, FiUser, FiPackage, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { MdStore } from 'react-icons/md';
import { useGetOrderById, useUpdateOrderStatus } from '../../../tanstack/useOrders';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IOrder, IUser, IVendor, IBranch, IOrderItem } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetOrderById`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetOrderById(id || '');`
- **Purpose:** Fetches the full details of a specific order by ID.

#### `useUpdateOrderStatus`
- **Hook usage:** `const updateStatus = useUpdateOrderStatus();`
- **Purpose:** Mutation hook to update the fulfillment status of an order. Cache invalidation is handled by mutation `onSuccess`.

### Local Component State

#### `order`, `customer`, `vendor`, `branch`
- **Purpose:** Derived objects from the fetched `data` to simplify access within the component.
```tsx
const order = data?.order as IOrder;
const customer = order?.customer as IUser;
const vendor = order?.vendor as IVendor;
const branch = order?.branch as IBranch;
```

### Memoized Parameters

#### `None`
- **Purpose:** This component does not currently utilize memoized parameters for state management.

## Functions Involved

### `handleStatusUpdate()`
**purpose:** Initiates the order status update process and handles the mutation.

**process:**
1. Validates that an order ID exists.
2. Calls `updateStatus.mutateAsync` with the order ID and new status.
3. Logs errors if the mutation fails.

**function implementation:**
```tsx
  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    try {
      await updateStatus.mutateAsync({ 
        orderId: id, 
        data: { status: newStatus as any } 
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };
```

## API Integration

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

### `PATCH /api/orders/:orderId/status`

#### Interface
```typescript
export interface UpdateOrderStatusPayload {
  status: 'PLACED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
}
```

#### API
```typescript
export const orderAPI = {
  // Update order fulfillment status
  updateOrderStatus: (orderId: string, data: UpdateOrderStatusPayload) => api.patch(`/api/orders/${orderId}/status`, data),
};
```

#### Hook
```typescript
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: UpdateOrderStatusPayload }) => {
      const response = await orderAPI.updateOrderStatus(orderId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      console.log('Order status updated successfully');
    },
    onError: (error: any) => console.error('Error updating order status:', error),
  });
};
```

#### Contract
Returns updated order details on success.

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Standard padding container.
- **Header:** Back button and Order ID display.
- **Main Content:**
    - **Status Section:** Summary of Payment and Order status.
    - **Order Items Table:** List of items, quantities, and prices.
    - **Price Breakdown:** Subtotal, fees, tax, and total.
    - **Progress Tracker:** Visual stepper to update order fulfillment status.
- **Sidebar:** Customer, Vendor, and Branch information.

## Error Handling
- Displays a prominent error banner if `isError` is true using `FiAlertTriangle`.
- API error messages are retrieved from `(error as any)?.response?.data?.message` and displayed to the user.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header (Back, Title)                                     │
├──────────────────────────────────────────────────────────┤
│ Status Section  │                                        │
├─────────────────┤           Customer Info                │
│ Items Table     │                                        │
├─────────────────┤           Vendor/Branch Info           │
│ Price Breakdown │                                        │
├─────────────────┤                                        │
│ Status Tracker  │                                        │
└─────────────────┴────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Order #12345678                                                                       │
│ Placed on...                                                                          │
│                                                                                       │
│ Order Status Summary    | Customer Information                                        │
│ Payment: [Paid]         | Name: John Doe                                              │
│ Order:   [Packed]       | Phone: +254...                                              │
│                         |                                                             │
│ Order Items             | Vendor & Fulfillment                                        │
│ Product | Qty | Price   | Vendor: Shop A                                              │
│ ─────────────────────   | Branch: Branch 1                                            │
│ Item A  | 1   | 500     | Method: M-Pesa                                              │
│                                                                                       │
│ Update Order Progress                                                                 │
│ ○ PLACED                                                                              │
│ ◉ CONFIRMED                                                                           │
│ ○ PACKED                                                                              │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/orders/:id`
- Back button -> `/orders`

## Future Enhancements
- Implement real-time status updates using WebSockets if available.
- Add "Print Receipt" button.
- Integrate map view for delivery tracking.
