import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineEye } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { format } from 'date-fns';
import { useGetInvoices } from '../../../tanstack/useInvoices';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import type { IInvoice } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  
  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /**
   * Debounce search input to reduce API calls
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const formatCreatedAt = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  /**
   * Build API params
   */
  const params = useMemo(() => {
    const apiParams: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (debouncedSearch.trim()) {
      apiParams.search = debouncedSearch.trim();
    }

    if (filterPaymentStatus !== 'all') {
      apiParams.paymentStatus = filterPaymentStatus;
    }

    return apiParams;
  }, [debouncedSearch, filterPaymentStatus, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetInvoices(params);

  const invoices = data?.invoices || [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  };

  const handlePaymentStatusFilterChange = (value: string) => {
    setFilterPaymentStatus(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred fetching invoices';

  return (
    <div className="p-6 space-y-6">
      <header className="">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage billing records
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Invoice #..."
                className="input-search"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.total} invoices</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Payment Status Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterPaymentStatus}
                onChange={(e) => handlePaymentStatusFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Payment Status</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Items per page */}
            <div className="relative">
              <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Invoice #</th>
              <th className="table-header-cell">Branch</th>
              <th className="table-header-cell">Total</th>
              <th className="table-header-cell">Balance Due</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Created At</th>
              <th className="table-header-cell-right">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {isLoading && (
              <>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="table-row animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}

            {isError && !isLoading && (
              <tr>
                <td colSpan={7} className="table-cell-center py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FiAlertTriangle className="text-brand-accent" size={48} />
                    <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !isError && invoices.length === 0 && (
              <tr>
                <td colSpan={7} className="table-cell-center">
                  <p className="text-gray-500">No invoices found.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && invoices.map((invoice: IInvoice) => {
              const branch = invoice.branch as { _id: string; name: string } | string;
              
              return (
                <tr key={invoice._id} className="table-row">
                  <td className="table-cell font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="table-cell text-gray-600">
                    {typeof branch === 'object' ? branch.name : branch || 'N/A'}
                  </td>
                  <td className="table-cell font-semibold text-gray-900">
                    {formatCurrency(invoice.total)}
                  </td>
                  <td className="table-cell text-gray-700">
                    {formatCurrency(invoice.balanceDue)}
                  </td>
                  <td className="table-cell">
                    <StatusBadge status={invoice.paymentStatus} type="invoice-status" />
                  </td>
                  <td className="table-cell text-gray-500">
                    {formatCreatedAt(invoice.createdAt)}
                  </td>
                  <td className="table-cell text-right">
                    <button 
                      onClick={() => navigate(`/invoices/${invoice._id}`)}
                      className="text-brand-primary hover:text-brand-primary/80 p-2 rounded-lg hover:bg-brand-primary/10 transition-colors"
                      title="View Invoice Details"
                    >
                      <HiOutlineEye size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            currentPageCount={invoices.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
