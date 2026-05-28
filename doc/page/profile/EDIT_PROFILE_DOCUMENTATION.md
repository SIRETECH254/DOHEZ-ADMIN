# Edit Profile Documentation

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
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useUpdateProfile } from '../../../tanstack/useUsers';
```

## Context and State Management

### Context

#### `Auth`
- **Hook usage:** `const { user, updateProfile: updateAuthProfile } = useAuth();`
- Provides the current user data to pre-populate the form and the function to update the global auth state.

#### `TanStack Query`
- **Hook usage:** `const { mutate: updateProfile, isLoading: isUpdating } = useUpdateProfile();`
- Handles the API call for updating the profile with automatic cache invalidation.

### Form State

#### `form`
- **Form state:** managed with `useState`, initialized from the current user data.
```tsx
const [form, setForm] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  avatar: null as string | null
})
```

#### `inlineMessage`
- **Inline message state:** stores success or error feedback messages.
```tsx
const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
```

## Functions Involved

### `handleSubmit()`
**purpose:** Orchestrates the profile update process, including local validation and calling the update function.

**process:**
1. Prevents default form submission.
2. Performs basic validation (e.g., ensuring required fields are not empty).
3. Calls the `updateAuthProfile` function from the auth context.
4. If successful, updates the local `inlineMessage` with a success message.
5. If it fails, displays the error message returned by the API.

**function implementation (planned):**
```tsx
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setInlineMessage(null);

      const result = await updateAuthProfile(form);
      if (result.success) {
        setInlineMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setInlineMessage({ type: 'error', text: result.error ?? 'Failed to update profile' });
      }
    },
    [form, updateAuthProfile]
  );
```

### `handleInputChange()`
**purpose:** Updates the form state as the user types.

**process:**
1. Updates the specific field in the `form` object.
2. Clears any existing `inlineMessage`.

**function implementation:**
```tsx
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      setForm((prev) => ({ ...prev, [name]: value }));
      setInlineMessage(null);
    },
    []
  );
```

## API Integration

### `PUT /api/users/profile`

#### Interface
```tsx
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string | null;
}
```

#### API
```typescript
export const userAPI = {
  // Update own profile
  updateProfile: (profileData: UpdateProfilePayload | FormData) =>
    api.put('/api/users/profile', profileData),
}
```

#### Auth Function
```tsx
const updateProfile = async (profileData: UpdateProfilePayload | FormData): Promise<AuthResult> => {
  try {
    const response = await userAPI.updateProfile(profileData);
    const updatedUser = response.data.data?.user ?? response.data.data;
    // ... update localStorage and Redux
    return { success: true, user: updatedUser };
  } catch (error) {
    // ... handle error
  }
};
```

## UI Structure
- **Container:** Maximum width container (`max-w-2xl`) with padding.
- **Card:** White background card containing the form.
- **Form Groups:** Vertical arrangement of labels and inputs.
- **Avatar Picker:** A circular preview with an upload button.
- **Actions:** Save changes button and a cancel link.

## Planned Layout
```
┌───────────────────────────────┐
│        Edit Profile           │
├───────────────────────────────┤
│       [ Avatar Picker ]       │
├───────────────────────────────┤
│        First Name Input       │
├───────────────────────────────┤
│        Last Name Input        │
├───────────────────────────────┤
│          Email Input          │
├───────────────────────────────┤
│          Phone Input          │
├───────────────────────────────┤
│        [ Save Changes ]       │
├───────────────────────────────┤
│           [ Cancel ]          │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│               Edit Profile                    │
│                                               │
│             [   ( JD )   ]                    │
│             Change Photo                      │
│                                               │
│  First Name                                   │
│  [ John_____________________________ ]        │
│                                               │
│  Last Name                                    │
│  [ Doe______________________________ ]        │
│                                               │
│  Email (Read-only)                            │
│  [ john.doe@example.com_____________ ]        │
│                                               │
│  Phone                                        │
│  [ +254 700 000 000_________________ ]        │
│                                               │
│        [    Save Changes (gold)    ]          │
│                                               │
│               Cancel                          │
└───────────────────────────────────────────────┘
```

## Form Inputs

### `First Name`
```tsx
<input
  value={form.firstName}
  onChange={(e) => handleInputChange('firstName', e.target.value)}
  className="input"
  placeholder="Enter first name"
/>
```

### `Submit Button`
```tsx
<button
  type="submit"
  disabled={!canSubmit}
  className="btn-primary w-full"
>
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</button>
```

## Error Handling
- Validation errors (e.g., empty names) are displayed via `inlineMessage`.
- API errors are caught and displayed in the same banner.
- Form inputs are pre-populated from context to prevent data loss on reload.

## Navigation Flow
- Route: `/profile/edit`.
- From Profile Detail: "Edit Profile" button ➞ `/profile/edit`.
- On Success: Stays on page with success message or redirects back to `/profile`.
- Cancel: Redirects to `/profile`.

## Future Enhancements
- Implement real image upload to Cloudinary for the avatar.
- Add field-level validation (e.g., regex for phone numbers).
- Implement "Unsaved Changes" warning when navigating away.
