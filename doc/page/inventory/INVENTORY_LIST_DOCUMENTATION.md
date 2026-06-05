# Inventory List Documentation

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
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { FiSearch, FiList, FiAlertTriangle, FiChevronDown, FiChevronUp, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { useGetProducts, useUpdateProductSKU } from '../../../tanstack/useProducts';
import { useGetProductVariants } from '../../../tanstack/useProductVariants';
import Pagination from '../../../components/ui/Pagination';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IProduct, ISKU, IVariant } from '../../../types/api.types';
import { getInitials } from '../../../utils';
```

## Context and State Management

### TanStack Query

#### `useGetProducts`
- **Hook usage:** `const { data, isLoading, isError, error } = useGetProducts(params);`
- **Purpose:** Fetches the list of products based on search and pagination states.

#### `useUpdateProductSKU`
- **Hook usage:** `const updateSkuMutation = useUpdateProductSKU();`
- **Purpose:** Mutation hook to update specific SKU details (price, stock, etc.).

### Local Component State

#### `searchTerm` & `debouncedSearch`
- **Purpose:** Manages the product search input with debouncing to limit API calls.

#### `currentPage` & `itemsPerPage`
- **Purpose:** Manages pagination controls.

#### `expandedRows`
- **Purpose:** Tracks which products are expanded to show detailed SKU lists.

#### `isModalOpen`, `selectedProduct`, `selectedSku`, `skuForm`
- **Purpose:** Manages the SKU management modal visibility and the data being edited in the form.

### Memoized Parameters

#### `params`
- **Purpose:** Memoizes search, page, and limit parameters to trigger API refetches only when necessary.

## Functions Involved

### `toggleRow()`
**purpose:** Toggles the expanded/collapsed state of a product row in the table.

**process:**
1. Receives the `productId` to toggle.
2. Updates `expandedRows` state to flip the boolean value for that product.

**function implementation:**
```tsx
  const toggleRow = (productId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
```

### `calculateTotalStock()`
**purpose:** Aggregates stock levels from all SKUs belonging to a product.

**process:**
1. Iterates through the `product.skus` array.
2. Sums the `stock` property of each SKU.

**function implementation:**
```tsx
  const calculateTotalStock = (product: IProduct) => {
    return product.skus?.reduce((acc, sku) => acc + (sku.stock || 0), 0) || 0;
  };
```

### `formatAttributes()`
**purpose:** Generates a human-readable string for SKU attributes by mapping IDs to variant option names.

**process:**
1. Checks for empty attributes.
2. Maps through SKU attributes to find corresponding variant and option objects.
3. Formats as "Variant Name: Option Name".

**function implementation:**
```tsx
  const formatAttributes = (sku: ISKU, product: IProduct) => {
    if (!sku.attributes || sku.attributes.length === 0) return 'Standard';
    
    return sku.attributes.map(attr => {
      const vId = typeof attr.variantId === 'object' ? (attr.variantId as any)._id : attr.variantId;
      const oId = typeof attr.optionId === 'object' ? (attr.optionId as any)._id : attr.optionId;

      let variant: any = (product.variants as any[])?.find(v => (v._id || v) === vId) || variants.find((v: IVariant) => v._id === vId);
      if (!variant) return 'Unknown';

      let option: any = variant.options?.find((o: any) => (o._id || o) === oId);
      return `${variant.name}: ${option?.value || option?.name || 'Unknown'}`;
    }).join(', ');
  };
```

### `handleManageSku()`
**purpose:** Opens the SKU management modal, initializing the form with existing SKU values.

**process:**
1. Sets the `selectedProduct` and `selectedSku`.
2. Populates `skuForm` with the SKU's current values.
3. Sets `isModalOpen` to `true`.

**function implementation:**
```tsx
  const handleManageSku = (product: IProduct, sku: ISKU) => {
    setSelectedProduct(product);
    setSelectedSku(sku);
    setSkuForm({
      price: sku.price || 0,
      stock: sku.stock || 0,
      lowStockThreshold: sku.lowStockThreshold || 0,
      allowPreOrder: sku.allowPreOrder || false,
      isActive: sku.isActive !== undefined ? sku.isActive : true
    });
    setIsModalOpen(true);
  };
```

### `handleUpdateSku()`
**purpose:** Submits updated SKU data to the API via `updateSkuMutation` and closes the modal.

**process:**
1. Validates `selectedProduct` and `selectedSku`.
2. Calls `updateSkuMutation.mutateAsync` with the form data.
3. Closes modal on success.

**function implementation:**
```tsx
  const handleUpdateSku = async () => {
    if (!selectedProduct || !selectedSku) return;
    
    try {
      await updateSkuMutation.mutateAsync({
        productId: selectedProduct._id,
        skuId: selectedSku._id,
        skuData: skuForm
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Update SKU error:', err);
    }
  };
```

## API Integration

### `GET /api/products`

#### Interface
```typescript
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
  // Get all products (Admin/Staff)
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
        "_id": "650af1234567890abcdef123",
        "name": "Product A",
        "price": 100,
        "status": true,
        "skus": [{ "_id": "sku1", "stock": 50 }]
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

### `PUT /api/products/:productId/skus/:skuId`

#### API
```typescript
export const productAPI = {
  // Update product SKU (Admin)
  updateProductSKU: (productId: string, skuId: string, skuData: any) =>
    api.put(`/api/products/${productId}/skus/${skuId}`, skuData),
};
```

#### Hook
```typescript
export const useUpdateProductSKU = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, skuId, skuData }: { productId: string; skuId: string; skuData: any }) => {
      const response = await productAPI.updateProductSKU(productId, skuId, skuData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      console.log('Product SKU updated successfully');
    },
    onError: (error: any) => console.error('Error updating product SKU:', error),
  });
};
```

#### Contract
Returns updated SKU data on success.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "sku1",
    "stock": 60,
    "price": 110
  }
}
```

#### Error Handling
API returns a message in `response.data.message`.

## UI Structure
- **Container:** Standard padding container.
- **Header:** Title, description, and search input.
- **Table:** Expandable table rows showing product summary, with nested tables for SKU-level details.
- **Modals:** Modal for updating price, stock, threshold, and active/pre-order status of individual SKUs.

## Form Inputs

### `Search Input`
**Purpose**: Collects the search query string for filtering products.
**Applicable**: Uses `FiSearch` icon for visual context.

**Input implementation**:
```tsx
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search products..."
  className="input-search"
/>
```

### `Items Per Page Dropdown`
**Purpose**: Adjusts the number of results shown per page.
**Applicable**: Uses `FiList` icon for visual context.

**Input implementation**:
```tsx
<select
  value={itemsPerPage}
  onChange={(e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  }}
  className="input-select pl-10"
>
  <option value="10">10 per page</option>
  <option value="25">25 per page</option>
  <option value="50">50 per page</option>
</select>
```

### `SKU Price Input`
**Purpose**: Edits the price of a specific SKU.
**Applicable**: Inside SKU management modal.

**Input implementation**:
```tsx
<input 
  type="number" 
  value={skuForm.price}
  onChange={(e) => setSkuForm({...skuForm, price: Number(e.target.value)})}
  className="input py-2.5"
/>
```

### `SKU Stock Input`
**Purpose**: Edits the current stock level for a specific SKU.
**Applicable**: Inside SKU management modal.

**Input implementation**:
```tsx
<input 
  type="number" 
  value={skuForm.stock}
  onChange={(e) => setSkuForm({...skuForm, stock: Number(e.target.value)})}
  className="input py-2.5"
/>
```

### `Low Stock Threshold Input`
**Purpose**: Sets the threshold that triggers a low stock warning for a SKU.
**Applicable**: Inside SKU management modal.

**Input implementation**:
```tsx
<input 
  type="number" 
  value={skuForm.lowStockThreshold}
  onChange={(e) => setSkuForm({...skuForm, lowStockThreshold: Number(e.target.value)})}
  className="input py-2.5"
/>
```

### `Allow Pre-Order Toggle`
**Purpose**: Enables or disables the ability for customers to order this SKU when stock is zero.
**Applicable**: Inside SKU management modal.

**Input implementation**:
```tsx
<input 
  type="checkbox" 
  checked={skuForm.allowPreOrder}
  onChange={(e) => setSkuForm({...skuForm, allowPreOrder: e.target.checked})}
  className="sr-only peer" 
/>
```

## Error Handling
- Displays an error banner with a warning icon if product fetching fails.
- Console logging is used for mutation errors during SKU updates, with `isPending` state handling to provide UI feedback.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Inventory Header                                         │
├──────────────────────────────────────────────────────────┤
│ [ Search Bar ]                                           │
├──────────────────────────────────────────────────────────┤
│ Showing X products      [ Items/Page Selector ]          │
├──────────────────────────────────────────────────────────┤
│ Table (Expanded Rows: Product Name, Stock, Actions)      │
├──────────────────────────────────────────────────────────┤
│ Pagination                                               │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Inventory                                                                             │
│ Monitor and manage product stock levels                                               │
│                                                                                       │
│ [ 🔍 Search products... ]                                                             │
│                                                                                       │
│ Showing 50 products                                                 [ ☰ 10/pg ]       │
│                                                                                       │
│ Product Name           | Total Units | Actions                                        │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ 🔽 👕 Product A        | 100         |                                                │
│    Attribute | Stock | Threshold | Actions                                            │
│    Size: L   | 50    | 5         | [ Edit ]                                           │
│    Size: M   | 50    | 5         | [ Edit ]                                           │
│ ▶ 👟 Product B         | 20          |                                                │
│                                                                                       │
│                                     < 1 2 3 ... >                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
- Route: `/inventory`

## Future Enhancements
- Add bulk stock update functionality.
- Integrate detailed stock movement logs.
- Add stock level visualizations (e.g., progress bars).
