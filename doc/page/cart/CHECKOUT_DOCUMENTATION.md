# Checkout Documentation

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
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineLocationMarker, 
  HiOutlineClipboardCheck, 
  HiOutlineTruck,
  HiOutlineShoppingBag,
  HiOutlineCreditCard,
  HiOutlineTicket,
  HiOutlineInformationCircle,
  HiOutlinePencilAlt
} from 'react-icons/hi';
import { useGetCart } from '../../../tanstack/useCart';
import { useCreateOrder } from '../../../tanstack/useOrders';
import { useGetUserAddresses } from '../../../tanstack/useAddresses';
import { useAuth } from '../../../contexts/AuthContext';
```

## Context and State Management

### Context

#### `useAuth`
- **Hook usage:** `const { user } = useAuth();`
- **Purpose:** Accesses the authenticated user's information, specifically used to pre-fill the payment phone number.

### TanStack Query

#### `useGetCart`
- **Hook usage:** `const { data: cartData, isLoading: isLoadingCart } = useGetCart();`
- **Purpose:** Fetches the current user's cart to display items and calculate totals.

#### `useGetUserAddresses`
- **Hook usage:** `const { data: addressesData, isLoading: isLoadingAddresses } = useGetUserAddresses();`
- **Purpose:** Fetches the user's saved addresses for delivery selection.

#### `useCreateOrder`
- **Hook usage:** `const createOrder = useCreateOrder();`
- **Purpose:** Mutation hook to place the final order.

### Local Component State

#### `activeTab` & `currentStep`
- **Purpose:** Manages the multi-step wizard progression.
```tsx
const [activeTab, setActiveTab] = useState('location');
const [currentStep, setCurrentStep] = useState(1);
```

#### `inlineError`
- **Purpose:** Displays validation or API errors within the form.
```tsx
const [inlineError, setInlineError] = useState<string | null>(null);
```

#### `form`
- **Purpose:** Aggregates all selections made during the checkout process.
```tsx
const [form, setForm] = useState({
  location: 'in_shop' as 'in_shop' | 'away',
  type: 'pickup' as 'pickup' | 'delivery',
  addressId: '',
  paymentPreference: {
    mode: 'pay_now' as 'post_to_bill' | 'pay_now' | 'cash' | 'cod',
    method: 'mpesa_stk' as 'mpesa_stk' | undefined,
    phone: user?.phone || '',
  }
});
```

### Memoized Parameters

#### `branchCart`
- **Purpose:** Filters the global cart data to only show items relevant to the current vendor and branch selected via URL parameters.
```tsx
const branchCart = useMemo(() => {
  if (!cartData?.cart?.cartGroups) return null;
  return cartData.cart.cartGroups.find((group: any) => 
    group.vendorId._id === vendorId && group.branchId._id === branchId
  );
}, [cartData, vendorId, branchId]);
```

## Functions Involved

### `validateTabNavigation()`
**purpose:** Validates if the current step is complete before allowing navigation to a target tab.

**process:**
1. Checks if target step is backwards (always allowed).
2. Forwards validation:
   - Step 1: Location must be selected.
   - Step 2: Order type must be selected.
   - Step 3: If delivery, address must be selected.
   - Step 4: Payment mode must be selected.

**function implementation:**
```tsx
  const validateTabNavigation = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (!targetTab) return false;
    
    // Can always go back
    if (targetTab.step < currentStep) return true;
    
    // Forwards validation
    if (currentStep === 1) return !!form.location;
    if (currentStep === 2) return !!form.type;
    if (currentStep === 3) {
      if (form.type === 'delivery') return !!form.addressId;
      return true;
    }
    if (currentStep === 4) return !!form.paymentPreference.mode;
    
    return true;
  };
