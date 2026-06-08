import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { FiAlertTriangle, FiFileText, FiCreditCard, FiUser, FiCalendar, FiExternalLink } from 'react-icons/fi';
import { MdStore, MdLocationOn } from 'react-icons/md';
import { useGetReceiptById } from '../../../tanstack/useReceipts';
import type { IReceipt, IUser, IVendor, IBranch } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';

const ReceiptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetReceiptById(id || '');

  const receipt = data?.receipt as IReceipt;
  
  const customer = typeof receipt?.customer === 'object' ? receipt.customer as IUser : null;
  const vendor = typeof receipt?.vendor === 'object' ? receipt.vendor as IVendor : null;
  const branch = typeof receipt?.branch === 'object' ? receipt.branch as IBranch : null;


  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (isError || !receipt) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Receipt</h2>
          <p className="text-red-700">{(error as any)?.response?.data?.message || 'Could not find the requested receipt.'}</p>
          <button onClick={() => navigate('/receipts')} className="mt-4 btn-primary">
            Back to Receipts
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
            onClick={() => navigate('/receipts')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <HiOutlineArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Receipt {receipt.receiptNumber}
            </h1>
            <p className="text-sm text-gray-500">
              Issued on {new Date(receipt.issuedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiFileText className="text-brand-primary" />
            Receipt Details
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-3">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-bold text-lg text-brand-primary">{formatCurrency(receipt.amountPaid)}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium text-gray-900 capitalize">{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-gray-500 flex items-center gap-2"><FiCalendar /> Issued At</span>
              <span className="font-medium text-gray-900">{new Date(receipt.issuedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Related Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCreditCard className="text-brand-primary" />
              Reference Information
            </h3>
            <div className="space-y-3 text-sm">
               {receipt.invoice && (
                 <div>
                  <p className="text-gray-500">Related Invoice</p>
                  <p className="font-medium text-gray-900">{typeof receipt.invoice === 'string' ? receipt.invoice : (receipt.invoice as any).invoiceNumber}</p>
                </div>
               )}
               {receipt.pdfUrl && (
                 <a href={receipt.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-primary hover:underline mt-2 text-sm">
                   <FiExternalLink /> View Receipt PDF
                 </a>
               )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="text-brand-primary" />
              Customer
            </h3>
            <div className="space-y-3 text-sm">
               <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{customer ? `${customer.firstName} ${customer.lastName}` : 'N/A'}</p>
               </div>
               <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{customer?.phone || 'N/A'}</p>
               </div>
            </div>
          </div>

          {/* Vendor & Branch Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MdStore className="text-brand-primary" />
              Vendor & Branch
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                 <MdStore className="text-gray-400" />
                 <div>
                    <p className="text-gray-500">Vendor</p>
                    <p className="font-medium text-gray-900">{vendor?.name || 'N/A'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <MdLocationOn className="text-gray-400" />
                 <div>
                    <p className="text-gray-500">Branch</p>
                    <p className="font-medium text-gray-900">{branch?.name || 'N/A'}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDetail;
