# TanStack Query Documentation

## Overview

This document provides comprehensive documentation for TanStack Query (React Query) implementation in the Appointment Admin application. TanStack Query is used for server state management, providing data fetching, caching, synchronization, and updating capabilities.

**Location:** All TanStack Query hooks are located in the `src/tanstack/` folder.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Setup and Configuration](#setup-and-configuration)
3. [QueryClient Configuration](#queryclient-configuration)
4. [Custom Hooks Pattern](#custom-hooks-pattern)
5. [Query Hooks (useQuery)](#query-hooks-usequery)
6. [Mutation Hooks (useMutation)](#mutation-hooks-usemutation)
7. [Cache Invalidation Strategies](#cache-invalidation-strategies)
8. [Error Handling Patterns](#error-handling-patterns)
9. [Best Practices](#best-practices)
10. [Usage Examples](#usage-examples)
11. [Integration with Existing Code](#integration-with-existing-code)
12. [Troubleshooting](#troubleshooting)
13. [Notes](#notes)

---

## Introduction

TanStack Query (formerly React Query) is a powerful data synchronization library for React applications. It provides:

- **Automatic Caching**: Data is cached automatically with configurable stale times
- **Background Refetching**: Keeps data fresh automatically
- **Request Deduplication**: Prevents duplicate requests
- **Optimistic Updates**: Update UI before server confirms
- **Error Handling**: Built-in error states and retry logic
- **Loading States**: Built-in loading and fetching states

### Why TanStack Query?

- Reduces boilerplate code for data fetching
- Provides excellent developer experience
- Handles complex caching scenarios automatically
- Works seamlessly with existing API layer (axios)
- Integrates well with Redux for client state

---

## Setup and Configuration

### Installation

```bash
npm install @tanstack/react-query
```

### Provider Setup

The QueryClientProvider is set up in `src/main.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Wrap your app
<QueryClientProvider client={queryClient}>
  {/* Your app */}
</QueryClientProvider>
```

---

## QueryClient Configuration

### Default Options

The QueryClient is configured with the following default options:

- **staleTime**: `5 * 60 * 1000` (5 minutes)
  - Data is considered fresh for 5 minutes
  - No refetch occurs during this time

- **gcTime**: `10 * 60 * 1000` (10 minutes, formerly cacheTime)
  - Unused data is garbage collected after 10 minutes
  - Data remains in cache for this duration even if not used

- **retry**: `1`
  - Failed requests are retried once
  - Reduces unnecessary network calls

- **refetchOnWindowFocus**: `false`
  - Prevents automatic refetch when window regains focus
  - Better for admin dashboard workflows

### Mutation Default Options

- **retry**: `1`
  - Failed mutations are retried once

---

## Custom Hooks Pattern

### Folder Structure

All TanStack Query hooks are organized in the `src/tanstack/` folder:

```
src/
└── tanstack/
    ├── index.ts
    ├── useUsers.ts
    ├── useRoles.ts
    ├── useServices.ts
    ├── useAppointments.ts
    ├── useBreaks.ts
    ├── useAvailability.ts
    ├── usePayments.ts
    ├── useNotifications.ts
    ├── useContact.ts
    ├── useDashboard.ts
    ├── useStoreConfig.ts
    ├── useNewsletters.ts
    └── useReviews.ts
```

### Hook Naming Convention

- **Query Hooks**: `useGet[Resource]` or `useGet[Resource]ById`
  - Example: `useGetUsers`, `useGetUserById`

- **Mutation Hooks**: `use[Action][Resource]`
  - Example: `useCreateService`, `useUpdateRole`, `useDeleteAppointment`

---

## Query Hooks (useQuery)

Query hooks are used for GET operations (fetching data).

### Basic Structure

```typescript
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../api';

export const useGetUsers = (params = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await userAPI.getAllUsers(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};
```

### Query Hook Options

- **queryKey**: Array that uniquely identifies the query
  - Format: `['resource', params/id]`
  - Used for cache management and invalidation

- **queryFn**: Async function that fetches data
  - Must return a Promise
  - Typically calls API and returns `response.data`

- **enabled**: Boolean to conditionally enable/disable query
  - Useful when query depends on other data
  - Example: `enabled: !!userId`

- **staleTime**: Time in milliseconds before data is considered stale
  - Default: 5 minutes (from QueryClient config)

- **gcTime**: Time in milliseconds before unused data is garbage collected
  - Default: 10 minutes (from QueryClient config)

### Query Hook Return Value

```typescript
const {
  data,           // The data returned from queryFn
  isLoading,      // True if query is fetching for the first time
  isFetching,     // True if query is fetching (including refetches)
  isError,        // True if query encountered an error
  error,          // Error object if query failed
  refetch,        // Function to manually refetch
  isSuccess,      // True if query succeeded
} = useGetUsers();
```

### Conditional Queries

```typescript
export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await userAPI.getUserById(userId);
      return response.data;
    },
    enabled: !!userId, // Only run if userId exists
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
```

---

## Mutation Hooks (useMutation)

Mutation hooks are used for POST, PUT, PATCH, and DELETE operations.

### Basic Structure

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceAPI } from '../api';

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData: any) => {
      const response = await serviceAPI.createService(serviceData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch services list
      queryClient.invalidateQueries({ queryKey: ['services'] });
      console.log('Service created successfully');
    },
    onError: (error: any) => {
      console.error('Create service error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create service';
      console.error('Error:', errorMessage);
    },
  });
};
```

### Mutation Hook Options

- **mutationFn**: Async function that performs the mutation
  - Receives variables as parameter
  - Must return a Promise

- **onSuccess**: Callback executed on successful mutation
  - Typically used for cache invalidation and notifications

- **onError**: Callback executed on mutation failure
  - Typically used for error handling and notifications

### Mutation Hook Return Value

```typescript
const {
  mutate,         // Function to trigger mutation
  mutateAsync,    // Async function that returns a Promise
  isPending,      // True if mutation is in progress
  isError,        // True if mutation failed
  error,          // Error object if mutation failed
  isSuccess,      // True if mutation succeeded
  data,           // Data returned from successful mutation
  reset,          // Function to reset mutation state
} = useCreateService();

// Usage
mutate(serviceData);
// or
await mutateAsync(serviceData);
```

### Mutation with Variables

```typescript
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, serviceData }: { serviceId: string; serviceData: any }) => {
      const response = await serviceAPI.updateService(serviceId, serviceData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both list and specific service
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      console.log('Service updated successfully');
    },
    onError: (error: any) => {
      console.error('Update service error:', error);
    },
  });
};
```

---

## Cache Invalidation Strategies

### Invalidate Queries

Invalidate queries to trigger refetch:

```typescript
// Invalidate all queries with key 'users'
queryClient.invalidateQueries({ queryKey: ['users'] });

// Invalidate specific user
queryClient.invalidateQueries({ queryKey: ['user', userId] });

// Invalidate all queries starting with 'appointment'
queryClient.invalidateQueries({ queryKey: ['appointment'] });
```

### Refetch Queries

Manually refetch queries:

```typescript
// Refetch all 'appointments' queries
queryClient.refetchQueries({ queryKey: ['appointments'] });
```

### Update Query Data

Update cache directly without refetching:

```typescript
queryClient.setQueryData(['user', userId], (oldData) => {
  return { ...oldData, ...updatedData };
});
```

### Common Patterns

1. **After Create**: Invalidate list query
   ```typescript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['services'] });
   }
   ```

2. **After Update**: Invalidate both list and item queries
   ```typescript
   onSuccess: (_, variables) => {
     queryClient.invalidateQueries({ queryKey: ['appointments'] });
     queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
   }
   ```

3. **After Delete**: Invalidate list query
   ```typescript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['users'] });
   }
   ```

---

## Error Handling Patterns

### Query Error Handling

```typescript
const { data, isError, error } = useGetUsers();

