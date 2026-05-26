import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, userAPI } from '../api';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout as logoutAction,
  updateUser,
  setTokens,
  clearError,
  setLoading,
  setAuthLoading,
  setAuthSuccess,
  setAuthFailure,
  clearAuth,
} from '../redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import type {
  LoginPayload,
  RegisterPayload,
  VerifyOTPPayload,
  ResendOTPPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '../types/api.types';
import type { User } from '../redux/types';

interface AuthResult {
  success: boolean;
  error?: string;
  data?: unknown;
  user?: User;
}

interface AuthContextValue {
  // State (from Redux)
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth Functions
  login: (credentials: LoginPayload) => Promise<AuthResult>;
  register: (userData: RegisterPayload) => Promise<AuthResult>;
  verifyOTP: (otpData: VerifyOTPPayload) => Promise<AuthResult>;
  resendOTP: (emailData: ResendOTPPayload) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResult>;
  updateProfile: (profileData: UpdateProfilePayload | FormData) => Promise<AuthResult>;
  changePassword: (passwordData: ChangePasswordPayload) => Promise<AuthResult>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const error = useAppSelector((state) => state.auth.error);

  // Rehydrate auth state from localStorage and refresh the user profile in the background.
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const storedUserString = localStorage.getItem('user');

        // 1) Rehydrate immediately from localStorage so state survives reloads.
        if (token && storedUserString) {
          try {
            const storedUser = JSON.parse(storedUserString);
            if (storedUser) {
              dispatch(setAuthSuccess(storedUser));
              dispatch(setTokens({ accessToken: token }));
            } else {
              dispatch(clearAuth());
            }
          } catch {
            dispatch(clearAuth());
          }
        } else {
          dispatch(clearAuth());
        }

        dispatch(setLoading(false));

        // 2) Background refresh of user profile; do NOT clear tokens on failure.
        const refreshUserInBackground = async () => {
          if (!token) return;
          try {
            const response = await authAPI.getMe();
            const userData = response.data.data?.user ?? response.data.data;
            if (userData) {
              localStorage.setItem('user', JSON.stringify(userData));
              dispatch(setAuthSuccess(userData));
            }
          } catch (refreshError: any) {
            console.log('Background token validation failed:', refreshError?.response?.status);
          }
        };

        refreshUserInBackground();
      } catch (initError) {
        console.error('Auth initialization error:', initError);
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Login flow: exchange credentials for tokens and user, then persist to localStorage.
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

  // Registration flow: create a new account (no token storage yet).
  const register = async (userData: RegisterPayload): Promise<AuthResult> => {
    dispatch(registerStart());

    try {
      const response = await authAPI.register(userData);
      dispatch(registerSuccess());
      return { success: true, data: response.data.data };
    } catch (registerError: any) {
      const errorMessage =
        registerError?.response?.data?.message || registerError?.message || 'Registration failed';
      dispatch(registerFailure(errorMessage));
      dispatch(setAuthFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  // OTP verification: complete login and persist tokens + user.
  const verifyOTP = async (otpData: VerifyOTPPayload): Promise<AuthResult> => {
    dispatch(loginStart());

    try {
      const response = await authAPI.verifyOTP(otpData);
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
    } catch (otpError: any) {
      const errorMessage =
        otpError?.response?.data?.message || otpError?.message || 'OTP verification failed';
      dispatch(loginFailure(errorMessage));
      dispatch(setAuthFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  // Resend OTP: stateless retry for verification flow.
  const resendOTP = async (emailData: ResendOTPPayload): Promise<AuthResult> => {
    try {
      await authAPI.resendOTP(emailData);
      return { success: true };
    } catch (resendError: any) {
      const errorMessage =
        resendError?.response?.data?.message || resendError?.message || 'Failed to resend OTP';
      return { success: false, error: errorMessage };
    }
  };

  // Forgot password: request a reset email.
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

  // Reset password: submit new password using the token.
  const resetPassword = async (token: string, newPassword: string): Promise<AuthResult> => {
    try {
      await authAPI.resetPassword(token, { newPassword });
      return { success: true };
    } catch (resetError: any) {
      const errorMessage =
        resetError?.response?.data?.message || resetError?.message || 'Failed to reset password';
      return { success: false, error: errorMessage };
    }
  };

  // Profile update: persist the updated user record.
  const updateProfile = async (
    profileData: UpdateProfilePayload | FormData,
  ): Promise<AuthResult> => {
    try {
      const response = await userAPI.updateProfile(profileData);
      const updatedUser = response.data.data?.user ?? response.data.data;

      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch(updateUser(updatedUser));
        dispatch(setAuthSuccess(updatedUser));
      }

      return { success: true, user: updatedUser };
    } catch (updateError: any) {
      const errorMessage =
        updateError?.response?.data?.message || updateError?.message || 'Failed to update profile';
      return { success: false, error: errorMessage };
    }
  };

  // Change password: authenticated user flow.
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

  // Logout: clear storage, reset Redux auth state, and redirect to login.
  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (logoutError) {
      console.error('Logout error:', logoutError);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      dispatch(logoutAction());
      dispatch(clearAuth());

      navigate('/login', { replace: true });
    }
  };

  // Clear only error state for inline resets in the UI.
  const clearErrorHandler = () => {
    dispatch(clearError());
    dispatch(setAuthFailure(null));
  };

  // Expose auth state and actions via context.
  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    logout,
    clearError: clearErrorHandler,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
