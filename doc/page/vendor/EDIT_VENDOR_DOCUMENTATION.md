# Edit Vendor Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Form State](#form-state)
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
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { useGetVendorById, useUpdateVendor } from '../../../tanstack/useVendors';
import { useGetVendorCategories } from '../../../tanstack/useVendorCategories';
```

## Context and State Management

### TanStack Query (Server State)

#### `useGetVendorById`
- **Hook usage:** `const { data: vendorData, isLoading, isError, error } = useGetVendorById(id!);`
- **Purpose:** Fetches the current vendor data to populate the form fields.

#### `useUpdateVendor`
- **Hook usage:** `const updateVendor = useUpdateVendor();`
- **Purpose:** Handles the patch/update request for the vendor record.

#### `useGetVendorCategories`
- **Hook usage:** `const { data: categoriesData } = useGetVendorCategories({ all: true });`
- **Purpose:** Fetches all vendor categories for the selection dropdown.

### Form State

#### `form`
- **Purpose:** Stores the updated textual input data.
```tsx
const [form, setForm] = useState({
  name: '',
  description: '',
  categoryId: '',
  serviceId: '',
  phone: '',
  email: '',
  kraPin: '',
  regNo: '',
  location: '',
  isActive: true,
});
```

#### `logo`, `cover` & `previewUrls`
- **Purpose:** Manages the selected image files (new or existing) and their local preview URLs.
```tsx
const [logo, setLogo] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [cover, setCover] = useState<File | null>(null);
const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
```

## Functions Involved

### `useEffect` (Data Population)
**Purpose:** Pre-fills the `form` state once the vendor data is successfully loaded from the API.
```tsx
  useEffect(() => {
    if (vendor) {
      setForm({
        name: vendor.name || '',
        description: vendor.details || '',
        categoryId: typeof vendor.vendorCategory === 'string' ? vendor.vendorCategory : (vendor.vendorCategory as IVendorCategory)?._id || '',
        serviceId: typeof vendor.service === 'string' ? vendor.service : (vendor.service as IService)?._id || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        kraPin: vendor.kraPin || '',
        regNo: vendor.regNo || '',
        location: typeof vendor.location === 'string' ? vendor.location : vendor.location?.address || '',
        isActive: vendor.isActive,
      });
      setPreviewUrl(vendor.logo || null);
      setCoverPreviewUrl(vendor.cover || null);
    }
  }, [vendor]);
```

### `handleImageChange()` & `handleCoverChange()`
**Purpose:** Handles new image selection and updates the local preview. Reverts to existing URLs if selection is cleared.

### `handleSubmit()`
**Purpose:** Validates inputs, appends changes (mapping `serviceId` to `service`) to `FormData`, and triggers the update mutation.

## API Integration

### `PATCH /api/vendors/:id`
**Purpose:** Update an existing vendor's information.
**Payload:** `multipart/form-data` containing:
- Updated fields: `name`, `description`, `categoryId`, `service`, `phone`, `email`, `kraPin`, `regNo`, `location`, `isActive`.
- Optional new `logo` and `cover` files.

## UI Structure
- **Screen Shell:** Padded container (`p-6`).
- **Header:** Back link to detail page and Page Title.
- **Form Card:** White rounded card with consistent spacing.
- **Media Section:** Split layout showing current/new cover image and logo with upload triggers.
- **Grid:** Responsive grid for standard fields.
- **Actions:** "Save Changes" and "Cancel" buttons.

## Planned Layout
```
┌──────────────────────────────────────────────────┐
│ [<-] Back to Vendor Details                      │
│ Edit Vendor: Quick Laundry                       │
├──────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐ │
│ │               [COVER IMAGE]                  │ │
│ └──────────────────────────────────────────────┘ │
│           ┌──────────┐                           │
│           │ [PREVIEW]│                           │
│           └──────────┘                           │
│                                                  │
│ Vendor Name [________]   Service    [________]   │
│ Category    [________]   Email      [________]   │
│ Phone       [________]   KRA PIN    [________]   │
│ Reg No.     [________]   Location   [________]   │
│                                                  │
│ Description [________________________________]   │
│                                                  │
│ Status: ( ) Active                               │
│                                                  │
│ [ Save Changes (Primary) ]   [ Cancel ]          │
└──────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────┐
│ (<-) Back to Vendor Details                      │
│                                                  │
│ Edit Vendor: Quick Laundry                       │
│                                                  │
│  [++++++++++++++ UPLOAD COVER +++++++++++++++]   │
│                                                  │
│        (  LOGO  )                                │
│        Click to change logo                      │
│                                                  │
│ Vendor Name*          Service*                   │
│ [Quick Laundry     ]  [Laundry Services | V]     │
│                                                  │
│ Category*             Email*                     │
│ [Laundry          | V] [contact@ql.com    ]      │
│                                                  │
│ Phone*                KRA PIN                    │
│ [+254 712...       ]  [A00...            ]       │
│                                                  │
│ Registration No.      Location                   │
│ [CPR/...           ]  [Nairobi, Kenya    ]       │
│                                                  │
│ Description           Status                     │
│ [Best laundry in..]   [ Active        (O) ]      │
│                                                  │
│ [       Save Changes         ] [  Cancel  ]      │
└──────────────────────────────────────────────────┘
```

## Form Inputs

### `Category Select`
**Purpose**: Update the vendor's primary category.
**Implementation**: Handles both string (ID) and object (hydrated) types from the API.

### `Status Toggle`
**Purpose**: Toggle the vendor's active status.
**Implementation**: Custom styled toggle switch using Tailwind peer utilities.

## Error Handling
- **Loading State:** Simple text indicator while fetching initial data.
- **Error State:** Displays API error messages if data fetching or updating fails.
- **Form Validation:** Ensures all required fields are present before submission.

## Navigation Flow
- Route: `/vendors/:id/edit`.
- Back Button/Cancel ➞ `/vendors/:id`.
- Successful Update ➞ `/vendors/:id`.

## Future Enhancements
- Versioning or change logs for vendor profile updates.
- Approval workflow for sensitive field changes (e.g., email, bank info).
- Auto-save drafts.
