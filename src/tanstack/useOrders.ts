import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderAPI } from '../api';
import type { CreateOrderPayload, AdminCreateOrderPayload, UpdateOrderStatusPayload, GetOrdersParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderPayload) => {
      const response = await orderAPI.createOrder(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      console.log('Order created successfully');
    },
    onError: (error: any) => console.error('Error creating order:', error),
  });
};

// Get my orders
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

// Get order by ID
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

// Admin create order
export const useAdminCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AdminCreateOrderPayload) => {
      const response = await orderAPI.adminCreateOrder(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      console.log('Admin order created successfully');
    },
    onError: (error: any) => console.error('Error creating order (admin):', error),
  });
};

// Get all orders (admin)
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

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: UpdateOrderStatusPayload }) => {
      const response = await orderAPI.updateOrderStatus(orderId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      console.log('Order status updated successfully');
    },
    onError: (error: any) => console.error('Error updating order status:', error),
  });
};

// Assign rider to order
export const useAssignRider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await orderAPI.assignRider(orderId);
      return response.data.data;
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      console.log('Rider assigned successfully');
    },
    onError: (error: any) => console.error('Error assigning rider:', error),
  });
};

// Delete order
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await orderAPI.deleteOrder(orderId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      console.log('Order deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting order:', error),
  });
};
