# Product Detail Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Error Handling](#error-handling)
- [UI Layout](#ui-layout)

## Imports
```tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetProductById } from '../../../tanstack/useProducts';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IProductCategory, IVariant } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query
- **`useGetProductById`**: Fetches the product details based on the `id` from URL parameters.

## Error Handling
- Displays a loading state while fetching.
- Displays a custom error view with an alert icon and back navigation if the product fetch fails or returns an error.
- Displays "Product not found" if the data is missing.

## UI Layout
- **Header**: Contains back navigation button, product name, ID, and an "Edit Product" button linking to `/products/:id/edit`.
- **Content**: 
    - Product gallery (images).
    - Detailed sections for Category, Price, Status.
    - Product description/details.
    - List of variants using `StatusBadge` for formatting.
