# Create Product Documentation

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
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineClipboardCheck, 
  HiOutlinePencilAlt,
  HiOutlineSearch,
  HiOutlineExclamation,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineDuplicate,
  HiOutlineAdjustments,
  HiOutlineTrash,
  HiOutlinePhotograph
} from 'react-icons/hi';
import { useCreateProduct } from '../../../tanstack/useProducts';
import { useGetProductCategories } from '../../../tanstack/useProductCategories';
import { useGetProductVariants } from '../../../tanstack/useProductVariants';
import { useGetProductModifiers } from '../../../tanstack/useProductModifiers';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IProductCategory, IVariant, IProductModifier } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useCreateProduct`
- **Hook usage:** `const createProduct = useCreateProduct();`
- **Purpose:** Mutation hook to create a new product. Handles `FormData` for image uploads and JSON data.

#### `useGetProductCategories`
- **Hook usage:** `const { data: categoriesData, isLoading: isSearchingCategories } = useGetProductCategories({ search: debouncedCategorySearchQuery });`
- **Purpose:** Fetches product categories with search support.

#### `useGetProductVariants`
- **Hook usage:** `const { data: variantsData } = useGetProductVariants({});`
- **Purpose:** Fetches all available product variants for selection.

#### `useGetProductModifiers`
- **Hook usage:** `const { data: modifiersData } = useGetProductModifiers();`
- **Purpose:** Fetches all available product modifiers for selection.

### Local Component State

#### `activeTab` & `currentStep`
- **Purpose:** Manages the multi-step wizard navigation.
```tsx
const [activeTab, setActiveTab] = useState('basic');
const [currentStep, setCurrentStep] = useState(1);
```

#### `form`
- **Purpose:** Holds the entire product creation data including variants, modifiers, and images.
```tsx
const [form, setForm] = useState({
  name: '',
  details: '',
  category: '',
  price: 0,
  offerPrice: 0,
  status: true,
  variants: [] as string[],
  modifiers: [] as string[],
  selectedVariantOptions: [] as { variantId: string; optionId: string }[],
  selectedModifierOptions: [] as { modifierId: string; optionId: string }[],
  images: [] as File[],
});
```

#### `previewUrls`
- **Purpose:** Stores local URLs for image previews before upload.
```tsx
const [previewUrls, setPreviewUrls] = useState<string[]>([]);
```

#### `categorySearchQuery` & `debouncedCategorySearchQuery`
- **Purpose:** Manages category search input and its debounced value for API calls.
```tsx
const [categorySearchQuery, setCategorySearchQuery] = useState('');
const [debouncedCategorySearchQuery, setDebouncedCategorySearchQuery] = useState('');
```

## Functions Involved

### `toggleVariantOption()`
**purpose:** Manages selection of variant options. Automatically updates the parent `variants` array based on selection.

**process:**
1. Checks if option is already selected.
2. Updates `selectedVariantOptions` by adding or removing the option.
3. Updates `variants` array: ensures the `variantId` is present if any of its options are selected, or removed if none are.

**function implementation:**
```tsx
  const toggleVariantOption = (variantId: string, optionId: string) => {
    setForm(prev => {
      const isSelected = prev.selectedVariantOptions.some(
        so => so.variantId === variantId && so.optionId === optionId
      );
      
      let nextSelectedOptions;
      if (isSelected) {
        nextSelectedOptions = prev.selectedVariantOptions.filter(
          so => !(so.variantId === variantId && so.optionId === optionId)
        );
      } else {
        nextSelectedOptions = [...prev.selectedVariantOptions, { variantId, optionId }];
      }

      const hasOptionsSelected = nextSelectedOptions.some(so => so.variantId === variantId);
      let nextVariants = prev.variants;
      if (hasOptionsSelected && !prev.variants.includes(variantId)) {
        nextVariants = [...prev.variants, variantId];
      } else if (!hasOptionsSelected && prev.variants.includes(variantId)) {
        nextVariants = prev.variants.filter(id => id !== variantId);
      }

      return { ...prev, selectedVariantOptions: nextSelectedOptions, variants: nextVariants };
    });
  };
```

### `validateTabNavigation()`
**purpose:** Ensures required fields are completed before allowing navigation to the next step.

**process:**
1. Checks the target tab's step vs current step (backward navigation is always allowed).
2. For Step 1 (Basic), requires `name`.
3. For Step 2 (Category), requires `category`.

**function implementation:**
```tsx
  const validateTabNavigation = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (!targetTab) return false;
    if (targetTab.step < currentStep) return true;
    
    if (currentStep === 1) return !!form.name;
    if (currentStep === 2) return !!form.category;
    
    return true;
  };
