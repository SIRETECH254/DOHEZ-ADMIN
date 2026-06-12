import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, Role, Vendor, Branch } from '../types';

const initialState: AuthState = {
  user: null,
  roles: null,
  vendor: null,
  branch: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isError: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions: drive sign-in lifecycle and token storage.
    loginStart: (state) => {
      state.isLoading = true;
      state.isError = false;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        roles: Role[];
        vendor?: Vendor;
        branch?: Branch;
        accessToken: string;
        refreshToken: string;
      }>,
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.roles = action.payload.roles;
      state.vendor = action.payload.vendor || null;
      state.branch = action.payload.branch || null;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isError = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.roles = null;
      state.vendor = null;
      state.branch = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isError = true;
      state.error = action.payload;
    },

    // Register actions: basic lifecycle for sign-up.
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Logout action: wipe all auth state.
    logout: (state) => {
      state.user = null;
      state.roles = null;
      state.vendor = null;
      state.branch = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isError = false;
      state.error = null;
    },

    // Update user action: keep profile data in sync.
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    // Set tokens action: support refresh/token updates.
    setTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken?: string;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },

    // Clear error action: used by UI to reset inline error states.
    clearError: (state) => {
      state.isError = false;
      state.error = null;
    },

    // Set loading action: manual loading flag for init flows.
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Convenience actions: common auth lifecycle helpers.
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    setAuthSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        roles: Role[];
        vendor?: Vendor;
        branch?: Branch;
      }>,
    ) => {
      state.user = action.payload.user;
      state.roles = action.payload.roles;
      state.vendor = action.payload.vendor || null;
      state.branch = action.payload.branch || null;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isError = false;
      state.error = null;
    },
    setAuthFailure: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isError = !!action.payload;
      state.isLoading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.roles = null;
      state.vendor = null;
      state.branch = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isError = false;
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  updateUser,
  setTokens,
  clearError,
  setLoading,
  setAuthLoading,
  setAuthSuccess,
  setAuthFailure,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;
