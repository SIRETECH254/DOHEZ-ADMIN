import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { MdHourglassEmpty, MdSync, MdCheckCircle, MdError, MdCancel, MdArrowBack, MdRefresh } from 'react-icons/md';
import { FiPackage } from 'react-icons/fi';
import { API_BASE_URL } from '../../../api/config';
import { usePayInvoice, useQueryMpesaStatus, useGetPaymentById } from '../../../tanstack/usePayments';
import { useGetInvoiceById } from '../../../tanstack/useInvoices';
import { useGetOrderById } from '../../../tanstack/useOrders';
import { useAuth } from '../../../contexts/AuthContext';
import { formatCurrency } from '../../../utils';
import type { IOrderItem ,IOrder} from '../../../types/api.types';

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

const Payment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const invoiceId = searchParams.get('invoiceId') || '';
  const amountParam = searchParams.get('amount');
  const phoneParam = searchParams.get('phone');
  const orderId = searchParams.get('orderId') || '';

  const [paymentId, setPaymentId] = useState<string>('');
  const [checkoutId, setCheckoutId] = useState<string>('');
  const [socketStatus, setSocketStatus] = useState<PaymentStatusType | null>(null);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const [hasInitiated, setHasInitiated] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Queries
  const { data: invoice, isLoading: isInvoiceLoading } = useGetInvoiceById(invoiceId);
  const { data: orderData, isLoading: isOrderLoading } = useGetOrderById(orderId);

  const order = orderData?.order as IOrder;
  
  const { data: paymentData } = useGetPaymentById(paymentId);
  const { refetch: refetchMpesaStatus } = useQueryMpesaStatus(checkoutId);

  const payInvoiceMutation = usePayInvoice();

  const currentStatus = useMemo(() => {
    if (socketStatus) return socketStatus;
    
    const status = (paymentData?.status || invoice?.paymentStatus || 'pending').toLowerCase();
    if (status === 'success' || status === 'completed' || status === 'paid') return 'completed';
    if (status === 'failed') return 'failed';
    if (status === 'cancelled') return 'cancelled';
    if (status === 'initiated' || status === 'pending') return 'processing';
    
    return 'pending' as PaymentStatusType;
  }, [paymentData?.status, invoice?.paymentStatus, socketStatus]);

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

      // Fallback
      timeoutRef.current = setTimeout(async () => {
        if (currentStatus === 'completed' || currentStatus === 'failed' || currentStatus === 'cancelled') return;
        
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
    [handleMpesaResultCode, clearPaymentTimers, refetchMpesaStatus, currentStatus]
  );

  useEffect(() => {
    const initiatePayment = async () => {
      if (hasInitiated || !invoiceId) return;
      
      const amount = amountParam ? parseFloat(amountParam) : invoice?.total || 0;
      let phone = phoneParam || user?.phone || '';
      if (phone.startsWith('0')) {
        phone = '254' + phone.substring(1);
      } else if (phone.startsWith('+')) {
        phone = phone.substring(1);
      } else if (phone.length === 9) {
        phone = '254' + phone;
      }

      if (!amount || !phone) {
        if (!isInvoiceLoading && !isOrderLoading) {
           console.error('Missing payment details:', { amount, phone });
        }
        return;
      }

      setHasInitiated(true);
      setSocketStatus('processing');
      setSocketError(null);

      try {
        const result = await payInvoiceMutation.mutateAsync({
          invoiceId,
          method: 'mpesa_stk',
          amount,
          payerPhone: phone,
        });

        if (result?.paymentId) {
          setPaymentId(result.paymentId);
          const cId = result.daraja?.checkoutRequestId || result.checkoutId || '';
          setCheckoutId(cId);
          startTracking(result.paymentId, cId);
        }
      } catch (err: any) {
        console.error('STK Push Error:', err);
        setSocketStatus('failed');
        setSocketError(err?.response?.data?.message || 'Failed to initiate STK push');
      }
    };

    if (invoice && !hasInitiated) {
      initiatePayment();
    }
  }, [invoice, invoiceId, amountParam, phoneParam, user, hasInitiated, payInvoiceMutation, startTracking, isInvoiceLoading, isOrderLoading]);

  useEffect(() => {
    return () => clearPaymentTimers();
  }, [clearPaymentTimers]);

  const handleRetry = () => {
    setHasInitiated(false);
    setSocketStatus(null);
    setSocketError(null);
  };

  if (isInvoiceLoading && !hasInitiated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <MdSync className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="mt-4 text-gray-600">Loading invoice details...</p>
      </div>
    );
  }

  return (
    <div className="p-6 ">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Status Header */}
        <div className={`p-8 flex flex-col items-center text-center ${config.color} bg-opacity-5`}>
          {config.icon}
          <h1 className="mt-4 text-2xl font-bold">{config.label}</h1>
          <p className="mt-2 text-gray-600">
            {currentStatus === 'processing' && 'Please check your phone for the M-Pesa PIN prompt.'}
            {currentStatus === 'completed' && 'Your payment has been received successfully.'}
            {currentStatus === 'failed' && (socketError || 'Something went wrong with the transaction.')}
            {currentStatus === 'cancelled' && 'The transaction was cancelled.'}
          </p>
          {isFallbackActive && (
            <p className="mt-2 text-xs text-blue-400 animate-pulse">Verifying status with Safaricom...</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="p-6 border-t border-gray-100">
          {/* Order Items Section */}
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2 text-brand-primary">
                <FiPackage size={20} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Order Items</h3>
              </div>
            </div>
            
            <div className="overflow-x-auto -mx-2">
              {order?.items && order.items.length > 0 ? (
                <table className="w-full text-left min-w-[400px]">
                  <thead className="text-gray-500 text-xs uppercase font-medium">
                    <tr>
                      <th className="px-2 py-2">Product</th>
                      <th className="px-2 py-2 text-center">Qty</th>
                      <th className="px-2 py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item: IOrderItem, index: number) => (
                      <tr key={index} className="text-sm">
                        <td className="px-2 py-3">
                          <div className="font-medium text-gray-900">{item.title}</div>
                          <div className="text-xs text-gray-400">SKU: {item.sku}</div>
                        </td>
                        <td className="px-2 py-3 text-center text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="px-2 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-sm">No items found for this order.</p>
              )}
            </div>
          </div>

          {/* Price Breakdown Section */}
          <div className="mt-6 bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2 text-brand-primary">
                <MdSync size={20} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Price Breakdown</h3>
              </div>
            </div>
            <div className="space-y-3 ml-2">
              {order?.pricing && (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold text-gray-900">{formatCurrency(order.pricing.subtotal)}</span>
                  </div>
                  {order.pricing.packagingFee > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Packaging Fee</span>
                      <span className="font-bold text-gray-900">{formatCurrency(order.pricing.packagingFee)}</span>
                    </div>
                  )}
                  {order.pricing.deliveryFee > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Delivery Fee</span>
                      <span className="font-bold text-gray-900">{formatCurrency(order.pricing.deliveryFee)}</span>
                    </div>
                  )}
                  {order.pricing.tax > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Tax</span>
                      <span className="font-bold text-gray-900">{formatCurrency(order.pricing.tax)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-brand-primary uppercase">Total Amount</span>
                <span className="text-lg font-black text-brand-primary">
                  {formatCurrency(order?.pricing?.total || invoice?.total || (amountParam ? parseFloat(amountParam) : 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="px-6 py-4 bg-gray-50 flex items-start space-x-3">
          <MdError className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            {currentStatus === 'processing' 
              ? "If you don't see the prompt, ensure your phone is unlocked and try again."
              : "A receipt has been sent to your email and is available in your account."}
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          {currentStatus === 'failed' || currentStatus === 'cancelled' ? (
            <button
              onClick={handleRetry}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <MdRefresh className="w-5 h-5" />
              Try Again
            </button>
          ) : (
            <Link
              to="/orders"
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <MdArrowBack className="w-5 h-5" />
              {currentStatus === 'completed' ? 'Back to Orders' : 'Go to Orders'}
            </Link>
          )}
          
          {currentStatus === 'completed' && (
            <Link
              to="/"
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center hover:bg-blue-700 transition-colors text-center"
            >
              Continue Shopping
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Payment processed by Daraja (M-Pesa)
        </p>
        <div className="mt-2 flex justify-center gap-4 text-xs font-medium text-gray-400">
          <span>SECURE</span>
          <span>•</span>
          <span>REAL-TIME</span>
          <span>•</span>
          <span>RELIABLE</span>
        </div>
      </div>
    </div>
  );
};

export default Payment;
