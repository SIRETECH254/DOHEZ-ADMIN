# Create Role Documentation

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
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useCreateRole } from '../../../tanstack/useRoles';
import type { CreateRolePayload } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useCreateRole`
- **Hook usage:** `const createRole = useCreateRole();`

**`useCreateRole` function (from `tanstack/useRoles.ts`):**
```tsx
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData: CreateRolePayload) => {
      const response = await roleAPI.createRole(roleData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      console.log('Role created successfully');
    },
    onError: (error: any) => console.error('Error creating role:', error),
  });
};
```

### Form State

#### `form`
- **Form state:** single `form` object `{ name, displayName, description, permissions, isActive }` managed with `useState`.
```tsx
const [form, setForm] = useState({
  name: '',
  displayName: '',
  description: '',
  permissions: '',
  isActive: true,
});
```

#### `inlineError`
- **Inline error state:** stores local validation or API error messages to be displayed in the UI.
```tsx
const [inlineError, setInlineError] = useState<string | null>(null);
```

## Functions Involved

### `handleSubmit()`
**purpose:** Orchestrates local validation, constructs the payload, calls the create role mutation, handles navigation upon success, and manages error feedback.

**process:**
1. Prevents the default browser form submission.
2. Resets `inlineError`.
3. Validates that required fields (`name`, `displayName`, `permissions`) are provided.
4. Trims strings and formats `permissions` as an array of strings.
5. Calls `createRole.mutateAsync` with the payload.
6. Navigates to `/roles` on success.
7. Sets `inlineError` if the API request fails.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name || !form.displayName || !form.permissions) {
      setInlineError('Please fill in all required fields (Name, Display Name, and Permissions).');
      return;
    }

    const payload: CreateRolePayload = {
      name: form.name.trim(),
      displayName: form.displayName.trim(),
      description: form.description.trim(),
      permissions: form.permissions.split(',').map(p => p.trim()).filter(p => p !== ''),
      isActive: form.isActive,
    };

    try {
      await createRole.mutateAsync(payload);
      navigate('/roles');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to create role';
      setInlineError(errorMessage);
    }
  }, [form, createRole, navigate]);
```

## API Integration

### `POST /api/roles`

#### Interface
```tsx
export interface CreateRolePayload {
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  isActive?: boolean;
}
```

#### Payload
```json
{
  "name": "string",
  "displayName": "string",
  "description": "string",
  "permissions": ["string"],
  "isActive": "boolean"
}
```

#### API
```typescript
export const roleAPI = {
  // Create a new role.
  createRole: (roleData: CreateRolePayload) => api.post('/api/roles', roleData),
}
```

#### Contract
`data.data` contains the created role object.

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "displayName": "string",
    "description": "string",
    "permissions": ["string"],
    "isActive": true,
    "isSystemRole": false
  }
}
```

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## UI Structure
- **Container:** Standard padding container with max-width.
- **Header:** Contains back button, page title, and subtitle.
- **Form:** Uses `grid` layout for inputs, `textarea` for description and permissions, and a toggle for `isActive`.
- **Feedback:** Inline error banner shown above the form.

## Planned Layout
```
┌──────────────────────────────────────────────┐
│  < Back to Roles                             │
│  Create New Role                             │
│  Define a new system role...                 │
├──────────────────────────────────────────────┤
│  [ Display Name ] [ Internal Name ]          │
├──────────────────────────────────────────────┤
│  [ Description (textarea)                 ]  │
├──────────────────────────────────────────────┤
│  [ Permissions (textarea)                 ]  │
├──────────────────────────────────────────────┤
│  [ ] Active                                  │
├──────────────────────────────────────────────┤
│  [ Create Role ] [ Cancel ]                  │
└──────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│ Create New Role                                               │
│ Define a new system role and its permissions                  │
│                                                               │
│ Display Name (*)    [ Enter Display Name...          ]        │
│ Internal Name (*)   [ Enter Internal Name...         ]        │
│                                                               │
│ Description         [ Enter description...           ]        │
│                                                               │
│ Permissions (*)     [ Enter permissions...           ]        │
│                                                               │
│ Role Status         [ ] Active                                │
│                                                               │
│                     [ Create Role ] [ Cancel ]                │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

### `Display Name Input`
**Purpose**: Collects the user-friendly name for the role.
**Applicable**: Required field.

**Input implementation**:
```tsx
<input 
  type="text"
  value={form.displayName} 
  onChange={(e) => setForm({...form, displayName: e.target.value})} 
  className="input" 
  placeholder="e.g. Content Manager" 
  required
/>
```

### `Internal Name Input`
**Purpose**: Collects the unique system slug for the role.
**Applicable**: Required field. Used by the system for permission checking.

**Input implementation**:
```tsx
<input 
  type="text"
  value={form.name} 
  onChange={(e) => setForm({...form, name: e.target.value})} 
  className="input" 
  placeholder="e.g. content_manager" 
  required
/>
```

### `Description Input`
**Purpose**: Collects the role description for administrative clarity.
**Applicable**: Optional field.

**Input implementation**:
```tsx
<textarea 
  value={form.description} 
  onChange={(e) => setForm({...form, description: e.target.value})} 
  className="input min-h-[100px] py-3" 
  placeholder="Briefly describe the purpose of this role..."
/>
```

### `Permissions Input`
**Purpose**: Collects permissions as a comma-separated list.
**Applicable**: Required field.

**Input implementation**:
```tsx
<textarea 
  value={form.permissions} 
  onChange={(e) => setForm({...form, permissions: e.target.value})} 
  className="input min-h-[100px] py-3" 
  placeholder="e.g. view_users, edit_users (comma separated)"
  required
/>
```

### `Active Status Toggle`
**Purpose**: Toggles role activation status.
**Applicable**: Resets `inlineError` on toggle.

**Input implementation**:
```tsx
<input 
  type="checkbox" 
  checked={form.isActive} 
  onChange={(e) => setForm({...form, isActive: e.target.checked})} 
  className="sr-only peer"
/>
```

### `Submit Button`
**Purpose**: Triggers the role creation process.
**Applicable**: Disables when creation is in progress to prevent duplicate submissions.

**Input implementation**:
```tsx
<button 
  type="submit" 
  className="btn-primary flex-1" 
  disabled={createRole.isPending}
>
  {createRole.isPending ? 'Creating Role...' : 'Create Role'}
</button>
```

## Error Handling
- Displays a prominent error banner if the API request fails (`inlineError`).
- Form validation ensures all required fields are filled before allowing submission.
- The `createRole` mutation handles error states, enabling loading feedback on the submit button.

## Navigation Flow
- Route: `/roles/new`.
- "Back to Roles" button -> `/roles`.
- Successful creation ➞ `navigate('/roles')`.

## Future Enhancements
- Replace the permissions `textarea` with a multi-select or checkbox-based UI for better UX.
- Implement real-time validation for unique `name` slugs.