if (isError) {
  const errorMessage = error?.response?.data?.message || 'Failed to fetch users';
  // Handle error (show toast, alert, etc.)
}
```

### Mutation Error Handling

```typescript
const createService = useCreateService();

const handleCreate = async (formData: any) => {
  try {
    await createService.mutateAsync(formData);
    // Success handling
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || 'Failed to create service';
    // Error handling
  }
};
```

### Global Error Handling

Errors are logged in the mutation's `onError` callback. For user-facing errors, consider:

- Toast notifications (can be added later)
- Alert dialogs
- Error state in UI components

---

## Best Practices

### 1. Query Key Structure

- Use consistent, hierarchical query keys
- Include all parameters that affect the query
- Example: `['appointments', { page: 1, limit: 10 }]`

### 2. Stale Time Configuration

- Set appropriate stale times based on data freshness requirements
- Use longer stale times for relatively static data
- Use shorter stale times for frequently changing data

### 3. Conditional Queries

- Use `enabled` option to prevent unnecessary queries
- Example: `enabled: !!appointmentId` prevents query when appointmentId is missing

### 4. Cache Invalidation

- Invalidate related queries after mutations
- Invalidate both list and detail queries after updates
- Consider optimistic updates for better UX

### 5. Error Handling

- Always handle errors in mutations
- Provide user-friendly error messages
- Log errors for debugging

### 6. TypeScript

- Type all hook parameters and return values
- Use proper types from API responses
- Leverage TypeScript for better developer experience

### 7. Performance

- Use `staleTime` to reduce unnecessary refetches
- Use `gcTime` to manage cache size
- Consider pagination for large datasets

---

## Usage Examples

### Example 1: Fetching Data

```typescript
import { useGetAllUsers } from '../tanstack';

