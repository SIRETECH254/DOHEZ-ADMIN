import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketAPI } from '../api';
import type { UpdateTicketPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useGetTickets = (params?: any) => {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: async () => {
      const response = await ticketAPI.getTickets(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useGetTicket = (ticketId: string) => {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const response = await ticketAPI.getTicket(ticketId);
      return response.data.data;
    },
    enabled: !!ticketId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, ticketData }: { ticketId: string; ticketData: UpdateTicketPayload }) =>
      ticketAPI.updateTicket(ticketId, ticketData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => ticketAPI.deleteTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};
