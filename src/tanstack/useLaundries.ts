import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { laundryAPI } from '../api';
import type { BookLaundryPayload, PayLaundryInvoicePayload, UpdateLaundryPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get all laundries
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

// Get laundry by ID
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

// Update laundry
export const useUpdateLaundry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ laundryId, laundryData }: { laundryId: string; laundryData: UpdateLaundryPayload }) => {
      const response = await laundryAPI.updateLaundry(laundryId, laundryData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
      queryClient.invalidateQueries({ queryKey: ['laundry', variables.laundryId] });
      console.log('Laundry updated successfully');
    },
    onError: (error: any) => console.error('Error updating laundry:', error),
  });
};

// Delete laundry
export const useDeleteLaundry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (laundryId: string) => {
      const response = await laundryAPI.deleteLaundry(laundryId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
      console.log('Laundry deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting laundry:', error),
  });
};

// Book laundry
export const useBookLaundry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BookLaundryPayload) => {
      const response = await laundryAPI.bookLaundry(payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
      console.log('Laundry booked successfully');
    },
    onError: (error: any) => console.error('Error booking laundry:', error),
  });
};

// Pay laundry invoice
export const usePayLaundryInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PayLaundryInvoicePayload) => {
      const response = await laundryAPI.payLaundryInvoice(payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
      console.log('Laundry invoice paid successfully');
    },
    onError: (error: any) => console.error('Error paying laundry invoice:', error),
  });
};
