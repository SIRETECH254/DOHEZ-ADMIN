# Product Detail Documentation

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
import React, { useState, useMemo ,useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlinePlus, HiOutlineMinus } from 'react-icons/hi';
import { FiAlertTriangle, FiShoppingCart } from 'react-icons/fi';
import { useGetProductById } from '../../../tanstack/useProducts';
import { useAddToCart } from '../../../tanstack/useCart';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IProductCategory, IVariant, IProductModifier, ISelectedVariantOption, ISelectedModifierOption } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetProductById`
- **Hook usage:** `const { data: productData, isLoading, isError, error } = useGetProductById(id!);`
- **Purpose:** Fetches detailed information for a specific product by ID.

#### `useAddToCart`
- **Hook usage:** `const addToCart = useAddToCart();`
- **Purpose:** Mutation hook to add the configured product (with variants, modifiers, and quantity) to the user's cart.

### Local Component State

#### `activeImageIndex`
- **Purpose:** Tracks the index of the image currently displayed in the main gallery view.
```tsx
const [activeImageIndex, setActiveImageIndex] = useState(0);
```

#### `quantity`
- **Purpose:** Tracks the desired quantity of the product to add to the cart.
```tsx
const [quantity, setQuantity] = useState(1);
```

#### `selectedVariants`
- **Purpose:** Stores the map of selected variant option IDs for each variant type.
```tsx
const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
```

#### `selectedModifiers`
- **Purpose:** Stores the map of arrays of selected modifier option IDs for each modifier type.
```tsx
const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
```

### Memoized Parameters

#### `matchedSku`
- **Purpose:** Memoized calculation that matches the user's variant selections against the available product SKUs to determine the correct `skuId` and pricing.
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

## Functions Involved

### `handleVariantSelect()`
**purpose:** Updates the state of selected product variants based on user selection.

**process:**
1. Receives the `variantId` and `optionId`.
2. Updates `selectedVariants` state object with the new selection.

**function implementation:**
```tsx
  const handleVariantSelect = (variantId: string, optionId: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantId]: optionId }));
  };
```

### `handleModifierToggle()`
**purpose:** Manages the selection/deselection of product modifiers while respecting selection limits.

**process:**
1. Checks if the modifier option is already selected.
2. If selected, removes it.
3. If not selected, ensures the total count for this modifier does not exceed the allowed maximum before adding.

**function implementation:**
```tsx
  const handleModifierToggle = (modifierId: string, optionId: string, min: number, max: number) => {
    setSelectedModifiers(prev => {
      const current = prev[modifierId] || [];
      const isSelected = current.includes(optionId);
      
      if (isSelected) {
        return { ...prev, [modifierId]: current.filter(id => id !== optionId) };
      } else {
        if (current.length < max) {
          return { ...prev, [modifierId]: [...current, optionId] };
        }
        return prev;
      }
    });
  };
```

### `handleAddToCart()`
**purpose:** Validates user selection and submits the product configuration to the cart.

**process:**
1. Validates that all required variants are selected.
2. Constructs the `AddToCartPayload` with product, SKU, quantity, variants, and modifiers.
3. Invokes the `addToCart.mutateAsync` mutation.

**function implementation:**
```tsx
  const handleAddToCart = async () => {
    if (!product) return;

    const allVariantsSelected = (product.variants as IVariant[]).every(v => selectedVariants[v._id]);
    if (!allVariantsSelected) {
      alert('Please select all available variants.');
      return;
    }

    const payload = {
      vendorId: typeof product.vendor === 'object' ? product.vendor._id : product.vendor,
      branchId: typeof product.branch === 'object' ? product.branch._id : product.branch,
      productId: product._id,
      skuId: matchedSku?._id || product.skus?.[0]?._id,
      quantity,
      priceAtAddition: matchedSku?.price || (product.offerPrice > 0 ? product.offerPrice : product.price),
      variants: Object.entries(selectedVariants).map(([vId, oId]) => ({ variantId: vId, optionId: oId })),
      modifiers: Object.entries(selectedModifiers).flatMap(([mId, options]) => 
        options.map(oId => ({ modifierId: mId, optionId: oId }))
      )
    };

    try {
      await addToCart.mutateAsync(payload as any);
    } catch (err) {
      console.error('Failed to add to cart', err);
    }
  };
```

## API Integration

### `GET /api/products/:productId`

#### API
```typescript
export const productAPI = {
  getProductById: (productId: string) => api.get(`/api/products/${productId}`),
};
```

#### Hook
```typescript
export const useGetProductById = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await productAPI.getProductById(productId);
      return response.data.data;
    },
    enabled: !!productId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ product }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "650af1234567890abcdef123",
      "name": "Classic Burger",
      "price": 15.00,
      "offerPrice": 12.00,
      "status": true,
      "images": [{"url": "...", "publicId": "..."}],
      "variants": [...],
      "modifiers": [...],
      "skus": [...]
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `POST /api/cart/add`

#### Interface
```typescript
export interface AddToCartPayload {
  vendorId: string;
  branchId: string;
  productId: string;
  skuId: string;
  quantity: number;
  priceAtAddition: number;
  variants?: Array<{ variantId: string; optionId: string }>;
  modifiers?: Array<{ modifierId: string; optionId: string }>;
}
```

#### API
```typescript
export const cartAPI = {
  addToCart: (itemData: AddToCartPayload) => api.post('/api/cart/add', itemData),
};
```

