import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { MdHourglassEmpty, MdSync, MdCheckCircle, MdError, MdCancel, MdArrowBack, MdRefresh } from 'react-icons/md';
import { HiOutlineTicket } from 'react-icons/hi';
import { API_BASE_URL } from '../../../api/config';
import { usePayTicketInvoices, useQueryMpesaStatus, useGetPaymentById } from '../../../tanstack/usePayments';
import { useAuth } from '../../../contexts/AuthContext';
import { formatCurrency } from '../../../utils';

type PaymentStatusType = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

const statusVariantMap: Record<
  PaymentStatusType,
  {
    label: string;
    variant: 'default' | 'info' | 'success' | 'warning' | 'error';
    icon: React.ReactNode;
    color: string;
  }
> = {
  pending: { label: 'Pending', variant: 'info', icon: <MdHourglassEmpty className="w-12 h-12" />, color: 'text-blue-500' },
  processing: { label: 'Processing', variant: 'info', icon: <MdSync className="w-12 h-12 animate-spin" />, color: 'text-blue-500' },
  completed: { label: 'Completed', variant: 'success', icon: <MdCheckCircle className="w-12 h-12" />, color: 'text-green-500' },
  failed: { label: 'Failed', variant: 'error', icon: <MdError className="w-12 h-12" />, color: 'text-red-500' },
  cancelled: { label: 'Cancelled', variant: 'error', icon: <MdCancel className="w-12 h-12" />, color: 'text-gray-500' },
};

const FALLBACK_TIMEOUT = 60000; // 60 seconds

