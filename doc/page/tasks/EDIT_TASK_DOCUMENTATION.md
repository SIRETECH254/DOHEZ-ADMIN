# Edit Task Screen Documentation

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
import { useGetTaskById, useUpdateTask } from '../../../tanstack/useTasks';
```

## Context and State Management

### TanStack Query

#### `Task Data`
- **Hook usage:** `const { data: task, isLoading, isError, error } = useGetTaskById(taskId!);`
- Fetches the existing task details to populate the form.

#### `Update Task Mutation`
- **Hook usage:** `const updateTask = useUpdateTask();`
- Handles the API request to save changes.

### Form State

#### `form`
- **Form state:** managed with `useState`, containing the core task fields.
```tsx
const [form, setForm] = useState({
  name: '',
  description: '',
  isActive: true,
});
```

#### `image`
- **Image file state:** stores the actual `File` object selected by the user for multipart upload.
```tsx
const [image, setImage] = useState<File | null>(null);
```

#### `previewUrl`
- **Preview state:** stores the URL string for the image preview (either the existing task image or a local blob URL).
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
**purpose:** Orchestrates validation, prepares the payload (JSON or FormData), calls the update mutation, and handles navigation on success.

**process:**
1. Prevents default form submission.
2. Validates that the task name is provided.
3. If a new image is selected:
    - Creates a `FormData` object.
    - Appends `name`, `description`, `isActive`, and the `image` file.
4. If no new image is selected:
    - Uses the standard JSON `form` object as the payload.
5. Calls `updateTask.mutateAsync` with the `taskId` and `payload`.
6. On success, navigates back to the task detail page.
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

    let payload: FormData | typeof form;

    if (image) {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('isActive', String(form.isActive));
      formData.append('image', image);
      payload = formData;
    } else {
      payload = form;
    }

    try {
      await updateTask.mutateAsync({ taskId: taskId!, taskData: payload });
      navigate(`/tasks/${taskId}`);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update task';
      setInlineError(errorMessage);
    }
  }, [form, image, updateTask, taskId, navigate]);
```

### `handleImageChange()`
**purpose:** Updates the local image state and creates a preview URL when a new file is selected.

**process:**
1. Retrieves the first file from the input.
2. Sets the `image` state.
3. If a file exists, creates a local object URL and sets `previewUrl`.
4. If no file is selected, reverts `previewUrl` to the original task image.

**function implementation:**
```tsx
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setImage(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(task?.image || null);
    }
  };
```

### `triggerFileInput()`
**purpose:** Programmatically triggers the hidden file input when the user clicks the task image.

**function implementation:**
```tsx
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
```

## API Integration

### `PUT /api/tasks/:taskId`

#### Interface
```tsx
export interface UpdateTaskPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
  image?: string | null;
}
```

#### Payload
```json
{
  "name": "Laundry Premium",
  "description": "Express washing services",
  "isActive": true
}
```
*Note: Uses `multipart/form-data` when an image file is included.*

#### API
```typescript
export const taskAPI = {
  // Update task details
  updateTask: (taskId: string, taskData: UpdateTaskPayload | FormData) =>
    taskData instanceof FormData
      ? api.put(`/api/tasks/${taskId}`, taskData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/tasks/${taskId}`, taskData),
};
```

#### Hook
```tsx
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, taskData }: { taskId: string; taskData: UpdateTaskPayload | FormData }) => {
      const response = await taskAPI.updateTask(taskId, taskData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    }
  });
};
```

#### Contract
`data.data` contains the updated `task` object.

#### Response
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "_id": "650af1234567890abcdef123",
      "name": "Laundry Premium",
      "description": "Express washing services",
      "isActive": true,
      "image": "https://res.cloudinary.com/demo/image/upload/v123/task.jpg",
      "imagePublicId": "tasks/task_image_123",
      "createdAt": "2023-09-20T12:00:00.000Z",
      "updatedAt": "2026-05-22T11:00:00.000Z",
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
- **Actions:** Primary and secondary buttons for "Save Changes" and "Cancel".

## Planned Layout
```
┌───────────────────────────────┐
│ [<- Back]  Edit Task: [Name]  │
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
│  [ Save ]      [ Cancel ]     │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│ < Back to Task Details                        │
│                                               │
│ Edit Task: Laundry                            │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │                                           │ │
│ │               ( 👤 )                      │ │
│ │          Click to change photo            │ │
│ │                                           │ │
│ │  Task Name *                              │ │
│ │  [ Laundry                      ]         │ │
│ │                                           │ │
│ │  Description                              │ │
│ │  [ Cleaning and ironing...      ]         │ │
│ │                                           │ │
│ │  Status                                   │ │
│ │  (●) Active                               │ │
│ │                                           │ │
│ │  [ Save Changes ]     [ Cancel ]          │ │
│ └───────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

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
/>
```

### `Status Toggle`
**Purpose**: Toggles the task's active/inactive state.
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
**Purpose**: Triggers the task update process.
**Applicable**: Disables when update is in progress.

**Input implementation**:
```tsx
<button
  type="submit"
  className="btn-primary flex-1"
  disabled={updateTask.isPending}
>
  {updateTask.isPending ? 'Saving...' : 'Save Changes'}
</button>
```

## Error Handling
- Displays local validation errors (e.g., missing name) in an `inlineError` banner.
- Displays API error messages in the same banner.
- Errors are cleared at the start of each submission attempt.

## Navigation Flow
- Route: `/tasks/:taskId/edit`.
- Success ➞ `/tasks/:taskId`.
- Cancel/Back ➞ `/tasks/:taskId`.