function UsersList() {
  const { data, isLoading, isError, error } = useGetAllUsers({ page: 1, limit: 10 });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div>
      {data?.data?.items?.map((user: any) => (
        <div key={user._id}>{user.firstName} {user.lastName}</div>
      ))}
    </div>
  );
}
```

### Example 2: Creating Data

```typescript
import { useCreateService } from '../tanstack';

function CreateServiceForm() {
  const createService = useCreateService();

  const handleSubmit = async (formData: any) => {
    try {
      await createService.mutateAsync(formData);
      // Navigate or show success message
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  return (
    <button onClick={() => handleSubmit({ name: 'Consultation' })} disabled={createService.isPending}>
      {createService.isPending ? 'Creating...' : 'Create Service'}
    </button>
  );
}
```

### Example 3: Updating Data

```typescript
import { useRescheduleAppointment } from '../tanstack';

function EditAppointment({ appointmentId }: { appointmentId: string }) {
  const updateAppointment = useRescheduleAppointment();

  const handleUpdate = async (appointmentData: any) => {
    try {
      await updateAppointment.mutateAsync({ appointmentId, data: appointmentData });
      // Show success message
    } catch (error) {
      // Error handling
    }
  };

  return <button onClick={() => handleUpdate({ date: '2026-02-01' })}>Update</button>;
}
```

### Example 4: Conditional Query

```typescript
import { useGetAppointment } from '../tanstack';

function AppointmentDetails({ appointmentId }: { appointmentId?: string }) {
  const { data, isLoading } = useGetAppointment(appointmentId || '');

  if (!appointmentId) return <div>No appointment selected</div>;
  if (isLoading) return <div>Loading...</div>;

  return <div>{data?.data?.appointment?.status}</div>;
}
```

### Example 5: Multiple Queries

```typescript
import { useGetAppointment, useGetNotifications } from '../tanstack';

function Dashboard({ appointmentId }: { appointmentId: string }) {
  const { data: appointment } = useGetAppointment(appointmentId);
  const { data: notifications } = useGetNotifications({ page: 1, limit: 5 });

  return (
    <div>
      <div>Appointment Status: {appointment?.data?.appointment?.status}</div>
      <div>Notifications: {notifications?.data?.items?.length}</div>
    </div>
  );
}
```

---

## Integration with Existing Code

### API Layer

TanStack Query hooks use the existing API layer (`src/api/index.ts`):

```typescript
import { appointmentAPI } from '../api';

export const useGetAppointment = (appointmentId: string) => {
  return useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const response = await appointmentAPI.getAppointment(appointmentId);
      return response.data;
    },
  });
};
```

### Redux Integration

- TanStack Query handles server state (data from API)
- Redux handles client state (UI state, auth state)
- Both can coexist in the same application

### Auth Context

- Authentication is handled in `AuthContext` (`src/contexts/AuthContext.tsx`)
- API interceptors handle token management (`src/api/config.ts`)
- TanStack Query hooks automatically use authenticated requests

---

## Troubleshooting

### Common Issues

1. **Queries not refetching**
   - Check `staleTime` configuration
   - Verify query keys are correct
   - Ensure `refetchOnWindowFocus` is not blocking

2. **Cache not invalidating**
   - Verify query keys match exactly
   - Check that `invalidateQueries` is called in `onSuccess`

3. **TypeScript errors**
   - Ensure proper types are imported
   - Check API response types match expected types

4. **Multiple requests**
   - Check if queries are enabled unnecessarily
   - Verify request deduplication is working

---

## Notes

- Newsletter hooks exist in `src/tanstack/useNewsletters.ts` but are **NOT currently exported** in `src/tanstack/index.ts`. To use these hooks, import directly from the file: `import { useGetAllSubscribers } from '@/tanstack/useNewsletters'`
- All hooks follow TypeScript typing conventions
- Error handling uses console.error (toast notifications can be added later)
- Cache invalidation follows consistent patterns
- Query keys are structured as arrays: `['resource', params/id]`
- Hooks are organized by resource type for better maintainability
- Import paths in examples may need adjusting depending on component location

---

## Service Hooks

### useGetAllServices

Fetches all services with optional filtering.

```typescript
import { useGetAllServices } from '../tanstack/useServices';

