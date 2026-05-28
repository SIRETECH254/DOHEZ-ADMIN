# Login Screen Documentation

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
import { Link, useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

import { useAuth } from '../../../contexts/AuthContext';
```

## Context and State Management

### Context

#### `Auth`
- **Hook usage on login screen:** `const { login, isLoading, error, clearError } = useAuth();`

**`login` function (from `AuthContext.tsx`):**
```tsx
const login = async (credentials: LoginPayload): Promise<AuthResult> => {
  dispatch(loginStart());
  dispatch(setAuthLoading(true));

  try {
    const response = await authAPI.login(credentials);
    const { user: userData, accessToken, refreshToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));

    dispatch(
      loginSuccess({
        user: userData,
        accessToken,
        refreshToken,
      }),
    );

    return { success: true };
  } catch (loginError: any) {
    const errorMessage =
      loginError?.response?.data?.message || loginError?.message || 'Login failed';
    dispatch(loginFailure(errorMessage));
    dispatch(setAuthFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};
```

#### `Redux`
- **Redux slice:** `redux/slices/authSlice.ts` stores `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isLoading`, and `error`.

**`isLoading` selector reused via `useAuth`:**
```tsx
const isLoading = useSelector((state: RootState) => state.auth.isLoading);
```

### Form State

#### `form`
- **Form state:** single `form` object `{ email, password }` managed with `useState`.
```tsx
const [form, setForm] = useState({ email: '', password: '' })
```

#### `rememberMe`
- **Remember me state:** boolean to determine if the session should persist via the refresh token.
```tsx
const [rememberMe, setRememberMe] = useState(true)
```

#### `isPasswordVisible`
- **Password visibility state:** boolean to toggle password field visibility.
```tsx
const [isPasswordVisible, setIsPasswordVisible] = useState(false)
```

#### `isSubmitting`
- **Submission state:** boolean to track if the login request is currently in progress.
```tsx
const [isSubmitting, setIsSubmitting] = useState(false)
```

#### `inlineError`
- **Inline error state:** stores local validation or API error messages to be displayed in the UI.
```tsx
const [inlineError, setInlineError] = useState<string | null>(null)
```

## Functions Involved

### `onSubmit()`
**purpose:** Orchestrates local validation, calls the login function from context, handles navigation upon success, and manages session persistence (removing the refresh token if "Remember me" is unchecked).

**process:**
1. Prevents the default browser form submission.
2. Trims the email input to ensure no trailing spaces interfere with authentication.
3. Checks if both email and password are provided; if not, sets a local `inlineError`.
4. Resets `inlineError` and sets `isSubmitting` to `true` to show loading state.
5. Calls the `login` function with the form data.
6. If login fails, updates `inlineError` with the error message.
7. If login succeeds:
    - Checks the `rememberMe` state; if false, removes the `refreshToken` from `localStorage`.
    - Navigates the user to the `/dashboard`.
8. In the `finally` block, sets `isSubmitting` to `false`.

**function implementation:**
```tsx
  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      // Trim email before sending to the API.
      const trimmedEmail = form.email.trim()
      if (!trimmedEmail || !form.password) {
        setInlineError('Please enter both email and password.')
        return
      }

      // Clear old errors and start the button loader.
      setInlineError(null)
      setIsSubmitting(true)

      try {
        // Send the form object as the login payload.
        const result = await login({ ...form, email: trimmedEmail })
        if (!result.success) {
          setInlineError(result.error ?? 'Unable to sign in.')
          return
        }

        // If remember me is unchecked, drop the refresh token.
        if (!rememberMe) {
          localStorage.removeItem('refreshToken')
        }

        // Redirect to the authenticated landing page.
        navigate('/dashboard', { replace: true })
      } finally {
        // Always stop the loader.
        setIsSubmitting(false)
      }
    },
    [form, rememberMe, login, navigate],
  )
```

### `handleInputChange()`
**purpose:** A shared handler for all form fields that updates the local state and clears any existing error messages to provide immediate feedback.

**process:**
1. Updates the `form` state with the new value for the specified field.
2. Checks if there is a global authentication error from Redux and clears it if present.
3. Resets the local `inlineError` to `null`.

**function implementation:**
```tsx
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      // Update the form and clear any visible errors.
      setForm((previous) => ({ ...previous, [name]: value }))
      if (error) {
        clearError()
      }
      setInlineError(null)
    },
    [error, clearError],
  )
```

### `canSubmit`
**purpose:** A memoized boolean that determines whether the login form is valid and ready for submission.

**process:**
1. Trims the email to ensure whitespace-only input is caught.
2. Checks if both email and password fields are non-empty.
3. Ensures no submission is currently in progress (`isSubmitting` is false).
4. Ensures the authentication context isn't already loading (`isLoading` is false).

**function implementation:**
```tsx
  const canSubmit = useMemo(
    () =>
      Boolean(form.email.trim() && form.password) &&
      !isSubmitting &&
      !isLoading,
    [form.email, form.password, isSubmitting, isLoading],
  )
