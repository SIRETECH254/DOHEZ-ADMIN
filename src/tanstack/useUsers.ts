import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../api';
import type { 
  UpdateProfilePayload, 
  ChangePasswordPayload, 
  UpdateNotificationPreferencesPayload, 
  AdminCreateUserPayload, 
  UpdateUserPayload, 
  UpdateUserStatusPayload, 
  AssignRolePayload, 
  GetUsersParams,
  GetCustomersParams 
} from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get own profile
export const useGetProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update own profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProfilePayload | FormData) => {
      const response = await userAPI.updateProfile(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      console.log('Profile updated successfully');
    },
    onError: (error: any) => console.error('Error updating profile:', error),
  });
};

// Change password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordPayload) => {
      const response = await userAPI.changePassword(data);
      return response.data;
    },
    onSuccess: () => console.log('Password changed successfully'),
    onError: (error: any) => console.error('Error changing password:', error),
  });
};

// Get notification preferences
export const useGetNotificationPreferences = () => {
  return useQuery({
    queryKey: ['user', 'notifications'],
    queryFn: async () => {
      const response = await userAPI.getNotificationPreferences();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update notification preferences
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateNotificationPreferencesPayload) => {
      const response = await userAPI.updateNotificationPreferences(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] });
      console.log('Notification preferences updated successfully');
    },
    onError: (error: any) => console.error('Error updating notification preferences:', error),
  });
};

// Admin create customer
export const useAdminCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AdminCreateUserPayload) => {
      const response = await userAPI.adminCreateUser(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log('User created successfully');
    },
    onError: (error: any) => console.error('Error creating user:', error),
  });
};

// Get customers
export const useGetCustomers = (params?: GetCustomersParams) => {
  return useQuery({
    queryKey: ['users', 'customers', params],
    queryFn: async () => {
      const response = await userAPI.getCustomers(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get staff
export const useGetStaff = () => {
  return useQuery({
    queryKey: ['users', 'staff'],
    queryFn: async () => {
      const response = await userAPI.getStaff();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get all users
export const useGetAllUsers = (params?: GetUsersParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await userAPI.getAllUsers(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get user by ID
export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await userAPI.getUserById(userId);
      return response.data.data;
    },
    enabled: !!userId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserPayload | FormData }) => {
      const response = await userAPI.updateUser(userId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      console.log('User updated successfully');
    },
    onError: (error: any) => console.error('Error updating user:', error),
  });
};

// Update user status
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserStatusPayload }) => {
      const response = await userAPI.updateUserStatus(userId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      console.log('User status updated successfully');
    },
    onError: (error: any) => console.error('Error updating user status:', error),
  });
};

// Set user admin
export const useSetUserAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await userAPI.setUserAdmin(userId);
      return response.data.data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      console.log('User admin status set successfully');
    },
    onError: (error: any) => console.error('Error setting user admin:', error),
  });
};

// Get user roles
export const useGetUserRoles = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId, 'roles'],
    queryFn: async () => {
      const response = await userAPI.getUserRoles(userId);
      return response.data.data;
    },
    enabled: !!userId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await userAPI.deleteUser(userId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log('User deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting user:', error),
  });
};

// Assign role to user
export const useAssignRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: AssignRolePayload }) => {
      const response = await userAPI.assignRole(userId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId, 'roles'] });
      console.log('Role assigned successfully');
    },
    onError: (error: any) => console.error('Error assigning role:', error),
  });
};

// Remove role from user
export const useRemoveRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const response = await userAPI.removeRole(userId, roleId);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId, 'roles'] });
      console.log('Role removed successfully');
    },
    onError: (error: any) => console.error('Error removing role:', error),
  });
};