// Get all active services
const { data, isLoading } = useGetAllServices({ status: 'active' });

// Get all services (admin)
const { data } = useGetAllServices({ status: 'inactive' });
```

**Parameters:**
- `params.status?: 'active' | 'inactive'` - Filter by service status (replaces deprecated `isActive` boolean)

**Note:** The API expects `status` query parameter, not `isActive`. Use `status: 'active'` to get active services.

### useGetServicesByStaff

Fetches services assigned to a specific staff member (for staff-first appointment flow).

```typescript
import { useGetServicesByStaff } from '../tanstack/useServices';

function ServiceSelector({ staffId }: { staffId: string }) {
  const { data, isLoading } = useGetServicesByStaff(staffId);
  const services = data?.services || [];
  
  return (
    <div>
      {services.map(service => (
        <div key={service._id}>{service.name}</div>
      ))}
    </div>
  );
}
```

**Parameters:**
- `staffId: string` - The staff member's user ID

**Returns:**
- `{ services: IService[] }` - Array of services assigned to the staff member

**Note:** This hook is automatically disabled if `staffId` is empty.

---

## User Hooks

### useGetStaffByService

Fetches staff members who provide a specific service (for service-first appointment flow).

```typescript
import { useGetStaffByService } from '../tanstack/useUsers';

function StaffSelector({ serviceId }: { serviceId: string }) {
  const { data, isLoading } = useGetStaffByService(serviceId);
  const staff = data?.users || [];
  
  return (
    <div>
      {staff.map(member => (
        <div key={member._id}>{member.firstName} {member.lastName}</div>
      ))}
    </div>
  );
}
```

**Parameters:**
- `serviceId: string` - The service ID

**Returns:**
- `{ users: IUser[] }` - Array of staff members who provide the service

**Note:** This hook is automatically disabled if `serviceId` is empty. Only works with single service selection.

---

## Availability Hooks

### useGetSlots

Fetches available time slots for a staff member, service(s), and date.

```typescript
import { useGetSlots } from '../tanstack/useAvailability';

