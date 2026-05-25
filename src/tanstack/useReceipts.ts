import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { receiptAPI } from '../api';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useGetReceipts = (params?: any) => {
  return useQuery({
    queryKey: ['receipts', params],
    queryFn: async () => {
      const response = await receiptAPI.getReceipts(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useGetReceiptById = (receiptId: string) => {
  return useQuery({
    queryKey: ['receipt', receiptId],
    queryFn: async () => {
      const response = await receiptAPI.getReceiptById(receiptId);
      return response.data.data;
    },
    enabled: !!receiptId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
