import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { couponAPI } from '../api';
import type { CreateCouponPayload, UpdateCouponPayload, GetCouponsParams, ValidateCouponPayload, ApplyCouponPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create coupon
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCouponPayload) => {
      const response = await couponAPI.createCoupon(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      console.log('Coupon created successfully');
    },
    onError: (error: any) => console.error('Error creating coupon:', error),
  });
};

// Get all coupons
export const useGetAllCoupons = (params?: GetCouponsParams) => {
  return useQuery({
    queryKey: ['coupons', params],
    queryFn: async () => {
      const response = await couponAPI.getAllCoupons(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get coupon by ID
export const useGetCouponById = (id: string) => {
  return useQuery({
    queryKey: ['coupon', id],
    queryFn: async () => {
      const response = await couponAPI.getCouponById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update coupon
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCouponPayload }) => {
      const response = await couponAPI.updateCoupon(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon', variables.id] });
      console.log('Coupon updated successfully');
    },
    onError: (error: any) => console.error('Error updating coupon:', error),
  });
};

// Delete coupon
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await couponAPI.deleteCoupon(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      console.log('Coupon deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting coupon:', error),
  });
};

// Validate coupon
export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async ({ data, orderAmount }: { data: ValidateCouponPayload; orderAmount: number }) => {
      const response = await couponAPI.validateCoupon(data, orderAmount);
      return response.data.data;
    },
    onError: (error: any) => console.error('Error validating coupon:', error),
  });
};

// Apply coupon
export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: async (data: ApplyCouponPayload) => {
      const response = await couponAPI.applyCoupon(data);
      return response.data.data;
    },
    onError: (error: any) => console.error('Error applying coupon:', error),
  });
};

// Get coupon stats
export const useGetCouponStats = (id: string) => {
  return useQuery({
    queryKey: ['coupon', 'stats', id],
    queryFn: async () => {
      const response = await couponAPI.getCouponStats(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Generate new code
export const useGenerateNewCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await couponAPI.generateNewCode(id);
      return response.data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['coupon', id] });
      console.log('New coupon code generated successfully');
    },
    onError: (error: any) => console.error('Error generating new code:', error),
  });
};