```

### `handleTabChange()`
**purpose:** Handle tab navigation changes. Updates the active tab and current step if navigation is valid.

**process:**
1. Validates the target tab using `validateTabNavigation()`.
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
**purpose:** Advances the wizard to the next logical step.

**process:**
1. Finds the current step index.
2. Identifies the next step.
3. Skips the "Address" tab if the order type is "pickup".
4. Updates `activeTab` and `currentStep`.
5. Clears any existing `inlineError`.

**function implementation:**
```tsx
  const goToNextStep = () => {
    const currentIndex = TABS.findIndex(t => t.key === activeTab);
    if (currentIndex < TABS.length - 1) {
      const nextTab = TABS[currentIndex + 1];
      if (validateTabNavigation(nextTab.key)) {
        // Skip address tab if not delivery
        if (nextTab.key === 'address' && form.type !== 'delivery') {
            setActiveTab('payment');
            setCurrentStep(4);
        } else {
            setActiveTab(nextTab.key);
            setCurrentStep(nextTab.step);
        }
        setInlineError(null);
      } else {
        setInlineError('Please complete the current step to continue.');
      }
    }
  };
```

### `goToPrevStep()`
**purpose:** Navigates the wizard to the previous step.

**process:**
1. Finds the current step index.
2. Identifies the previous step.
3. Skips the "Address" tab if the order type is "pickup".
4. Updates `activeTab` and `currentStep`.
5. Clears any existing `inlineError`.

**function implementation:**
```tsx
  const goToPrevStep = () => {
    const currentIndex = TABS.findIndex(t => t.key === activeTab);
    if (currentIndex > 0) {
      const prevTab = TABS[currentIndex - 1];
      // Skip address tab if not delivery when going back
      if (prevTab.key === 'address' && form.type !== 'delivery') {
          setActiveTab('type');
          setCurrentStep(2);
      } else {
          setActiveTab(prevTab.key);
          setCurrentStep(prevTab.step);
      }
      setInlineError(null);
    }
  };
```

### `handleSubmit()`
**purpose:** Finalizes the checkout process by calling the create order mutation.

**process:**
1. Validates that the user is on the summary tab.
2. Clears previous errors.
3. Validates required vendor/branch information.
4. Calls `createOrder.mutateAsync` with the aggregated form data.
5. Redirects to the payment page if an `invoiceId` is returned, otherwise to the dashboard.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'summary') return;
    
    setInlineError(null);

    if (!vendorId || !branchId) {
        setInlineError('Missing vendor or branch information.');
        return;
    }

    try {
      const res = await createOrder.mutateAsync({
        vendorId,
        branchId,
        location: form.location,
        type: form.type,
        addressId: form.type === 'delivery' ? form.addressId : undefined,
        paymentPreference: form.paymentPreference
      });
      
      if (res?.invoiceId) {
        navigate(`/payment/${res.invoiceId}/${form.paymentPreference.phone}/${res.orderId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to place order');
    }
  }, [form, vendorId, branchId, createOrder, navigate, activeTab]);
