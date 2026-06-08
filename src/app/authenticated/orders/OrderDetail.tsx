import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { FiAlertTriangle, FiUser, FiPackage, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { MdStore } from 'react-icons/md';
import { useGetOrderById, useUpdateOrderStatus } from '../../../tanstack/useOrders';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IOrder, IUser, IVendor, IBranch, IOrderItem } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetOrderById(id || '');
  const updateStatus = useUpdateOrderStatus();

  const order = data?.order as IOrder;
  const customer = order?.customer as IUser;
  const vendor = order?.vendor as IVendor;
  const branch = order?.branch as IBranch;

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    try {
      await updateStatus.mutateAsync({ 
        orderId: id, 
        data: { status: newStatus as any } 
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Status Skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
                <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
              </div>
            </div>
            
            {/* Items Table Skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="h-6 w-40 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 w-full bg-gray-100 rounded-lg"></div>)}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="h-6 w-40 bg-gray-200 rounded"></div>
              <div className="h-20 w-full bg-gray-100 rounded-lg"></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="h-6 w-40 bg-gray-200 rounded"></div>
              <div className="h-20 w-full bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Order</h2>
          <p className="text-red-700">{(error as any)?.response?.data?.message || 'Could not find the requested order.'}</p>
          <button onClick={() => navigate('/orders')} className="mt-4 btn-primary">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <HiOutlineArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order._id.substring(order._id.length - 8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              Order Status Summary
            </h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <FiCreditCard className="text-brand-primary" />
                  Payment Status
                </h3>
                <StatusBadge status={order.paymentStatus} type="payment-status" />
              </div>
              
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <FiCheckCircle className="text-brand-primary" />
                  Order Status
                </h3>
                <StatusBadge status={order.status} type="order-status" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 font-semibold text-gray-900">
              <FiPackage className="text-brand-primary" />
              Order Items
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3 text-center">Quantity</th>
                    <th className="px-6 py-3 text-right">Unit Price</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item: IOrderItem, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 p-6 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.pricing.subtotal)}</span>
              </div>
              {order.pricing.packagingFee > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Packaging Fee</span>
                  <span>{formatCurrency(order.pricing.packagingFee)}</span>
                </div>
              )}
              {order.pricing.deliveryFee > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(order.pricing.deliveryFee)}</span>
                </div>
              )}
              {order.pricing.tax > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>{formatCurrency(order.pricing.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>Total</span>
                <span className="text-brand-primary">{formatCurrency(order.pricing.total)}</span>
              </div>
            </div>
          </div>

          {/* Procedural Status Update Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
              <FiCheckCircle className="text-brand-primary" />
              Update Order Progress
            </h3>
            
            <div className="flex flex-col gap-2 relative">
              {['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((s, index, arr) => {
                const statusOrder = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                const isPassed = statusOrder.indexOf(order.status) > statusOrder.indexOf(s);
                const isActive = order.status === s;
                
                // Don't show "CANCELLED" in the progression if it hasn't been selected
                if (s === 'CANCELLED' && order.status !== 'CANCELLED') return null;

                return (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(s)}
                    disabled={updateStatus.isPending || isActive || s === 'CANCELLED'}
                    className={`flex items-center gap-3 text-sm font-medium p-3 rounded-lg transition-all relative ${
                      isActive || isPassed ? 'text-brand-primary' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {isPassed || isActive ? (
                      <FiCheckCircle className="text-brand-primary" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                    
                    {s.replace(/_/g, ' ')}
                    
                    {index < arr.length - 2 && (
                      <div className={`absolute left-[24px] top-[40px] h-6 w-0.5 ${isPassed ? 'bg-brand-primary' : 'bg-gray-200'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="text-brand-primary" />
              Customer Information
            </h3>
            {customer ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{customer.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{customer.phone}</p>
                </div>
                {order.address && (
                  <div>
                    <p className="text-gray-500">Shipping Address</p>
                    <p className="font-medium text-gray-900">{order.address}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Guest Customer</p>
            )}
          </div>

          {/* Vendor & Payment Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MdStore className="text-brand-primary" />
              Vendor & Fulfillment
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Vendor</p>
                <p className="font-medium text-gray-900">{vendor?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Branch</p>
                <p className="font-medium text-gray-900">{branch?.name || 'N/A'}</p>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-gray-500 flex items-center gap-1">
                  <FiCreditCard className="inline" /> Payment Method
                </p>
                <p className="font-medium text-gray-900 uppercase">
                  {order.paymentPreference.mode.replace(/_/g, ' ')} 
                  {order.paymentPreference.method ? ` (${order.paymentPreference.method})` : ''}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Fulfillment Type</p>
                <p className="font-medium text-gray-900 uppercase">{order.type}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
