# Login Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Inputs](#form-inputs)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

import { useAuth } from '../../../contexts/AuthContext';
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.tsx` wraps the app and exposes the `useAuth` hook.
- **Redux slice:** `redux/slices/authSlice.ts` stores `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isLoading`, and `error`.
- **Persistent storage:** `localStorage` stores tokens and serialized user data.
- **Hook usage on login screen:** `const { login, isLoading, error, clearError } = useAuth();`
- **Form state:** single `form` object `{ email, password }` managed with `useState`.

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

**`isLoading` selector reused via `useAuth`:**
```tsx
const isLoading = useSelector((state: RootState) => state.auth.isLoading);
```

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

## Form Inputs
- **Email field**
  ```tsx
  <input
    value={form.email}
    onChange={(event) => handleInputChange('email', event.target.value)}
    autoCapitalize="none"
    autoComplete="email"
    type="email"
    placeholder="admin@example.com"
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
  />
  ```

- **Password field** (show/hide toggle)
  ```tsx
  <input
    value={form.password}
    onChange={(event) => handleInputChange('password', event.target.value)}
    autoComplete="current-password"
    type={isPasswordVisible ? 'text' : 'password'}
    placeholder="••••••••"
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900"
  />
  ```

- **Remember me toggle**
  ```tsx
  <input
    type="checkbox"
    checked={rememberMe}
    onChange={() => {
      setRememberMe((previous) => !previous);
      setInlineError(null);
    }}
    className="h-4 w-4 accent-[#D4AF37]"
  />
  ```

- **Submit button**
  ```tsx
  <button
    type="submit"
    disabled={!canSubmit}
    className="w-full rounded-xl bg-[#D4AF37] py-3 text-sm font-semibold text-white"
  >
    {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
  </button>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `authAPI.login`.
- **Endpoint:** `POST /api/auth/login`.
- **Payload:** `{ email: string; password: string }`.
- **Response contract:** `data.data` contains `{ user, accessToken, refreshToken }`.
- **Token handling:** tokens saved to `localStorage`; Redux receives `loginSuccess`.
- **Error responses:** API returns a message in `response.data.message`; fallback to generic message.


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

## Functions Involved
- **`onSubmit`** — orchestrates local validation, calls `login`, handles navigation, and clears the refresh token when “remember me” is unchecked.
  ```tsx
  const onSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setInlineError('Please enter both email and password.');
      return;
    }

    setInlineError(null);
    setIsSubmitting(true);

    try {
      const result = await login({ email: trimmedEmail, password });
      if (!result.success) {
        setInlineError(result.error ?? 'Unable to sign in.');
        return;
      }

      if (!rememberMe) {
        localStorage.removeItem('refreshToken');
      }

      navigate('/dashboard', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, rememberMe, login, navigate]);
  ```

- **`handleInputChange`** — clears Redux and inline errors whenever the user adjusts a field.
  ```tsx
  const handleInputChange = useCallback(() => {
    if (error) {
      clearError();
    }
    setInlineError(null);
  }, [error, clearError]);
  ```

## Future Enhancements
- Add optional form libraries (`react-hook-form`) when advanced validation is required.
- Introduce branded logo assets once design system finalizes.
- Provide account recovery hints for locked or disabled accounts.
- Add rate-limit feedback when the API returns those states.
