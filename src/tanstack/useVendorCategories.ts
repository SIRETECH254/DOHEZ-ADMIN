import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorCategoryAPI } from '../api';
import type { CreateVendorCategoryPayload, UpdateVendorCategoryPayload, GetVendorCategoriesParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useCreateVendorCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVendorCategoryPayload | FormData) => vendorCategoryAPI.createVendorCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorCategories'] });
    },
  });
};

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

export const useUpdateVendorCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorCategoryPayload | FormData }) =>
      vendorCategoryAPI.updateVendorCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorCategories'] });
      queryClient.invalidateQueries({ queryKey: ['vendorCategory', variables.id] });
    },
  });
};

export const useDeleteVendorCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vendorCategoryAPI.deleteVendorCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorCategories'] });
    },
  });
};
