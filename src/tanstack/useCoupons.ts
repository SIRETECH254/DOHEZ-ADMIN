import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { couponAPI } from '../api';
import type { CreateCouponPayload, UpdateCouponPayload, GetCouponsParams, ValidateCouponPayload, ApplyCouponPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCouponPayload) => couponAPI.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

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

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponPayload }) =>
      couponAPI.updateCoupon(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon', variables.id] });
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponAPI.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: ({ data, orderAmount }: { data: ValidateCouponPayload; orderAmount: number }) =>
      couponAPI.validateCoupon(data, orderAmount),
  });
};

export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: (data: ApplyCouponPayload) => couponAPI.applyCoupon(data),
  });
};

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

export const useGenerateNewCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponAPI.generateNewCode(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['coupon', id] });
    },
  });
};