```

### `handleSubmit()`
**purpose:** Final submission of the product data to the API.

**process:**
1. Validates that the user is on the 'summary' tab.
2. Constructs a `FormData` object to include both JSON-like fields and image files.
3. Appends all form fields, stringifying complex arrays (variants, modifiers, options).
4. Calls the `createProduct.mutateAsync` mutation.
5. Navigates to `/products` on success.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async () => {
    if (activeTab !== 'summary') return;
    setInlineError(null);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('details', form.details);
    formData.append('category', form.category);
    formData.append('price', String(form.price));
    formData.append('offerPrice', String(form.offerPrice));
    formData.append('status', String(form.status));
    formData.append('variants', JSON.stringify(form.variants));
    formData.append('modifiers', JSON.stringify(form.modifiers));
    formData.append('selectedVariantOptions', JSON.stringify(form.selectedVariantOptions));
    formData.append('selectedModifierOptions', JSON.stringify(form.selectedModifierOptions));
    form.images.forEach(image => formData.append('images', image));

    try {
      await createProduct.mutateAsync(formData);
      navigate('/products');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to create product');
    }
  }, [form, createProduct, navigate, activeTab]);
```

## API Integration

### `POST /api/products`

#### Interface
```typescript
export interface CreateProductPayload {
  name: string;
  details?: string;
  price: number;
  offerPrice?: number;
  category: string;
  vendor: string;
  branch: string;
  service: string;
  variants?: string[];
  selectedVariantOptions?: any[];
  modifiers?: string[];
  selectedModifierOptions?: any[];
  status?: boolean;
  trackInventory?: boolean;
  duration?: string;
  buffertime?: string;
}
```

#### API
```typescript
export const productAPI = {
  createProduct: (productData: CreateProductPayload | FormData) =>
    productData instanceof FormData
      ? api.post('/api/products', productData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/products', productData),
};
```

#### Hook
```typescript
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductPayload | FormData) => {
      const response = await productAPI.createProduct(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => console.error('Error creating product:', error),
  });
};
```

