import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderAPI } from '../api';
import type { CreateOrderPayload, AdminCreateOrderPayload, UpdateOrderStatusPayload, GetOrdersParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderPayload) => orderAPI.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useGetUserOrders = (params?: GetOrdersParams) => {
  return useQuery({
    queryKey: ['orders', 'my', params],
    queryFn: async () => {
      const response = await orderAPI.getUserOrders(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useGetOrderById = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await orderAPI.getOrderById(orderId);
      return response.data.data;
    },
    enabled: !!orderId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useAdminCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminCreateOrderPayload) => orderAPI.adminCreateOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useGetOrders = (params?: GetOrdersParams) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await orderAPI.getOrders(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: UpdateOrderStatusPayload }) =>
      orderAPI.updateOrderStatus(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
};

export const useAssignRider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => orderAPI.assignRider(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => orderAPI.deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
