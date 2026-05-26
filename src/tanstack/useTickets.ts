import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketAPI } from '../api';
import type { UpdateTicketPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get all tickets
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

// Get single ticket
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

// Update ticket
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, ticketData }: { ticketId: string; ticketData: UpdateTicketPayload }) => {
      const response = await ticketAPI.updateTicket(ticketId, ticketData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      console.log('Ticket updated successfully');
    },
    onError: (error: any) => console.error('Error updating ticket:', error),
  });
};

// Delete ticket
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await ticketAPI.deleteTicket(ticketId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      console.log('Ticket deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting ticket:', error),
  });
};