```

## API Integration

### `GET /api/cart`

#### API
```typescript
export const cartAPI = {
  // Fetch current user's cart
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
`data.data` contains `{ cart: { cartGroups: [...] } }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "cart": {
      "cartGroups": [
        {
          "vendorId": { "_id": "...", "name": "..." },
          "branchId": { "_id": "...", "name": "..." },
          "items": [...],
          "groupSubtotal": 1200
        }
      ]
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/addresses`

#### API
```typescript
export const addressAPI = {
  // Get all user addresses
  getUserAddresses: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/api/addresses', { params }),
};
```

#### Hook
```typescript
export const useGetUserAddresses = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['addresses', params],
    queryFn: async () => {
      const response = await addressAPI.getUserAddresses(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ addresses: [...] }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "_id": "...",
        "name": "Home",
        "address": "123 Street",
        "isDefault": true
      }
    ]
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `POST /api/orders`

#### Interface
```typescript
export interface CreateOrderPayload {
  vendorId: string;
  branchId: string;
  location: 'in_shop' | 'away';
  type: 'pickup' | 'delivery';
  addressId?: string;
  paymentPreference: {
    mode: 'post_to_bill' | 'pay_now' | 'cash' | 'cod';
    method?: 'mpesa_stk';
    phone: string;
  };
}
```

#### API
```typescript
export const orderAPI = {
  // Create a new order from cart
  createOrder: (orderData: CreateOrderPayload) => api.post('/api/orders', orderData),
};
```

#### Hook
```typescript
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderPayload) => {
      const response = await orderAPI.createOrder(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      console.log('Order created successfully');
    },
    onError: (error: any) => console.error('Error creating order:', error),
  });
};
```

#### Contract
Returns order details on success, including an `orderId` and optional `invoiceId`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "orderId": "650af1234567890abcdef123",
    "invoiceId": "INV-12345",
    "status": "pending"
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Progress Header:** Displays current step name, number, and a visual progress bar.
- **Wizard Content:** Animated `fadeIn` sections for each step:
    - **Location/Type:** Card-based selection with icons.
    - **Address:** List of saved addresses with selection indicators.
    - **Payment:** Mode selection and M-Pesa phone number input.
    - **Summary:** Categorized review sections (Items, Location, Type, Payment, Address) and a price breakdown.
- **Sticky Footer:** Navigation buttons (Back/Cancel and Continue/Complete Order).

## Form Inputs

### `Location Selection`
**Purpose**: Where the user is placing the order from (In-Shop or Away).
**Applicable**: Uses `HiOutlineShoppingBag` and `HiOutlineLocationMarker` icons.

**Input implementation**:
```tsx
{[
  { id: 'in_shop', label: 'In-Shop', icon: HiOutlineShoppingBag, desc: 'Ordering while at the branch' },
  { id: 'away', label: 'Away', icon: HiOutlineLocationMarker, desc: 'Ordering from home or office' }
].map((loc) => (
  <button
    key={loc.id}
    type="button"
    onClick={() => setForm({ ...form, location: loc.id as any })}
    className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${
      form.location === loc.id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/20'
    }`}
  >
    <div className={`p-3 rounded-2xl ${form.location === loc.id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
      <loc.icon size={24} />
    </div>
    <div>
      <h3 className="font-bold text-gray-900">{loc.label}</h3>
      <p className="text-xs text-gray-500 mt-1">{loc.desc}</p>
    </div>
  </button>
))}
```

### `Order Type Selection`
**Purpose**: How the user would like to receive the order (Pick Up or Delivery).
**Applicable**: Uses `HiOutlineShoppingBag` and `HiOutlineTruck` icons.

**Input implementation**:
```tsx
{[
  { id: 'pickup', label: 'Pick Up', icon: HiOutlineShoppingBag, desc: 'I will collect it myself' },
  { id: 'delivery', label: 'Delivery', icon: HiOutlineTruck, desc: 'Have it delivered to my location' }
].map((t) => (
  <button
    key={t.id}
    type="button"
    onClick={() => setForm({ ...form, type: t.id as any })}
    className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${
      form.type === t.id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/20'
    }`}
  >
    <div className={`p-3 rounded-2xl ${form.type === t.id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
      <t.icon size={24} />
    </div>
    <div>
      <h3 className="font-bold text-gray-900">{t.label}</h3>
      <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
    </div>
  </button>
))}
```

### `Address Selection`
**Purpose**: Selection of a delivery address from the user's saved locations.
**Applicable**: Uses `HiOutlineLocationMarker` icon and `HiCheck` for selection indicator.

**Input implementation**:
```tsx
addressesData.addresses.map((addr: any) => (
  <button
    key={addr._id}
    type="button"
    onClick={() => setForm({ ...form, addressId: addr._id })}
    className={`p-5 rounded-3xl border-2 transition-all text-left flex items-center gap-4 ${
      form.addressId === addr._id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/20'
    }`}
  >
    <div className={`p-3 rounded-2xl ${form.addressId === addr._id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
      <HiOutlineLocationMarker size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-gray-900 truncate">{addr.name}</h3>
      <p className="text-xs text-gray-500 truncate">{addr.address}</p>
    </div>
    {form.addressId === addr._id && <HiCheck className="text-brand-primary" size={24} />}
  </button>
))
```

### `Payment Mode Selection`
**Purpose**: Choosing the preferred payment method (Pay Now via M-Pesa or Post to Bill).
**Applicable**: Uses `HiOutlineCreditCard` and `HiOutlineTicket` icons.

**Input implementation**:
```tsx
{[
  { id: 'pay_now', label: 'Pay Now', icon: HiOutlineCreditCard, desc: 'Online payment (M-Pesa)' },
  { id: 'post_to_bill', label: 'Post to Bill', icon: HiOutlineTicket, desc: 'Add to your existing bill' }
].map((p) => (
  <button
    key={p.id}
    type="button"
    onClick={() => setForm({ ...form, paymentPreference: { 
      ...form.paymentPreference,
      mode: p.id as any, 
      method: p.id === 'pay_now' ? 'mpesa_stk' : undefined 
    } })}
    className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${
      form.paymentPreference.mode === p.id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/20'
    }`}
  >
    <div className={`p-3 rounded-2xl ${form.paymentPreference.mode === p.id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
      <p.icon size={24} />
    </div>
    <div>
      <h3 className="font-bold text-gray-900">{p.label}</h3>
      <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
    </div>
  </button>
))}
```

### `M-Pesa Phone Number Input`
**Purpose**: Collects the phone number for M-Pesa STK push.
**Applicable**: Shown only when 'Pay Now' is selected.

**Input implementation**:
```tsx
<input 
    type="text"
    value={form.paymentPreference.phone}
    onChange={(e) => setForm({...form, paymentPreference: { ...form.paymentPreference, phone: e.target.value }})}
    className="input text-xs mt-1 w-full"
    placeholder="Enter phone number..."
/>
```

## Error Handling
- **Navigation Validation:** Prevents moving forward if required data is missing, showing an `inlineError`.
- **API Error Handling:** `handleSubmit` catches mutation errors and displays the message from `err?.response?.data?.message` in the `inlineError` banner.
- **Empty States:** Displays a placeholder and "Add New Address" button if no addresses are found for delivery orders.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Back to Cart                                             │
├──────────────────────────────────────────────────────────┤
│ Checkout Title                      Step X of 5          │
├──────────────────────────────────────────────────────────┤
│ [ Step Header: 1 Location ] [ Progress Bar =========== ] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              Selection Content Area                      │
│        (Location / Type / Address / Payment)             │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ [ Cancel/Previous ]                         [ Continue ] │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ < Back to Cart                                                                        │
│                                                                                       │
│ Checkout                                                             Step 1 of 5      │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │  (1) LOCATION  ------------------------------------------------------------------ │ │
│ │  [====================================                                          ] │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│  Where are you placing this order from?                                               │
│                                                                                       │
│  ┌──────────────────────────────┐      ┌──────────────────────────────┐               │
│  │ 🏠 In-Shop                   │      │ 📍 Away                      │               │
│  │ Ordering while at the branch │      │ Ordering from home or office │               │
│  └──────────────────────────────┘      └──────────────────────────────┘               │
│                                                                                       │
│  ───────────────────────────────────────────────────────────────────────────────────  │
│  [ Cancel ]                                                              [ Continue ] │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- **Route:** `/cart/checkout?vendorId=...&branchId=...`
- **Back Button:** Returns to `/cart`.
- **Success (Payment):** Redirects to `/payment/:invoiceId/:phone/:orderId`.
- **Success (Non-Payment):** Redirects to `/dashboard`.

## Future Enhancements
- Integration of a map for precise delivery location pinning.
- Support for coupon/discount code application within the summary step.
- Detailed packaging fee calculation.
- Support for more payment methods (Card, Cash on Delivery).
