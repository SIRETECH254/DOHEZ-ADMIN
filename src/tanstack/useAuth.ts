import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../api';
import type {
  RegisterPayload,
  LoginPayload,
  VerifyOTPPayload,
  ResendOTPPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  RefreshTokenPayload,
} from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Register
export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: RegisterPayload) => {
      const response = await authAPI.register(userData);
      return response.data.data;
    },
    onSuccess: () => {
      console.log('User registered successfully');
    },
    onError: (error: any) => {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Verify OTP
export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async (otpData: VerifyOTPPayload) => {
      const response = await authAPI.verifyOTP(otpData);
      return response.data.data;
    },
    onSuccess: () => {
      console.log('OTP verified successfully');
    },
    onError: (error: any) => {
      console.error('Verify OTP error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Resend OTP
export const useResendOTP = () => {
  return useMutation({
    mutationFn: async (data: ResendOTPPayload) => {
      const response = await authAPI.resendOTP(data);
      return response.data.data;
    },
    onSuccess: () => {
      console.log('OTP resent successfully');
    },
    onError: (error: any) => {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      const response = await authAPI.login(credentials);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'profile'], data.user);
      console.log('Login successful');
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authAPI.logout();
    },
    onSuccess: () => {
      queryClient.clear();
      console.log('Logout successful');
    },
    onError: (error: any) => {
      console.error('Logout error:', error);
    },
  });
};

// Forgot Password
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordPayload) => {
      const response = await authAPI.forgotPassword(data);
      return response.data;
    },
    onSuccess: () => {
      console.log('Password reset instructions sent');
    },
    onError: (error: any) => {
      console.error('Forgot password error:', error);
    },
  });
};

// Reset Password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ token, data }: { token: string; data: ResetPasswordPayload }) => {
      const response = await authAPI.resetPassword(token, data);
      return response.data;
    },
    onSuccess: () => {
      console.log('Password reset successfully');
    },
    onError: (error: any) => {
      console.error('Reset password error:', error);
    },
  });
};

// Refresh Token
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async (data: RefreshTokenPayload) => {
      const response = await authAPI.refreshToken(data);
      return response.data.data;
    },
    onError: (error: any) => {
      console.error('Refresh token error:', error);
    },
  });
};

// Get Me
export const useGetMe = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await authAPI.getMe();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

