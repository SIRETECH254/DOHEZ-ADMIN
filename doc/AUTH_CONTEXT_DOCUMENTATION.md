# AuthContext Documentation

## Overview

This document provides comprehensive documentation for the AuthContext implementation in the Appointment Admin web application. The AuthContext provides authentication functionality using Redux as the single source of truth (no useReducer), adapted for a React web environment.

**Location:** `src/contexts/AuthContext.tsx`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [State Management](#state-management)
3. [Storage Strategy](#storage-strategy)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Type Definitions](#type-definitions)

---

## Architecture Overview

The AuthContext provides a centralized authentication system that:

- Uses **Redux** as the single source of truth for all auth state
- Persists authentication state using **localStorage**
- Integrates with **react-router-dom** for navigation
- Provides authentication functions (login, register, OTP, password reset, etc.)
- Handles token refresh and validation automatically via API interceptors
- Manages user profile updates

### Component Structure

```
AuthProvider (Context Provider)
├── Redux Integration (useSelector, useDispatch)
├── localStorage Integration (token persistence)
├── Navigation Integration (react-router-dom)
└── Auth Functions (login, register, logout, etc.)
```

---

## State Management

### Why Redux Only?

- **Single Source of Truth**: All auth state comes from Redux store
- **Consistency**: No conflicts between local and global state
- **Persistence**: Redux Persist handles state persistence automatically
- **Simplicity**: Fewer moving parts, easier to debug

### Redux State Structure

The auth state is managed entirely through Redux:

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Redux Actions Used

The AuthContext uses the following Redux actions from `src/redux/slices/authSlice.ts`:

- `loginStart()` - Sets loading state
- `loginSuccess({ user, accessToken, refreshToken })` - Sets authenticated state
- `loginFailure(error)` - Sets error state
- `registerStart()` - Sets loading for registration
- `registerSuccess()` - Clears loading after registration
- `registerFailure(error)` - Sets registration error
- `logout()` - Clears all auth state
- `updateUser(user)` - Updates user in state
- `setTokens({ accessToken, refreshToken? })` - Updates tokens
- `clearError()` - Clears error state
- `setLoading(boolean)` - Sets loading state
- `setAuthLoading(boolean)` - Sets loading and clears error
- `setAuthSuccess(user)` - Sets user and authenticated state
- `setAuthFailure(error | null)` - Sets error state
- `clearAuth()` - Clears all auth state and resets loading

### State Access

All state is accessed via `useSelector`:

```typescript
const user = useSelector((state: RootState) => state.auth.user);
const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
const isLoading = useSelector((state: RootState) => state.auth.isLoading);
const error = useSelector((state: RootState) => state.auth.error);
```

---

## Storage Strategy

### localStorage Keys

The following keys are used in localStorage:

- `accessToken` - JWT access token
- `refreshToken` - JWT refresh token
- `user` - Serialized user object (JSON string)

### Storage Flow

1. **On Login/Register**: Tokens and user data are stored in localStorage
2. **On App Start**: AuthContext rehydrates state from localStorage
3. **Background Validation**: User profile is refreshed in background without clearing tokens on failure
4. **On Logout**: All tokens and user data are removed from localStorage

### Rehydration Strategy

```typescript
// 1. Rehydrate immediately from localStorage
if (token && storedUser) {
  // Restore state from storage
  dispatch(setAuthSuccess(storedUser));
  dispatch(setTokens({ accessToken: token }));
}

// 2. Background validation (non-blocking)
// Refresh user profile without clearing tokens on failure
```

---

## API Reference

### AuthProvider Props

```typescript
interface AuthProviderProps {
  children: React.ReactNode;
}
```

### Context Value

The AuthContext provides the following value:

```typescript
interface AuthContextValue {
  // State (from Redux)
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth Functions
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (userData: RegisterData) => Promise<AuthResult>;
  verifyOTP: (otpData: OTPData) => Promise<AuthResult>;
  resendOTP: (emailData: { email: string }) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResult>;
  updateProfile: (profileData: ProfileData) => Promise<AuthResult>;
  changePassword: (passwordData: PasswordData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  clearError: () => void;
}
```

### Function Details

#### `login(credentials)`

Authenticates a user with email and password.

**Parameters:**
- `credentials: { email: string; password: string }`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

**Example:**
```typescript
const result = await login({ email: 'user@example.com', password: 'password123' });
if (result.success) {
  // User is authenticated
}
```

#### `register(userData)`

Registers a new user account.

**Parameters:**
- `userData: { firstName: string; lastName: string; email: string; password: string; phone: string }`

**Returns:**
```typescript
Promise<{ success: boolean; data?: any; error?: string }>
```

#### `verifyOTP(otpData)`

Verifies email OTP and activates account.

**Parameters:**
- `otpData: { email: string; otp: string }`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `resendOTP(emailData)`

Resends OTP verification email.

**Parameters:**
- `emailData: { email: string }`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `forgotPassword(email)`

Sends password reset email.

**Parameters:**
- `email: string`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `resetPassword(token, newPassword)`

Resets password using reset token.

**Parameters:**
- `token: string` - Password reset token
- `newPassword: string` - New password

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `updateProfile(profileData)`

Updates user profile information.

**Parameters:**
- `profileData: { firstName?: string; lastName?: string; phone?: string; avatar?: string }`

**Returns:**
```typescript
Promise<{ success: boolean; user?: User; error?: string }>
```

#### `changePassword(passwordData)`

Changes user password.

**Parameters:**
- `passwordData: { currentPassword: string; newPassword: string }`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `logout()`

Logs out the current user and clears all auth data.

**Returns:**
```typescript
Promise<void>
```

**Note:** Automatically navigates to login page after logout.

#### `clearError()`

Clears the current error state.

**Returns:**
```typescript
void
```

---

## Integration Guide

### 1. Provider Setup

Wrap your app with `AuthProvider` in the root:

```typescript
// src/main.tsx
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </PersistGate>
    </Provider>
  </BrowserRouter>,
);
```

### 2. Using Auth in Components

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      email: 'user@example.com',
      password: 'password123',
    });

    if (result.success) {
      // Handle success
    } else {
      // Handle error (result.error)
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <span>Welcome, {user?.firstName}!</span>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 3. Protected Routes

Use the auth state to protect routes:

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

---

## Usage Examples

### Login Flow

```typescript
const { login, isLoading, error } = useAuth();

const handleLogin = async (email: string, password: string) => {
  const result = await login({ email, password });

  if (result.success) {
    // Navigate to home or dashboard
    navigate('/dashboard');
  } else {
    // Error is already set in Redux state
    console.error('Login failed:', result.error);
  }
};
```

### Registration Flow

```typescript
const { register, verifyOTP, resendOTP } = useAuth();

// Step 1: Register
const handleRegister = async (userData) => {
  const result = await register(userData);
  if (result.success) {
    // Show OTP input screen
    setShowOTP(true);
  }
};

// Step 2: Verify OTP
const handleVerifyOTP = async (email: string, otp: string) => {
  const result = await verifyOTP({ email, otp });
  if (result.success) {
    navigate('/dashboard');
  }
};

// Step 3: Resend OTP if needed
const handleResendOTP = async (email: string) => {
  await resendOTP({ email });
};
```

### Profile Update

```typescript
const { updateProfile, user } = useAuth();

const handleUpdateProfile = async (profileData) => {
  try {
    const result = await updateProfile(profileData);
    if (result.success) {
      console.log('Updated user:', result.user);
    }
  } catch (error) {
    // Handle error
  }
};
```

### Logout

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // User is automatically navigated to login page
};
```

---

## Best Practices

### 1. Error Handling

Always check the `success` property and handle errors:

```typescript
const result = await login(credentials);
if (!result.success) {
  alert(result.error);
}
```

### 2. Loading States

Use the `isLoading` state from context to show loading indicators:

```typescript
const { isLoading } = useAuth();
if (isLoading) {
  return <div>Loading...</div>;
}
```

### 3. State Access

Access state directly from context, not from Redux:

```typescript
// ✅ Good
const { user, isAuthenticated } = useAuth();

