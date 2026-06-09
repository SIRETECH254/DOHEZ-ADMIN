# Create Appointment Documentation

## Table of Contents
- [Overview](#overview)
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Form Inputs](#form-inputs)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)

## Overview
The `CreateAppointment` component facilitates the admin-driven booking process for appointments. It utilizes a multi-step form wizard to collect customer details, vendor/branch information, selected services, staff preferences, and finally, appointment date availability.

## Imports
```tsx
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineSearch,
  HiOutlineOfficeBuilding,
  HiOutlineScissors,
  HiOutlineCalendar,
  HiOutlineClipboardCheck,
  HiOutlineExclamation,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlinePencilAlt,
  HiOutlineMail,
  HiOutlinePhone
} from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useAdminCreateAppointment } from '../../../tanstack/useAppointments';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useGetBranches } from '../../../tanstack/useBranches';
import { useGetProducts } from '../../../tanstack/useProducts';
import { useGetStaff, useGetAllUsers } from '../../../tanstack/useUsers';
import { useGetAvailability } from '../../../tanstack/useAvailability';
import { formatCurrency } from '../../../utils';
import type { IVendor, IBranch, IService, IUser, IScheduleOption } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useAdminCreateAppointment`
- **Hook usage:** `const createAppointment = useAdminCreateAppointment();`
- **Purpose:** Mutation hook to submit the finalized appointment booking to the admin API.

#### `useGetAvailability`
- **Hook usage:** `const getAvailability = useGetAvailability();`
- **Purpose:** Fetches available time slots based on the selected date, branch, and services.

#### Data Fetching Hooks
- `useGetVendors`, `useGetBranches`, `useGetProducts`, `useGetStaff`, `useGetAllUsers`: Purpose is to fetch necessary entities for the multi-step form completion.

### Local Component State

#### `activeTab` & `currentStep`
- **Purpose:** Manages the wizard step state and progress tracking.
```tsx
const [activeTab, setActiveTab] = useState('customer');
const [currentStep, setCurrentStep] = useState(1);
```

#### `form`
- **Purpose:** Main object storing the collected data throughout the booking steps.
```tsx
const [form, setForm] = useState({
  customerId: '',
  vendorId: '',
  branchId: '',
  serviceIds: [] as string[],
  staffId: '',
  date: new Date().toISOString().split('T')[0],
});
```

#### `selectedCustomer`, `selectedVendor`, `selectedBranch`, `selectedServices`, `selectedSlot`
- **Purpose:** Stores the full objects of selected items for display in the summary and for API payload mapping.

#### `availabilityOptions`
- **Purpose:** Stores the list of available slots returned by `useGetAvailability`.
```tsx
const [availabilityOptions, setAvailabilityOptions] = useState<IScheduleOption[]>([]);
```

#### `inlineError`
- **Purpose:** Manages error messaging within the wizard steps.
```tsx
const [inlineError, setInlineError] = useState<string | null>(null);
```

## Functions Involved

### `fetchAvailability()`
**purpose:** Fetches available time slots for the chosen branch, services, and date.

**process:**
1. Validates form selections.
2. Calls `getAvailability.mutateAsync` with the required payload.
3. Updates `availabilityOptions` or sets `inlineError` if none found.

**function implementation:**
```tsx
  const fetchAvailability = useCallback(async () => {
    if (!form.branchId || !form.vendorId || form.serviceIds.length === 0 || !form.date) {
      setInlineError('Please select branch, services, and date.');
      return;
    }

    try {
      const payload = {
        date: form.date,
        branch: form.branchId,
        vendor: form.vendorId,
        items: form.serviceIds,
        preferredStaffs: form.staffId ? [form.staffId] : [],
      };
      const response = await getAvailability.mutateAsync(payload);
      const data = response?.scheduleOptions || [];
      setAvailabilityOptions(data);
      if (data && data.length > 0) {
        setInlineError(null);
      } else {
        setInlineError('No availability found for the selected criteria.');
      }
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to fetch availability');
    }
  }, [form, getAvailability]);
```

### `handleTabChange()`
**purpose:** Handle tab navigation, ensuring validation checks are passed before proceeding to the target step.

**process:**
1. Validates navigation to the target key.
2. Updates `activeTab` and `currentStep` states.

**function implementation:**
```tsx
  const handleTabChange = (key: string) => {
    if (validateTabNavigation(key)) {
      setActiveTab(key);
      const step = TABS.find(t => t.key === key)?.step || 1;
      setCurrentStep(step);
    }
  };
```

### `goToNextStep()`
**purpose:** Advance the wizard to the next step.

**process:**
1. Finds the current tab index.
2. Validates if the next step can be navigated to.
3. Updates `activeTab` and `currentStep`.

**function implementation:**
```tsx
  const goToNextStep = () => {
    const currentIndex = TABS.findIndex(t => t.key === activeTab);
    if (currentIndex < TABS.length - 1) {
      const nextTab = TABS[currentIndex + 1];

      if (validateTabNavigation(nextTab.key) || nextTab.key === 'staff' || nextTab.key === 'availability') {
        setActiveTab(nextTab.key);
        setCurrentStep(nextTab.step);
        setInlineError(null);
      } else {
        setInlineError('Please complete the current step to continue.');
      }
    }
  };
```

### `goToPrevStep()`
**purpose:** Go back to the previous step.

**process:**
1. Finds the current tab index.
2. Updates `activeTab` and `currentStep`.

**function implementation:**
```tsx
  const goToPrevStep = () => {
    const currentIndex = TABS.findIndex(t => t.key === activeTab);
    if (currentIndex > 0) {
      const prevTab = TABS[currentIndex - 1];
      setActiveTab(prevTab.key);
      setCurrentStep(prevTab.step);
      setInlineError(null);
    }
  };
```

### `handleSubmit()`
**purpose:** Submit the final appointment creation form to the API.

**process:**
1. Validates that the active tab is 'summary' and a slot is selected.
2. Maps the form and selected slot data into the expected API payload format.
3. Calls `createAppointment.mutateAsync`.
4. Navigates back to the appointment list on success.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'summary' || !selectedSlot) return;

    try {
      const payload = {
        customerId: form.customerId,
        vendor: form.vendorId,
        branch: form.branchId,
        items: selectedSlot.items.map(item => ({
          serviceId: item.serviceId,
          staffId: item.staffId,
          startTime: item.startTime,
          endTime: item.endTime,
          amount: item.amount,
          durationMinutes: item.durationMinutes
        })),
      };

      await createAppointment.mutateAsync(payload);
      navigate('/appointments');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to create appointment');
    }
  }, [form, selectedSlot, createAppointment, navigate, activeTab]);
