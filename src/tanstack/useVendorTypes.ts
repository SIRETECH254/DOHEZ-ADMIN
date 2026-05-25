import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorTypeAPI } from '../api';
import type { CreateVendorTypePayload, UpdateVendorTypePayload, GetVendorTypesParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useCreateVendorType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVendorTypePayload | FormData) => vendorTypeAPI.createVendorType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorTypes'] });
    },
  });
};

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

export const useUpdateVendorType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorTypePayload | FormData }) =>
      vendorTypeAPI.updateVendorType(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorTypes'] });
      queryClient.invalidateQueries({ queryKey: ['vendorType', variables.id] });
    },
  });
};

export const useDeleteVendorType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vendorTypeAPI.deleteVendorType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorTypes'] });
    },
  });
};
