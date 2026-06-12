import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { MdHourglassEmpty, MdSync, MdCheckCircle, MdError, MdCancel, MdArrowBack, MdRefresh } from 'react-icons/md';
import { HiOutlineOfficeBuilding, HiOutlineLocationMarker, HiOutlineClipboardList } from 'react-icons/hi';
import { API_BASE_URL } from '../../../api/config';
import { usePayLaundryInvoice, useQueryMpesaStatus, useGetPaymentById } from '../../../tanstack/usePayments';
import { useGetLaundryById } from '../../../tanstack/useLaundries';
import { useGetProducts } from '../../../tanstack/useProducts';
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

const FALLBACK_TIMEOUT = 60000;

const PayLaundry: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const laundryId = searchParams.get('laundryId') || '';
  const invoiceId = searchParams.get('invoiceId') || '';
  const amountParam = searchParams.get('amount');
  const phoneParam = searchParams.get('phone');
  const initialPaymentId = searchParams.get('paymentId');
  const initialCheckoutId = searchParams.get('checkoutId');

  const [paymentId, setPaymentId] = useState<string>(initialPaymentId || '');
  const [checkoutId, setCheckoutId] = useState<string>(initialCheckoutId || '');
  const [socketStatus, setSocketStatus] = useState<PaymentStatusType | null>(null);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [hasInitiated, setHasInitiated] = useState(!!initialPaymentId);

  const socketRef = useRef<Socket | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start tracking if we already have a paymentId
  useEffect(() => {
    if (initialPaymentId) {
      startTracking(initialPaymentId);
    }
  }, [initialPaymentId]);

  // Queries
  const { data: laundry, isLoading: isLoadingLaundry } = useGetLaundryById(laundryId);
  const { data: paymentData } = useGetPaymentById(paymentId);
  const { refetch: refetchMpesaStatus } = useQueryMpesaStatus(checkoutId);
  
  const { data: productsData } = useGetProducts({ 
    branch: typeof laundry?.branch === 'string' ? laundry.branch : laundry?.branch?._id,
    limit: 100 
  });

  const payLaundryMutation = usePayLaundryInvoice();

  const currentStatus = useMemo(() => {
    if (socketStatus) return socketStatus;
    const status = (paymentData?.status || 'pending').toLowerCase();
    if (status === 'success' || status === 'completed' || status === 'paid') return 'completed';
    if (status === 'failed') return 'failed';
    if (status === 'cancelled') return 'cancelled';
    if (status === 'initiated' || status === 'pending') return 'processing';
    return 'pending' as PaymentStatusType;
  }, [paymentData?.status, socketStatus]);

  const config = statusVariantMap[currentStatus] || statusVariantMap.pending;

  const clearPaymentTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const handleMpesaResultCode = useCallback((resultCode: number, resultMessage: string) => {
    switch (resultCode) {
      case 0:
        setSocketStatus('completed');
        clearPaymentTimers();
        break;
      case 1032:
        setSocketStatus('cancelled');
        setSocketError('Payment cancelled by user');
        clearPaymentTimers();
        break;
      default:
        setSocketStatus('failed');
        setSocketError(resultMessage || `Transaction failed (Code: ${resultCode})`);
        clearPaymentTimers();
        break;
    }
  }, [clearPaymentTimers]);

  const startTracking = useCallback((targetPaymentId: string) => {
    clearPaymentTimers();
    socketRef.current = io(API_BASE_URL, { transports: ['websocket'], forceNew: true });
    socketRef.current.on('connect', () => {
      socketRef.current?.emit('subscribe-to-payment', String(targetPaymentId));
    });
    socketRef.current.on('callback.received', (payload: any) => {
      const code = payload.CODE ?? payload.code ?? payload.resultCode;
      const message = payload.message || payload.resultDesc || 'Processed';
      handleMpesaResultCode(Number(code), message);
    });
    
    timeoutRef.current = setTimeout(async () => {
      if (['completed', 'failed', 'cancelled'].includes(currentStatus)) return;
      const { data: statusData } = await refetchMpesaStatus();
      handleMpesaResultCode(Number(statusData?.resultCode || -1), statusData?.resultDesc || 'Unknown');
    }, FALLBACK_TIMEOUT);
  }, [handleMpesaResultCode, clearPaymentTimers, refetchMpesaStatus, currentStatus]);

  useEffect(() => {
    const initiatePayment = async () => {
      if (hasInitiated || !laundry || (!invoiceId && !laundryId)) return;
      
      let phone = phoneParam || user?.phone || '';
      if (phone.startsWith('0')) phone = '254' + phone.substring(1);
      
      const amount = amountParam ? parseFloat(amountParam) : laundry.bookingFee;

      if (!amount || !phone) return;

      setHasInitiated(true);
      setSocketStatus('processing');

      try {
        const result = await payLaundryMutation.mutateAsync({
          invoiceId: invoiceId || laundryId, // Fallback if invoiceId not provided
          method: 'mpesa',
          payerPhone: phone,
        });

        if (result?.paymentId) {
          setPaymentId(result.paymentId);
          setCheckoutId(result.daraja?.checkoutRequestId || '');
          startTracking(result.paymentId);
        }
      } catch (err: any) {
        setSocketStatus('failed');
        setSocketError(err?.response?.data?.message || 'Failed to initiate STK push');
      }
    };

    if (laundry && !hasInitiated) {
      initiatePayment();
    }
  }, [laundry, hasInitiated, invoiceId, laundryId, amountParam, phoneParam, user, payLaundryMutation, startTracking]);

  useEffect(() => () => clearPaymentTimers(), [clearPaymentTimers]);

  const laundryServices = productsData?.products.filter((p: any) => laundry?.services?.includes(p._id)) || [];

  if (isLoadingLaundry && !hasInitiated) {
    return <div className="p-12 text-center">Loading payment details...</div>;
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Status Header */}
        <div className={`p-8 flex flex-col items-center text-center ${config.color} bg-opacity-5`}>
          {config.icon}
          <h1 className="mt-4 text-2xl font-bold">{config.label}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {currentStatus === 'processing' && 'Confirm the prompt on your phone.'}
            {currentStatus === 'completed' && 'Payment successful!'}
            {currentStatus === 'failed' && (socketError || 'Payment failed.')}
          </p>
        </div>

        {/* Laundry Info */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-primary">
              <HiOutlineOfficeBuilding size={20} />
              <h3 className="font-bold uppercase text-xs">Laundry Details</h3>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-900">#{laundry?.laundryNumber}</p>
              <p className="text-xs text-gray-500">{laundry?.vendor?.name} - {laundry?.branch?.name}</p>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <HiOutlineLocationMarker className="mt-1 shrink-0" />
              <span>{laundry?.location?.address}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-primary">
              <HiOutlineClipboardList size={20} />
              <h3 className="font-bold uppercase text-xs">Services</h3>
            </div>
            <div className="space-y-2">
              {laundryServices.map((s: any) => (
                <div key={s._id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{s.name}</span>
                  <span className="font-bold text-gray-900">{formatCurrency(s.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Amount to Pay</span>
            <span className="text-lg font-black text-brand-primary">
              {formatCurrency(amountParam ? parseFloat(amountParam) : (laundry?.bookingFee || 0))}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 text-right uppercase font-bold">Processed via M-Pesa STK Push</p>
        </div>

        {/* Actions */}
        <div className="p-6 flex flex-col sm:flex-row gap-3">
          {currentStatus === 'failed' || currentStatus === 'cancelled' ? (
            <button onClick={() => setHasInitiated(false)} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
              <MdRefresh /> Try Again
            </button>
          ) : (
            <button onClick={() => navigate('/laundries')} className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2">
              <MdArrowBack /> Back to Laundries
            </button>
          )}
          {currentStatus === 'completed' && (
            <button onClick={() => navigate(`/laundries/${laundryId}`)} className="flex-1 btn-primary py-3">
              View Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayLaundry;