```

## API Integration

### `POST /api/appointments/admin`

#### Interface
```typescript
export interface AdminCreateAppointmentPayload {
  customerId: string;
  branch: string;
  vendor: string;
  status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
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

#### API
```typescript
export const appointmentAPI = {
  // Create a new appointment by admin
  createAppointmentByAdmin: (appointmentData: AdminCreateAppointmentPayload) =>
    api.post('/api/appointments/admin', appointmentData),
};
```

#### Hook
```typescript
export const useAdminCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AdminCreateAppointmentPayload) => {
      const response = await appointmentAPI.createAppointmentByAdmin(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Appointment created (admin) successfully');
    },
    onError: (error: any) => console.error('Error creating appointment (admin):', error),
  });
};
```

#### Contract
`data.data` contains the created appointment object.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "650af1234567890abcdef123",
    "customer": "650af1234567890abcdef111",
    "vendor": "650af1234567890abcdef222",
    "branch": "650af1234567890abcdef333",
    "status": "CONFIRMED",
    "items": [
      {
        "service": "650af1234567890abcdef444",
        "staff": "650af1234567890abcdef555",
        "startTime": "2023-10-27T10:00:00Z",
        "endTime": "2023-10-27T11:00:00Z",
        "amount": 50,
        "durationMinutes": 60
      }
    ]
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `POST /api/availability`

#### Interface
```typescript
export interface GetAvailabilityPayload {
  date: string;
  branch: string;
  vendor: string;
  items: string[];
  preferredStaffs?: string[];
}
```

#### API
```typescript
export const availabilityAPI = {
  // Fetch available schedule options
  getAvailability: (payload: GetAvailabilityPayload) =>
    api.post('/api/availability', payload),
};
```

#### Hook
```typescript
export const useGetAvailability = () => {
  return useMutation({
    mutationFn: async (payload: GetAvailabilityPayload) => {
      const response = await availabilityAPI.getAvailability(payload);
      return response.data.data;
    },
    onError: (error: any) => {
      console.error('Get availability error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};
```

#### Contract
`data.data` contains `scheduleOptions`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "scheduleOptions": [
      {
        "overallStartTime": "2023-10-27T10:00:00Z",
        "overallEndTime": "2023-10-27T11:00:00Z",
        "totalDurationMinutes": 60,
        "totalAmount": 50,
        "items": [
          {
            "serviceId": "...",
            "serviceName": "...",
            "staffId": "...",
            "staffName": "...",
            "startTime": "...",
            "endTime": "...",
            "amount": 50,
            "durationMinutes": 60
          }
        ]
      }
    ]
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/vendors`

#### Interface
```typescript
export interface GetVendorsParams extends PaginationParams {
  search?: string;
  type?: string;
  category?: string;
  status?: string;
}
```

#### API
```typescript
export const vendorAPI = {
  // Get all vendors
  getVendors: (params?: GetVendorsParams) => api.get('/api/vendors', { params }),
};
```

#### Hook
```typescript
export const useGetVendors = (params?: GetVendorsParams) => {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: async () => {
      const response = await vendorAPI.getVendors(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ vendors, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "_id": "...",
        "name": "Barber Shop X",
        "email": "vendor@example.com"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalVendors": 1
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/branches`

#### Interface
```typescript
export interface GetBranchesParams extends PaginationParams {
  vendorId?: string;
  search?: string;
}
```

#### API
```typescript
export const branchAPI = {
  // Get all branches
  getBranches: (params?: GetBranchesParams) => api.get('/api/branches', { params }),
};
```

#### Hook
```typescript
export const useGetBranches = (params?: GetBranchesParams) => {
  return useQuery({
    queryKey: ['branches', params],
    queryFn: async () => {
      const response = await branchAPI.getBranches(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ branches, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "branches": [
      {
        "_id": "...",
        "name": "Main Branch",
        "vendor": "..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalBranches": 1
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/products`

#### Interface
```typescript
export interface GetProductsParams extends PaginationParams {
  search?: string;
  vendor?: string;
  branch?: string;
  category?: string;
  type?: string;
}
```

#### API
```typescript
export const productAPI = {
  // Get all products
  getProducts: (params?: GetProductsParams) => api.get('/api/products', { params }),
};
```

#### Hook
```typescript
export const useGetProducts = (params?: GetProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await productAPI.getProducts(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ products, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "...",
        "name": "Haircut",
        "basePrice": 20
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalProducts": 1
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/users` (Admin: Search Customers)

#### Interface
```typescript
export interface GetUsersParams extends PaginationParams {
  search?: string;
  role?: string;
  status?: 'active' | 'inactive';
}
```

#### API
```typescript
export const userAPI = {
  // Get all users (admin)
  getAllUsers: (params?: GetUsersParams) => api.get('/api/users', { params }),
};
```

#### Hook
```typescript
export const useGetAllUsers = (params?: GetUsersParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await userAPI.getAllUsers(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ users, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "...",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalUsers": 1
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/users/staff` (Staff Selection)

#### API
```typescript
export const userAPI = {
  // Get staff (any authenticated user)
  getStaff: () => api.get('/api/users/staff'),
};
```

#### Hook
```typescript
export const useGetStaff = () => {
  return useQuery({
    queryKey: ['users', 'staff'],
    queryFn: async () => {
      const response = await userAPI.getStaff();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ users }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "...",
        "firstName": "Staff",
        "lastName": "Member",
        "roles": [...]
      }
    ]
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.


## UI Structure
- **Wizard Header:** Progress bar and tab switcher (Customer -> Location -> Services -> Staff -> Availability -> Summary).
- **Tab Content:** Rendered dynamically based on `activeTab`.
- **Form Actions:** Previous/Next/Submit buttons with state-based disabling.

## Form Inputs

### `Customer Search Input`
**Purpose**: Collects a search query to filter the list of available customers by name, email, or phone.
**Applicable**: Uses `HiOutlineSearch` icon for visual context.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={customerSearch} 
  onChange={(e) => setCustomerSearch(e.target.value)} 
  className="input pr-10" 
  placeholder="Search by name, email or phone..." 
/>
```

### `Vendor Search Input`
**Purpose**: Filters the list of vendors based on name or other identifiers.
**Applicable**: Uses `HiOutlineSearch` icon for visual context.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={vendorSearch} 
  onChange={(e) => setVendorSearch(e.target.value)} 
  className="input pr-10" 
  placeholder="Search vendors..." 
/>
```

### `Service Search Input`
**Purpose**: Filters the list of available services (products) for the selected vendor and branch.
**Applicable**: Uses `HiOutlineSearch` icon for visual context.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={serviceSearch} 
  onChange={(e) => setServiceSearch(e.target.value)} 
  className="input pr-10" 
  placeholder="Search products..." 
/>
```

### `Appointment Date Selector`
**Purpose**: Allows the admin to select the specific date for the appointment to check availability.
**Applicable**: Standard HTML5 date input styled for a clean, integrated appearance.

**Input implementation**:
```tsx
<input 
  type="date" 
  value={form.date} 
  onChange={(e) => setForm({ ...form, date: e.target.value })}
  className="bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-gray-900" 
/>
```

### `Entity Selection Button (Generic)`
**Purpose**: Used across various steps (Customer, Vendor, Branch, Staff) to select a single entity.
**Applicable**: Uses conditional class mapping for active/selected states.

**Input implementation**:
```tsx
<button
  type="button"
  onClick={() => {
    setForm({ ...form, [entityId]: selectedId });
    setSelectedEntity(entityObject);
  }}
  className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
    form[entityId] === selectedId ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
  }`}
>
  {/* Entity Icon and Details */}
</button>
```

### `Service Multi-Selection Button`
**Purpose**: Allows selecting multiple services for a single appointment booking.
**Applicable**: Toggles ID existence in the `serviceIds` array.

**Input implementation**:
```tsx
<button
  type="button"
  onClick={() => {
    const newIds = isSelected 
      ? form.serviceIds.filter(id => id !== p._id)
      : [...form.serviceIds, p._id];
    setForm({ ...form, serviceIds: newIds });
    
    const newSelected = isSelected
      ? selectedServices.filter(item => item._id !== p._id)
      : [...selectedServices, p];
    setSelectedServices(newSelected);
  }}
  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 text-left ${
    isSelected ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
  }`}
>
  {/* Service Details */}
  {isSelected && <HiCheck className="text-brand-primary w-5 h-5" />}
</button>
```

### `Availability Slot Selection Button`
**Purpose**: Final selection step to choose a specific time slot and staff combination.
**Applicable**: Displays a full summary of the slot including individual item breakdowns and total price.

**Input implementation**:
```tsx
<button
  type="button"
  onClick={() => setSelectedSlot(slot)}
  className={`p-4 rounded-2xl border transition-all flex flex-col items-start text-left w-full ${
    selectedSlot === slot ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
  }`}
>
  {/* Slot Time, Items, and Total Amount */}
</button>
```


## Error Handling
- The component uses a centralized `inlineError` state to display validation and API error messages at the top of the form area.
- API error messages are dynamically retrieved from `err?.response?.data?.message` during both availability fetching and the final booking submission.
- Validation errors (e.g., attempting to skip steps without required selections) are caught before navigation and displayed via the same `inlineError` banner.
- Individual data-fetching hooks (Customers, Vendors, Branches, Products, Staff) include localized error states within their respective tabs, showing a `FiAlertTriangle` and a "Failed to load" message if an error occurs.
- TanStack Query mutation hooks (Create Appointment, Get Availability) include `onError` logging to the console for debugging and monitoring background failures.
- Form inputs and wizard progress are maintained in local state, ensuring that user progress isn't lost if a specific step encounter a network error.


## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Back Navigation Link                                     │
├──────────────────────────────────────────────────────────┤
│ Header (Title, Step Indicator Text)                      │
├──────────────────────────────────────────────────────────┤
│ Wizard Header (Step Icons, Progress Bar)                 │
├──────────────────────────────────────────────────────────┤
│ Dynamic Content Area (Step-specific Inputs/Search)       │
├──────────────────────────────────────────────────────────┤
│ Footer Actions (Previous/Cancel, Next/Submit)            │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Appointments                                                                │
│                                                                                       │
│ Book New Appointment                                               Step 1 of 6        │
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │  ➊ CUSTOMER   ②   ③   ④   ⑤   ⑥                                                 │ │
│ │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━────────────────────────────────────────────────  │ │
│ │                                                                                   │ │
│ │  Search Customer *                                                                │ │
│ │  [ 🔍 Search by name, email or phone...             ]                             │ │
│ │                                                                                   │ │
│ │  ┌─────────────────────────────┐  ┌─────────────────────────────┐                 │ │
│ │  │ 👤 John Doe                 │  │ 👤 Jane Smith               │                 │ │
│ │  │ john@example.com            │  │ jane@example.com            │                 │ │
│ │  └─────────────────────────────┘  └─────────────────────────────┘                 │ │
│ │                                                                                   │ │
│ │  ┌─────────────────────────────┐  ┌─────────────────────────────┐                 │ │
│ │  │ 👤 Bob Wilson               │  │ 👤 Alice Brown              │                 │ │
│ │  │ bob@example.com             │  │ alice@example.com           │                 │ │
│ │  └─────────────────────────────┘  └─────────────────────────────┘                 │ │
│ │                                                                                   │ │
│ ├───────────────────────────────────────────────────────────────────────────────────┤ │
│ │  [ Cancel ]                                                        [ Continue ]   │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/appointments/new`
- On success: Navigate to `/appointments`
- Cancel: Navigate back to `/appointments`
