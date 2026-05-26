import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { serviceAPI } from '../api';
import type { CreateServicePayload, UpdateServicePayload, GetServicesParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get all services
export const useGetServices = (params?: GetServicesParams) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: async () => {
      const response = await serviceAPI.getServices(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single service
export const useGetServiceById = (serviceId: string) => {
  return useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const response = await serviceAPI.getServiceById(serviceId);
      return response.data.data;
    },
    enabled: !!serviceId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Create service
export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateServicePayload | FormData) => {
      const response = await serviceAPI.createService(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      console.log('Service created successfully');
    },
    onError: (error: any) => console.error('Error creating service:', error),
  });
};

// Update service
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceId, data }: { serviceId: string; data: UpdateServicePayload | FormData }) => {
      const response = await serviceAPI.updateService(serviceId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      console.log('Service updated successfully');
    },
    onError: (error: any) => console.error('Error updating service:', error),
  });
};

// Delete service
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await serviceAPI.deleteService(serviceId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      console.log('Service deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting service:', error),
  });
};
