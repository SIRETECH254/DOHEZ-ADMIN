import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { packagingAPI } from '../api';
import type { CreatePackagingPayload, UpdatePackagingPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useCreatePackaging = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePackagingPayload) => packagingAPI.createPackaging(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
    },
  });
};

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

export const useUpdatePackaging = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePackagingPayload }) =>
      packagingAPI.updatePackaging(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
      queryClient.invalidateQueries({ queryKey: ['packaging', variables.id] });
    },
  });
};

export const useDeletePackaging = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => packagingAPI.deletePackaging(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
    },
  });
};

export const useSetDefaultPackaging = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => packagingAPI.setDefaultPackaging(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
    },
  });
};
