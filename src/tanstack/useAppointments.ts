import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentAPI } from '../api';
import type {
  CreateAppointmentPayload,
  AdminCreateAppointmentPayload,
  RescheduleAppointmentPayload,
} from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointmentPayload) => appointmentAPI.createAppointment(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
    onError: (error: any) => console.error('Error creating appointment:', error),
  });
};

export const useAdminCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminCreateAppointmentPayload) => appointmentAPI.createAppointmentByAdmin(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
    onError: (error: any) => console.error('Error creating appointment (admin):', error),
  });
};

export const useGetMyAppointments = (params?: any) => {
  return useQuery({
    queryKey: ['appointments', 'my', params],
    queryFn: async () => {
      const response = await appointmentAPI.getMyAppointments(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useGetAppointments = (params?: any) => {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: async () => {
      const response = await appointmentAPI.getAppointments(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useGetAppointmentById = (id: string) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const response = await appointmentAPI.getAppointmentById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RescheduleAppointmentPayload }) =>
      appointmentAPI.rescheduleAppointment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: any) => console.error('Error rescheduling appointment:', error),
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentAPI.cancelAppointment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: any) => console.error('Error canceling appointment:', error),
  });
};

export const useCheckInAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentAPI.checkIn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: any) => console.error('Error checking in appointment:', error),
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentAPI.completeAppointment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: any) => console.error('Error completing appointment:', error),
  });
};

export const useMarkNoShowAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentAPI.markNoShow(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: any) => console.error('Error marking appointment as no-show:', error),
  });
};

