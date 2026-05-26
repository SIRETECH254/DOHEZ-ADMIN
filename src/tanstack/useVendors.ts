import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorAPI } from '../api';
import type { RegisterVendorPayload, UpdateVendorPayload, GetVendorsParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Register vendor
export const useRegisterVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RegisterVendorPayload | FormData) => {
      const response = await vendorAPI.registerVendor(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      console.log('Vendor registered successfully');
    },
    onError: (error: any) => console.error('Error registering vendor:', error),
  });
};

// Get all vendors
export const useGetVendors = (params?: GetVendorsParams) => {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: async () => {
      const response = await vendorAPI.getVendors(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get vendor by ID
export const useGetVendorById = (vendorId: string) => {
  return useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: async () => {
      const response = await vendorAPI.getVendorById(vendorId);
      return response.data.data;
    },
    enabled: !!vendorId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update vendor
export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ vendorId, data }: { vendorId: string; data: UpdateVendorPayload | FormData }) => {
      const response = await vendorAPI.updateVendor(vendorId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.vendorId] });
      console.log('Vendor updated successfully');
    },
    onError: (error: any) => console.error('Error updating vendor:', error),
  });
};

// Delete vendor
export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vendorId: string) => {
      const response = await vendorAPI.deleteVendor(vendorId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      console.log('Vendor deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting vendor:', error),
  });
};
