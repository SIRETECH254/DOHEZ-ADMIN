import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roleAPI } from '../api';
import type { CreateRolePayload, UpdateRolePayload, GetRolesParams, PaginationParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get all roles
export const useGetAllRoles = (params?: GetRolesParams) => {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: async () => {
      const response = await roleAPI.getAllRoles(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get customers (admin)
export const useGetCustomers = () => {
  return useQuery({
    queryKey: ['roles', 'customers'],
    queryFn: async () => {
      const response = await roleAPI.getCustomers();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single role
export const useGetRoleById = (roleId: string) => {
  return useQuery({
    queryKey: ['role', roleId],
    queryFn: async () => {
      const response = await roleAPI.getRole(roleId);
      return response.data.data;
    },
    enabled: !!roleId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Create role
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData: CreateRolePayload) => {
      const response = await roleAPI.createRole(roleData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      console.log('Role created successfully');
    },
    onError: (error: any) => {
      console.error('Create role error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Update role
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, roleData }: { roleId: string; roleData: UpdateRolePayload }) => {
      const response = await roleAPI.updateRole(roleId, roleData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.roleId] });
      console.log('Role updated successfully');
    },
    onError: (error: any) => {
      console.error('Update role error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Delete role
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      const response = await roleAPI.deleteRole(roleId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      console.log('Role deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete role error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Get users by role
export const useGetUsersByRole = (roleId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['roles', roleId, 'users', params],
    queryFn: async () => {
      const response = await roleAPI.getUsersByRole(roleId, params);
      return response.data.data;
    },
    enabled: !!roleId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
