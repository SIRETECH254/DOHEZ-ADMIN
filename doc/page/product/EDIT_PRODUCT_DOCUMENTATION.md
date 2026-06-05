# Edit Product Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Form Logic](#form-logic)
- [Data Initialization](#data-initialization)
- [API Integration](#api-integration)

## Imports
```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt, MdRemove } from 'react-icons/md';
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
import { useGetProductById, useUpdateProduct } from '../../../tanstack/useProducts';
import { useGetProductCategories } from '../../../tanstack/useProductCategories';
import { useGetProductVariants } from '../../../tanstack/useProductVariants';
import { useGetProductModifiers } from '../../../tanstack/useProductModifiers';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IProductCategory, IVariant, IProductModifier, IProduct } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetProductById`
- **Hook usage:** `const { data: productData, isLoading } = useGetProductById(id);`
- **Purpose:** Fetches the product details for editing.

#### `useUpdateProduct`
- **Hook usage:** `const updateProduct = useUpdateProduct();`
- **Purpose:** Mutation hook to update the product.

#### `useGetProductCategories`
- **Hook usage:** `const { data: categories } = useGetProductCategories();`
- **Purpose:** Fetches available product categories for the form dropdowns.

#### `useGetProductVariants`
- **Hook usage:** `const { data: variants } = useGetProductVariants();`
- **Purpose:** Fetches available product variants.

#### `useGetProductModifiers`
- **Hook usage:** `const { data: modifiers } = useGetProductModifiers();`
- **Purpose:** Fetches available product modifiers.

### Local Component State

#### `form`
- **Purpose:** Holds the product form data.
```tsx
const [form, setForm] = useState<IProduct>(initialState);
```

#### `existingImages`
- **Purpose:** Tracks images already associated with the product (to handle deletion).
```tsx
const [existingImages, setExistingImages] = useState<string[]>([]);
```

#### `previewUrls`
- **Purpose:** Tracks newly uploaded images.
```tsx
const [previewUrls, setPreviewUrls] = useState<string[]>([]);
```

## Functions Involved

### `useEffect` (Initialization)
**purpose:** Populates the `form` state with product details upon loading.

**process:**
1. Checks if `product` data is available.
2. Flattens variant and modifier option IDs.
3. Sets `form` state and `existingImages`.

**function implementation:**
```tsx
  useEffect(() => {
    if (product) {
      const selectedVariantOptions = product.selectedVariantOptions?.flatMap((sv: any) => 
        (sv.optionIds || []).map((optionId: string) => ({
          variantId: typeof sv.variantId === 'string' ? sv.variantId : (sv.variantId as any)?._id,
          optionId: optionId
        }))
      ) || [];

      const selectedModifierOptions = product.selectedModifierOptions?.flatMap((sm: any) => 
        (sm.optionIds || []).map((optionId: string) => ({
          modifierId: typeof sm.modifierId === 'string' ? sm.modifierId : (sm.modifierId as any)?._id,
          optionId: optionId
        }))
      ) || [];

      const variants = Array.from(new Set(selectedVariantOptions.map(so => so.variantId)));
      const modifiers = Array.from(new Set(selectedModifierOptions.map(so => so.modifierId)));

      setForm({
        name: product.name || '',
        details: product.details || '',
        category: typeof product.category === 'string' ? product.category : (product.category as IProductCategory)?._id || '',
        price: product.price || 0,
        offerPrice: product.offerPrice || 0,
        status: product.status,
        variants,
        modifiers,
        selectedVariantOptions,
        selectedModifierOptions,
        images: [],
      });
      setImages(product.images || []);
    }
  }, [product]);
```

### `toggleVariantOption()`
**purpose:** Toggles the selection status of a variant option.

**process:**
1. Checks if the option is already selected.
2. Adds or removes the option from `selectedVariantOptions`.
3. Updates the `variants` ID list based on selections.

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

      return {
        ...prev,
        selectedVariantOptions: nextSelectedOptions,
        variants: nextVariants
      };
    });
  };
```

### `handleImageChange()`
**purpose:** Adds new images to the product gallery state.

**process:**
1. Takes the file input.
2. Updates `form.images` and generates preview URLs.

**function implementation:**
```tsx
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setForm(prev => ({ ...prev, images: [...prev.images, ...files] }));
      const newUrls = files.map(f => URL.createObjectURL(f));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };
