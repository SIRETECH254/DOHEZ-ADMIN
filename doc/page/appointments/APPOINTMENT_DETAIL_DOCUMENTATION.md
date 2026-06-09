# Appointment Detail Documentation

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
import { HiOutlineArrowLeft, HiOutlineClipboardCheck, HiOutlineScissors, HiOutlineUser } from 'react-icons/hi';
import { FiAlertTriangle, FiUser, FiClock, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import { MdStore, MdPerson } from 'react-icons/md';
import { 
  useGetAppointmentById, 
  useCheckInAppointment, 
  useCompleteAppointment, 
  useCancelAppointment, 
  useMarkNoShowAppointment 
} from '../../../tanstack/useAppointments';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IAppointment, IUser, IVendor, IBranch } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetAppointmentById`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetAppointmentById(id);`
- **Purpose:** Fetches full details of a specific appointment by its unique ID.

#### `useCheckInAppointment`
- **Hook usage:** `const checkIn = useCheckInAppointment();`
- **Purpose:** Mutation to mark the appointment as "Checked In".

#### `useCompleteAppointment`
- **Hook usage:** `const complete = useCompleteAppointment();`
- **Purpose:** Mutation to mark the appointment as "Completed".

#### `useCancelAppointment`
- **Hook usage:** `const cancel = useCancelAppointment();`
- **Purpose:** Mutation to mark the appointment as "Cancelled".

#### `useMarkNoShowAppointment`
- **Hook usage:** `const markNoShow = useMarkNoShowAppointment();`
- **Purpose:** Mutation to mark the appointment as "No Show".

### Local Component State
- The component primarily relies on URL parameters (`id`) and TanStack Query state. It does not maintain significant local UI state other than what is derived from the API response.

## Functions Involved

### `handleAction()`
**purpose:** Generic wrapper to execute appointment state mutations (check-in, complete, etc.) with error logging.

**process:**
1. Validates the existence of the appointment ID.
2. Executes the provided async action (mutation).
3. Catches and logs any errors to the console.

**function implementation:**
```tsx
  const handleAction = async (action: () => Promise<any>, actionName: string) => {
    if (!id) return;
    try {
      await action();
    } catch (err) {
      console.error(`Failed to ${actionName}:`, err);
    }
  };
```

## API Integration

### `GET /api/appointments/:id`

#### API
```typescript
export const appointmentAPI = {
  getAppointmentById: (appointmentId: string) => api.get(`/api/appointments/${appointmentId}`),
};
```

#### Hook
```typescript
export const useGetAppointmentById = (id: string) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const response = await appointmentAPI.getAppointmentById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};
```

#### Contract
`data.data` contains the full `IAppointment` object including nested `customer`, `vendor`, and `branch` details.

---

### `PUT /api/appointments/:id/check-in`

#### Hook
```typescript
export const useCheckInAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentAPI.checkIn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
```

*(Note: Similar mutation patterns apply for Complete, Cancel, and No-Show endpoints.)*

## UI Structure
- **Container:** Max-width centered container (`max-w-5xl`).
- **Header:** Contains a back button and the page title.
- **Actions Banner:** A prominent card at the top displaying status, booking time, and contextual action buttons (Check In, Complete, Reschedule, etc.).
- **Summary Grid:** Displays appointment number, scheduled time, status, and pricing breakdown (Booking Fee, Balance, Total).
- **Service Items List:** Maps through `appointment.items` to show individual service details, duration, price, and assigned staff.
- **Customer & Location Info:** Two-column grid showing detailed customer contact info and branch/vendor location data.

## Form Inputs
- The component does not contain form inputs, but rather contextual action buttons.

### `Action Buttons`
**Purpose**: Execute state transitions for the appointment.
**Applicable**: Buttons are conditionally rendered based on the current appointment status (`isPending`, `isConfirmed`, etc.).

**Implementation**:
```tsx
<button 
  onClick={() => handleAction(() => checkIn.mutateAsync(appointment._id), 'check-in')}
  disabled={checkIn.isPending}
  className="btn-primary"
>
  Check In
</button>
```

## Error Handling
- **Loading State:** Uses an `animate-pulse` skeleton loader for the entire layout.
- **Error Banner:** Displays a `FiAlertTriangle` and the API error message if fetching the appointment fails.
- **Mutation Feedback:** Mutations include `disabled` states while pending and console logging for failures.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ ← Back Link                                              │
├──────────────────────────────────────────────────────────┤
│ Actions Card (Status, Check-In/Complete/Cancel Buttons)   │
├──────────────────────────────────────────────────────────┤
│ Appointment Summary Card (ID, Time, Fees, Balance)       │
├──────────────────────────────────────────────────────────┤
│ Service Items Card (List of services, prices, staff)     │
├──────────────────────────────────────────────────────────┤
│ Customer Info Card (Left)  |  Location Info Card (Right) │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ← Appointment Details                                                                 │
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Status: [ CONFIRMED ]  Booked on Oct 27, 2023    [ Reschedule ] [ Check In ] [ ... ]│ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 📋 Appointment Summary                                                             │ │
│ │ Appt #: APT-123    Time: 10:00 AM      Balance: $30.00      Total: $50.00         │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│ ┌───────────────────────────────────┐  ┌───────────────────────────────────┐          │ │
│ │ 👤 Customer Details               │  │ 🏪 Branch & Vendor                │          │ │
│ │ John Doe                          │  │ Vendor Name                       │          │ │
│ │ john@example.com                  │  │ Main Branch                       │          │ │
│ └───────────────────────────────────┘  └───────────────────────────────────┘          │ │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/appointments/:id`
- Back button -> `/appointments`
- Reschedule button -> `/appointments/:id/reschedule`
- Confirm Payment button -> `/appointments/:id/confirm`
- Pay button -> `/appointments/:id/pay`

## Future Enhancements
- Add printable appointment summary (PDF).
- Integrate internal notes or timeline history for the appointment.
- Add "Edit Customer" quick-link from the detail view.
