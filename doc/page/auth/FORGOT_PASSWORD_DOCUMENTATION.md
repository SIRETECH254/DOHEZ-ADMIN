# Forgot Password Screen Documentation

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
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
```

## Context and State Management

### Context

#### Auth
- **Hook usage on forgot password screen:** `const { forgotPassword, error, clearError } = useAuth();`

**`forgotPassword` function (from `AuthContext.tsx`):**
```tsx
const forgotPassword = async (email: string): Promise<AuthResult> => {
  try {
    await authAPI.forgotPassword({ email });
    return { success: true };
  } catch (forgotError: any) {
    const errorMessage =
      forgotError?.response?.data?.message || forgotError?.message || 'Failed to send reset email';
    return { success: false, error: errorMessage };
  }
};
```

### Form State

#### `form`
- **Form state:** single `form` object `{ email }` managed with `useState`.
```tsx
const [form, setForm] = useState({ email: '' })
```

#### `inlineMessage`
- **Inline message state:** stores success or error feedback messages to be displayed in the UI.
```tsx
const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null)
```

#### `isSubmitting`
- **Submission state:** boolean to track if the reset link request is currently in progress.
```tsx
const [isSubmitting, setIsSubmitting] = useState(false)
```

## Functions Involved

### `handleSubmit()`
**purpose:** Orchestrates local validation and calls the `forgotPassword` function from the auth context to request a reset link.

**process:**
1. Prevents the default browser form submission.
2. Trims the email input to ensure no trailing spaces interfere with the request.
3. Checks if the email is provided; if not, sets a local `inlineMessage` of type `error`.
4. Resets `inlineMessage` and sets `isSubmitting` to `true` to show loading state.
5. Calls the `forgotPassword` function with the trimmed email.
6. If the request fails, updates `inlineMessage` with the error message.
7. If the request succeeds, updates `inlineMessage` with a success message instructing the user to check their inbox.
8. In the `finally` block, sets `isSubmitting` to `false`.

**function implementation:**
```tsx
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmedEmail = form.email.trim()

      if (!trimmedEmail) {
        setInlineMessage({
          type: 'error',
          text: 'Please enter your email address.',
        })
        return
      }

      setInlineMessage(null)
      setIsSubmitting(true)

      try {
        // Send the form object as the payload source.
        const result = await forgotPassword(trimmedEmail)
        if (!result.success) {
          setInlineMessage({
            type: 'error',
            text: result.error ?? 'Unable to send reset link.',
          })
          return
        }

        setInlineMessage({
          type: 'success',
          text: 'Check your inbox for password reset instructions.',
        })
      } catch {
        setInlineMessage({
          type: 'error',
          text: 'Unexpected error. Please try again.',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [form.email, forgotPassword],
  )
```

### `handleInputChange()`
**purpose:** A handler for the email field that updates the local state and clears any existing messages to provide immediate feedback.

**process:**
1. Updates the `form` state with the new value for the specified field.
2. Checks if there is a global authentication error from Redux and clears it if present.
3. Resets the local `inlineMessage` to `null`.

**function implementation:**
```tsx
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      // Update form and clear any errors.
      setForm((previous) => ({ ...previous, [name]: value }))
      if (error) {
        clearError()
      }
      setInlineMessage(null)
    },
    [error, clearError],
  )
```

### `canSubmit`
**purpose:** A memoized boolean that determines whether the form is valid and ready for submission.

**process:**
1. Trims the email to ensure whitespace-only input is caught.
2. Checks if the email field is non-empty.
3. Ensures no submission is currently in progress (`isSubmitting` is false).

**function implementation:**
```tsx
  const canSubmit = useMemo(
    () => Boolean(form.email.trim()) && !isSubmitting,
    [form.email, isSubmitting],
  )
```

## API Integration

### `POST /api/auth/forgot-password`

#### Interface
```tsx
export interface ForgotPasswordPayload {
  email: string;
}
```

#### API
```typescript
export const authAPI = {
  // Request a password reset email.
  forgotPassword: (data: ForgotPasswordPayload) => api.post('/api/auth/forgot-password', data),
}
```

#### Auth Function
```tsx
const forgotPassword = async (email: string): Promise<AuthResult> => {
  try {
    await authAPI.forgotPassword({ email });
    return { success: true };
  } catch (forgotError: any) {
    const errorMessage =
      forgotError?.response?.data?.message || forgotError?.message || 'Failed to send reset email';
    return { success: false, error: errorMessage };
  }
};
```

#### Contract
Request body contains the user's `email`.

#### Response
Successful response (200 OK) with a success message indicating the email was sent.

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## UI Structure
- **Screen shell:** full-height `div` with a white background and centered content.
- **Typography:** regular HTML elements styled with Tailwind utilities.
- **Layout helpers:** open layout (no card) with a max-width container.
- **Branding:** header text block (title + subtitle).
- **Feedback:** success or error banner shown below inputs.

## Planned Layout
```
┌───────────────────────────────┐
│            Header             │
│  “Forgot password?” (H1 style)│
├───────────────────────────────┤
│           Subtitle            │
│  (“Enter your email...”)      │
├───────────────────────────────┤
│        Email Input            │
├───────────────────────────────┤
│        Primary Button         │
├───────────────────────────────┤
│  Inline success / error text  │
├───────────────────────────────┤
│      Back to sign in link     │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│            White background                  │
│                                               │
│  Appointment Admin                            │
│  Forgot password?                             │
│  Enter your email address and we will send... │
│                                               │
│  Email  [______________________________]      │
│                                               │
│        [  Send reset link (gold)  ]           │
│                                               │
│  Inline message (success or error)            │
│                                               │
│  Remembered your password? Back to sign in    │
└───────────────────────────────────────────────┘
```

## Form Inputs

### `Email Field`
**Purpose**: Collects the user's email address to request a reset link.
**Applicable**: Uses `autoCapitalize="none"` and `autoComplete="email"` for better UX.

**Input implementation**:
```tsx
<input
  value={form.email}
  onChange={(event) =>
    handleInputChange('email', event.target.value)
  }
  autoCapitalize="none"
  autoComplete="email"
  type="email"
  placeholder="admin@example.com"
  className="input"
/>
```

### `Submit Button`
**Purpose**: Triggers the password reset request process.
**Applicable**: Disables when submission is in progress or the email field is empty.

**Input implementation**:
```tsx
<button
  type="submit"
  disabled={!canSubmit}
  className="auth-button"
>
  {isSubmitting ? 'Sending...' : 'Send reset link'}
</button>
```

## Error Handling
- `useAuth` handles the API call and provides a generic error if it fails.
- The screen uses `inlineMessage` to display both validation errors and API errors.
- `handleInputChange` clears stale messages as soon as the user edits the input.
- Successful requests trigger a success message banner without redirecting, allowing the user to see the confirmation.

## Navigation Flow
- Route: `/forgot-password`.
- From Login: “Forgot password?” link ➞ `/forgot-password`.
- Secondary navigation:
  - “Back to sign in” ➞ `/login`.

## Future Enhancements
- Implement a countdown or rate-limiting feedback if the user tries to send multiple requests in a short time.
- Add a confirmation step or redirect to a "success" screen to prevent multiple submissions.
