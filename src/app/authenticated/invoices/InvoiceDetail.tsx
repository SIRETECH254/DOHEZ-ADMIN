import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { FiAlertTriangle, FiFileText, FiCreditCard } from 'react-icons/fi';
import { MdStore } from 'react-icons/md';
import { useGetInvoiceById } from '../../../tanstack/useInvoices';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IInvoice, IInvoiceLineItem } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetInvoiceById(id || '');

  const invoice = data?.invoice as IInvoice;
  const vendor = invoice?.vendor as { _id: string; name: string };
  const branch = invoice?.branch as { _id: string; name: string };
  const order = invoice?.order as { _id: string; orderNumber: string };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Invoice</h2>
          <p className="text-red-700">{(error as any)?.response?.data?.message || 'Could not find the requested invoice.'}</p>
          <button onClick={() => navigate('/invoices')} className="mt-4 btn-primary">
            Back to Invoices
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
            onClick={() => navigate('/invoices')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <HiOutlineArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-sm text-gray-500">
              Issued on {new Date(invoice.createdAt).toLocaleString()}
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
              Invoice Status Summary
            </h2>
            
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <FiCreditCard className="text-brand-primary" />
                Payment Status
              </h3>
              <StatusBadge status={invoice.paymentStatus} type="invoice-status" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 font-semibold text-gray-900">
              <FiFileText className="text-brand-primary" />
              Invoice Summary
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.lineItems.map((item: IInvoiceLineItem, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.label}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 p-6 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.fees > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Fees</span>
                  <span>{formatCurrency(invoice.fees)}</span>
                </div>
              )}
              {invoice.discounts > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Discounts</span>
                  <span className="text-green-600">-{formatCurrency(invoice.discounts)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>{formatCurrency(invoice.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>Total</span>
                <span className="text-brand-primary">{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between text-md font-semibold text-red-600">
                <span>Balance Due</span>
                <span>{formatCurrency(invoice.balanceDue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Related Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCreditCard className="text-brand-primary" />
              Payment Information
            </h3>
            <div className="space-y-3 text-sm">
               {order && (
                 <div>
                  <p className="text-gray-500">Related Order</p>
                  <p className="font-medium text-brand-primary cursor-pointer hover:underline" onClick={() => navigate(`/orders/${order._id}`)}>
                    {order.orderNumber}
                  </p>
                </div>
               )}
               {invoice.metadata?.paymentMethod && (
                 <div>
                  <p className="text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-900 uppercase">{invoice.metadata.paymentMethod}</p>
                </div>
               )}
            </div>
          </div>

          {/* Vendor & Branch Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MdStore className="text-brand-primary" />
              Vendor & Branch
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Vendor</p>
                <p className="font-medium text-gray-900">{typeof vendor === 'object' ? vendor.name : vendor || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Branch</p>
                <p className="font-medium text-gray-900">{typeof branch === 'object' ? branch.name : branch || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
