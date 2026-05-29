# Edit User Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Inputs](#form-inputs)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useGetUserById, useUpdateUser } from '../../../tanstack/useUsers';
import { useGetProducts } from '../../../tanstack/useProducts';
import { getInitials } from '../../../utils';
import type { IUser, IRole, IProduct } from '../../../types/api.types';
import StatusBadge from '../../../components/ui/StatusBadge';
```

## Context and State Management

### TanStack Query

#### `useGetUserById`
- **Hook usage:** `const { data, isLoading } = useGetUserById(userId!);`
- **Purpose:** Fetches the specific user's detailed information for editing.

#### `useGetProducts`
- **Hook usage:** `const { data: productData } = useGetProducts(params);`
- **Purpose:** Fetches available products (services) for staff users, filtered by the user's vendor and branch.

#### `useUpdateUser`
- **Hook usage:** `const updateUser = useUpdateUser();`
- **Purpose:** Mutation hook to send updated user data to the API.

### Form State

#### `form`
- **Form state:** An object containing all editable fields for the user.
```tsx
const [form, setForm] = useState({ 
  firstName: '', 
  lastName: '', 
  phone: '', 
  isActive: true,
  workingHours: { ... },
  services: [] as string[]
});
```

#### `firstName` & `lastName`
- **Purpose:** Manages the user's name fields within the `form` object.

#### `phone`
- **Purpose:** Manages the user's contact information within the `form` object.

#### `isActive`
- **Purpose:** Boolean flag for enabling or disabling the user account within the `form` object.

#### `workingHours`
- **Purpose:** Nested object for staff availability times (Monday to Sunday) within the `form` object.

#### `services`
- **Purpose:** Array of service (product) IDs assigned to staff users within the `form` object.

## Functions Involved

### `handleSubmit()`
**purpose:** Orchestrates the user update process, preparing the payload based on user role and triggering the mutation.

**process:**
1. Prevents default form submission.
2. Identifies if the user is a 'staff' member.
3. Prepares a `payload` from the current `form` state.
4. If not staff, removes `workingHours` and `services` from the payload.
5. Calls `updateUser.mutate()` with the `userId` and `payload`.
6. Navigates to `/users` on successful update.

**function implementation:**
```tsx
const handleSubmit = useCallback(async (e: React.FormEvent) => {
  e.preventDefault();
  
  const isStaffUser = user && (user.roles as IRole[]).some((r: IRole) => r.name === 'staff');
  const payload: any = { ...form };
  
  if (!isStaffUser) {
    delete payload.workingHours;
    delete payload.services;
  }

  updateUser.mutate({ userId: userId!, data: payload }, {
    onSuccess: () => navigate('/users')
  });
}, [form, userId, updateUser, navigate, user]);
```

### `handleServiceToggle()`
**purpose:** Manages the selection of services for staff users.

**process:**
1. Receives the `serviceId` from a clicked checkbox.
2. Checks if the ID is already in the `form.services` array.
3. If present, removes it; if absent, adds it.
4. Updates the `form` state with the new services array.

**function implementation:**
```tsx
const handleServiceToggle = (serviceId: string) => {
  setForm(prev => {
    const services = prev.services.includes(serviceId)
      ? prev.services.filter(id => id !== serviceId)
      : [...prev.services, serviceId];
    return { ...prev, services };
  });
};
```

## API Integration

### `GET /api/users/:userId`

#### Interface
```tsx
export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[] | IRole[];
  phone: string;
  isActive: boolean;
  vendor?: string | IVendor;
  branch?: string | IBranch;
  workingHours?: WorkingHours;
  services?: string[] | IProduct[];
}
```

#### API
```typescript
export const userAPI = {
  // Get user by ID (admin)
  getUserById: (userId: string) => api.get(`/api/users/${userId}`),
}
```

#### Hook
```tsx
export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await userAPI.getUserById(userId);
      return response.data.data;
    },
    enabled: !!userId,
  });
};
```

#### Contract
`data.data` contains `{ user }`.

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "650af1234567890abcdef123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "roles": [{"_id": "...", "name": "staff", "displayName": "Staff"}],
      "isActive": true,
      "vendor": { "_id": "...", "name": "Vendor Name" },
      "branch": { "_id": "...", "name": "Branch Name" },
      "workingHours": { ... },
      "services": ["service_id_1"]
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

---

### `PUT /api/users/:userId`

#### Interface
```tsx
export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
  workingHours?: WorkingHours;
  services?: string[];
}
```

#### Payload
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+254700000000",
  "isActive": true,
  "workingHours": {
    "monday": { "start": "08:00", "end": "17:00" }
  },
  "services": ["650af..."]
}
```

