import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentAPI } from '../api';
import type {
  CreateAppointmentPayload,
  AdminCreateAppointmentPayload,
  RescheduleAppointmentPayload,
} from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create appointment
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAppointmentPayload) => {
      const response = await appointmentAPI.createAppointment(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Appointment created successfully');
    },
    onError: (error: any) => console.error('Error creating appointment:', error),
  });
};

// Admin create appointment
export const useAdminCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AdminCreateAppointmentPayload) => {
      const response = await appointmentAPI.createAppointmentByAdmin(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Appointment created (admin) successfully');
    },
    onError: (error: any) => console.error('Error creating appointment (admin):', error),
  });
};

// Get my appointments
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

// Get all appointments
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

// Get appointment by ID
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

// Reschedule appointment
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RescheduleAppointmentPayload }) => {
      const response = await appointmentAPI.rescheduleAppointment(id, data);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Appointment rescheduled successfully');
    },
    onError: (error: any) => console.error('Error rescheduling appointment:', error),
  });
};

// Cancel appointment
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await appointmentAPI.cancelAppointment(id);
      return response.data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Appointment canceled successfully');
    },
    onError: (error: any) => console.error('Error canceling appointment:', error),
  });
};

// Check in appointment
export const useCheckInAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await appointmentAPI.checkIn(id);
      return response.data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Appointment checked in successfully');
    },
    onError: (error: any) => console.error('Error checking in appointment:', error),
  });
};

// Complete appointment
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await appointmentAPI.completeAppointment(id);
      return response.data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Appointment completed successfully');
    },
    onError: (error: any) => console.error('Error completing appointment:', error),
  });
};

// Mark appointment as no-show
export const useMarkNoShowAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await appointmentAPI.markNoShow(id);
      return response.data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Appointment marked as no-show successfully');
    },
    onError: (error: any) => console.error('Error marking appointment as no-show:', error),
  });
};

