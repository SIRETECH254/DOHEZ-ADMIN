# Cart Documentation

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
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineTrash } from 'react-icons/hi';
import { FiShoppingCart, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { MdArrowForward } from 'react-icons/md';
import { useGetCart, useRemoveCartItem, useUpdateCartQuantity, useClearCart } from '../../../tanstack/useCart';
```

## Context and State Management

### TanStack Query

#### `useGetCart`
- **Hook usage:** `const { data: cartData, isLoading } = useGetCart();`
- **Purpose:** Fetches the current user's cart data.

#### `useRemoveCartItem`
- **Hook usage:** `const removeCartItem = useRemoveCartItem();`
- **Purpose:** Mutation hook to remove a specific item from a branch's cart group.

#### `useUpdateCartQuantity`
- **Hook usage:** `const updateQuantity = useUpdateCartQuantity();`
- **Purpose:** Mutation hook to increment or decrement the quantity of a cart item.

#### `useClearCart`
- **Hook usage:** `const clearCart = useClearCart();`
- **Purpose:** Mutation hook to empty the entire cart.

### Local Component State

#### `expandedVendors`
- **Purpose:** Manages the accordion state for vendor groups.
```tsx
const [expandedVendors, setExpandedVendors] = useState<Record<string, boolean>>({});
```

#### `expandedBranches`
- **Purpose:** Manages the accordion state for branch groups within vendors.
```tsx
const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});
```

### Memoized Parameters

#### `groupedByVendor`
- **Purpose:** Organizes the flat `cartGroups` array into a nested structure (Vendor > Branches > Items) for the accordion UI.
```tsx
const groupedByVendor = useMemo(() => {
  if (!cart?.cartGroups) return [];
  const groups = cart.cartGroups.reduce((acc: any, group: any) => {
    const vendorId = group.vendorId._id;
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendor: group.vendorId,
        branches: [],
        vendorSubtotal: 0
      };
    }
    acc[vendorId].branches.push(group);
    acc[vendorId].vendorSubtotal += group.groupSubtotal;
    return acc;
  }, {});
  return Object.values(groups);
}, [cart?.cartGroups]);
```

## Functions Involved

### `toggleVendor()`
**purpose:** Toggles the expanded/collapsed state of a vendor group in the cart accordion.

**process:**
1. Receives the `vendorId`.
2. Updates the `expandedVendors` state object by flipping the boolean value for the given ID.

**function implementation:**
```tsx
  const toggleVendor = (vendorId: string) => {
    setExpandedVendors(prev => ({ ...prev, [vendorId]: !prev[vendorId] }));
  };
```

### `toggleBranch()`
**purpose:** Toggles the expanded/collapsed state of a branch group within a vendor.

**process:**
1. Receives the `branchId`.
2. Updates the `expandedBranches` state object by flipping the boolean value for the given ID.

**function implementation:**
```tsx
  const toggleBranch = (branchId: string) => {
    setExpandedBranches(prev => ({ ...prev, [branchId]: !prev[branchId] }));
  };
