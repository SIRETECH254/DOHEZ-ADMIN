import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentAPI } from '../api';
import type {
  CancelAppointmentPayload,
  ConfirmAppointmentPayload,
  CreateAppointmentPayload,
  AdminCreateAppointmentPayload,
  GetAppointmentsParams,
  GetMyAppointmentsParams,
  RescheduleAppointmentPayload,
  AppointmentsListResponse,
  AppointmentDetailResponse,
} from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get all appointments
export const useGetAllAppointments = (params: GetAppointmentsParams = {}) => {
  return useQuery<AppointmentsListResponse>({
    queryKey: ['appointments', params],
    queryFn: async () => {
      const response = await appointmentAPI.getAllAppointments(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get my appointments
export const useGetMyAppointments = (params: GetMyAppointmentsParams = {}) => {
  return useQuery<AppointmentsListResponse>({
    queryKey: ['appointments', 'my', params],
    queryFn: async () => {
      const response = await appointmentAPI.getMyAppointments(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single appointment
export const useGetAppointment = (appointmentId: string) => {
  return useQuery<AppointmentDetailResponse>({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const response = await appointmentAPI.getAppointment(appointmentId);
      return response.data.data;
    },
    enabled: !!appointmentId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Create appointment
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<AppointmentDetailResponse, Error, CreateAppointmentPayload>({
    mutationFn: async (appointmentData: CreateAppointmentPayload) => {
      const response = await appointmentAPI.create(appointmentData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Appointment created successfully');
    },
    onError: (error: any) => {
      console.error('Create appointment error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Admin create appointment
export const useAdminCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<AppointmentDetailResponse, Error, AdminCreateAppointmentPayload>({
    mutationFn: async (appointmentData: AdminCreateAppointmentPayload) => {
      const response = await appointmentAPI.adminCreate(appointmentData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Appointment created successfully by admin');
    },
    onError: (error: any) => {
      console.error('Admin create appointment error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Confirm appointment
export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<AppointmentDetailResponse, Error, { appointmentId: string; paymentData: ConfirmAppointmentPayload }>({
    mutationFn: async ({ appointmentId, paymentData }: { appointmentId: string; paymentData: ConfirmAppointmentPayload }) => {
      const response = await appointmentAPI.confirm(appointmentId, paymentData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      console.log('Appointment confirmed successfully');
    },
    onError: (error: any) => {
      console.error('Confirm appointment error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Reschedule appointment
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<AppointmentDetailResponse, Error, { appointmentId: string; data: RescheduleAppointmentPayload }>({
    mutationFn: async ({ appointmentId, data }: { appointmentId: string; data: RescheduleAppointmentPayload }) => {
      const response = await appointmentAPI.reschedule(appointmentId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      console.log('Appointment rescheduled successfully');
    },
    onError: (error: any) => {
      console.error('Reschedule appointment error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Cancel appointment
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<AppointmentDetailResponse, Error, { appointmentId: string; data?: CancelAppointmentPayload }>({
    mutationFn: async ({ appointmentId, data }: { appointmentId: string; data?: CancelAppointmentPayload }) => {
      const response = await appointmentAPI.cancel(appointmentId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      console.log('Appointment cancelled successfully');
    },
    onError: (error: any) => {
      console.error('Cancel appointment error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Check in appointment
export const useCheckInAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<AppointmentDetailResponse, Error, string>({
    mutationFn: async (appointmentId: string) => {
      const response = await appointmentAPI.checkIn(appointmentId);
      return response.data.data;
    },
    onSuccess: (_, appointmentId) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', appointmentId] });
      console.log('Appointment checked in successfully');
    },
    onError: (error: any) => {
      console.error('Check-in error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Complete appointment
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<AppointmentDetailResponse, Error, string>({
    mutationFn: async (appointmentId: string) => {
      const response = await appointmentAPI.complete(appointmentId);
      return response.data.data;
    },
    onSuccess: (_, appointmentId) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', appointmentId] });
      console.log('Appointment completed successfully');
    },
    onError: (error: any) => {
      console.error('Complete appointment error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Mark no-show
export const useMarkNoShowAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<AppointmentDetailResponse, Error, string>({
    mutationFn: async (appointmentId: string) => {
      const response = await appointmentAPI.markNoShow(appointmentId);
      return response.data.data;
    },
    onSuccess: (_, appointmentId) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', appointmentId] });
      console.log('Appointment marked as no-show');
    },
    onError: (error: any) => {
      console.error('Mark no-show error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Delete appointment
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (appointmentId: string) => {
      const response = await appointmentAPI.deleteAppointment(appointmentId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Appointment deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete appointment error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};
