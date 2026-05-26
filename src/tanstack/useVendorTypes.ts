import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorTypeAPI } from '../api';
import type { CreateVendorTypePayload, UpdateVendorTypePayload, GetVendorTypesParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create vendor type
export const useCreateVendorType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVendorTypePayload | FormData) => {
      const response = await vendorTypeAPI.createVendorType(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorTypes'] });
      console.log('Vendor type created successfully');
    },
    onError: (error: any) => console.error('Error creating vendor type:', error),
  });
};

// Get vendor types
export const useGetVendorTypes = (params?: GetVendorTypesParams) => {
  return useQuery({
    queryKey: ['vendorTypes', params],
    queryFn: async () => {
      const response = await vendorTypeAPI.getVendorTypes(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get vendor type by ID/Slug
export const useGetVendorTypeById = (idOrSlug: string) => {
  return useQuery({
    queryKey: ['vendorType', idOrSlug],
    queryFn: async () => {
      const response = await vendorTypeAPI.getVendorTypeById(idOrSlug);
      return response.data.data;
    },
    enabled: !!idOrSlug,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update vendor type
export const useUpdateVendorType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateVendorTypePayload | FormData }) => {
      const response = await vendorTypeAPI.updateVendorType(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorTypes'] });
      queryClient.invalidateQueries({ queryKey: ['vendorType', variables.id] });
      console.log('Vendor type updated successfully');
    },
    onError: (error: any) => console.error('Error updating vendor type:', error),
  });
};

// Delete vendor type
export const useDeleteVendorType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await vendorTypeAPI.deleteVendorType(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorTypes'] });
      console.log('Vendor type deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting vendor type:', error),
  });
};
