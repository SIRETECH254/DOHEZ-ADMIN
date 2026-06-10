# Event Detail Documentation

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
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdLocationOn, MdEvent, MdAccessTime, MdPeople, MdAdd, MdRemove } from 'react-icons/md';
import { HiOutlinePencil, HiOutlineCalendar, HiOutlineTicket, HiOutlinePlus, HiOutlineMinus } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetProductById } from '../../../tanstack/useProducts';
import { useBookTicket } from '../../../tanstack/useTickets';
import { useAuth } from '../../../contexts/AuthContext';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IProductCategory, IVariant } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetProductById`
- **Hook usage:** `const { data: productData, isLoading, isError, error } = useGetProductById(id!);`
- **Purpose:** Fetches the event details by its ID.

#### `useBookTicket`
- **Hook usage:** `const { mutate: bookTicket, isPending: isBooking } = useBookTicket();`
- **Purpose:** Mutation hook to handle ticket booking for the event.

### Local Component State

#### `activeImageIndex`
- **Purpose:** Manages the index of the currently displayed image in the gallery.
```tsx
const [activeImageIndex, setActiveImageIndex] = useState(0);
```

#### `quantity`
- **Purpose:** Manages the number of tickets to be booked.
```tsx
const [quantity, setQuantity] = useState(1);
```

#### `selectedVariants`
- **Purpose:** Manages selected options for different event variants (e.g., ticket tiers).
```tsx
const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
```

#### `attendees`
- **Purpose:** Manages the details (name, email, phone) of all attendees for the booking.
```tsx
const [attendees, setAttendees] = useState<{ name: string; email: string; phone: string }[]>(
  [{ name: '', email: '', phone: '' }]
);
```

### Memoized Parameters

#### `matchedSku`
- **Purpose:** Finds the specific SKU object that matches all currently selected variants.
```tsx
const matchedSku = useMemo(() => {
  if (!product?.skus || product.skus.length === 0) return null;
  return product.skus.find((sku: any) => {
    return sku.attributes.every((attr: any) => 
      selectedVariants[attr.variantId] === attr.optionId
    );
  });
}, [product?.skus, selectedVariants]);
```

#### `currentPrice`
- **Purpose:** Calculates the final price per ticket based on the base price and variant additions.
```tsx
const currentPrice = useMemo(() => {
  if (matchedSku) return matchedSku.price;
  let price = product?.price || 0;
  // ... additions ...
  return price;
}, [product, selectedVariants, matchedSku]);
```

## Functions Involved

### `handleVariantSelect()`
**purpose:** Update the selected option for a specific variant.

**process:**
1. Updates the `selectedVariants` map with the new `optionId` for the given `variantId`.

**function implementation:**
```tsx
  const handleVariantSelect = (variantId: string, optionId: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantId]: optionId }));
  };
```

### `handleAttendeeChange()`
**purpose:** Update details for a specific attendee.

**process:**
1. Clones the current `attendees` array.
2. Updates the specific field (`name`, `email`, or `phone`) for the attendee at the given `index`.

**function implementation:**
```tsx
  const handleAttendeeChange = (index: number, field: string, value: string) => {
    setAttendees(prev => {
        const newAttendees = [...prev];
        newAttendees[index] = { ...newAttendees[index], [field]: value };
        return newAttendees;
    });
  };
```

### `handleBookTicket()`
**purpose:** Execute the ticket booking process.

**process:**
1. Validates that all mandatory variants have a selection.
2. Constructs the `ticketsRequested` payload.
3. Calls the `bookTicket` mutation.
4. Navigates to the payment page on success.

**function implementation:**
```tsx
  const handleBookTicket = () => {
    if (!product) return;
    // ... validation ...
    bookTicket({
        eventId: product._id,
        ticketsRequested,
        paymentMethod: 'mpesa',
        phoneNumber: user?.phone || '...'
    }, {
        onSuccess: (response: any) => {
            navigate('/events/pay-tickets', { state: { bookingData: response.data } });
        }
    });
  };
