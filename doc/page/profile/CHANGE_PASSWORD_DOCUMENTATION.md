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
import { MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md';
import { useAuth } from '../../../contexts/AuthContext';
```

## Context and State Management

### Context

#### `Auth`
- **Hook usage:** `const { changePassword } = useAuth();`
- Provides the function to change the user's password.

**`changePassword` function (from `AuthContext.tsx`):**
```tsx
const changePassword = async (passwordData: ChangePasswordPayload): Promise<AuthResult> => {
  try {
    await userAPI.changePassword(passwordData);
    return { success: true };
  } catch (changeError: any) {
    const errorMessage =
      changeError?.response?.data?.message || changeError?.message || 'Failed to change password';
    return { success: false, error: errorMessage };
  }
};
```

### Form State

#### `form`
- **Form state:** managed with `useState` to track current, new, and confirm password fields.
```tsx
const [form, setForm] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
```

#### `visibility`
- **Visibility state:** toggles for each password field (`current`, `new`, `confirm`).
```tsx
const [visibility, setVisibility] = useState({
  current: false,
  new: false,
  confirm: false
})
```

#### `inlineMessage`
- **Feedback state:** stores success or error messages after a submission attempt.
```tsx
const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
```

#### `isSubmitting`
- **Loading state:** boolean to disable buttons while the request is in progress.
```tsx
const [isSubmitting, setIsSubmitting] = useState(false)
```

## Functions Involved

### `handleSubmit()`
**purpose:** Orchestrates the password change process, including validation and calling the API.

**process:**
1. Prevents default form submission.
2. Resets `inlineMessage` and sets `isSubmitting` to `true`.
3. Validates that `newPassword` and `confirmPassword` match.
4. Calls the `changePassword` function from the auth context.
5. If successful, shows a success message and clears the form.
6. If it fails, displays the error returned by the API.
7. Sets `isSubmitting` to `false` in the `finally` block.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setInlineMessage(null);

    if (form.newPassword !== form.confirmPassword) {
      setInlineMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      if (result.success) {
        setInlineMessage({ type: 'success', text: 'Password updated successfully!' });
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setInlineMessage({ type: 'error', text: result.error ?? 'Failed to update password.' });
      }
    } catch (err) {
      setInlineMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, changePassword]);
```

### `handleInputChange()`
**purpose:** Updates the form state as the user types.

**process:**
1. Updates the specific field in the `form` object.
2. Clears any existing `inlineMessage`.

**function implementation:**
```tsx
  const handleInputChange = useCallback((name: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setInlineMessage(null);
  }, []);
```

### `canSubmit`
**purpose:** A memoized boolean that determines whether the form is ready for submission.

**implementation:**
```tsx
  const canSubmit = useMemo(
    () => form.currentPassword && form.newPassword && form.confirmPassword && !isSubmitting,
    [form, isSubmitting]
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

#### Payload
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

#### API
```typescript
export const userAPI = {
  // Change password
  changePassword: (passwordData: ChangePasswordPayload) => api.put('/api/users/change-password', passwordData),
}
```

#### Response
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## UI Structure
- **Screen shell:** Uses `auth-page` and `auth-container` classes for consistent layout.
- **Form:** Uses `auth-form` space-y-5.
- **Inputs:** `input-password` class for password fields with visibility toggles.
- **Feedback:** A color-coded banner for success (green) or error (red) messages.

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

### `Current Password Field`
**Purpose**: Collects the user's current password for verification.
**Applicable**: Uses `input-password` class and toggles visibility via `visibility.current` state.

**Input implementation**:
```tsx
<div className="relative">
  <input
    type={visibility.current ? 'text' : 'password'}
    value={form.currentPassword}
    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
    className="input-password"
    placeholder="••••••••"
  />
  <button
    type="button"
    onClick={() => toggleVisibility('current')}
    className="input-toggle-icon"
  >
    {visibility.current ? <MdVisibilityOff /> : <MdVisibility />}
  </button>
</div>
```

### `New Password Field`
**Purpose**: Collects the new password.
**Applicable**: Uses `input-password` class and toggles visibility via `visibility.new` state.

**Input implementation**:
```tsx
<div className="relative">
  <input
    type={visibility.new ? 'text' : 'password'}
    value={form.newPassword}
    onChange={(e) => handleInputChange('newPassword', e.target.value)}
    className="input-password"
    placeholder="••••••••"
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

### `Confirm Password Field`
**Purpose**: Confirms the new password.
**Applicable**: Uses `input-password` class and toggles visibility via `visibility.confirm` state.

**Input implementation**:
```tsx
<div className="relative">
  <input
    type={visibility.confirm ? 'text' : 'password'}
    value={form.confirmPassword}
    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
    className="input-password"
    placeholder="••••••••"
  />
  <button
    type="button"
    onClick={() => toggleVisibility('confirm')}
    className="input-toggle-icon"
  >
    {visibility.confirm ? <MdVisibilityOff /> : <MdVisibility />}
  </button>
</div>
```

### `Submit Button`
**Purpose**: Triggers the password update request.
**Applicable**: Disables when submission is in progress or fields are empty.

**Input implementation**:
```tsx
<button
  type="submit"
  disabled={!canSubmit}
  className="auth-button"
>
  {isSubmitting ? 'Updating...' : 'Update Password'}
</button>
```


## Error Handling
- Checks for password mismatch before calling the API.
- Displays API errors (e.g., incorrect current password) via `inlineMessage`.
- Clears errors as the user starts typing again.

## Navigation Flow
- Route: `/profile/change-password`.
- From Profile Detail: "Change Password" action ➞ `/profile/change-password`.
- Back: Redirects to `/profile`.

## Future Enhancements
- Add password strength meter.
- Implement account lockout after multiple failed attempts.
- Add "Forgot Password" link as a secondary option if they forget their current password.
