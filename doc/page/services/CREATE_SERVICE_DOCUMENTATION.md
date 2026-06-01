# Create Service Screen Documentation

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
import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { useCreateService } from '../../../tanstack/useServices';
import { useGetTasks } from '../../../tanstack/useTasks';
import type { ITask } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `Create Service Mutation`
- **Hook usage:** `const createService = useCreateService();`
- **Purpose:** Mutation hook to handle the multipart/form-data request for creating a new service.

#### `Task Fetching`
- **Hook usage:** `const { data: tasksData, isLoading: isLoadingTasks } = useGetTasks({ all: true });`
- **Purpose:** Fetches all task categories to populate the dropdown selection.

### Component State

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
- **Image state:** stores the actual `File` object and a local blob URL for visual feedback.
```tsx
const [image, setImage] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
```

#### `inlineError`
- **Error state:** stores local validation or API error messages.
```tsx
const [inlineError, setInlineError] = useState<string | null>(null);
```

## Functions Involved

### `handleSubmit()`
**purpose:** Orchestrates form validation, prepares the `FormData` payload, and executes the creation mutation.

**process:**
1. Prevents default browser submission.
2. Validates that `name` and `task` (category) are provided.
3. Initializes a `FormData` object.
4. Appends all text fields and the image file (if present).
5. Calls `createService.mutateAsync`.
6. Navigates back to the service list upon successful creation.
7. Sets `inlineError` if the API request fails.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name || !form.task) {
      setInlineError('Service name and task category are required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('description', form.description.trim());
    formData.append('task', form.task);
    formData.append('isActive', String(form.isActive));
    if (image) {
      formData.append('image', image);
    }

    try {
      await createService.mutateAsync(formData);
      navigate('/services');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to create service';
      setInlineError(errorMessage);
    }
  }, [form, image, createService, navigate]);
```

### `handleImageChange()`
**purpose:** Captures the selected file from the hidden input and generates a local preview.

**process:**
1. Accesses the first file from the input event.
2. Updates the `image` state.
3. Creates a temporary blob URL via `URL.createObjectURL` for the `previewUrl` state.

**function implementation:**
```tsx
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setImage(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };
```

### `triggerFileInput()`
**purpose:** Triggers the hidden `input[type="file"]` when the user clicks the avatar/preview area.

**function implementation:**
```tsx
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
```

## API Integration

### `POST /api/services`

#### Interface
```tsx
export interface CreateServicePayload {
  task: string;
  name: string;
  description?: string;
  isActive?: boolean;
}
```

#### Payload
```json
{
  "name": "Dry Cleaning",
  "task": "650af123...",
  "description": "Premium garment cleaning",
  "isActive": true
}
```
*Note: The actual request uses `multipart/form-data` to include the `image` file.*

#### API
```typescript
export const serviceAPI = {
  createService: (serviceData: CreateServicePayload | FormData) =>
    serviceData instanceof FormData
      ? api.post('/api/services', serviceData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/services', serviceData),
}
```

#### Hook
```tsx
export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateServicePayload | FormData) => {
      const response = await serviceAPI.createService(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};
```

#### Contract
`data.data` contains the created `service` object.

#### Response
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "service": {
      "_id": "...",
      "name": "Dry Cleaning",
      "task": "...",
      "isActive": true,
      "image": "https://..."
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## UI Structure
- **Card-based layout:** A white container with rounded corners.
- **Header:** Back button and title.
- **Avatar Upload:** A centered, clickable area with a camera icon overlay.
- **Form Grid:** Inputs for Name and Task Category arranged in a grid.
- **Toggle:** A custom checkbox switch for status.
- **Actions:** Primary and secondary buttons for submission and cancellation.

## Planned Layout
```
┌───────────────────────────────┐
│ [<- Back]  Create New Service │
├───────────────────────────────┤
│                               │
│        [ Image Avatar ]       │
│                               │
│  Service Name *   Task *      │
│  [__________]    [______]     │
│                               │
│  Description                  │
│  [__________________________] │
│                               │
│  Status ( )                   │
│                               │
│  [ Create ]     [ Cancel ]    │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│ < Back to Services                            │
│                                               │
│ Create New Service                            │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │                                           │ │
│ │               ( SR )                      │ │
│ │          Click to change photo            │ │
│ │                                           │ │
│ │  Service Name *       Task Category *     │ │
│ │  [ e.g. Suit Wash ]   [ Select task... ]  │ │
│ │                                           │ │
│ │  Description                              │ │
│ │  [ Describe the service...       ]         │ │
│ │                                           │ │
│ │  Status                                   │ │
│ │  (●) Active                               │ │
│ │                                           │ │
│ │  [ Create Service ]   [ Cancel ]          │ │
│ └───────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

## Form Inputs

### `Image Picker`
**Purpose**: Collects the task's visual representation.
**Applicable**: Hidden file input triggered by clicking the preview area.

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
  placeholder="e.g. Suit Wash" 
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
  placeholder="Describe the service..." 
/>
```

### `Status Toggle`
**Purpose**: Sets the service's initial active/inactive state.
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
**Purpose**: Triggers the service creation process.
**Applicable**: Disables when creation is in progress.

**Input implementation**:
```tsx
<button
  type="submit"
  className="btn-primary flex-1"
  disabled={createService.isPending}
>
  {createService.isPending ? 'Creating...' : 'Create Service'}
</button>
```

## Error Handling
- Local validation checks for mandatory fields.
- API error messages displayed in a dedicated banner above the form.

## Navigation Flow
- Back Button ➞ `/services`
- Cancel Button ➞ `/services`
- Success ➞ `/services`