```

## API Integration

### `GET /api/cart`

#### API
```typescript
export const cartAPI = {
  getCart: () => api.get('/api/cart'),
};
```

#### Hook
```typescript
export const useGetCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await cartAPI.getCart();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains the `cart` object with `cartGroups`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "cart": {
      "_id": "...",
      "userId": "...",
      "cartGroups": [...],
      "totalCartValue": 1500,
      "totalItems": 3
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `PUT /api/cart/update`

#### Interface
```typescript
export interface UpdateCartQuantityPayload {
  branchId: string;
  cartItemId: string;
  quantity: number;
}
```

#### API
```typescript
export const cartAPI = {
  updateQuantity: (data: UpdateCartQuantityPayload) => api.put('/api/cart/update', data),
};
```

#### Hook
```typescript
export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateCartQuantityPayload) => {
      const response = await cartAPI.updateQuantity(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
```

#### Contract
Updates item quantity and returns updated cart data.

#### Error Handling
API returns a message in `response.data.message`.

---

### `DELETE /api/cart/remove`

#### Interface
```typescript
export interface RemoveCartItemPayload {
  branchId: string;
  cartItemId: string;
}
```

#### API
```typescript
export const cartAPI = {
  removeItem: (data: RemoveCartItemPayload) => api.delete('/api/cart/remove', { data }),
};
```

#### Hook
```typescript
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RemoveCartItemPayload) => {
      const response = await cartAPI.removeItem(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
```

#### Contract
Removes item from cart group and returns updated cart data.

#### Error Handling
API returns a message in `response.data.message`.

---

### `DELETE /api/cart/clear`

#### API
```typescript
export const cartAPI = {
  clearCart: () => api.delete('/api/cart/clear'),
};
```

#### Hook
```typescript
export const useClearCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await cartAPI.clearCart();
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
```

#### Contract
Empties the entire cart.

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Standard padding container with max-width `max-w-5xl`.
- **Header:** Back button and total item count.
- **Vendor Accordion:** Top-level grouping showing Vendor name, subtotal, and toggle.
- **Branch Accordion:** Nested grouping showing Branch name, subtotal, and "Order" action.
- **Cart Items:** Individual product cards showing:
    - Product Name and Price.
    - **Variants:** Mapped list of selected options.
    - **Modifiers:** Categorized list of additional selections.
    - **Quantity Control:** Increment/Decrement stepper.
    - **Actions:** Individual delete icon.
- **Summary Action:** Global "Clear All Items" button at the bottom.

## Form Inputs

### `Quantity Stepper`
**Purpose**: Increases or decreases the quantity of a specific item in the cart.
**Applicable**: Within each cart item row. Uses `useUpdateCartQuantity` mutation.

**Input implementation**:
```tsx
<div className="flex items-center justify-between gap-3 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
  <button 
    onClick={() => updateQuantity.mutate({ branchId: group.branchId._id, cartItemId: item._id, quantity: Math.max(1, item.quantity - 1) })}
    className="h-8 w-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-500 font-bold transition-colors"
  >-</button>
  <span className="font-bold w-6 text-center text-gray-900">{item.quantity}</span>
  <button 
    onClick={() => updateQuantity.mutate({ branchId: group.branchId._id, cartItemId: item._id, quantity: item.quantity + 1 })}
    className="h-8 w-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-500 font-bold transition-colors"
  >+</button>
</div>
```

### `Remove Item Button`
**Purpose**: Removes a specific item from the cart.
**Applicable**: Within each cart item row. Uses `useRemoveCartItem` mutation.

**Input implementation**:
```tsx
<button 
    onClick={() => removeCartItem.mutate({ branchId: group.branchId._id, cartItemId: item._id })}
    className="h-10 w-10 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition-colors"
>
  <HiOutlineTrash size={20} />
</button>
```

### `Clear All Items Button`
**Purpose**: Empties the entire shopping cart for the user.
**Applicable**: At the bottom of the cart page. Uses `useClearCart` mutation.

**Input implementation**:
```tsx
<button 
  onClick={() => clearCart.mutate()}
  className="flex items-center gap-2 justify-center w-full text-red-500 border border-red-500 rounded-md px-4 py-3 cursor-pointer"
  disabled={clearCart.isPending}
>
  <HiOutlineTrash size={20} />
  Clear All Items
</button>
```

## Error Handling
- **Loading State:** Simple "Loading cart..." indicator.
- **Empty State:** Visual placeholder with `FiShoppingCart` and a "Shop Products" call-to-action button.
- **Quantity Validation:** Uses `Math.max(1, ...)` to prevent quantity from dropping to zero via the stepper.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ < Back to ...                            Your Cart (X)   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [V] Vendor Name                       Total: $XX.X │  │
│  │ ────────────────────────────────────────────────── │  │
│  │   ┌──────────────────────────────────────────────┐ │  │
│  │   │ [B] Branch Name              [ Order ] [v]   │ │  │
│  │   │ ──────────────────────────────────────────── │ │  │
│  │   │   Product Name                   $XX.XX      │ │  │
│  │   │   [ - ] [ 1 ] [ + ]              [ Trash ]   │ │  │
│  │   └──────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  [ Clear All Items ]                                     │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ <                                                                  Your Cart (3 items)│
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │ (V) Gourmet Foods                                           TOTAL: KES 1,500.00 [^] │
│ │ ───────────────────────────────────────────────────────────────────────────────── │ │
│ │  ┌───────────────────────────────────────────────────────────────────────────────┐ │ │
│ │  │ Main Street Branch                                         [ Order ] [^]       │ │ │
│ │  │ ───────────────────────────────────────────────────────────────────────────── │ │ │
│ │  │ 🍔 Deluxe Burger                                          KES 500.00          │ │ │
│ │  │    • Size: Large                                                              │ │ │
│ │  │    • Modifiers: [Extra Cheese] [+ Bacon]                  [ - ] [ 1 ] [ + ] 🗑 │ │ │
│ │  └───────────────────────────────────────────────────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│ [ 🗑 Clear All Items ]                                                                │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/cart`
- Back Button -> Previous page
- View Vendor -> `/vendors/:id`
- Shop Products -> `/products`

## Future Enhancements
- Implement full checkout flow integration.
- Add "Save for Later" functionality.
- Integrate voucher/coupon code entry.
- Show estimated delivery time per branch.