// ❌ Avoid (unless you need Redux-specific features)
const user = useSelector((state) => state.auth.user);
```

### 4. Token Management

Tokens are automatically managed by AuthContext and the API interceptors:
- Stored in localStorage on login
- Refreshed automatically on 401 errors
- Cleared on logout

### 5. Navigation

Use `react-router-dom` navigation after auth actions:

```typescript
const { login } = useAuth();
const navigate = useNavigate();

const handleLogin = async () => {
  const result = await login(credentials);
  if (result.success) {
    navigate('/dashboard', { replace: true });
  }
};
```

---

## Troubleshooting

### State Not Persisting

- Check if Redux Persist is configured correctly
- Verify localStorage is available (no errors in console)
- Ensure `auth` slice is in the persist whitelist

### Navigation Not Working

- Ensure `react-router-dom` is properly installed
- Check that navigation happens after async operations complete
- Use `navigate('/login', { replace: true })` for auth flows

### Token Refresh Issues

- Check API interceptor configuration in `src/api/config.ts`
- Verify refresh token endpoint is correct
- Check network connectivity

### Error State Not Clearing

- Use `clearError()` function to manually clear errors
- Errors are automatically cleared on new auth attempts

---

## Type Definitions

### User Type

```typescript
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  roles: Role[];
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Auth Result Type

```typescript
interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
  user?: User;
}
```

---

## Notes

- All authentication state is managed through Redux
- Tokens are persisted in localStorage for offline access
- User profile is automatically refreshed on app start
- Background token validation doesn't clear tokens on failure (preserves offline access)
- Navigation is handled automatically on logout
- Error messages come from the API when available

---

**Last Updated:** February 2026  
**Version:** 1.0.0