// Single service
const { data, isLoading } = useGetSlots({
  staffId: 'staff123',
  serviceId: 'service456',
  date: '2025-01-30'
});

// Multiple services
const { data } = useGetSlots({
  staffId: 'staff123',
  serviceId: ['service456', 'service789'], // Array for multiple services
  date: '2025-01-30'
});
```

**Parameters:**
- `params.staffId: string` - Staff member ID (required)
- `params.serviceId: string | string[]` - Single service ID or array of service IDs (required)
- `params.date: string` - Date in YYYY-MM-DD format (required)

**Returns:**
- `{ slots: ITimeSlot[] }` - Array of available time slots

**Note:** When multiple services are provided, the API sums their durations to calculate the total appointment duration for slot generation.

---

## Review Hooks

### useGetAllReviews

Fetches all reviews with optional filtering and pagination.

```typescript
import { useGetAllReviews } from '../tanstack/useReviews';

// Get all reviews
const { data, isLoading } = useGetAllReviews();

// Get reviews with filters
const { data } = useGetAllReviews({
  page: 1,
  limit: 10,
  status: 'APPROVED',
  staffId: 'staff123',
  serviceId: 'service456',
  search: 'great service'
});
```

**Parameters:**
- `params.page?: number` - Page number (default: 1)
- `params.limit?: number` - Items per page (default: 10)
- `params.search?: string` - Search by user name, comment, or rating
- `params.userId?: string` - Filter by user ID
- `params.appointmentId?: string` - Filter by appointment ID
- `params.staffId?: string` - Filter by staff ID (via appointment)
- `params.serviceId?: string` - Filter by service ID (via appointment)
- `params.status?: 'PENDING' | 'APPROVED' | 'REJECTED'` - Filter by status

**Returns:**
- `{ reviews: IReview[], pagination: {...}, averageRating: number }` - Review data with pagination and average rating

**Note:** By default, only approved reviews are shown. Admins can filter by status.

### useGetReviewById

Fetches a single review by ID.

```typescript
import { useGetReviewById } from '../tanstack/useReviews';

function ReviewDetails({ reviewId }: { reviewId: string }) {
  const { data, isLoading } = useGetReviewById(reviewId);
  const review = data?.review || data;
  
  return (
    <div>
      {review && (
        <div>
          <h1>Rating: {review.rating}</h1>
          <p>{review.comment}</p>
        </div>
      )}
    </div>
  );
}
```

**Parameters:**
- `reviewId: string` - The review ID

**Returns:**
- `{ review: IReview }` - Review object with populated userId and appointmentId

**Note:** This hook is automatically disabled if `reviewId` is empty.

### useCreateReview

Creates a new review for an appointment.

```typescript
import { useCreateReview } from '../tanstack/useReviews';

function CreateReviewForm({ appointmentId }: { appointmentId: string }) {
  const createReview = useCreateReview();
  
  const handleSubmit = async (rating: number, comment: string) => {
    try {
      await createReview.mutateAsync({
        appointmentId,
        rating,
        comment
      });
      // Review created successfully
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(5, 'Great service!');
    }}>
      {/* Form fields */}
    </form>
  );
}
```

**Parameters:**
- `reviewData.appointmentId: string` - Appointment ID (required)
- `reviewData.rating: number` - Rating from 1-5 (required)
- `reviewData.comment?: string` - Optional comment (max 1000 characters)

**Validation:**
- Appointment must belong to user and have status "COMPLETED"
- One review per appointment per user

### useUpdateReview

Updates an existing review's rating or comment.

```typescript
import { useUpdateReview } from '../tanstack/useReviews';

function EditReview({ reviewId }: { reviewId: string }) {
  const updateReview = useUpdateReview();
  
  const handleUpdate = async () => {
    try {
      await updateReview.mutateAsync({
        reviewId,
        reviewData: {
          rating: 4,
          comment: 'Updated comment'
        }
      });
      // Review updated successfully
    } catch (error) {
      // Handle error
    }
  };
  
  return <button onClick={handleUpdate}>Update Review</button>;
}
```

**Parameters:**
- `reviewId: string` - The review ID
- `reviewData.rating?: number` - New rating (1-5, optional)
- `reviewData.comment?: string` - New comment (max 1000 characters, optional)

**Note:** Only owner or admin can update reviews.

### useDeleteReview

Deletes a review.

```typescript
import { useDeleteReview } from '../tanstack/useReviews';

