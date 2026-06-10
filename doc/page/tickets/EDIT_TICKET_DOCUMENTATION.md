# Edit Ticket Documentation

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
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdConfirmationNumber } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetTicket, useUpdateTicket } from '../../../tanstack/useTickets';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { ITicket } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetTicket`
- **Hook usage:** `const { data: ticketData, isLoading, isError, error } = useGetTicket(id!);`
- **Purpose:** Fetches the existing ticket data to pre-populate the status.

#### `useUpdateTicket`
- **Hook usage:** `const updateTicket = useUpdateTicket();`
- **Purpose:** Mutation hook to update the ticket status.

### Local Component State

#### `status`
- **Purpose:** Manages the selected status value in the radio button form.
```tsx
const [status, setStatus] = useState<string>('');
```

## Functions Involved

### `handleSubmit()`
**purpose:** Submit the status update to the server.

**process:**
1. Prevents default form submission.
2. Validates that `id` and `status` are present.
3. Calls `updateTicket.mutate()` with the `ticketId` and the new `status`.
4. Navigates back to `/tickets` on success.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !status) return;

    updateTicket.mutate({ 
      ticketId: id, 
      ticketData: { status: status as any } 
    }, {
      onSuccess: () => navigate('/tickets')
    });
  }, [id, status, updateTicket, navigate]);
```

## API Integration

### `PATCH /api/tickets/:ticketId`

#### API
```typescript
export const ticketAPI = {
  // Update ticket status
  updateTicket: (id: string, data: Partial<ITicket>) => api.patch(`/api/tickets/${id}`, data),
};
```

#### Hook
```typescript
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, ticketData }: { ticketId: string; ticketData: any }) => {
      const response = await ticketAPI.updateTicket(ticketId, ticketData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket'] });
    },
  });
};
```

#### Contract
Returns confirmation of status update on success.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Ticket updated"
}
```

## UI Structure
- **Container:** Standard padding container.
- **Form Card:** Max-w-2xl centered card with shadow and border.
- **Header:** Back button and page title ("Update Ticket Status").
- **Ticket Summary:** A grey info card showing the ticket number and current status badge.
- **Input Group:** Grid of radio buttons for status selection.
- **Action Buttons:** Save Changes (primary) and Cancel (utility).

## Form Inputs

### `Status Radio Group`
**Purpose**: Allows selection of a new lifecycle state for the ticket.
**Applicable**: Options include `PENDING`, `BOOKED`, `CANCELLED`, `USED`, `EXPIRED`.

**Input implementation**:
```tsx
<label 
  className={`... ${status === s ? 'active-styles' : 'inactive-styles'}`}
>
  <input 
    type="radio" 
    name="status" 
    value={s} 
    checked={status === s}
    onChange={(e) => setStatus(e.target.value)}
  />
  <span>{s}</span>
  <StatusBadge status={s} type="ticket-status" />
</label>
```

## Error Handling
- Displays a pulse animation loader while `isLoading` is true.
- Shows a prominent error card with `FiAlertTriangle` if the ticket data cannot be fetched.
- The "Save Changes" button is disabled during submission (`isPending`) or if the status hasn't changed from the original.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [ < Back ] Update Ticket Status                          │
├──────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐ │
│ │  [ Ticket Summary Info Card ]                        │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │  Select New Status:                                  │ │
│ │                                                      │ │
│ │  ( ) PENDING   ( ) BOOKED    ( ) CANCELLED           │ │
│ │  ( ) USED      ( ) EXPIRED                           │ │
│ │                                                      │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │ [ Save Changes ] [ Cancel ]                          │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ < Back      Update Ticket Status                                                      │
│                                                                                       │
│ ┌──────────────────────────────────────────────────────┐                              │
│ │ 🎫 TKT-12345                         [ BOOKED ]      │                              │
│ └──────────────────────────────────────────────────────┘                              │
│                                                                                       │
│ Select New Status                                                                     │
│ Update the current lifecycle state of this ticket.                                    │
│                                                                                       │
│ ┌──────────────────────────┐  ┌──────────────────────────┐                            │
│ │ ( ) PENDING    [ PEND. ] │  │ (●) BOOKED      [ BOOK. ] │                            │
│ └──────────────────────────┘  └───────────────────────────┘                            │
│ ┌──────────────────────────┐  ┌──────────────────────────┐                            │
│ │ ( ) CANCELLED  [ CANC. ] │  │ ( ) USED        [ USED ]  │                            │
│ └──────────────────────────┘  └──────────────────────────┘                            │
│                                                                                       │
│ [ SAVE CHANGES ] [ CANCEL ]                                                           │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/tickets/:id/edit`
- Back button / Cancel -> `/tickets`
- Save Changes -> `/tickets` (on success)

## Future Enhancements
- Add status update notes/history.
- Implement permission checks (who can change status to 'USED').
- Batch status updates for multiple tickets.
