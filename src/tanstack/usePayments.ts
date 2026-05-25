import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentAPI } from '../api';
import type { 
  BookLaundryPayload, 
  PayLaundryInvoicePayload 
} from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get all payments (Admin)
export const useGetPayments = (params?: any) => {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: async () => {
      const response = await paymentAPI.getPayments(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single payment details (Admin)
export const useGetPaymentById = (paymentId: string) => {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: async () => {
      const response = await paymentAPI.getPaymentById(paymentId);
      return response.data.data;
    },
    enabled: !!paymentId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Pay ticket invoices
export const usePayTicketInvoices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { invoiceIds: string[], method: string, payerPhone: string }) => {
      const response = await paymentAPI.payTicketInvoices(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      console.log('Ticket invoices paid successfully');
    },
    onError: (error: any) => console.error('Error paying ticket invoices:', error),
  });
};

// Book laundry
export const useBookLaundry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BookLaundryPayload) => {
      const response = await paymentAPI.bookLaundry(payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      console.log('Laundry booked successfully');
    },
    onError: (error: any) => console.error('Error booking laundry:', error),
  });
};

// Pay laundry invoice
export const usePayLaundryInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PayLaundryInvoicePayload) => {
      const response = await paymentAPI.payLaundryInvoice(payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      console.log('Laundry invoice paid successfully');
    },
    onError: (error: any) => console.error('Error paying laundry invoice:', error),
  });
};

// Confirm appointment
export const useConfirmAppointmentPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ appointmentId, data }: { appointmentId: string, data: { method: string, payerPhone: string } }) => {
      const response = await paymentAPI.confirmAppointment(appointmentId, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      console.log('Appointment confirmed successfully');
    },
    onError: (error: any) => console.error('Error confirming appointment:', error),
  });
};

// Pay appointment invoice
export const usePayAppointmentInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { appointmentId: string, method: string, payerPhone: string }) => {
      const response = await paymentAPI.payAppointmentInvoice(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      console.log('Appointment paid successfully');
    },
    onError: (error: any) => console.error('Error paying appointment:', error),
  });
};

// Pay general invoice
export const usePayInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { invoiceId: string, method: string, amount: number, payerPhone: string }) => {
      const response = await paymentAPI.payInvoice(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      console.log('Invoice paid successfully');
    },
    onError: (error: any) => console.error('Error paying invoice:', error),
  });
};

// Query M-Pesa status
export const useQueryMpesaStatus = (checkoutId: string) => {
  return useQuery({
    queryKey: ['payment', 'mpesa', checkoutId],
    queryFn: async () => {
      const response = await paymentAPI.queryMpesaByCheckoutId(checkoutId);
      return response.data.data;
    },
    enabled: !!checkoutId,
    staleTime: 0,
    gcTime: DEFAULT_GC_TIME,
  });
};
