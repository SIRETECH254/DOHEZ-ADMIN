import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd, MdEvent } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetProducts, useDeleteProduct } from '../../../tanstack/useProducts';
import { useGetBranches } from '../../../tanstack/useBranches';
import { useAuth } from '../../../contexts/AuthContext';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IProduct, IBranch } from '../../../types/api.types';

const EventList: React.FC = () => {
  const navigate = useNavigate();
  const { vendor, branch } = useAuth();
  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

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
   * Build API params from filters, search, and pagination
   */
  const params = useMemo(() => {
    const apiParams: any = {
      page: currentPage,
      limit: itemsPerPage,
      // For events, we might want to filter by a specific category if known,
      // but the user requested fetching from useProducts.
    };

    if (vendor?._id) {
      apiParams.vendor = vendor._id;
    }

    if (debouncedSearch.trim()) {
      apiParams.search = debouncedSearch.trim();
    }

    if (filterStatus !== 'all') {
      apiParams.status = filterStatus === 'active';
    }

    if (branch?._id) {
      apiParams.branch = branch._id;
    } else if (filterBranch !== 'all') {
      apiParams.branch = filterBranch;
    }

    return apiParams;
  }, [debouncedSearch, filterStatus, filterBranch, branch?._id, vendor?._id, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetProducts(params);
  const deleteProduct = useDeleteProduct();

  const events = data?.products || [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleDeleteClick = useCallback((eventId: string, eventName: string) => {
    setEventToDelete({ id: eventId, name: eventName });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!eventToDelete) return;

    try {
      await deleteProduct.mutateAsync(eventToDelete.id);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (err) {
      console.error('Delete event error:', err);
    }
  }, [eventToDelete, deleteProduct]);

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred';

  return (
    <div className="p-6 space-y-6">
      <header className="">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage ticketing events and performances
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
                placeholder="Search events..."
                className="input-search"
              />
            </div>
          </div>

          <Link to="/events/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span className="">Add Event</span>
            <MdAdd size={24}/>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalProducts} events</p>
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
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterStatus}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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

      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Event</th>
              <th className="table-header-cell">Amount</th>
              <th className="table-header-cell">Venue</th>
              <th className="table-header-cell">Date</th>
              <th className="table-header-cell">Status</th>
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
                        <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                    <td className="table-cell"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                    <td className="table-cell"><div className="flex items-center justify-end gap-2"><div className="h-8 w-24 bg-gray-200 rounded-lg"></div></div></td>
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

            {!isLoading && !isError && events.length === 0 && (
              <tr>
                <td colSpan={6} className="table-cell-center">
                  <p className="text-gray-500">No events found.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && events.map((event: IProduct) => (
              <tr key={event._id} className="table-row">
                <td className="table-cell font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    {event.images && event.images[0] ? (
                      <img 
                        src={event.images[0].url} 
                        alt={event.name} 
                        className="h-10 w-10 rounded-lg object-cover border border-gray-200" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                        <MdEvent size={20} />
                      </div>
                    )}
                    <span>{event.name}</span>
                  </div>
                </td>
                <td className="table-cell text-gray-600 font-semibold">${event.price.toFixed(2)}</td>
                <td className="table-cell text-gray-500">{event.venue || 'N/A'}</td>
                <td className="table-cell text-gray-500">
                  {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="table-cell">
                  <StatusBadge status={event.status} type="product-status" />
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => navigate(`/events/${event._id}`)} className="text-green-600 hover:text-green-800">
                      <HiOutlineEye size={20} />
                    </button>
                    <button onClick={() => navigate(`/events/${event._id}/edit`)} className="text-blue-600 hover:text-blue-800">
                      <HiOutlinePencil size={20} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDeleteClick(event._id, event.name)}
                      className="text-red-600 hover:text-red-800"
                      disabled={deleteProduct.isPending}
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
            totalItems={pagination.totalProducts}
            currentPageCount={events.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        message={eventToDelete ? `Are you sure you want to delete event "${eventToDelete.name}"?` : 'Are you sure?'}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteProduct.isPending}
      />
    </div>
  );
};

export default EventList;
