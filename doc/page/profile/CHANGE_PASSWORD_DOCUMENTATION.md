# Change Password Documentation

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
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../../../contexts/AuthContext';
```

## Context and State Management

### Context

#### `Auth`
- **Hook usage:** `const { changePassword, error, clearError } = useAuth();`
- Provides the function to change the user's password and access to global auth errors.

### Form State

#### `form`
- **Form state:** managed with `useState`.
```tsx
const [form, setForm] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
```

#### `isPasswordVisible`
- **Visibility state:** toggles for each password field.
```tsx
const [visibility, setVisibility] = useState({
  current: false,
  new: false,
  confirm: false
})
```

#### `inlineMessage`
- **Inline message state:** stores success or error feedback messages.
```tsx
const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
```

## Functions Involved

### `handleSubmit()`
**purpose:** Orchestrates the password change process, including validation and calling the API.

**process:**
1. Prevents default form submission.
2. Validates that all fields are filled.
3. Validates that `newPassword` and `confirmPassword` match.
4. Calls the `changePassword` function from the auth context.
5. If successful, shows a success message and potentially clears the form.
6. If it fails, displays the error returned by the API.

**function implementation (planned):**
```tsx
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setInlineMessage(null);

      if (form.newPassword !== form.confirmPassword) {
        setInlineMessage({ type: 'error', text: 'New passwords do not match.' });
        return;
      }

      const result = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });

      if (result.success) {
        setInlineMessage({ type: 'success', text: 'Password updated successfully!' });
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setInlineMessage({ type: 'error', text: result.error ?? 'Failed to update password' });
      }
    },
    [form, changePassword]
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

### `PUT /api/users/change-password`

#### Interface
```tsx
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
```

#### API
```typescript
export const userAPI = {
  // Change password
  changePassword: (passwordData: ChangePasswordPayload) => api.put('/api/users/change-password', passwordData),
}
```

#### Auth Function
```tsx
const changePassword = async (passwordData: ChangePasswordPayload): Promise<AuthResult> => {
  try {
    await userAPI.changePassword(passwordData);
    return { success: true };
  } catch (error) {
    // ... handle error
  }
};
```

## UI Structure
- **Container:** Maximum width container (`max-w-md`) centered on the page.
- **Card:** White background card containing the form.
- **Form Groups:** Vertical arrangement of labels and password inputs with visibility toggles.
- **Actions:** Update Password button and a back link.

## Planned Layout
```
┌───────────────────────────────┐
│       Change Password         │
├───────────────────────────────┤
│    Current Password Input     │
├───────────────────────────────┤
│      New Password Input       │
├───────────────────────────────┤
│    Confirm Password Input     │
├───────────────────────────────┤
│      [ Update Password ]      │
├───────────────────────────────┤
│           [ Back ]            │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│              Change Password                  │
│                                               │
│  Current Password                             │
│  [ •••••••••••••••••••••••••• ] (👁)          │
│                                               │
│  New Password                                 │
│  [ •••••••••••••••••••••••••• ] (👁)          │
│                                               │
│  Confirm New Password                         │
│  [ •••••••••••••••••••••••••• ] (👁)          │
│                                               │
│        [   Update Password (gold)   ]         │
│                                               │
│                 Back                          │
└───────────────────────────────────────────────┘
```

## Form Inputs

### `Password Field`
```tsx
<div className="relative">
  <input
    type={visibility.new ? 'text' : 'password'}
    value={form.newPassword}
    onChange={(e) => handleInputChange('newPassword', e.target.value)}
    className="input-password"
    placeholder="New password"
  />
  <button
    type="button"
    onClick={() => toggleVisibility('new')}
    className="input-toggle-icon"
  >
    {visibility.new ? <MdVisibilityOff /> : <MdVisibility />}
  </button>
</div>
```

## Error Handling
- Checks for password mismatch before calling the API.
- Displays API errors (e.g., incorrect current password) via `inlineMessage`.
- Clears errors as the user starts typing again.

## Navigation Flow
- Route: `/profile/change-password`.
- From Profile Detail: "Change Password" action ➞ `/profile/change-password`.
- On Success: Stays on page with success message or redirects to `/profile`.
- Back: Redirects to `/profile`.

## Future Enhancements
- Add password strength meter.
- Implement account lockout after multiple failed "current password" attempts.
- Add "Forgot Password" link as a secondary option.
