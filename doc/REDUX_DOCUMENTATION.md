# Redux Documentation

## Overview

This document provides comprehensive documentation for Redux state management in the Appointment Admin application. The Redux setup uses Redux Toolkit for simplified state management and Redux Persist for state persistence across app restarts (browser sessions).

**Reference Structure:** This implementation is based on the store structure from the SIRE-ADMIN project, adapted for the APPOINTMENT ADMIN project.

**Location:** All Redux files are located in the `redux/` folder (under `src/redux/`).

---

## Table of Contents

1. [Installation](#installation)
2. [Project Structure](#project-structure)
3. [Store Configuration](#store-configuration)
4. [Slices](#slices)
5. [TypeScript Types](#typescript-types)
6. [Usage in Components](#usage-in-components)
7. [Best Practices](#best-practices)
8. [Integration with API](#integration-with-api)
9. [Adding New Slices](#adding-new-slices)
10. [Redux DevTools](#redux-devtools)
11. [Troubleshooting](#troubleshooting)
12. [Reference](#reference)
13. [Notes](#notes)

---

## Installation

The following packages are required for Redux in this project:

```bash
npm install @reduxjs/toolkit react-redux redux-persist
```

### Dependencies

- **@reduxjs/toolkit** - Official Redux Toolkit for simplified Redux logic
- **react-redux** - React bindings for Redux
- **redux-persist** - Persist and rehydrate Redux store using localStorage (web)

---

## Project Structure

```
src/redux/
├── index.ts              # Store configuration and exports
├── types.ts              # TypeScript type definitions
├── hooks.ts              # Typed useAppDispatch / useAppSelector (optional)
└── slices/
    └── authSlice.ts      # Authentication slice
```

### File Descriptions

- **`redux/index.ts`** - Main store configuration file that:
  - Configures the Redux store
  - Sets up Redux Persist with localStorage
  - Combines all reducers
  - Exports store, persistor, and types

- **`redux/types.ts`** - TypeScript type definitions for:
  - State interfaces
  - User and Role types (aligned with API types)
  - Root state type

- **`redux/slices/authSlice.ts`** - Authentication slice containing:
  - Auth state management
  - Login/Register actions
  - User management actions
  - Token management

- **`redux/hooks.ts`** - Typed hooks for use in components:
  - `useAppDispatch` - Typed dispatch
  - `useAppSelector` - Typed selector with RootState

---

## Store Configuration

### Store Setup

The store is configured in `redux/index.ts`:

```typescript
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
// Custom storage adapter for redux-persist (localStorage with async API)
const storage = {
  getItem: (key: string): Promise<string | null> =>
    Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string): Promise<void> =>
    Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key: string): Promise<void> =>
    Promise.resolve(localStorage.removeItem(key)),
};

// Redux Persist configuration (localStorage for web)
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.DEV, // Enable Redux DevTools in development
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type { RootState };
```

### Key Features

1. **Redux Persist** - Automatically saves and restores auth state using localStorage
2. **Redux DevTools** - Enabled in development mode for debugging
3. **TypeScript Support** - Full type safety with TypeScript
4. **Middleware** - Configured to handle redux-persist actions

---

## Slices

### Auth Slice

The auth slice manages authentication state including user data, tokens, and authentication status.

#### State Structure

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

#### Available Actions

##### Login Actions

- **`loginStart()`** - Initiates login process
  - Sets `isLoading` to `true`
  - Clears any previous errors

- **`loginSuccess(payload)`** - Handles successful login
  - Payload: `{ user: User, accessToken: string, refreshToken: string }`
  - Sets user data and tokens
  - Sets `isAuthenticated` to `true`

- **`loginFailure(error)`** - Handles login failure
  - Payload: `string` (error message)
  - Sets error message
  - Resets auth state

##### Register Actions

- **`registerStart()`** - Initiates registration process
- **`registerSuccess()`** - Handles successful registration
- **`registerFailure(error)`** - Handles registration failure

##### Other Actions

- **`logout()`** - Clears all auth data and logs out user
- **`updateUser(user)`** - Updates user information in state
- **`setTokens(tokens)`** - Updates access and refresh tokens
- **`clearError()`** - Clears error message
- **`setLoading(boolean)`** - Sets loading state
- **`setAuthLoading(boolean)`** - Sets loading and clears error
- **`setAuthSuccess(user)`** - Sets user and authenticated state
- **`setAuthFailure(error | null)`** - Sets error and clears loading
- **`clearAuth()`** - Clears all auth state

#### Usage Example

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import type { RootState } from '../redux';

// In a component
const dispatch = useDispatch();
const { user, isAuthenticated, isLoading } = useSelector(
  (state: RootState) => state.auth
);

// Dispatch login action
dispatch(loginStart());
```

---

## TypeScript Types

### User and Role Types

The `User` and `Role` types are imported and re-exported from `../types/api.types` to maintain a single source of truth for these core entities. For their detailed structure, refer to `src/types/api.types.ts`.

```typescript
import type { IUser, IRole } from '../../types/api.types'; // Path relative to slices or hooks
export type User = IUser;
export type Role = IRole;
```

### Auth State Type

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

### Root State Type

```typescript
interface RootState {
  auth: AuthState;
}
```

---

## Usage in Components

### Provider Setup

The Redux Provider is set up in `src/main.tsx`:

```typescript
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>,
);
```

### Using Hooks in Components

#### useSelector Hook

Access state from Redux store:

```typescript
import { useSelector } from 'react-redux';
import type { RootState } from '../redux';

function MyComponent() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return (
    <div>
      {isAuthenticated ? (
        <span>Welcome, {user?.firstName}!</span>
      ) : (
        <span>Please log in</span>
      )}
    </div>
  );
}
```

#### useDispatch Hook

Dispatch actions to update state:

```typescript
import { useDispatch } from 'react-redux';
import { loginSuccess, loginFailure, logout } from '../redux/slices/authSlice';

function LoginComponent() {
  const dispatch = useDispatch();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      const response = await authAPI.login(credentials);
      const { data } = response.data;
      dispatch(loginSuccess({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }));
    } catch (error: unknown) {
      const message = error?.response?.data?.message ?? 'Login failed';
      dispatch(loginFailure(typeof message === 'string' ? message : 'Login failed'));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (/* Your component JSX */);
}
```

### Typed Hooks (Recommended)

Use the typed hooks from `redux/hooks.ts` for full type safety:

```typescript
// redux/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

Then use them in components:

```typescript
import { useAppDispatch, useAppSelector } from '../redux/hooks';

function MyComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  // TypeScript will provide full type safety
}
```

---

## Integration with API

### Example: Login Flow

```typescript
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import { authAPI } from '../api';

async function handleLogin(email: string, password: string) {
  dispatch(loginStart());

  try {
    const response = await authAPI.login({ email, password });

    if (response.data.success && response.data.data) {
      const { user, accessToken, refreshToken } = response.data.data;

      // Token storage may be handled by API client (e.g. axios interceptor)
      // or explicitly: localStorage.setItem('accessToken', accessToken); etc.

      dispatch(loginSuccess({ user, accessToken, refreshToken }));
    }
  } catch (error: unknown) {
    const message =
      error?.response?.data?.message ?? 'Login failed';
    dispatch(loginFailure(typeof message === 'string' ? message : 'Login failed'));
  }
}
```

### Example: Logout Flow

```typescript
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { authAPI } from '../api';

async function handleLogout() {
  try {
    await authAPI.logout();
  } catch {
    // Continue with logout even if API call fails
  } finally {
    // Clear localStorage if tokens are stored there
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    dispatch(logout());
  }
}
```

---

## Best Practices

### 1. State Structure

- Keep state normalized and flat
- Avoid nested state structures
- Use slices to organize related state

### 2. Actions

- Use Redux Toolkit's `createSlice` for action creators
- Keep actions focused and specific
- Use descriptive action names

### 3. Selectors

- Create reusable selectors for complex state access
- Use `useSelector` with specific state paths
- Avoid selecting entire state objects

### 4. Performance

- Use `useSelector` with equality functions when needed
- Memoize selectors for expensive computations
- Avoid unnecessary re-renders by selecting only needed state

### 5. Type Safety

- Always use TypeScript types
- Export and use `RootState` type
- Type action payloads properly

### 6. Error Handling

- Always handle errors in async actions
- Use error state in slices
- Display user-friendly error messages

### 7. Testing

- Test reducers with different action payloads
- Test selectors with various state shapes
- Mock store for component testing

---

## Adding New Slices

To add a new slice (e.g., `userSlice`, `appointmentSlice`):

1. **Create the slice file:**
   ```typescript
   // redux/slices/userSlice.ts
   import { createSlice, PayloadAction } from '@reduxjs/toolkit';

   const userSlice = createSlice({
     name: 'user',
     initialState: { /* initial state */ },
     reducers: {
       // Your reducers
     },
   });

   export const { /* actions */ } = userSlice.actions;
   export default userSlice.reducer;
   ```

2. **Add to root reducer:**
   ```typescript
   // redux/index.ts
   import userReducer from './slices/userSlice';

   const rootReducer = combineReducers({
     auth: authReducer,
     user: userReducer, // Add new reducer
   });
   ```

3. **Update types:**
   ```typescript
   // redux/types.ts
   export interface RootState {
     auth: AuthState;
     user: UserState; // Add new state type
   }
   ```

---

## Redux DevTools

Redux DevTools are enabled in development mode (`import.meta.env.DEV`). To use:

1. Install the Redux DevTools browser extension for Chrome, Firefox, or Edge
2. Open the app in development; the store will connect automatically
3. Inspect actions, state, and time-travel debug from the DevTools panel

---

## Troubleshooting

### Common Issues

1. **State not persisting:**
   - Check if the slice is in `whitelist` in persist config
   - Verify localStorage is available (web) and not disabled
   - Check for serialization errors (e.g. non-JSON-serializable values in state)

2. **Type errors:**
   - Ensure all types are properly exported from `redux/types.ts`
   - Use `RootState` type for selectors
   - Check action payload types in slice `PayloadAction<>`

3. **Re-render issues:**
   - Use specific selectors instead of selecting entire state
   - Memoize selectors if needed
   - Check for unnecessary state updates

---

## Reference

- **Redux Toolkit Documentation:** https://redux-toolkit.js.org/
- **React-Redux Documentation:** https://react-redux.js.org/
- **Redux Persist Documentation:** https://github.com/rt2zz/redux-persist

---

## Notes

- Auth state is persisted using localStorage (web)
- Only auth state is persisted (configured in `whitelist`)
- Redux DevTools are enabled in development mode
- TypeScript provides full type safety
- Actions are automatically generated by Redux Toolkit

---

**Last Updated:** January 2025  
**Version:** 1.0.0