const PayTickets: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const bookingData = location.state?.bookingData;

  const [paymentId, setPaymentId] = useState<string>(bookingData?.paymentId || '');
  const [checkoutId, setCheckoutId] = useState<string>(bookingData?.daraja?.checkoutRequestId || '');
  const [socketStatus, setSocketStatus] = useState<PaymentStatusType | null>(null);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const [hasInitiated, setHasInitiated] = useState(!!bookingData);

  const socketRef = useRef<Socket | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<PaymentStatusType>(bookingData ? 'processing' : 'pending');

  // Queries
  const { data: paymentData } = useGetPaymentById(paymentId);
  const { refetch: refetchMpesaStatus } = useQueryMpesaStatus(checkoutId);
  const payTicketInvoicesMutation = usePayTicketInvoices();

  const currentStatus = useMemo(() => {
    if (socketStatus) return socketStatus;
    
    const status = (paymentData?.status || bookingData?.status || 'pending').toLowerCase();
    if (status === 'success' || status === 'completed' || status === 'paid') return 'completed';
    if (status === 'failed') return 'failed';
    if (status === 'cancelled') return 'cancelled';
    if (status === 'initiated' || status === 'pending') return 'processing';
    
    return 'pending' as PaymentStatusType;
  }, [paymentData?.status, bookingData?.status, socketStatus]);

  useEffect(() => {
    statusRef.current = currentStatus;
  }, [currentStatus]);

  const config = statusVariantMap[currentStatus] || statusVariantMap.pending;

  const clearPaymentTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch (err) {
        console.error('Error disconnecting Socket.IO:', err);
      }
      socketRef.current = null;
    }
  }, []);

  const handleMpesaResultCode = useCallback(
    (resultCode: number, resultMessage: string) => {
      console.log(`M-Pesa Result: ${resultCode} - ${resultMessage}`);
      
      switch (resultCode) {
        case 0:
          setSocketStatus('completed');
          clearPaymentTimers();
          break;
        case 1:
          setSocketStatus('failed');
          setSocketError('Insufficient M-Pesa balance');
          clearPaymentTimers();
          break;
        case 1032:
          setSocketStatus('cancelled');
          setSocketError('Payment cancelled by user');
          clearPaymentTimers();
          break;
        case 1037:
          setSocketStatus('failed');
          setSocketError('Payment timeout - could not reach your phone');
          clearPaymentTimers();
          break;
        case 2001:
          setSocketStatus('failed');
          setSocketError('Wrong PIN entered');
          clearPaymentTimers();
          break;
        case 9999:
          // Keep waiting
          setSocketStatus('processing');
          break;
        default:
          setSocketStatus('failed');
          setSocketError(resultMessage || `Transaction failed (Code: ${resultCode})`);
          clearPaymentTimers();
          break;
      }
    },
    [clearPaymentTimers]
  );

  const startTracking = useCallback(
    (targetPaymentId: string) => {
      clearPaymentTimers();
      
      try {
        socketRef.current = io(API_BASE_URL, {
          transports: ['websocket'],
          forceNew: true,
          reconnection: true,
        });

        socketRef.current.on('connect', () => {
          console.log('Socket connected, subscribing to:', targetPaymentId);
          socketRef.current?.emit('subscribe-to-payment', String(targetPaymentId));
        });

        socketRef.current.on('callback.received', (payload: any) => {
          console.log('M-Pesa callback:', payload);
          const code = payload.CODE ?? payload.code ?? payload.resultCode;
          const message = payload.message || payload.resultDesc || 'Processed';
          handleMpesaResultCode(Number(code), message);
        });

        socketRef.current.on('payment.updated', (payload: any) => {
          if (String(payload.paymentId) !== String(targetPaymentId)) return;
          console.log('Payment updated:', payload);
          
          if (payload.status) {
            const status = payload.status.toLowerCase();
            if (status === 'success' || status === 'completed') setSocketStatus('completed');
            else if (status === 'failed') setSocketStatus('failed');
            else if (status === 'cancelled') setSocketStatus('cancelled');
            
            if (['success', 'completed', 'failed', 'cancelled'].includes(status)) {
              clearPaymentTimers();
            }
          }
        });

      } catch (err) {
        console.error('Socket connection error:', err);
      }

      timeoutRef.current = setTimeout(async () => {
        if (statusRef.current === 'completed' || statusRef.current === 'failed' || statusRef.current === 'cancelled') return;
        
        try {
          setIsFallbackActive(true);
          console.log('Fallback: Querying M-Pesa status...');
          const { data: statusData } = await refetchMpesaStatus();
          
          const code = statusData?.resultCode ?? statusData?.CODE ?? -1;
          const desc = statusData?.resultDesc ?? statusData?.message ?? 'Unknown status';
          
          handleMpesaResultCode(Number(code), desc);
        } catch (error) {
          console.error('Fallback error:', error);
          setSocketStatus('failed');
          setSocketError('Could not verify status. Please check your M-Pesa messages.');
        } finally {
          setIsFallbackActive(false);
        }
      }, FALLBACK_TIMEOUT);
    },
    [handleMpesaResultCode, clearPaymentTimers, refetchMpesaStatus]
  );

  useEffect(() => {
    if (bookingData && paymentId && !socketRef.current && hasInitiated) {
      startTracking(paymentId);
    }
  }, [bookingData, paymentId, startTracking, hasInitiated]);

  useEffect(() => {
    return () => clearPaymentTimers();
  }, [clearPaymentTimers]);

  const handleRetry = async () => {
    if (!bookingData) return;

    clearPaymentTimers();
    setHasInitiated(false);
    setSocketStatus('processing');
    setSocketError(null);

    try {
      const invoiceIds = bookingData.items.map((item: any) => item.invoiceId);
      const phone = user?.phone || '254712345678';
      
      const result = await payTicketInvoicesMutation.mutateAsync({
        invoiceIds,
        method: 'mpesa',
        payerPhone: phone,
      });

      if (result?.paymentId) {
        setPaymentId(result.paymentId);
        const cId = result.daraja?.checkoutRequestId || '';
        setCheckoutId(cId);
        setHasInitiated(true);
      }
    } catch (err: any) {
      console.error('STK Push Error:', err);
      setSocketStatus('failed');
      setSocketError(err?.response?.data?.message || 'Failed to initiate STK push');
    }
  };

  if (!bookingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <MdError className="text-red-500 w-16 h-16" />
        <h2 className="text-xl font-bold mt-4">Invalid Booking Data</h2>
        <p className="text-gray-500 mt-2">Could not find booking information to process payment.</p>
        <button onClick={() => navigate('/events')} className="btn-primary mt-6">Back to Events</button>
      </div>
    );
  }

  const totalPrice = bookingData.items.reduce((sum: number, item: any) => sum + item.price, 0);

  return (
    <div className="p-6 ">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Status Header */}
        <div className={`p-10 flex flex-col items-center text-center ${config.color} bg-opacity-5`}>
          <div className="p-4 rounded-full bg-white shadow-sm mb-4">
            {config.icon}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">{config.label}</h1>
          <p className="mt-3 text-gray-600 font-medium">
            {currentStatus === 'processing' && 'Please check your phone for the M-Pesa PIN prompt.'}
            {currentStatus === 'completed' && 'Your tickets have been reserved successfully!'}
            {currentStatus === 'failed' && (socketError || 'Something went wrong with the transaction.')}
            {currentStatus === 'cancelled' && 'The transaction was cancelled.'}
          </p>
          {isFallbackActive && (
            <p className="mt-3 text-xs text-blue-500 font-bold animate-pulse flex items-center gap-1">
                <MdSync className="animate-spin" /> Verifying with Safaricom...
            </p>
          )}
        </div>

        {/* Tickets Breakdown */}
        <div className="p-8 border-t border-gray-50 space-y-8">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-primary">
                    <HiOutlineTicket size={24} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Ticket Summary</h3>
                </div>
                
                <div className="space-y-3">
                    {bookingData.items.map((item: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Ticket #{item.ticketNumber}</p>
                                <p className="font-bold text-gray-900">{item.attendee || 'General Admission'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-brand-primary font-black">{formatCurrency(item.price)}</p>
                                <p className="text-[10px] text-gray-400 font-medium">INV: {item.invoiceNumber}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-brand-primary/5 rounded-3xl p-6 border border-brand-primary/10 flex justify-between items-center">
                <span className="font-bold text-brand-primary uppercase tracking-widest text-sm">Total Amount Paid</span>
                <span className="text-2xl font-black text-brand-primary">{formatCurrency(totalPrice)}</span>
            </div>
        </div>

        {/* Help text */}
        <div className="px-8 py-4 bg-gray-50 flex items-start gap-3">
          <MdError className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            {currentStatus === 'processing' 
              ? "If you don't see the prompt, ensure your phone is unlocked and try again. Don't close this page while we process your payment."
              : "Your tickets will be available in your email and dashboard once payment is confirmed."}
          </p>
        </div>

        {/* Actions */}
        <div className="p-8 bg-white border-t border-gray-50 flex flex-col sm:flex-row gap-4">
          {currentStatus === 'failed' || currentStatus === 'cancelled' ? (
            <button
              onClick={handleRetry}
              disabled={payTicketInvoicesMutation.isPending}
              className="flex-1 bg-brand-primary text-white py-4 px-8 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
            >
              {payTicketInvoicesMutation.isPending ? <MdSync className="animate-spin" /> : <MdRefresh size={20} />}
              {payTicketInvoicesMutation.isPending ? 'Initiating...' : 'Try Again'}
            </button>
          ) : (
            <Link
              to="/events"
              className="flex-1 bg-gray-100 text-gray-700 py-4 px-8 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
            >
              <MdArrowBack size={20} />
              Back to Events
            </Link>
          )}
          
          {currentStatus === 'completed' && (
            <Link
              to="/profile"
              className="flex-1 bg-brand-primary text-white py-4 px-8 rounded-2xl font-bold flex items-center justify-center hover:bg-brand-primary/90 transition-all text-center shadow-lg shadow-brand-primary/20"
            >
              View My Tickets
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayTickets;
