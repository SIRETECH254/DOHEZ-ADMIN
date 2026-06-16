import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineEye } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { formatDistanceToNow, format, differenceInHours } from 'date-fns';
import { useGetOrders } from '../../../tanstack/useOrders';
import { useGetBranches } from '../../../tanstack/useBranches';
import { useAuth } from '../../../contexts/AuthContext';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import type { IOrder, IUser, IBranch } from '../../../types/api.types';
import { formatCurrency, getInitials } from '../../../utils';

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const { vendor, branch } = useAuth();
  
  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
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
      apiParams.q = debouncedSearch.trim();
    }

    if (filterStatus !== 'all') {
      apiParams.status = filterStatus;
    }

    if (filterPaymentStatus !== 'all') {
      apiParams.paymentStatus = filterPaymentStatus;
    }

    if (branch?._id) {
      apiParams.branch = branch._id;
    } else if (filterBranch !== 'all') {
      apiParams.branch = filterBranch;
    }

    return apiParams;
  }, [debouncedSearch, filterStatus, filterPaymentStatus, filterBranch, branch?._id, vendor?._id, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetOrders(params);

  const orders = data?.orders || [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handlePaymentStatusFilterChange = (value: string) => {
    setFilterPaymentStatus(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString);
    const hoursDiff = Math.abs(differenceInHours(new Date(), date));
    
    if (hoursDiff >= 24) {
      return format(date, 'MMM d, yyyy h:mm a');
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred fetching orders';

  return (
    <div className="p-6 space-y-6">
      <header className="">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage all customer orders
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
                placeholder="Search by Order ID or Customer..."
                className="input-search"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalItems} orders</p>
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
            {/* Status Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterStatus}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Statuses</option>
                <option value="PLACED">Placed</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PACKED">Packed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

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
                <option value="UNPAID">Unpaid</option>
                <option value="PENDING">Pending</option>
                <option value="REFUNDED">Refunded</option>
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
              <th className="table-header-cell">Customer</th>
              <th className="table-header-cell">Branch</th>
              <th className="table-header-cell">Total</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Payment</th>
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

            {!isLoading && !isError && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="table-cell-center">
                  <p className="text-gray-500">No orders found.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && orders.map((order: IOrder) => {
              const customer = order.customer as IUser;
              const branch = order.branch as IBranch;
              
              return (
                <tr key={order._id} className="table-row">
                  <td className="table-cell whitespace-nowrap">
                    <div className="table-cell-content">
                      {customer?.avatar ? (
                        <img 
                          src={customer.avatar} 
                          alt="" 
                          className="table-avatar"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`table-avatar-initials ${customer?.avatar ? 'hidden' : ''}`}>
                        {getInitials(customer)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {customer ? `${customer.firstName} ${customer.lastName}` : 'Guest'}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell text-gray-600 whitespace-nowrap">
                    {branch?.name || 'N/A'}
                  </td>
                  <td className="table-cell font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(order.pricing.total)}
                  </td>
                  <td className="table-cell whitespace-nowrap">
                    <StatusBadge status={order.status} type="order-status" />
                  </td>
                  <td className="table-cell whitespace-nowrap">
                    <StatusBadge status={order.paymentStatus} type="payment-status" />
                  </td>
                  <td className="table-cell text-gray-500 whitespace-nowrap">
                    {formatCreatedAt(order.createdAt)}
                  </td>
                  <td className="table-cell text-right whitespace-nowrap">
                    <button 
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="text-brand-primary hover:text-brand-primary/80 p-2 rounded-lg hover:bg-brand-primary/10 transition-colors"
                      title="View Order Details"
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
            totalItems={pagination.totalItems}
            currentPageCount={orders.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default OrderList;
