# Ticket Detail Documentation

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
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdConfirmationNumber, MdEvent, MdEmail, MdPhone, MdPerson, MdQrCode, MdFileDownload } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetTicket } from '../../../tanstack/useTickets';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { ITicket } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetTicket`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetTicket(id!);`
- **Purpose:** Fetches the specific details of a ticket by its ID.

### Local Component State
- **Purpose:** This component primarily relies on URL parameters (`id`) and fetched data, maintaining minimal local state outside of standard hooks.

## Functions Involved

### `TicketDetailSkeleton()`
**purpose:** Display a placeholder UI while data is being fetched.

### `handleBackClick()`
**purpose:** Navigate back to the tickets list. Implemented via `navigate('/tickets')`.

### `handleUpdateStatusClick()`
**purpose:** Navigate to the ticket status update page. Implemented via `navigate('/tickets/${ticket._id}/edit')`.

## API Integration

### `GET /api/tickets/:ticketId`

#### API
```typescript
export const ticketAPI = {
  // Get ticket details
  getTicket: (id: string) => api.get(`/api/tickets/${id}`),
};
```

#### Hook
```typescript
export const useGetTicket = (id: string) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const response = await ticketAPI.getTicket(id);
      return response.data.data;
    },
  });
};
```

#### Contract
`data.data` contains the `ticket` object.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "ticket": {
      "_id": "...",
      "ticketNumber": "TKT-12345",
      "status": "BOOKED",
      "details": { "name": "John Doe", "email": "john@doe.com", "phone": "..." },
      "event": { "name": "Summer Concert" },
      "qrCodeData": "data:image/png;base64,...",
      "pdfUrl": "https://..."
    }
  }
}
```

## UI Structure
- **Container:** Standard padding container.
- **Header:** Contains back button, "Ticket Details" title, and "Update Status" primary button.
- **Grid Layout (3 Columns):**
    - **Main Info (2 Cols):** Displays ticket number card, Customer Information, and Event Details.
    - **Sidebar (1 Col):** Displays QR Code card and Download links.
- **Components:** `StatusBadge` for lifecycle state, custom Skeleton during load.

## Form Inputs
- **Not Applicable:** This is a read-only detail view. Interaction is limited to navigation and downloads.

## Error Handling
- Displays a `TicketDetailSkeleton` during the loading phase.
- Shows a full-page error state with `FiAlertTriangle` if the fetch fails, including the API's error message and a "Back to Tickets" retry button.
- Handles the "Ticket not found" case gracefully with a centered message.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [ < Back ] Ticket Details               [ Update Status ]│
├──────────────────────────────────────────────────────────┤
│ ┌───────────────────────┐  ┌───────────────────────────┐ │
│ │  [ Ticket # Card ]    │  │  [ QR Code Card ]         │ │
│ │                       │  │                           │ │
│ ├───────────────────────┤  ├───────────────────────────┤ │
│ │ [ Customer Info ]     │  │  [ Downloads Card ]       │ │
│ ├───────────────────────┤  └───────────────────────────┘ │
│ │ [ Event Details ]     │                                │
│ └───────────────────────┘                                │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ < Back      Ticket Details                                           [ Update Status ]│
│                                                                                       │
│ ┌──────────────────────────────────────────────┐    ┌───────────────────────────┐     │
│ │ 🎫 TKT-12345                 [ BOOKED ]      │    │  [ QR CODE IMAGE ]        │     │
│ └──────────────────────────────────────────────┘    └───────────────────────────┘     │
│                                                                                       │
│ ┌──────────────────────────────────────────────┐    ┌───────────────────────────┐     │
│ │ Customer Information                         │    │  [ ⬇ Download PDF ]       │     │
│ │ Name: John Doe                               │    └───────────────────────────┘     │
│ │ Email: john@doe.com                          │                                      │
│ └──────────────────────────────────────────────┘                                      │
│                                                                                       │
│ ┌──────────────────────────────────────────────┐                                      │
│ │ Event Details                                │                                      │
│ │ Name: Summer Jazz                            │                                      │
│ │ Type: VIP                                    │                                      │
│ └──────────────────────────────────────────────┘                                      │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/tickets/:id`
- Back button -> `/tickets`
- Update Status button -> `/tickets/:id/edit`

## Future Enhancements
- Integrate scanning history/logs.
- Add "Resend Ticket Email" button.
- Map integration for event venue.
