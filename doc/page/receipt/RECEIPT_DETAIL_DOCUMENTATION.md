# Receipt Detail Documentation

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
import { FiAlertTriangle, FiFileText, FiCreditCard, FiUser, FiCalendar, FiExternalLink } from 'react-icons/fi';
import { MdStore, MdLocationOn } from 'react-icons/md';
import { useGetReceiptById } from '../../../tanstack/useReceipts';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IReceipt, IUser, IVendor, IBranch } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetReceiptById`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetReceiptById(id || '');`
- **Purpose:** Fetches the full details of a specific receipt by ID.

### Derived State

#### `receipt`, `customer`, `vendor`, `branch`
- **Purpose:** Objects derived from the fetched `data` to simplify access within the component.
```tsx
const receipt = data?.receipt as IReceipt;
const customer = typeof receipt?.customer === 'object' ? receipt.customer as IUser : null;
const vendor = typeof receipt?.vendor === 'object' ? receipt.vendor as IVendor : null;
const branch = typeof receipt?.branch === 'object' ? receipt.branch as IBranch : null;
```

## Functions Involved
- **None:** This component is primarily a display component and does not contain complex business logic functions.

## API Integration

### `GET /api/receipts/:receiptId`

#### API
```typescript
export const receiptAPI = {
  // Get receipt by ID
  getReceiptById: (receiptId: string) => api.get(`/api/receipts/${receiptId}`),
};
```

#### Hook
```typescript
export const useGetReceiptById = (receiptId: string) => {
  return useQuery({
    queryKey: ['receipt', receiptId],
    queryFn: async () => {
      const response = await receiptAPI.getReceiptById(receiptId);
      return response.data.data;
    },
    enabled: !!receiptId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains the `IReceipt` object.

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Standard padding container.
- **Header:** Back button and Receipt Number/Date display.
- **Main Content:**
    - **Receipt Details Section:** Shows Amount Paid, Payment Method, and Issued Date.
- **Sidebar:**
    - **Reference Info:** Link to related invoice and PDF link.
    - **Customer Info:** Name and Phone.
    - **Vendor & Branch Info:** Store name and branch location.

## Error Handling
- Displays a prominent error banner if `isError` is true during data fetching using `FiAlertTriangle`.
- API error messages are retrieved from `(error as any)?.response?.data?.message` and displayed to the user.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header (Back, Title)                                     │
├──────────────────────────────────────────────────────────┤
│ Receipt Details │           Reference Info               │
├─────────────────┤                                        │
│                 │           Customer Info                │
├─────────────────┤                                        │
│                 │           Vendor/Branch Info           │
└─────────────────┴────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Receipt REC-001                                                                       │
│ Issued on...                                                                          │
│                                                                                       │
│ Receipt Details         | Reference Information                                       │
│ Amount Paid: KES 500    | Related Invoice: INV-001                                    │
│ Payment Method: M-Pesa  | [🔗 View Receipt PDF]                                       │
│ Issued At: ...          |                                                             │
│                         | Customer Information                                        │
│                         | Name: John Doe                                              │
│                         | Phone: +254...                                              │
│                         |                                                             │
│                         | Vendor & Branch                                             │
│                         | Vendor: Shop A                                              │
│                         | Branch: Branch 1                                            │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/receipts/:id`
- Back button -> `/receipts`

## Future Enhancements
- Add "Print Receipt" button.
- Integrate automated invoice PDF generation/download.
