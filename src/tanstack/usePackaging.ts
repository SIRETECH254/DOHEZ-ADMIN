import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { packagingAPI } from '../api';
import type { CreatePackagingPayload, UpdatePackagingPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create packaging
export const useCreatePackaging = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePackagingPayload) => {
      const response = await packagingAPI.createPackaging(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
      console.log('Packaging created successfully');
    },
    onError: (error: any) => console.error('Error creating packaging:', error),
  });
};

// Get packaging
export const useGetPackaging = (params?: any) => {
  return useQuery({
    queryKey: ['packaging', params],
    queryFn: async () => {
      const response = await packagingAPI.getPackaging(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get packaging by ID
export const useGetPackagingById = (id: string) => {
  return useQuery({
    queryKey: ['packaging', id],
    queryFn: async () => {
      const response = await packagingAPI.getPackagingById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update packaging
export const useUpdatePackaging = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePackagingPayload }) => {
      const response = await packagingAPI.updatePackaging(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
      queryClient.invalidateQueries({ queryKey: ['packaging', variables.id] });
      console.log('Packaging updated successfully');
    },
    onError: (error: any) => console.error('Error updating packaging:', error),
  });
};

// Delete packaging
export const useDeletePackaging = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await packagingAPI.deletePackaging(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
      console.log('Packaging deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting packaging:', error),
  });
};

// Set default packaging
export const useSetDefaultPackaging = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await packagingAPI.setDefaultPackaging(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
      console.log('Default packaging set successfully');
    },
    onError: (error: any) => console.error('Error setting default packaging:', error),
  });
};
