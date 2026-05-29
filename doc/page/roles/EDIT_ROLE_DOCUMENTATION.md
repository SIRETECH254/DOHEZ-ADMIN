# Edit Role Documentation

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
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useGetRoleById, useUpdateRole } from '../../../tanstack/useRoles';
import type { UpdateRolePayload } from '../../../types/api.types';
```

## Context and State Management

### TanStack Query

#### `useGetRoleById`
- **Hook usage:** `const { data: role, isLoading, isError, error } = useGetRoleById(roleId!);`
- **Purpose:** Fetches the specific role's data for pre-populating the edit form.

#### `useUpdateRole`
- **Hook usage:** `const updateRole = useUpdateRole();`
- **Purpose:** Mutation hook to update the role details. Cache invalidation is handled by mutation `onSuccess`.

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
**purpose:** Orchestrates local validation, constructs the payload, calls the update role mutation, handles navigation upon success, and manages error feedback.

**process:**
1. Prevents the default browser form submission.
2. Resets `inlineError`.
3. Validates that required fields are provided.
4. Trims strings and formats `permissions` as an array of strings.
5. Calls `updateRole.mutateAsync` with the role ID and payload.
6. Navigates to the role details page (`/roles/:roleId`) on success.
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

    const payload: UpdateRolePayload = {
      name: form.name.trim(),
      displayName: form.displayName.trim(),
      description: form.description.trim(),
      permissions: form.permissions.split(',').map(p => p.trim()).filter(p => p !== ''),
      isActive: form.isActive,
    };

    try {
      await updateRole.mutateAsync({ roleId: roleId!, roleData: payload });
      navigate(`/roles/${roleId}`);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update role';
      setInlineError(errorMessage);
    }
  }, [form, updateRole, roleId, navigate]);
```

## API Integration

### `PUT /api/roles/:roleId`

#### Interface
```tsx
export interface UpdateRolePayload {
  name?: string;
  displayName?: string;
  description?: string;
  permissions?: string[];
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
  // Update a role.
  updateRole: (roleId: string, roleData: UpdateRolePayload) => api.put(`/api/roles/${roleId}`, roleData),
}
```

#### Hook
```tsx
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, roleData }: { roleId: string; roleData: UpdateRolePayload }) => {
      const response = await roleAPI.updateRole(roleId, roleData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.roleId] });
      console.log('Role updated successfully');
    },
    onError: (error: any) => console.error('Error updating role:', error),
  });
};
```

#### Contract
`data.data` contains the updated role object.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "displayName": "string",
    "description": "string",
    "permissions": ["string"],
    "isActive": true
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
│  < Back to Details                           │
│  Edit Role: [Role Name]                      │
│  Update system role...                       │
├──────────────────────────────────────────────┤
│  [ Display Name ] [ Internal Name ]          │
├──────────────────────────────────────────────┤
│  [ Description (textarea)                 ]  │
├──────────────────────────────────────────────┤
│  [ Permissions (textarea)                 ]  │
├──────────────────────────────────────────────┤
│  [ ] Active                                  │
├──────────────────────────────────────────────┤
│  [ Update Role ] [ Cancel ]                  │
└──────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│ Edit Role: Admin                                              │
│ Update system role details and permissions                    │
│                                                               │
│ Display Name (*)    [ Admin                          ]        │
│ Internal Name (*)   [ admin                          ]        │
│                                                               │
│ Description         [ Full system access...          ]        │
│                                                               │
│ Permissions (*)     [ *, manage_users...             ]        │
│                                                               │
│ Role Status         [x] Active                                │
│                                                               │
│                     [ Update Role ] [ Cancel ]                │
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
**Applicable**: Required field. Disabled for system roles.

**Input implementation**:
```tsx
<input 
  type="text"
  value={form.name} 
  onChange={(e) => setForm({...form, name: e.target.value})} 
  className="input" 
  placeholder="e.g. content_manager" 
  required
  disabled={role.isSystemRole}
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
**Applicable**: Disabled for mandatory system roles like 'super_admin'.

**Input implementation**:
```tsx
<input 
  type="checkbox" 
  checked={form.isActive} 
  onChange={(e) => setForm({...form, isActive: e.target.checked})} 
  className="sr-only peer"
  disabled={role.isSystemRole && role.name === 'super_admin'}
/>
```

### `Submit Button`
**Purpose**: Triggers the role update process.
**Applicable**: Disables when update is in progress.

**Input implementation**:
```tsx
<button 
  type="submit" 
  className="btn-primary flex-1" 
  disabled={updateRole.isPending}
>
  {updateRole.isPending ? 'Updating Role...' : 'Update Role'}
</button>
```

## Error Handling
- Displays a prominent error banner if the API request fails (`inlineError`).
- Form validation ensures all required fields are filled before allowing submission.
- The `updateRole` mutation handles error states, enabling loading feedback on the submit button.

## Navigation Flow
- Route: `/roles/:roleId/edit`.
- "Back to Role Details" button -> `/roles/:roleId`.
- Successful update ➞ `navigate('/roles/:roleId')`.

## Future Enhancements
- Replace the permissions `textarea` with a multi-select or checkbox-based UI for better UX.
- Implement real-time validation for unique `name` slugs.
