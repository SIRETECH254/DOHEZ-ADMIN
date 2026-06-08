# Invoice Detail Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
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
import { FiAlertTriangle, FiFileText, FiCreditCard } from 'react-icons/fi';
import { MdStore } from 'react-icons/md';
import { useGetInvoiceById } from '../../../tanstack/useInvoices';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IInvoice, IInvoiceLineItem } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetInvoiceById`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetInvoiceById(id || '');`
- **Purpose:** Fetches the full details of a specific invoice by ID.

### Derived State

#### `invoice`, `vendor`, `branch`, `order`
- **Purpose:** Objects derived from the fetched `data` to simplify access within the component.
```tsx
const invoice = data?.invoice as IInvoice;
const vendor = invoice?.vendor as { _id: string; name: string };
const branch = invoice?.branch as { _id: string; name: string };
const order = invoice?.order as { _id: string; orderNumber: string };
```

## Functions Involved

- **None:** This component is primarily a display component and does not contain complex business logic functions.

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

## UI Structure
- **Container:** Standard padding container.
- **Header:** Back button and Invoice Number/Date display.
- **Main Content:**
    - **Status Section:** Payment Status badge.
    - **Invoice Summary Table:** Line items with descriptions and amounts.
    - **Price Breakdown:** Subtotal, fees, discounts, tax, total, and balance due.
- **Sidebar:** Related order link, payment method, and Vendor/Branch info.

## Error Handling
- Displays a prominent error banner if `isError` is true during data fetching using `FiAlertTriangle`.
- API error messages are retrieved from `(error as any)?.response?.data?.message` and displayed to the user.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header (Back, Title)                                     │
├──────────────────────────────────────────────────────────┤
│ Status Section  │                                        │
├─────────────────┤           Payment Info                 │
│ Summary Table   │                                        │
├─────────────────┤           Vendor/Branch Info           │
│ Price Breakdown │                                        │
└─────────────────┴────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Invoice #INV-001                                                                      │
│ Issued on...                                                                          │
│                                                                                       │
│ Invoice Status Summary  | Payment Information                                         │
│ Payment: [Paid]         | Related Order: #ORD123                                      │
│                         | Method: M-Pesa                                              │
│                                                                                       │
│ Invoice Summary         | Vendor & Branch                                             │
│ Description | Amount    | Vendor: Shop A                                              │
│ ─────────────────────   | Branch: Branch 1                                            │
│ Item A      | 500       |                                                             │
│                                                                                       │
│ Price Breakdown                                                                       │
│ Subtotal    : KES 500                                                                 │
│ Total       : KES 500                                                                 │
│ Balance Due : KES 0                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/invoices/:id`
- Back button -> `/invoices`
- Related order link -> `/orders/:orderId`

## Future Enhancements
- Add "Print Invoice" button.
- Integrate automated invoice PDF generation/download.