```

### `removeImage()`
**purpose:** Removes an image from the gallery (either existing or new).

**process:**
1. Identifies if the image is existing or new.
2. Filters out the selected image from the appropriate state.

**function implementation:**
```tsx
  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    }
  };
```

### `handleSubmit()`
**purpose:** Submits the updated product form data to the server.

**process:**
1. Validates the active tab is 'summary'.
2. Prepares `FormData` with all form fields, variants, modifiers, and images.
3. Invokes the `updateProduct` mutation and navigates on success.

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
    formData.append('existingImages', JSON.stringify(existingImages));
    form.images.forEach(image => formData.append('images', image));

    try {
      await updateProduct.mutateAsync({ productId: id!, data: formData });
      navigate(`/products/${id}`);
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to update product');
    }
  }, [form, updateProduct, id, navigate, activeTab, existingImages]);
```

## Form Inputs

### `Product Name Input`
**Purpose**: Collects the name of the product.
**Applicable**: Required field for basic info.

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

### `Product Details Textarea`
**Purpose**: Collects detailed description of the product.

**Input implementation**:
```tsx
<textarea 
  value={form.details} 
  onChange={e => setForm({...form, details: e.target.value})} 
  className="input min-h-[120px] py-3" 
  placeholder="Enter product details..." 
/>
```

### `Category Search Input`
**Purpose**: Search and select product category.

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

### `Price & Offer Price Inputs`
**Purpose**: Define pricing for the product.

**Input implementation**:
```tsx
<input 
  type="number" 
  value={form.price} 
  onChange={e => setForm({...form, price: Number(e.target.value)})} 
  className="input" 
  placeholder="0.00" 
  required 
/>
<input 
  type="number" 
  value={form.offerPrice} 
  onChange={e => setForm({...form, offerPrice: Number(e.target.value)})} 
  className="input" 
  placeholder="0.00" 
/>
```

### Status Toggle
**Purpose**: Toggle product active/inactive status.

**Input implementation**:
```tsx
<input 
  type="checkbox" 
  checked={form.status} 
  onChange={e => setForm({...form, status: e.target.checked})} 
  className="sr-only peer" 
/>
```

## UI Structure
- **Container:** Standard padding container with max-width.
- **Header:** Contains "Back to Product Details" link, page title, and step indicator.
- **Progress Bar:** Step-based progress tracker (`currentStep` / `TABS.length`) to guide the user.
- **Form Tabs:** Multi-step navigation tabs (Basic Info, Category, Prices & Status, Variants, Modifiers, Images, Summary).
- **Form Fields:** Varies by active tab, including inputs, textareas, search inputs, toggles, and buttons.
- **Actions:** "Previous" and "Continue"/"Update Product" buttons for navigation and submission.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ [ Back Link ]                                            │
├──────────────────────────────────────────────────────────┤
│ Page Title                                 Step X of Y   │
├──────────────────────────────────────────────────────────┤
│ Progress Tracker & Step Tabs                             │
├──────────────────────────────────────────────────────────┤
│ Form Content (Tab-specific inputs/fields)                │
├──────────────────────────────────────────────────────────┤
│ [ Previous ]                             [ Continue ]    │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Edit Product                                                          Step 2 of 7     │
│                                                                                       │
│ [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ] [ 7 ]                                             │
│ ─────────────────────────────────────────                                             │
│                                                                                       │
│ Category                                                                              │
│ [ 🔍 Search category... ]                                                             │
│                                                                                       │
│ [Selected Category Box]                                                               │
│                                                                                       │
│ [Cat 1] [Cat 2] [Cat 3] [Cat 4]                                                       │
│                                                                                       │
│ [ Previous ]                                                          [ Continue ]    │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## API Integration

### `GET /api/products/:id`

#### API
```typescript
export const productAPI = {
  // Get product by ID
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

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "650af1234567890abcdef123",
      "name": "Sample Product",
      "details": "...",
      "price": 100,
      "status": true
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

---

### `PUT /api/products/:id`

#### API
```typescript
export const productAPI = {
  // Update product (admin)
  updateProduct: (id: string, data: FormData) => api.put(`/api/products/${id}`, data),
};
```

#### Hook
```typescript
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: FormData }) => 
      productAPI.updateProduct(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Product updated"
}
```

#### Error Handling
API returns a message in `response.data.message`.
