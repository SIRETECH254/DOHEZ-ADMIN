import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoiceAPI } from '../api';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create invoice
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { orderId: string }) => {
      const response = await invoiceAPI.createInvoice(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      console.log('Invoice created successfully');
    },
    onError: (error: any) => console.error('Error creating invoice:', error),
  });
};

// Get all invoices
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

// Get invoice by ID
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