#### Hook
```typescript
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddToCartPayload) => {
      const response = await cartAPI.addToCart(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
```

#### Contract
Returns the updated cart object on success.

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Centered max-width container (`max-w-7xl`).
- **Header:** Back button and product name with category badge.
- **Gallery (Left):** Large main image with a horizontal thumbnail list below.
- **Info Area (Right):** Pricing (with discount display), status badge, and product description.
- **Config Section:** Iterative lists for variants and modifiers with selectable pill buttons.
- **Action Area:** Sticky/persistent quantity controls and full-width "Add to Cart" button.

## Form Inputs

### `Variant Options`
**Purpose**: Mutually exclusive selection of product options (e.g., Size, Color).
**Applicable**: Selection triggers `handleVariantSelect`.

**Input implementation**:
```tsx
<button
  onClick={() => handleVariantSelect(v._id, opt._id)}
  className={`px-4 py-2 rounded-xl border ${
    selectedVariants[v._id] === opt._id ? 'bg-brand-primary text-white' : 'bg-white'
  }`}
>
  {opt.value || opt.name}
</button>
```

### `Modifier Options`
**Purpose**: Multiple selection of optional add-ons (e.g., Extra Cheese).
**Applicable**: Selection triggers `handleModifierToggle`.

**Input implementation**:
```tsx
<button
  onClick={() => handleModifierToggle(m._id, opt._id, m.minSelection, m.maxSelection)}
  className={`px-4 py-2 rounded-xl border ${
    isSelected ? 'bg-brand-primary/10 border-brand-primary' : 'bg-white'
  }`}
>
  {opt.value || opt.name}
</button>
```

### `Quantity Selector`
**Purpose**: Adjusts the number of units to be added to the cart.
**Applicable**: Increments/decrements the `quantity` state.

**Input implementation**:
```tsx
<button onClick={() => setQuantity(prev => Math.max(1, prev - 1))}> - </button>
<span>{quantity}</span>
<button onClick={() => setQuantity(prev => prev + 1)}> + </button>
```

## Error Handling
- **Skeleton State:** Displays an `animate-pulse` layout during data fetching.
- **Error Banner:** Shows a centered alert with `FiAlertTriangle` and an error message if the API call fails.
- **Form Validation:** Simple `alert` if the user attempts to add to cart without selecting required variants.
- **Mutation Feedback:** The "Add to Cart" button shows a loading state and is disabled while the mutation is pending.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ < Back to Products                          [ Edit ]     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────┐   ┌─────────────────────────┐  │
│  │                      │   │ Product Name            │  │
│  │                      │   │ [ Category ]            │  │
│  │     Main Image       │   │                         │  │
│  │                      │   │ Price: $XX.XX [Active]  │  │
│  │                      │   │                         │  │
│  └──────────────────────┘   │ Description Box         │  │
│                             │                         │  │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐        │ Variants Section        │  │
│  └──┘ └─-┘ └─-┘ └─-┘        │ Modifiers Section       │  │
│                             │                         │  │
│                             │ [ - ] [ Qty ] [ + ]     │  │
│                             │ [     Add to Cart     ] │  │
│                             └─────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ < Back to Products                                                 [ ✎ Edit Product ] │
│                                                                                       │
│ ┌───────────────────────────────────────┐   ┌───────────────────────────────────────┐ │
│ │            LEFT: GALLERY              │   │            RIGHT: PRODUCT INFO        │ │
│ │                                       │   │                                       │ │
│ │  ┌─────────────────────────────────┐  │   │  NAME: Gourmet Pizza                  │ │
│ │  │                                 │  │   │  CATEGORY: Main Course                │ │
│ │  │                                 │  │   │                                       │ │
│ │  │           MAIN IMAGE            │  │   │  PRICE: $12.00  $15.00 [ ACTIVE ]     │ │
│ │  │         (Selected View)         │  │   │                                       │ │
│ │  │                                 │  │   │  DETAILS:                             │ │
│ │  └─────────────────────────────────┘  │   │  Freshly baked sourdough crust with   │ │
│ │                                       │   │  organic tomatoes and basil.          │ │
│ │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │   │                                       │ │
│ │  │ THUM │ │ THUM │ │ THUM │ │ THUM │  │   │  VARIANTS:                            │ │
│ │  └──────┘ └──────┘ └──────┘ └──────┘  │   │  Size: (Small) (Medium) (Large)       │ │
│ │    (Selectable Thumbnails)            │   │                                       │ │
│ │                                       │   │  MODIFIERS:                           │ │
│ └───────────────────────────────────────┘   │  [ ] Extra Cheese (+$1.50)            │ │
│                                             │  [ ] Olives (+$0.50)                  │ │
│                                             │                                       │ │
│                                             │  QUANTITY:                            │ │
│                                             │  [ - ]  [ 1 ]  [ + ]                  │ │
│                                             │                                       │ │
│                                             │  ┌─────────────────────────────────┐  │
│                                             │  │           ADD TO CART           │  │
│                                             │  └─────────────────────────────────┘  │
│                                             └───────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/products/:id`
- Back Button -> `/products`
- Edit Button -> `/products/:id/edit`
- Add to Cart -> Updates header badge, stays on page.

## Future Enhancements
- Integrate a review/rating section for customers.
- Add "Related Products" or "Frequently Bought Together" carousel.
- Implement deep-linking for specific variant combinations.
- Enhance the gallery with zoom-on-hover functionality.
