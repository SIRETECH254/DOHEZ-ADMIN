import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { availabilityAPI } from '../api';
import type { GetAvailabilityPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Fetch available schedule options
export const useGetAvailability = () => {
  return useMutation({
    mutationFn: async (payload: GetAvailabilityPayload) => {
      const response = await availabilityAPI.getAvailability(payload);
      return response.data.data;
    },
    onError: (error: any) => {
      console.error('Get availability error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};
