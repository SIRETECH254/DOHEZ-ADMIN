import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { laundryAPI } from '../api';
import type { BookLaundryPayload, PayLaundryInvoicePayload, UpdateLaundryPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useGetLaundries = (params?: any) => {
  return useQuery({
    queryKey: ['laundries', params],
    queryFn: async () => {
      const response = await laundryAPI.getLaundries(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useGetLaundryById = (laundryId: string) => {
  return useQuery({
    queryKey: ['laundry', laundryId],
    queryFn: async () => {
      const response = await laundryAPI.getLaundry(laundryId);
      return response.data.data;
    },
    enabled: !!laundryId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useUpdateLaundry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ laundryId, laundryData }: { laundryId: string; laundryData: UpdateLaundryPayload }) =>
      laundryAPI.updateLaundry(laundryId, laundryData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
      queryClient.invalidateQueries({ queryKey: ['laundry', variables.laundryId] });
    },
  });
};

export const useDeleteLaundry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (laundryId: string) => laundryAPI.deleteLaundry(laundryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
    },
  });
};

export const useBookLaundry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookLaundryPayload) => laundryAPI.bookLaundry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
    },
  });
};

export const usePayLaundryInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayLaundryInvoicePayload) => laundryAPI.payLaundryInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
    },
  });
};