function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const deleteReview = useDeleteReview();
  
  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      try {
        await deleteReview.mutateAsync(reviewId);
        // Review deleted successfully
      } catch (error) {
        // Handle error
      }
    }
  };
  
  return (
    <button onClick={handleDelete} disabled={deleteReview.isPending}>
      {deleteReview.isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

**Parameters:**
- `reviewId: string` - The review ID to delete

**Note:** Only owner or admin can delete reviews.

### useUpdateReviewStatus

Updates a review's status (admin only).

```typescript
import { useUpdateReviewStatus } from '../tanstack/useReviews';

function ReviewModeration({ reviewId }: { reviewId: string }) {
  const updateStatus = useUpdateReviewStatus();
  
  const handleApprove = async () => {
    try {
      await updateStatus.mutateAsync({
        reviewId,
        statusData: { status: 'APPROVED' }
      });
      // Status updated successfully
    } catch (error) {
      // Handle error
    }
  };
  
  return <button onClick={handleApprove}>Approve Review</button>;
}
```

**Parameters:**
- `reviewId: string` - The review ID
- `statusData.status: 'PENDING' | 'APPROVED' | 'REJECTED'` - New status

**Note:** Only admin can update review status.

---

## Newsletter Hooks

### useGetAllSubscribers

Fetches all newsletter subscribers with optional filtering and pagination.

```typescript
import { useGetAllSubscribers } from '../tanstack/useNewsletters';

// Get all subscribers
const { data, isLoading } = useGetAllSubscribers();

// Get subscribers with filters
const { data } = useGetAllSubscribers({
  page: 1,
  limit: 10,
  search: 'example@email.com',
  status: 'SUBSCRIBED'
});
```

**Parameters:**
- `params.page?: number` - Page number (default: 1)
- `params.limit?: number` - Items per page (default: 10)
- `params.search?: string` - Search by email
- `params.status?: 'SUBSCRIBED' | 'UNSUBSCRIBED'` - Filter by status

**Returns:**
- `{ subscribers: INewsletter[], pagination: {...} }` - Subscriber data with pagination

**Note:** This hook is admin-only and requires authentication.

### useGetSubscriberById

Fetches a single subscriber by ID.

```typescript
import { useGetSubscriberById } from '../tanstack/useNewsletters';

function SubscriberDetails({ subscriberId }: { subscriberId: string }) {
  const { data, isLoading } = useGetSubscriberById(subscriberId);
  const subscriber = data?.subscriber || data;
  
  return (
    <div>
      {subscriber && (
        <div>
          <h1>Email: {subscriber.email}</h1>
          <p>Status: {subscriber.status}</p>
        </div>
      )}
    </div>
  );
}
```

**Parameters:**
- `subscriberId: string` - The subscriber ID

**Returns:**
- `{ subscriber: INewsletter }` - Subscriber object

**Note:** This hook is automatically disabled if `subscriberId` is empty. Admin-only.

### useGetSubscriptionStats

Fetches newsletter subscription statistics.

```typescript
import { useGetSubscriptionStats } from '../tanstack/useNewsletters';

function NewsletterStats() {
  const { data, isLoading } = useGetSubscriptionStats();
  const stats = data || {};
  
  return (
    <div>
      <p>Total Subscribers: {stats.totalSubscribers}</p>
      <p>Active Subscribers: {stats.activeSubscribers}</p>
    </div>
  );
}
```

**Returns:**
- `{ totalSubscribers: number, activeSubscribers: number, unsubscribedCount: number, subscriptionRate: number }` - Subscription statistics

**Note:** Admin-only hook.

### useSubscribeNewsletter

Subscribes an email to the newsletter.

```typescript
import { useSubscribeNewsletter } from '../tanstack/useNewsletters';

function NewsletterSubscribe() {
  const subscribeNewsletter = useSubscribeNewsletter();
  
  const handleSubscribe = async (email: string) => {
    try {
      await subscribeNewsletter.mutateAsync({ email });
      // Subscription successful
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubscribe('user@example.com');
    }}>
      {/* Form fields */}
    </form>
  );
}
```

**Parameters:**
- `payload.email: string` - Email address to subscribe

**Note:** Public endpoint, no authentication required.

### useUnsubscribeNewsletter

Unsubscribes from the newsletter using token or email.

```typescript
import { useUnsubscribeNewsletter } from '../tanstack/useNewsletters';

function NewsletterUnsubscribe() {
  const unsubscribeNewsletter = useUnsubscribeNewsletter();
  
  const handleUnsubscribe = async (token?: string, email?: string) => {
    try {
      await unsubscribeNewsletter.mutateAsync({ token, email });
      // Unsubscription successful
    } catch (error) {
      // Handle error
    }
  };
  
  return <button onClick={() => handleUnsubscribe(undefined, 'user@example.com')}>Unsubscribe</button>;
}
```

**Parameters:**
- `params.token?: string` - Unsubscribe token from email link
- `params.email?: string` - Email address to unsubscribe

**Note:** Public endpoint, no authentication required.

### useUpdateSubscriberStatus

Updates a subscriber's status (admin only).

```typescript
import { useUpdateSubscriberStatus } from '../tanstack/useNewsletters';

function UpdateSubscriberStatus({ subscriberId }: { subscriberId: string }) {
  const updateStatus = useUpdateSubscriberStatus();
  
  const handleUpdate = async () => {
    try {
      await updateStatus.mutateAsync({
        subscriberId,
        statusData: { status: 'UNSUBSCRIBED' }
      });
      // Status updated successfully
    } catch (error) {
      // Handle error
    }
  };
  
  return <button onClick={handleUpdate}>Update Status</button>;
}
```

**Parameters:**
- `subscriberId: string` - The subscriber ID
- `statusData.status: 'SUBSCRIBED' | 'UNSUBSCRIBED'` - New status

**Note:** Admin-only mutation.

### useDeleteSubscriber

Deletes a subscriber from the newsletter.

```typescript
import { useDeleteSubscriber } from '../tanstack/useNewsletters';

function DeleteSubscriberButton({ subscriberId }: { subscriberId: string }) {
  const deleteSubscriber = useDeleteSubscriber();
  
  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      try {
        await deleteSubscriber.mutateAsync(subscriberId);
        // Subscriber deleted successfully
      } catch (error) {
        // Handle error
      }
    }
  };
  
  return (
    <button onClick={handleDelete} disabled={deleteSubscriber.isPending}>
      {deleteSubscriber.isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

**Parameters:**
- `subscriberId: string` - The subscriber ID to delete

**Note:** Admin-only mutation.

### useSendNewsletter

Sends a newsletter to subscribers.

```typescript
import { useSendNewsletter } from '../tanstack/useNewsletters';

function SendNewsletterForm() {
  const sendNewsletter = useSendNewsletter();
  
  const handleSend = async (subject: string, message: string, status?: 'SUBSCRIBED' | 'ALL') => {
    try {
      await sendNewsletter.mutateAsync({
        subject,
        message,
        status: status || 'SUBSCRIBED'
      });
      // Newsletter sent successfully
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSend('Monthly Newsletter', 'This is the newsletter content...');
    }}>
      {/* Form fields */}
    </form>
  );
}
```

**Parameters:**
- `payload.subject: string` - Newsletter subject (required)
- `payload.message: string` - Newsletter message content (required)
- `payload.status?: 'SUBSCRIBED' | 'ALL'` - Target subscribers (default: 'SUBSCRIBED')

**Note:** Admin-only mutation. Sends newsletter to all subscribers matching the status filter.

---

**Last Updated:** February 2026  
**Version:** 1.0.0

