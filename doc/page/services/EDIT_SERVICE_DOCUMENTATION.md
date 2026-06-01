# Edit Service Screen Documentation

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

## Imports
```tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { useGetServiceById, useUpdateService } from '../../../tanstack/useServices';
import { useGetTasks } from '../../../tanstack/useTasks';
import type { ITask } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `Service Data`
- **Hook usage:** `const { data: serviceData, isLoading, isError, error } = useGetServiceById(serviceId!);`
- **Purpose:** Fetches the existing service details. The service object is extracted via `serviceData?.service`.

#### `Update Service Mutation`
- **Hook usage:** `const updateService = useUpdateService();`
- **Purpose:** Handles the API request to update existing service details.

#### `Tasks`
- **Hook usage:** `const { data: tasksData } = useGetTasks({ all: true });`
- **Purpose:** Fetches tasks to populate the parent category dropdown.

### Form State

#### `form`
- **Form state:** managed with `useState`, containing fields for `name`, `description`, `task`, and `isActive`.
```tsx
const [form, setForm] = useState({
  name: '',
  description: '',
  task: '',
  isActive: true,
});
```

#### `image` & `previewUrl`
- **Image state:** stores the file and a local preview URL. `previewUrl` defaults to the existing service image.

## Functions Involved

### `useEffect (Pre-fill)`
**purpose:** Populates the form state once the service data is successfully fetched from the API.

**process:**
1. Checks if the `service` object is available.
2. Updates `form` state with `name`, `description`, `task` (extracting ID if populated), and `isActive`.
3. Updates `previewUrl` with the existing service image URL.

### `handleSubmit()`
**purpose:** Orchestrates validation, prepares the payload (FormData for image, JSON otherwise), and calls the update mutation.

**process:**
1. Validates required fields.
2. Appends fields to `FormData` if a new `image` is selected.
3. Calls `updateService.mutateAsync`.
4. Navigates to the service detail page on success.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name || !form.task) {
      setInlineError('Service name and task category are required.');
      return;
    }

    let payload: FormData | typeof form;

    if (image) {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('task', form.task);
      formData.append('isActive', String(form.isActive));
      formData.append('image', image);
      payload = formData;
    } else {
      payload = form;
    }

    try {
      await updateService.mutateAsync({ serviceId: serviceId!, data: payload });
      navigate(`/services/${serviceId}`);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update service';
      setInlineError(errorMessage);
    }
  }, [form, image, updateService, serviceId, navigate]);
```

## API Integration

### `PUT /api/services/:serviceId`

#### Interface
```tsx
export interface UpdateServicePayload {
  task?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  image?: string | null;
}
```

#### API
```typescript
export const serviceAPI = {
  updateService: (serviceId: string, serviceData: UpdateServicePayload | FormData) =>
    serviceData instanceof FormData
      ? api.put(`/api/services/${serviceId}`, serviceData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/services/${serviceId}`, serviceData),
};
```

#### Response
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "service": {
      "_id": "...",
      "name": "Updated Name",
      "task": "...",
      "isActive": true
    }
  }
}
```

## UI Structure
- Card-based layout mirroring the Create Service screen but pre-filled with data.

## Planned Layout & Sketch Wireframe
- Matches `CreateService` with the title "Edit Service: [Name]".

## Form Inputs

### `Image Field`
**Purpose**: Collects the task's visual representation.
**Applicable**: Hidden file input triggered by clicking the preview image; supports image previews.

**Input implementation**:
```tsx
<div 
  onClick={triggerFileInput}
  className="relative group cursor-pointer"
>
  <input 
    type="file"
    ref={fileInputRef}
    onChange={handleImageChange}
    accept="image/*"
    className="hidden"
  />
  {/* Preview and Camera Overlay JSX... */}
</div>
```

### `Service Name Field`
**Purpose**: Collects the primary name of the service.
**Applicable**: Required field.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={form.name} 
  onChange={(e) => setForm({...form, name: e.target.value})} 
  className="input" 
  required 
/>
```

### `Task Category Field`
**Purpose**: Links the service to its parent task category.
**Applicable**: Required dropdown selection.

**Input implementation**:
```tsx
<select 
  value={form.task} 
  onChange={(e) => setForm({...form, task: e.target.value})} 
  className="input"
  required
  disabled={isLoadingTasks}
>
  <option value="">Select a task category</option>
  {tasks.map((task: ITask) => (
    <option key={task._id} value={task._id}>
      {task.name}
    </option>
  ))}
</select>
```

### `Description Field`
**Purpose**: Collects optional details about the service.
**Applicable**: Textarea for multi-line input.

**Input implementation**:
```tsx
<textarea 
  value={form.description} 
  onChange={(e) => setForm({...form, description: e.target.value})} 
  className="input min-h-[100px] py-3" 
/>
```

### `Status Toggle`
**Purpose**: Toggles the service's active/inactive state.
**Applicable**: Uses a custom toggle switch UI.

**Input implementation**:
```tsx
<label className="relative inline-flex items-center cursor-pointer">
  <input 
    type="checkbox" 
    checked={form.isActive} 
    onChange={(e) => setForm({...form, isActive: e.target.checked})} 
    className="sr-only peer" 
  />
  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
  <span className="ml-3 text-sm text-gray-700 font-medium">{form.isActive ? 'Active' : 'Inactive'}</span>
</label>
```

### `Submit Button`
**Purpose**: Triggers the service update process.
**Applicable**: Disables when update is in progress.

**Input implementation**:
```tsx
<button
  type="submit"
  className="btn-primary flex-1"
  disabled={updateService.isPending}
>
  {updateService.isPending ? 'Saving...' : 'Save Changes'}
</button>
```

## Error Handling
- Displays `inlineError` banner for validation and API failures.
- Loading and error states for initial data fetch.

## Navigation Flow
- Back Button ➞ `/services/:serviceId`
- Cancel Button ➞ `/services/:serviceId`
- Success ➞ `/services/:serviceId`