#### API
```typescript
export const userAPI = {
  // Update user (admin)
  updateUser: (userId: string, userData: UpdateUserPayload | FormData) =>
    userData instanceof FormData
      ? api.put(`/api/users/${userId}`, userData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/users/${userId}`, userData),
}
```

#### Hook
```tsx
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserPayload | FormData }) => {
      const response = await userAPI.updateUser(userId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
};
```

#### Contract
`data.data` contains the updated `user` object.

#### Response
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "650af123...",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true
  }
}
```

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

---

### `GET /api/products`

#### Interface
```tsx
export interface GetProductsParams extends PaginationParams {
  search?: string;
  category?: string;
  vendor?: string;
  branch?: string;
  service?: string;
  status?: boolean | string;
}
```

#### API
```typescript
export const productAPI = {
  // Get all products
  getProducts: (params?: GetProductsParams) => api.get('/api/products', { params }),
}
```

#### Hook
```tsx
export const useGetProducts = (params?: GetProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await productAPI.getProducts(params);
      return response.data.data;
    },
  });
};
```

#### Contract
`data.data` contains `{ products, pagination }`.

#### Response
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "650af...",
        "name": "Hair Cut",
        "price": 500
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
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## UI Structure
- **Screen shell:** Open layout with a centered form card.
- **Header:** Title ("Edit User") with a "Back to Users" navigation button.
- **Identity Summary:** Visual section showing avatar (or initials), Name, Roles, Status, and associated Vendor/Branch.
- **Form Groups:** Grid-based layout for personal info, separate sections for Account Status, Working Hours, and Services.
- **Feedback:** Loading states on the submit button.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Users                                          │
│ Edit User (Title)                                        │
├──────────────────────────────────────────────────────────┤
│ identity card                                            │
│ [ Avatar ]  [ Name ]                       [ Roles ]     │
│             [ Vendor/Branch ]              [ Status ]    │
├──────────────────────────────────────────────────────────┤
│ form                                                     │
│ [ First Name ] [ Last Name ]                             │
│ [ Email (Read Only) ]                                    │
│ [ Phone ]                                                │
│ [ Account Status Toggle ]                                │
├──────────────────────────────────────────────────────────┤
│ working hours (Staff Only)                               │
│ [ Monday: Start - End ]                                  │
│ ...                                                      │
├──────────────────────────────────────────────────────────┤
│ services (Staff Only)                                    │
│ [ ] Service A   [ ] Service B                            │
├──────────────────────────────────────────────────────────┤
│ [ Save Changes (Gold) ]                                  │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Users                                                                       │
│ Edit User                                                                             │
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 👤 John Doe                                    Roles: [Admin] [Staff]             │ │
│ │ Vendor: Gold Star Services                     Status: [ACTIVE]                   │ │
│ │ Branch: Nairobi CBD                                                               │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│ First Name                 Last Name                                                  │
│ [ John                 ]   [ Doe                  ]                                   │
│                                                                                       │
│ Email (Read Only)                                                                     │
│ [ john.doe@example.com                               ]                                │
│                                                                                       │
│ Phone                                                                                 │
│ [ +254 700 000 000                                   ]                                │
│                                                                                       │
│ Account Status                                                                        │
│ (●) Active                                                                            │
│                                                                                       │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ Working Hours                                                                         │
│ Monday      [ 08:00 AM ] - [ 05:00 PM ]                                               │
│ Tuesday     [ 08:00 AM ] - [ 05:00 PM ]                                               │
│ ...                                                                                   │
│                                                                                       │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ Services                                                                              │
│ [X] Hair Cut                [ ] Massage                                               │
│ [X] Beard Trim              [ ] Facial                                                │
│                                                                                       │
│ [   Save Changes   ]                                                                  │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Form Inputs

### `First Name Field`
**Purpose**: Collects the user's first name.
**Applicable**: Standard text input styled with `input` class.
**Input implementation**:
```tsx
<input 
  name="firstName" 
  value={form.firstName} 
  onChange={(e) => setForm({...form, firstName: e.target.value})} 
  className="input" 
  placeholder="First Name" 
/>
```

### `Last Name Field`
**Purpose**: Collects the user's last name.
**Applicable**: Standard text input styled with `input` class.
**Input implementation**:
```tsx
<input 
  name="lastName" 
  value={form.lastName} 
  onChange={(e) => setForm({...form, lastName: e.target.value})} 
  className="input" 
  placeholder="Last Name" 
/>
```

### `Email Field (Read Only)`
**Purpose**: Displays the user's email address for identification.
**Applicable**: Uses `input-disabled` class and `readOnly` attribute to prevent modification.
**Input implementation**:
```tsx
<input 
  name="email" 
  value={user.email} 
  className="input-disabled" 
  readOnly 
/>
```

### `Phone Field`
**Purpose**: Collects the user's contact phone number.
**Applicable**: Standard text input styled with `input` class.
**Input implementation**:
```tsx
<input 
  name="phone" 
  value={form.phone} 
  onChange={(e) => setForm({...form, phone: e.target.value})} 
  className="input" 
  placeholder="Phone" 
/>
```

### `Account Status Toggle`
**Purpose**: Toggles the user's account between active and inactive states.
**Applicable**: Custom toggle switch using a hidden checkbox and Tailwind's `peer` utilities for visual states.
**Input implementation**:
```tsx
<label className="relative inline-flex items-center cursor-pointer">
  <input 
    type="checkbox" 
    checked={form.isActive} 
    onChange={(e) => setForm({...form, isActive: e.target.checked})} 
    className="sr-only peer"
  />
  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
  <span className="ml-3 text-sm text-gray-700 font-medium">
    {form.isActive ? 'Active' : 'Inactive'}
  </span>
</label>
```

### `Working Hours Inputs`
**Purpose**: Sets the daily start and end times for staff users.
**Applicable**: Time inputs rendered conditionally for users with the 'staff' role.
**Input implementation**:
```tsx
<input 
  type="time" 
  value={hours.start}
  onChange={(e) => setForm({
    ...form, 
    workingHours: { ...form.workingHours, [day]: { ...hours, start: e.target.value } }
  })}
  className="input" 
/>
```

### `Service Checkboxes`
**Purpose**: Assigns specific services (products) to a staff member.
**Applicable**: Checkbox list rendered conditionally for staff members, based on available branch products.
**Input implementation**:
```tsx
<input 
  type="checkbox"
  checked={form.services.includes(product._id)}
  onChange={() => handleServiceToggle(product._id)}
  className="auth-checkbox"
/>
```

### `Submit Button`
**Purpose**: Triggers the `handleSubmit` function to save user changes.
**Applicable**: Disables and shows "Saving..." during the mutation process to provide feedback and prevent duplicate submissions.
**Input implementation**:
```tsx
<button type="submit" className="btn-primary" disabled={updateUser.isPending}>
  {updateUser.isPending ? 'Saving...' : 'Save Changes'}
</button>
```

## Error Handling
- The component displays a "User not found" message if the fetch fails or returns empty.
- Loading states are handled via an `isLoading` check at the top of the component.
- The "Save Changes" button is disabled and shows "Saving..." during mutation to prevent duplicate submissions.
- API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## Navigation Flow
- Route: `/users/:userId/edit`.
- Link from Users List "Edit" action button.
- Successful Update ➞ `/users`.
- Back button ➞ `/users`.

## Future Enhancements
- Implement a more robust multi-select component for services.
- Add form validation using a library like `Zod` or `Yup`.
- Include specific validation for working hours (ensure start < end).
- Add success/error toast notifications upon form submission.
