import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressAPI } from '../api';
import type { CreateAddressPayload, UpdateAddressPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create address
export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAddressPayload) => {
      const response = await addressAPI.createAddress(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      console.log('Address created successfully');
    },
    onError: (error: any) => console.error('Error creating address:', error),
  });
};

// Get user addresses
export const useGetUserAddresses = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['addresses', params],
    queryFn: async () => {
      const response = await addressAPI.getUserAddresses(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get address by ID
export const useGetAddressById = (id: string) => {
  return useQuery({
    queryKey: ['address', id],
    queryFn: async () => {
      const response = await addressAPI.getAddressById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update address
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAddressPayload }) => {
      const response = await addressAPI.updateAddress(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      queryClient.invalidateQueries({ queryKey: ['address', variables.id] });
      console.log('Address updated successfully');
    },
    onError: (error: any) => console.error('Error updating address:', error),
  });
};

// Delete address
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await addressAPI.deleteAddress(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      console.log('Address deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting address:', error),
  });
};

// Set default address
export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await addressAPI.setDefaultAddress(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      console.log('Default address set successfully');
    },
    onError: (error: any) => console.error('Error setting default address:', error),
  });
};
