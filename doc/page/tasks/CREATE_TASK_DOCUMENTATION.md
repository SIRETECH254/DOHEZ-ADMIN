# Create Task Screen Documentation

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
import { useCreateTask } from '../../../tanstack/useTasks';
```

## Context and State Management

### TanStack Query

#### `Create Task Mutation`
- **Hook usage:** `const createTask = useCreateTask();`
- Handles the API request to create a new task category.

### Form State

#### `form`
- **Form state:** single `form` object `{ name, description, isActive }` managed with `useState`.
```tsx
const [form, setForm] = useState({
  name: '',
  description: '',
  isActive: true,
});
```

#### `image`
- **Image file state:** stores the actual `File` object for multipart upload.
```tsx
const [image, setImage] = useState<File | null>(null);
```

#### `previewUrl`
- **Preview state:** stores a local blob URL for the image preview.
```tsx
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
```

#### `inlineError`
- **Error state:** stores local validation or API error messages.
```tsx
const [inlineError, setInlineError] = useState<string | null>(null);
```

## Functions Involved

### `onSubmit()`
**purpose:** Orchestrates validation, prepares the `FormData` payload, calls the creation mutation, and handles navigation on success.

**process:**
1. Prevents default form submission.
2. Validates that the task name is provided.
3. Creates a `FormData` object.
4. Appends `name`, `description`, `isActive`, and the `image` (if present) to the `FormData`.
5. Calls `createTask.mutateAsync` with the payload.
6. On success, navigates back to the task list.
7. On failure, updates `inlineError` with the API error message.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name) {
      setInlineError('Task name is required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('description', form.description.trim());
    formData.append('isActive', String(form.isActive));
    if (image) {
      formData.append('image', image);
    }

    try {
      await createTask.mutateAsync(formData);
      navigate('/tasks');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to create task';
      setInlineError(errorMessage);
    }
  }, [form, image, createTask, navigate]);
```

### `handleImageChange()`
**purpose:** Updates the local image state and creates a preview URL when a new file is selected.

**process:**
1. Retrieves the selected file.
2. Sets the `image` state.
3. Creates a local object URL and sets `previewUrl`.

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
**purpose:** Triggers the hidden file input when the user clicks the avatar area.

**function implementation:**
```tsx
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
```

## API Integration

### `POST /api/tasks`

#### Interface
```tsx
export interface CreateTaskPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}
```

#### Payload
```json
{
  "name": "Cleaning",
  "description": "Full house cleaning",
  "isActive": true
}
```
*Note: Uses `multipart/form-data` to include the `image` file.*

#### API
```typescript
export const taskAPI = {
  // Create a new task category
  createTask: (taskData: CreateTaskPayload | FormData) =>
    taskData instanceof FormData
      ? api.post('/api/tasks', taskData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/tasks', taskData),
};
```

#### Hook
```tsx
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskData: CreateTaskPayload | FormData) => {
      const response = await taskAPI.createTask(taskData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
};
```

#### Contract
`data.data` contains the created `task` object.

#### Response
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "650af1234567890abcdef124",
      "name": "Cleaning",
      "description": "Full house cleaning",
      "isActive": true,
      "image": null,
      "imagePublicId": null,
      "createdAt": "2026-05-22T10:00:00.000Z",
      "updatedAt": "2026-05-22T10:00:00.000Z",
      "__v": 0
    }
  }
}
```

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## UI Structure
- **Screen shell:** Padded container (`p-6`) with a back button and title.
- **Card:** White background, rounded corners (`rounded-3xl`), and subtle border.
- **Image Picker:** Centered avatar-style upload with hidden input, clickable preview, and camera icon overlay on hover.
- **Form:** Vertical stack of inputs (Name, Description, Status toggle).
- **Actions:** Primary and secondary buttons for "Create Task" and "Cancel".

## Planned Layout
```
┌───────────────────────────────┐
│ [<- Back]  Create New Task    │
├───────────────────────────────┤
│                               │
│        [ Image Avatar ]       │
│     (Click to change photo)   │
│                               │
│  Task Name *                  │
│  [__________________________] │
│                               │
│  Description                  │
│  [__________________________] │
│                               │
│  Status                       │
│  ( ) Active                   │
│                               │
│  [ Create ]    [ Cancel ]     │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│ < Back to Tasks                               │
│                                               │
│ Create New Task                               │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │                                           │ │
│ │               ( TA )                      │ │
│ │          Click to change photo            │ │
│ │                                           │ │
│ │  Task Name *                              │ │
│ │  [ e.g. Laundry                 ]         │ │
│ │                                           │ │
│ │  Description                              │ │
│ │  [ Describe the task category... ]         │ │
│ │                                           │ │
│ │  Status                                   │ │
│ │  (●) Active                               │ │
│ │                                           │ │
│ │  [ Create Task ]      [ Cancel ]          │ │
│ └───────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

## Form Inputs

### `Image Field`
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

### `Task Name Field`
**Purpose**: Collects the primary name of the task.
**Applicable**: Required field.

**Input implementation**:
```tsx
<input 
  type="text" 
  value={form.name} 
  onChange={(e) => setForm({...form, name: e.target.value})} 
  className="input" 
  placeholder="e.g. Laundry" 
  required 
/>
```

### `Description Field`
**Purpose**: Collects optional details about the task.
**Applicable**: Textarea for multi-line input.

**Input implementation**:
```tsx
<textarea 
  value={form.description} 
  onChange={(e) => setForm({...form, description: e.target.value})} 
  className="input min-h-[100px] py-3" 
  placeholder="Describe the task category..." 
/>
```

### Status Toggle
**Purpose**: Sets the task's initial active/inactive state.
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

### Submit Button
**Purpose**: Triggers the task creation process.
**Applicable**: Disables when creation is in progress.

**Input implementation**:
```tsx
<button
  type="submit"
  className="btn-primary flex-1"
  disabled={createTask.isPending}
>
  {createTask.isPending ? 'Creating...' : 'Create Task'}
</button>
```


## Error Handling
- Displays local validation or API error messages in an `inlineError` banner above the form.
- Errors are cleared at the start of each submission attempt.

## Navigation Flow
- Route: `/tasks/new`.
- Success ➞ `/tasks`.
- Cancel/Back ➞ `/tasks`.
