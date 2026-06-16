import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineEye } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { format } from 'date-fns';
import { useGetReceipts } from '../../../tanstack/useReceipts';
import { useGetBranches } from '../../../tanstack/useBranches';
import { useAuth } from '../../../contexts/AuthContext';
import Pagination from '../../../components/ui/Pagination';
import type { IReceipt, IBranch } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';

const ReceiptList: React.FC = () => {
  const navigate = useNavigate();
  const { vendor, branch } = useAuth();
  
  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');

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

  const { data: branchesData } = useGetBranches({ vendorId: vendor?._id });
  const branches = branchesData?.branches || [];

  const formatIssuedAt = (dateString: string) => {
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

    if (vendor?._id) {
      apiParams.vendor = vendor._id;
    }

    if (debouncedSearch.trim()) {
      apiParams.search = debouncedSearch.trim();
    }

    if (filterPaymentMethod !== 'all') {
      apiParams.paymentMethod = filterPaymentMethod;
    }

    if (branch?._id) {
      apiParams.branch = branch._id;
    } else if (filterBranch !== 'all') {
      apiParams.branch = filterBranch;
    }

    return apiParams;
  }, [debouncedSearch, filterPaymentMethod, filterBranch, branch?._id, vendor?._id, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetReceipts(params);

  const receipts = data?.receipts || [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalReceipts: 0,
  };

  const handlePaymentMethodFilterChange = (value: string) => {
    setFilterPaymentMethod(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred fetching receipts';

  return (
    <div className="p-6 space-y-6">
      <header className="">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Receipts</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage payment receipts
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
                placeholder="Search by Receipt #..."
                className="input-search"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalReceipts} receipts</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {!branch?._id && (
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
                <select
                  value={filterBranch}
                  onChange={(e) => {
                    setFilterBranch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-select pl-10"
                >
                  <option value="all">All Branches</option>
                  {branches.map((branchItem: IBranch) => (
                    <option key={branchItem._id} value={branchItem._id}>{branchItem.name}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Payment Method Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterPaymentMethod}
                onChange={(e) => handlePaymentMethodFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Methods</option>
                <option value="mpesa">M-Pesa</option>
                <option value="paystack">Paystack</option>
                <option value="cash">Cash</option>
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
              <th className="table-header-cell">Receipt #</th>
              <th className="table-header-cell">Amount</th>
              <th className="table-header-cell">Payment Method</th>
              <th className="table-header-cell">Branch</th>
              <th className="table-header-cell">Issued At</th>
              <th className="table-header-cell-right">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {isLoading && (
              <>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="table-row animate-pulse">
                    {[...Array(6)].map((_, j) => (
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
                <td colSpan={6} className="table-cell-center py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FiAlertTriangle className="text-brand-accent" size={48} />
                    <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !isError && receipts.length === 0 && (
              <tr>
                <td colSpan={6} className="table-cell-center">
                  <p className="text-gray-500">No receipts found.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && receipts.map((receipt: IReceipt) => {
              const branch = receipt.branch as { _id: string; name: string } | string;
              return (
                <tr key={receipt._id} className="table-row">
                  <td className="table-cell font-medium text-gray-900">
                    {receipt.receiptNumber}
                  </td>
                  <td className="table-cell font-semibold text-gray-900">
                    {formatCurrency(receipt.amountPaid)}
                  </td>
                  <td className="table-cell text-gray-600 capitalize">
                    {receipt.paymentMethod}
                  </td>
                  <td className="table-cell text-gray-600">
                    {typeof branch === 'object' ? branch.name : branch || 'N/A'}
                  </td>
                  <td className="table-cell text-gray-500">
                    {formatIssuedAt(receipt.issuedAt)}
                  </td>
                  <td className="table-cell text-right">
                    <button 
                      onClick={() => navigate(`/receipts/${receipt._id}`)}
                      className="text-brand-primary hover:text-brand-primary/80 p-2 rounded-lg hover:bg-brand-primary/10 transition-colors"
                      title="View Receipt Details"
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
            totalItems={pagination.totalReceipts}
            currentPageCount={receipts.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default ReceiptList;
