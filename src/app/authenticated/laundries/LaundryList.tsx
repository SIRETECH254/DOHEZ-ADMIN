import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { formatDistanceToNow, format, differenceInHours } from 'date-fns';
import { useGetLaundries, useDeleteLaundry } from '../../../tanstack/useLaundries';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { ILaundry } from '../../../types/api.types';
import { getInitials } from '../../../utils';

const laundryStatuses = [
  'PENDING',
  'CONFIRMED',
  'PICKED_UP',
  'IN_PROGRESS',
  'COMPLETED',
  'DELIVERED',
];

const LaundryList: React.FC = () => {
  const navigate = useNavigate();
  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [laundryToDelete, setLaundryToDelete] = useState<{
    id: string;
    number: string;
  } | null>(null);

  /**
   * Debounce search input
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

    if (filterStatus !== 'all') {
      apiParams.status = filterStatus;
    }

    return apiParams;
  }, [debouncedSearch, filterStatus, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetLaundries(params);
  const deleteLaundry = useDeleteLaundry();

  const laundries = data?.laundries || [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalLaundries: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleDeleteClick = useCallback((id: string, number: string) => {
    setLaundryToDelete({ id, number });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setLaundryToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!laundryToDelete) return;

    try {
      await deleteLaundry.mutateAsync(laundryToDelete.id);
      setDeleteModalOpen(false);
      setLaundryToDelete(null);
    } catch (err) {
      console.error('Delete laundry error:', err);
    }
  }, [laundryToDelete, deleteLaundry]);

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const formatPickUpDate = (pickUpDate: { day: string; hour: string }) => {
    if (!pickUpDate?.day || !pickUpDate?.hour) return 'N/A';
    
    // Extract date portion (YYYY-MM-DD) from ISO string
    const datePart = pickUpDate.day.split('T')[0];
    const date = new Date(`${datePart}T${pickUpDate.hour}`);
    
    if (isNaN(date.getTime())) return 'Invalid Date';

    const hoursDiff = Math.abs(differenceInHours(new Date(), date));
    
    if (hoursDiff >= 24) {
      return format(date, 'MMM d, yyyy h:mm a');
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred';

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <header className="">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Laundries</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage laundry bookings and status
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
                placeholder="Search by laundry number..."
                className="input-search"
              />
            </div>
          </div>

          <Link to="/laundries/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span className="">Book Laundry</span>
            <MdAdd size={24}/>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Showing {pagination.totalLaundries} laundries</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterStatus}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Status</option>
                {laundryStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

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

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Customer</th>
              <th className="table-header-cell">Laundry #</th>
              <th className="table-header-cell">Branch</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Pickup</th>
              <th className="table-header-cell-right">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {isLoading && (
              <>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="table-row animate-pulse">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </td>
                    <td className="table-cell">
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </td>
                    <td className="table-cell">
                      <div className="flex justify-end gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                      </div>
                    </td>
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

            {!isLoading && !isError && laundries.length === 0 && (
              <tr>
                <td colSpan={6} className="table-cell-center">
                  <p className="text-gray-500">No laundries found.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && laundries.map((laundry: ILaundry) => (
              <tr key={laundry._id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    {laundry.customer?.avatar ? (
                      <img 
                        src={laundry.customer.avatar} 
                        alt={`${laundry.customer.firstName}`} 
                        className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-sm font-bold border border-brand-primary/20">
                        {getInitials(laundry.customer)}
                      </div>
                    )}
                    <span className="font-medium text-gray-900">
                      {laundry.customer?.firstName} {laundry.customer?.lastName}
                    </span>
                  </div>
                </td>
                <td className="table-cell text-gray-700 font-mono text-xs">
                  {laundry.laundryNumber}
                </td>
                <td className="table-cell text-gray-700">
                  {laundry.branch?.name || 'N/A'}
                </td>
                <td className="table-cell">
                  <StatusBadge status={laundry.status} type="laundry-status" />
                </td>
                <td className="table-cell text-gray-700">
                  {formatPickUpDate(laundry.pickUpDate)}
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/laundries/${laundry._id}`)}
                      className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                      title="View details"
                    >
                      <HiOutlineEye size={20} />
                    </button>
                    <button 
                      onClick={() => navigate(`/laundries/${laundry._id}/edit`)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit laundry"
                    >
                      <HiOutlinePencil size={20} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(laundry._id, laundry.laundryNumber)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete laundry"
                      disabled={deleteLaundry.isPending}
                    >
                      <HiOutlineTrash size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalLaundries}
            currentPageCount={laundries.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Laundry Booking"
        message={`Are you sure you want to delete laundry booking "${laundryToDelete?.number}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteLaundry.isPending}
      />
    </div>
  );
};

export default LaundryList;
