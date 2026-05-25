import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorAPI } from '../api';
import type { RegisterVendorPayload, UpdateVendorPayload, GetVendorsParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useRegisterVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterVendorPayload | FormData) => vendorAPI.registerVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

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

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, data }: { vendorId: string; data: UpdateVendorPayload | FormData }) =>
      vendorAPI.updateVendor(vendorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.vendorId] });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vendorId: string) => vendorAPI.deleteVendor(vendorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};