```

## API Integration

### `POST /api/auth/login`

#### Interface
```tsx
export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}
```

#### API
```typescript
export const authAPI = {
  // Login with credentials and receive tokens.
  login: (credentials: LoginPayload) => api.post('/api/auth/login', credentials),
}
```

#### Auth Function
```tsx
const login = async (credentials: LoginPayload): Promise<AuthResult> => {
  dispatch(loginStart());
  dispatch(setAuthLoading(true));

  try {
    const response = await authAPI.login(credentials);
    const { user: userData, accessToken, refreshToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));

    dispatch(
      loginSuccess({
        user: userData,
        accessToken,
        refreshToken,
      }),
    );

    return { success: true };
  } catch (loginError: any) {
    const errorMessage =
      loginError?.response?.data?.message || loginError?.message || 'Login failed';
    dispatch(loginFailure(errorMessage));
    dispatch(setAuthFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};
```

#### Contract
`data.data` contains `{ user, accessToken, refreshToken }`.

#### Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "avatar": "string",
      "roles": [
        {
          "_id": "string",
          "name": "string",
          "displayName": "string"
        }
      ],
      "isVerified": true
    },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

#### Token Handling
Tokens saved to `localStorage`; Redux receives `loginSuccess`.

#### Error Handling
API returns a message in `response.data.message`; fallback to a generic error message if unavailable.

## UI Structure
- **Screen shell:** full-height `div` with a white background and centered content.
- **Typography:** regular HTML elements styled with Tailwind utilities.
- **Layout helpers:** open layout (no card) with a max-width container.
- **Branding:** header text block (title + subtitle).
- **Feedback:** inline error banner shown below inputs.

## Planned Layout
```
┌───────────────────────────────┐
│            Header             │
│   “Welcome back” (H1 style)   │
├───────────────────────────────┤
│           Subtitle            │
│   (“Sign in to manage...”)    │
├───────────────────────────────┤
│        Email Input            │
├───────────────────────────────┤
│       Password Input          │
├───────────────────────────────┤
│ [ ] Remember me    Forgot?    │
├───────────────────────────────┤
│        Primary Button         │
├───────────────────────────────┤
│  Inline error / status text   │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│            White background                  │
│                                               │
│  Appointment Admin                            │
│  Welcome back                                 │
│  Sign in to manage appointments...            │
│                                               │
│  Email  [______________________________]      │
│  Password [__________________________] (👁)   │
│                                               │
│  [ ] Remember me            Forgot password?  │
│                                               │
│        [  Sign in (gold)  ]                   │
│                                               │
│  Inline error text (if any)                   │
│                                               │
│  Need access? Contact your administrator.     │
└───────────────────────────────────────────────┘
```

## Form Inputs`

### `Email Field`
**Purpose**: Collects the user's email address for authentication.
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

### `Password Field`
**Purpose**: Collects the user's password for authentication.
**Applicable**: Toggles visibility via `isPasswordVisible` state and uses a custom toggle button icon.

**Input implementation**:
```tsx
<div className="relative">
  <input
    value={form.password}
    onChange={(event) =>
      handleInputChange('password', event.target.value)
    }
    autoComplete="current-password"
    type={isPasswordVisible ? 'text' : 'password'}
    placeholder="••••••••"
    className="input-password"
  />
  <button
    type="button"
    onClick={() =>
      setIsPasswordVisible((previous) => !previous)
    }
    aria-label={
      isPasswordVisible ? 'Hide password' : 'Show password'
    }
    className="input-toggle-icon"
  >
    {isPasswordVisible ? (
      <MdVisibilityOff size={20} />
    ) : (
      <MdVisibility size={20} />
    )}
  </button>
</div>
```

### `Remember Me Toggle`
**Purpose**: Allows the user to choose if their session should persist.
**Applicable**: Resets `inlineError` on toggle.

**Input implementation**:
```tsx
<input
  type="checkbox"
  checked={rememberMe}
  onChange={() => {
    setRememberMe((previous) => !previous)
    setInlineError(null)
    if (error) {
      clearError()
    }
  }}
  className="auth-checkbox"
/>
```

### `Submit Button`
**Purpose**: Triggers the authentication process.
**Applicable**: Disables when submission is in progress or fields are incomplete.

**Input implementation**:
```tsx
<button
  type="submit"
  disabled={!canSubmit}
  className="auth-button"
>
  {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
</button>
```

## Error Handling
- `useAuth` dispatches `loginFailure` and `setAuthFailure`, populating Redux `error`.
- Login screen shows a banner for `inlineError` or Redux `error`.
- Client-side checks ensure inputs are not empty before submission.
- `handleInputChange` clears stale errors as soon as the user edits inputs.
- Input values persist in local state after failures to avoid retyping.

## Navigation Flow
- Route: `/login`.
- On app launch, `/` redirects based on auth state:
  - Authenticated ➞ `/dashboard`.
  - Not authenticated ➞ `/login`.
- Successful login ➞ `navigate('/dashboard', { replace: true })`.
- Secondary navigation:
  - “Forgot password?” ➞ `/forgot-password`.
  - “Back to sign in” link on other pages ➞ `/login`.

## Future Enhancements
- Add optional form libraries (`react-hook-form`) when advanced validation is required.
- Introduce branded logo assets once design system finalizes.
- Provide account recovery hints for locked or disabled accounts.
- Add rate-limit feedback when the API returns those states.
