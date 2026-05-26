import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorCategoryAPI } from '../api';
import type { CreateVendorCategoryPayload, UpdateVendorCategoryPayload, GetVendorCategoriesParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create vendor category
export const useCreateVendorCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVendorCategoryPayload | FormData) => {
      const response = await vendorCategoryAPI.createVendorCategory(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorCategories'] });
      console.log('Vendor category created successfully');
    },
    onError: (error: any) => console.error('Error creating vendor category:', error),
  });
};

// Get vendor categories
export const useGetVendorCategories = (params?: GetVendorCategoriesParams) => {
  return useQuery({
    queryKey: ['vendorCategories', params],
    queryFn: async () => {
      const response = await vendorCategoryAPI.getVendorCategories(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get vendor category by ID/Slug
export const useGetVendorCategoryById = (idOrSlug: string) => {
  return useQuery({
    queryKey: ['vendorCategory', idOrSlug],
    queryFn: async () => {
      const response = await vendorCategoryAPI.getVendorCategoryById(idOrSlug);
      return response.data.data;
    },
    enabled: !!idOrSlug,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update vendor category
export const useUpdateVendorCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateVendorCategoryPayload | FormData }) => {
      const response = await vendorCategoryAPI.updateVendorCategory(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorCategories'] });
      queryClient.invalidateQueries({ queryKey: ['vendorCategory', variables.id] });
      console.log('Vendor category updated successfully');
    },
    onError: (error: any) => console.error('Error updating vendor category:', error),
  });
};

// Delete vendor category
export const useDeleteVendorCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await vendorCategoryAPI.deleteVendorCategory(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorCategories'] });
      console.log('Vendor category deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting vendor category:', error),
  });
};