```

## API Integration

### `GET /api/products/:productId`

#### API
```typescript
export const productAPI = {
  // Get event details
  getProductById: (id: string) => api.get(`/api/products/${id}`),
};
```

#### Hook
```typescript
export const useGetProductById = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productAPI.getProductById(id);
      return response.data.data;
    },
  });
};
```

---

### `POST /api/tickets/book`

#### API
```typescript
export const ticketAPI = {
  // Book tickets
  bookTicket: (payload: BookTicketPayload) => api.post('/api/tickets/book', payload),
};
```

#### Hook
```typescript
export const useBookTicket = () => {
  return useMutation({
    mutationFn: async (payload: BookTicketPayload) => {
      const response = await ticketAPI.bookTicket(payload);
      return response.data;
    },
  });
};
```

## UI Structure
- **Container:** Standard padding container with max-w-7xl.
- **Header:** Back button, event name, category badge, and Edit button.
- **Two Column Layout:**
    - **Left (Main):** Image gallery, "About Event" description, Venue & Address, Date & Time.
    - **Right (Sidebar):** Price display, Ticket tier selection, Quantity selector, Attendee details form, Book button, Organizer info.
- **Badges:** `StatusBadge` for event status.
- **Icons:** Material Design (`Md`) and HeroIcons (`Hi`).

## Form Inputs

### `Variant Selection Buttons`
**Purpose**: Allows users to select ticket tiers or options.
**Applicable**: Interactive cards in the sidebar.

**Input implementation**:
```tsx
<button 
    key={opt._id} 
    onClick={() => handleVariantSelect(v._id, opt._id)}
    className={`... ${selectedVariants[v._id] === opt._id ? 'selected-styles' : ''}`}
>
    {/* Label and Price */}
</button>
```

### `Quantity Selector`
**Purpose**: Increments or decrements the number of tickets.
**Applicable**: Number display with `HiOutlinePlus` and `HiOutlineMinus` buttons.

### `Attendee Detail Inputs`
**Purpose**: Collects name, email, and phone for each attendee.
**Applicable**: Text, email, and tel inputs.

**Input implementation**:
```tsx
<input 
    type="text" 
    placeholder="Full Name" 
    value={a.name} 
    onChange={(e) => handleAttendeeChange(idx, 'name', e.target.value)} 
/>
```

## Error Handling
- Global loading spinner during data fetch.
- Full-page error message with `FiAlertTriangle` and "Back to List" button if data loading fails.
- `alert()` notification if mandatory ticket options are not selected.
- Disable "Book Tickets" button during active mutation.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [ < Back ]   Event Name [ Category ]         [ Edit ]    │
├──────────────────────────────────────────────────────────┤
│ ┌───────────────────────┐  ┌───────────────────────────┐ │
│ │                       │  │  $ Price                  │ │
│ │     Image Gallery     │  │                           │ │
│ │                       │  │  [ Ticket Tiers ]         │ │
│ ├───────────────────────┤  │                           │ │
│ │ About Event           │  │  [ - ] Quantity [ + ]     │ │
│ │ ...                   │  │                           │ │
│ ├───────────────────────┤  │  [ Attendee Details ]     │ │
│ │ Venue & Address       │  │                           │ │
│ │                       │  │  [ Book Tickets Button ]  │ │
│ │ Date & Time           │  │                           │ │
│ └───────────────────────┘  └───────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ < Back      Summer Concert [ Music ]                                       ✏ Edit     │
│                                                                                       │
│ ┌───────────────────────────┐    ┌──────────────────────────────────────────────┐     │
│ │                           │    │ $ 1500.00                                    │     │
│ │       [ BIG IMAGE ]       │    │                                              │     │
│ │                           │    │ Ticket Tier                                  │     │
│ └───────────────────────────┘    │ ┌──────────────────────────────────────────┐ │     │
│ [o] [o] [o] (Thumbnails)         │ │ VIP ($1500) | Regular ($500)             │ │     │
│                                  │ └──────────────────────────────────────────┘ │     │
│ About Event                      │                                              │     │
│ Join us for an amazing night...  │ Quantity: [ - ] 1 [ + ]                      │     │
│                                  │                                              │     │
│ Venue              Date          │ Attendee 1                                   │     │
│ City Park          15 June 2026  │ [ Full Name        ]                         │     │
│                                  │ [ Email            ] [ Phone            ]    │     │
│                                  │                                              │     │
│                                  │ [ BOOK TICKETS ]                             │     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/events/:id`
- Back button -> `/events`
- Edit button -> `/events/:id/edit`
- Book button -> `/events/pay-tickets` (with state)

## Future Enhancements
- Add social sharing buttons.
- Integrate map view for the venue address.
- Add "Add to Calendar" functionality (iCal/Google).
- Implement countdown timer for ticket sales.
