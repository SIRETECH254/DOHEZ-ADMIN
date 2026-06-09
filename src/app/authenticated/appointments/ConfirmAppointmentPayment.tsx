import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { MdHourglassEmpty, MdSync, MdCheckCircle, MdError, MdCancel, MdArrowBack, MdRefresh } from 'react-icons/md';
import { HiOutlineClipboardCheck } from 'react-icons/hi';
import { API_BASE_URL } from '../../../api/config';
import { useConfirmAppointmentPayment, useQueryMpesaStatus, useGetPaymentById } from '../../../tanstack/usePayments';
import { useGetAppointmentById } from '../../../tanstack/useAppointments';
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
  completed: { label: 'Confirmed', variant: 'success', icon: <MdCheckCircle className="w-12 h-12" />, color: 'text-green-500' },
  failed: { label: 'Failed', variant: 'error', icon: <MdError className="w-12 h-12" />, color: 'text-red-500' },
  cancelled: { label: 'Cancelled', variant: 'error', icon: <MdCancel className="w-12 h-12" />, color: 'text-gray-500' },
};

const FALLBACK_TIMEOUT = 60000; // 60 seconds

const ConfirmAppointmentPayment: React.FC = () => {
  const { id: appointmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [paymentId, setPaymentId] = useState<string>('');
  const [checkoutId, setCheckoutId] = useState<string>('');
  const [socketStatus, setSocketStatus] = useState<PaymentStatusType | null>(null);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const [hasInitiated, setHasInitiated] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Queries
  const { data: appointment, isLoading: isAppointmentLoading } = useGetAppointmentById(appointmentId || '');
  const { data: paymentData } = useGetPaymentById(paymentId);
  const { refetch: refetchMpesaStatus } = useQueryMpesaStatus(checkoutId);

  const confirmPaymentMutation = useConfirmAppointmentPayment();

  const currentStatus = useMemo(() => {
    if (socketStatus) return socketStatus;
    
    const status = (paymentData?.status || appointment?.status || 'pending').toLowerCase();
    if (status === 'success' || status === 'completed' || status === 'confirmed') return 'completed';
    if (status === 'failed') return 'failed';
    if (status === 'cancelled') return 'cancelled';
    if (status === 'initiated' || status === 'pending') return 'processing';
    
    return 'pending' as PaymentStatusType;
  }, [paymentData?.status, appointment?.status, socketStatus]);

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
    (targetPaymentId: string, _targetCheckoutId: string) => {
      clearPaymentTimers();
      
      try {
        socketRef.current = io(API_BASE_URL, {
          transports: ['websocket'],
          forceNew: true,
          reconnection: true,
        });

        socketRef.current.on('connect', () => {
          console.log('Socket connected, subscribing to:', targetPaymentId);
          socketRef.current?.emit('subscribe-to-payment', targetPaymentId);
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
        if (currentStatus === 'completed' || currentStatus === 'failed' || currentStatus === 'cancelled') return;
        
        try {
          setIsFallbackActive(true);
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
    [handleMpesaResultCode, clearPaymentTimers, refetchMpesaStatus, currentStatus]
  );

  useEffect(() => {
    const initiateConfirmation = async () => {
      if (hasInitiated || !appointmentId || !appointment) return;
      
      let phone = user?.phone || '';
      
      const customerPhone = (appointment.customer as any)?.phone;
      phone = customerPhone || phone;

      if (phone.startsWith('0')) {
        phone = '254' + phone.substring(1);
      } else if (phone.startsWith('+')) {
        phone = phone.substring(1);
      } else if (phone.length === 9) {
        phone = '254' + phone;
      }

      if (!phone) {
        console.error('Missing phone number for confirmation');
        return;
      }

      setHasInitiated(true);
      setSocketStatus('processing');
      setSocketError(null);

      try {
        const result = await confirmPaymentMutation.mutateAsync({
          appointmentId,
          data: {
            method: 'mpesa',
            payerPhone: phone,
          },
        });

        if (result?.payment) {
          setPaymentId(result.payment.paymentId);
          const cId = result.payment.daraja?.checkoutRequestId || '';
          setCheckoutId(cId);
          startTracking(result.payment.paymentId, cId);
        }
      } catch (err: any) {
        console.error('Confirmation Error:', err);
        setSocketStatus('failed');
        setSocketError(err?.response?.data?.message || 'Failed to initiate confirmation');
      }
    };

    if (appointment && !hasInitiated) {
      initiateConfirmation();
    }
  }, [appointment, appointmentId, user, hasInitiated, confirmPaymentMutation, startTracking]);

  useEffect(() => {
    return () => clearPaymentTimers();
  }, [clearPaymentTimers]);

  const handleRetry = () => {
    setHasInitiated(false);
    setSocketStatus(null);
    setSocketError(null);
  };

  if (isAppointmentLoading && !hasInitiated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <MdSync className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="mt-4 text-gray-600">Loading appointment details...</p>
      </div>
    );
  }

  return (
    <div className="p-6 ">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Status Header */}
        <div className={`p-10 flex flex-col items-center text-center ${config.color} bg-opacity-5`}>
          {config.icon}
          <h1 className="mt-4 text-2xl font-bold">{config.label}</h1>
          <p className="mt-2 text-gray-600 ">
            {currentStatus === 'processing' && 'Please check the customer\'s phone for the M-Pesa PIN prompt to confirm the booking fee.'}
            {currentStatus === 'completed' && 'The appointment has been successfully confirmed.'}
            {currentStatus === 'failed' && (socketError || 'Something went wrong with the confirmation.')}
            {currentStatus === 'cancelled' && 'The confirmation process was cancelled.'}
          </p>
          {isFallbackActive && (
            <p className="mt-2 text-xs text-blue-400 animate-pulse">Verifying status with Safaricom...</p>
          )}
        </div>

        <div className="p-8 space-y-8">
          {/* Appointment Summary */}
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2 text-brand-primary">
                <HiOutlineClipboardCheck size={20} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Booking Summary</h3>
              </div>
              <span className="text-xs font-mono text-gray-500">#{appointment?.appointmentNumber}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Customer</p>
                  <p className="text-sm font-semibold text-gray-900">{(appointment?.customer as any)?.firstName} {(appointment?.customer as any)?.lastName}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Scheduled For</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {appointment && new Date(appointment.overallStartTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
               </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Services</p>
              <div className="space-y-2">
                {appointment?.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-gray-100">
                    <span className="font-medium text-gray-700">{item.service?.name}</span>
                    <span className="font-bold text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-brand-primary/5 rounded-3xl p-6 border border-brand-primary/10 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Booking Fee (Pay Now)</span>
              <span className="font-bold text-brand-primary">{formatCurrency(appointment?.bookingFeeAmount || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Remaining Balance (At Branch)</span>
              <span className="font-semibold text-gray-900">{formatCurrency(appointment?.remainingAmount || 0)}</span>
            </div>
            <div className="h-px bg-brand-primary/10 w-full" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Value</span>
              <span className="text-xl font-black text-gray-900">{formatCurrency((appointment?.bookingFeeAmount || 0) + (appointment?.remainingAmount || 0))}</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="px-8 py-4 bg-gray-50 flex items-start space-x-3">
          <MdError className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 italic">
            {currentStatus === 'processing' 
              ? "Confirming this appointment requires a booking fee payment via M-Pesa STK push."
              : "An automated confirmation message has been sent to the customer."}
          </p>
        </div>

        {/* Actions */}
        <div className="p-8 bg-white border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          {currentStatus === 'failed' || currentStatus === 'cancelled' ? (
            <button
              onClick={handleRetry}
              className="flex-1 btn-primary py-4 flex items-center justify-center gap-2"
            >
              <MdRefresh size={20} />
              Try Again
            </button>
          ) : (
            <button
              onClick={() => navigate(`/appointments/${appointmentId}`)}
              className="flex-1 btn-secondary py-4 flex items-center justify-center gap-2"
            >
              <MdArrowBack size={20} />
              {currentStatus === 'completed' ? 'Back to Appointment' : 'Cancel Process'}
            </button>
          )}
          
          {currentStatus === 'completed' && (
            <button
              onClick={() => navigate('/appointments')}
              className="flex-1 btn-primary py-4"
            >
              View All Appointments
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmAppointmentPayment;
