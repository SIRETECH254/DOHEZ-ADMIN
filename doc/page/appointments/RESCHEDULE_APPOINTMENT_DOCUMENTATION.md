# Reschedule Appointment Documentation

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
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { 
  HiOutlineCalendar,
  HiOutlineExclamation,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineScissors
} from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { 
  useGetAppointmentById, 
  useRescheduleAppointment 
} from '../../../tanstack/useAppointments';
import { useGetAvailability } from '../../../tanstack/useAvailability';
import { formatCurrency } from '../../../utils';
import type { IAppointment, IScheduleOption, IUser, IVendor, IBranch } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetAppointmentById`
- **Hook usage:** `const { data: appointmentData, isLoading: isLoadingAppointment, isError: isErrorAppointment } = useGetAppointmentById(id);`
- **Purpose:** Fetches current appointment details to preserve service information during rescheduling.

#### `useRescheduleAppointment`
- **Hook usage:** `const rescheduleAppointment = useRescheduleAppointment();`
- **Purpose:** Mutation hook to update the appointment with a new time slot.

#### `useGetAvailability`
- **Hook usage:** `const getAvailability = useGetAvailability();`
- **Purpose:** Fetches available slots for the same vendor/branch/services on a different date.

### Local Component State

#### `date`
- **Purpose:** Stores the target date for rescheduling. Defaults to the current appointment date or today.
```tsx
const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
```

#### `selectedSlot`
- **Purpose:** Stores the user-selected `IScheduleOption` from the availability results.
```tsx
const [selectedSlot, setSelectedSlot] = useState<IScheduleOption | null>(null);
```

#### `availabilityOptions`
- **Purpose:** Stores the list of available slots returned by the API.
```tsx
const [availabilityOptions, setAvailabilityOptions] = useState<IScheduleOption[]>([]);
```

#### `inlineError`
- **Purpose:** Manages error messages displayed within the form.

## Functions Involved

### `fetchAvailability()`
**purpose:** Queries the API for available time slots on the selected date.

**process:**
1. Maps existing appointment items to service IDs.
2. Constructs the `GetAvailabilityPayload`.
3. Calls `getAvailability.mutateAsync`.
4. Updates `availabilityOptions` and clears the previous selection.

**function implementation:**
```tsx
  const fetchAvailability = useCallback(async () => {
    if (!appointment || !date) return;
    try {
      const serviceIds = appointment.items.map((item: any) => 
        typeof item.service === 'object' ? item.service._id : item.service
      );
      const payload = {
        date,
        branch: typeof appointment.branch === 'object' ? (appointment.branch as any)._id : appointment.branch,
        vendor: typeof appointment.vendor === 'object' ? (appointment.vendor as any)._id : appointment.vendor,
        items: serviceIds,
      };
      const response = await getAvailability.mutateAsync(payload);
      const data = response?.scheduleOptions || [];
      setAvailabilityOptions(data);
      setSelectedSlot(null);
      // ... error handling
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to fetch availability');
    }
  }, [appointment, date, getAvailability]);
```

### `handleSubmit()`
**purpose:** Submits the rescheduled slot to the backend.

**process:**
1. Maps the `selectedSlot` items into the required payload format.
2. Calls `rescheduleAppointment.mutateAsync`.
3. Navigates back to the appointment detail view on success.

**function implementation:**
```tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedSlot) return;
    try {
      const payload = {
        items: selectedSlot.items.map(item => ({
          serviceId: item.serviceId,
          staffId: item.staffId,
          startTime: item.startTime,
          endTime: item.endTime,
          amount: item.amount,
          durationMinutes: item.durationMinutes
        })),
      };
      await rescheduleAppointment.mutateAsync({ id, data: payload });
      navigate(`/appointments/${id}`);
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to reschedule appointment');
    }
  };
```

## API Integration

### `PUT /api/appointments/:id/reschedule`

#### Interface
```typescript
export interface RescheduleAppointmentPayload {
  items: {
    serviceId: string;
    staffId: string;
    startTime: string;
    endTime: string;
    amount: number;
    durationMinutes: number;
  }[];
}
```

#### Hook
```typescript
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RescheduleAppointmentPayload }) => {
      const response = await appointmentAPI.rescheduleAppointment(id, data);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
```

## UI Structure
- **Back Navigation:** Link to return to appointment details.
- **Header:** Page title and description including the appointment number.
- **Context Summary:** A card displaying current customer and service information to provide reference during rescheduling.
- **Availability Section:**
    - **Date Picker:** To select the new target date.
    - **Find Slots Button:** To trigger the availability query.
    - **Slots Grid:** Scrollable area listing available time combinations.
- **Form Actions:** Cancel and Reschedule submission buttons.

## Form Inputs

### `Date Picker`
**Purpose**: Selects the target date for checking availability.

**Input implementation**:
```tsx
<input 
  type="date" 
  value={date} 
  onChange={(e) => setDate(e.target.value)}
  className="bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-gray-900 w-full" 
/>
```

### `Slot Selection Button`
**Purpose**: Selects a specific time slot from the availability list.

**Input implementation**:
```tsx
<button
  type="button"
  onClick={() => setSelectedSlot(slot)}
  className={`p-4 rounded-2xl border transition-all ... ${
    isSelected ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-100'
  }`}
>
  {/* Slot Time and Item Breakdowns */}
</button>
```

## Error Handling
- Uses `FiAlertTriangle` for fatal fetch errors.
- Uses `HiOutlineExclamation` within an `inlineError` banner for validation/API mutation errors.
- Disables the "Reschedule" button until a slot is selected or if a mutation is pending.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ ← Back Link                                              │
├──────────────────────────────────────────────────────────┤
│ Page Header (Title, Subtitle)                            │
├──────────────────────────────────────────────────────────┤
│ Context Summary Card (Customer, Services, Location)      │
├──────────────────────────────────────────────────────────┤
│ Availability Form (Date Input, Find Slots Button)        │
├──────────────────────────────────────────────────────────┤
│ Slots Selection Area (Scrollable List of Options)        │
├──────────────────────────────────────────────────────────┤
│ Form Actions (Cancel, Reschedule Appointment)            │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Details                                                                     │
│                                                                                       │
│ Reschedule Appointment                                                                │
│ Update the time slot for Appointment #APT-123                                         │
│                                                                                       │
│ ┌──────────────────────────┐                                                          │
│ │ Current Details          │                                                          │
│ │ 👤 John Doe              │                                                          │
│ │ ✂️ Haircut               │                                                          │
│ └──────────────────────────┘                                                          │
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Select New Date                                                                   │ │
│ │ [ 📅 2023-10-28            ] [ Find Slots ]                                       │ │
│ │                                                                                   │ │
│ │ Available Time Slots                                                              │ │
│ │ ┌───────────────────────────────────────────────────────────┐                     │ │
│ │ │ 📅 10:00 AM - 11:00 AM                                    │                     │ │
│ │ │ Service: Haircut  Staff: Any Available                    │                     │ │
│ │ └───────────────────────────────────────────────────────────┘                     │ │
│ │                                                                                   │ │
│ ├───────────────────────────────────────────────────────────────────────────────────┤ │
│ │ [ Cancel ]                                         [ Reschedule Appointment ]     │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/appointments/:id/reschedule`
- On success: Navigate to `/appointments/:id`
- Cancel: Navigate back to `/appointments/:id`

## Future Enhancements
- Add "Filter by Staff" option during rescheduling.
- Allow adding/removing services during the rescheduling process.