#### Contract
Expects `FormData` when images are included. JSON fields are parsed on the backend. Stringified arrays are used for complex objects.

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "650af1234567890abcdef123",
    "name": "New Product",
    "slug": "new-product",
    "price": 100,
    "status": true
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/product-categories`

#### Interface
```typescript
export interface GetProductCategoriesParams extends PaginationParams {
  search?: string;
}
```

#### API
```typescript
export const productCategoryAPI = {
  getProductCategories: (params?: GetProductCategoriesParams) => api.get('/api/product-categories', { params }),
};
```

#### Hook
```typescript
export const useGetProductCategories = (params?: GetProductCategoriesParams) => {
  return useQuery({
    queryKey: ['productCategories', params],
    queryFn: async () => {
      const response = await productCategoryAPI.getProductCategories(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ categories, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "650af1234567890abcdef123",
        "name": "Electronics",
        "slug": "electronics",
        "isActive": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCategories": 1
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/variants`

#### Interface
```typescript
export interface GetProductVariantsParams extends PaginationParams {
  search?: string;
}
```

#### API
```typescript
export const variantAPI = {
  getVariants: (params?: GetProductVariantsParams) => api.get('/api/variants', { params }),
};
```

#### Hook
```typescript
export const useGetProductVariants = (params?: GetProductVariantsParams) => {
  return useQuery({
    queryKey: ['productVariants', params],
    queryFn: async () => {
      const response = await variantAPI.getVariants(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ variants, pagination }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "variants": [
      {
        "_id": "650af1234567890abcdef123",
        "name": "Size",
        "options": [
          { "_id": "opt1", "name": "Large", "price": 10 }
        ]
      }
    ]
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `GET /api/product-modifiers`

#### Interface
```typescript
// No specific params required for standard list
```

#### API
```typescript
export const productModifierAPI = {
  getProductModifiers: () => api.get('/api/product-modifiers'),
};
```

#### Hook
```typescript
export const useGetProductModifiers = () => {
  return useQuery({
    queryKey: ['productModifiers'],
    queryFn: async () => {
      const response = await productModifierAPI.getProductModifiers();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

#### Contract
`data.data` contains `{ modifiers }`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "modifiers": [
      {
        "_id": "650af1234567890abcdef123",
        "name": "Add-ons",
        "options": [
          { "_id": "opt2", "name": "Extra Topping", "price": 5 }
        ]
      }
    ]
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Centered max-width container (`max-w-5xl`).
- **Navigation Header:** Back button and page title with current step indicator.
- **Wizard Header:** Progress bar with step bubbles (completed, active, inactive states).
- **Form Content:** Dynamic area rendering content based on `activeTab`.
- **Wizard Footer:** Persistent navigation buttons (Cancel/Previous and Continue/Create).
- **Transitions:** `animate-fadeIn` and `animate-shake` (for errors) classes used for smooth UX.

## Form Inputs

### `Product Name`
**Purpose**: Primary name of the product. Required.
**Applicable**: Basic Info tab.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={form.name} 
  onChange={e => setForm({...form, name: e.target.value})} 
  className="input" 
  placeholder="Enter product name" 
  required 
/>
```

### `Category Search`
**Purpose**: Dynamic search and selection of product categories.
**Applicable**: Category tab. Includes loading indicator and search icon.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={categorySearchQuery} 
  onChange={e => setCategorySearchQuery(e.target.value)} 
  className="input pr-10" 
  placeholder="Type to search category..." 
/>
```

### `Price Inputs`
**Purpose**: Defines regular and promotional pricing.
**Applicable**: Prices & Status tab.

**Input implementation**:
```tsx
<input 
  type="number" 
  value={form.price} 
  onChange={e => setForm({...form, price: Number(e.target.value)})} 
  className="input" 
/>
```

### `Status Toggle`
**Purpose**: Enables or disables the product visibility.
**Applicable**: Prices & Status tab. Uses a custom toggle UI.

**Input implementation**:
```tsx
<input 
  type="checkbox" 
  checked={form.status} 
  onChange={e => setForm({...form, status: e.target.checked})} 
  className="sr-only peer" 
/>
```

### `Image Gallery Upload`
**Purpose**: Multiple file selection for product images.
**Applicable**: Images tab. Supports image file types.

**Input implementation**:
```tsx
<input 
  type="file" 
  multiple 
  onChange={handleImageChange} 
  accept="image/*" 
  className="absolute inset-0 opacity-0 cursor-pointer" 
/>
```

## Error Handling
- **Inline Error Banner:** Displays a red alert box at the top of the form area if validation fails or API returns an error.
- **Validation Blocks:** Prevents moving to the next step if required fields (name, category) are missing.
- **API Errors:** Catches `err?.response?.data?.message` during submission and sets it to the `inlineError` state.
- **Feedback:** Mutation `isPending` state disables the submit button and shows "Processing..." to prevent duplicate submissions.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Back to Products                                         │
├──────────────────────────────────────────────────────────┤
│ Create New Product                         Step X of 7   │
├──────────────────────────────────────────────────────────┤
│ [Progress Bar: ◯──◯──◯──◯──◯──◯──◯]                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│           (Dynamic Tab Content Area)                     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ [ Cancel / Previous ]              [ Continue / Create ] │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ < Back to Products                                                                    │
│                                                                                       │
│ Create New Product                                                       Step 1 of 7  │
│                                                                                       │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 1 Basic Info ◯──◯──◯──◯──◯──◯                                                     │ │
│ │ ───────────────────────────────────────────────────────────────────────────────── │ │
│ │                                                                                   │ │
│ │ Product Name *                                                                    │ │
│ │ [ Enter product name...                       ]                                   │ │
│ │                                                                                   │ │
│ │ Details                                                                           │ │
│ │ [ Enter product details...                    ]                                   │ │
│ │ [                                             ]                                   │ │
│ │                                                                                   │ │
│ │ ───────────────────────────────────────────────────────────────────────────────── │ │
│ │ [ Cancel ]                                                           [ Continue ] │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/products/new`
- Success Redirect: `/products`
- Cancel Navigation: `/products`

## Future Enhancements
- **SKU Management:** Integrate a step for defining detailed SKUs (stock, weight, codes).
- **Inventory Tracking:** Add more granular controls for low-stock thresholds and pre-orders.
- **Drag-and-Drop Images:** Enhance the gallery with drag-and-drop reordering.
- **Draft Saving:** Allow users to save a draft of the product creation wizard.
