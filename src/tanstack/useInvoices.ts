import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoiceAPI } from '../api';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { orderId: string }) => invoiceAPI.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useGetInvoices = (params?: any) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const response = await invoiceAPI.getInvoices(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useGetInvoiceById = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await invoiceAPI.getInvoiceById(invoiceId);
      return response.data.data;
    },
    enabled: !!invoiceId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
