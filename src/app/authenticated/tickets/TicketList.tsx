import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetTickets, useDeleteTicket } from '../../../tanstack/useTickets';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { ITicket } from '../../../types/api.types';

const TicketList: React.FC = () => {
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
  const [ticketToDelete, setTicketToDelete] = useState<{
    id: string;
    number: string;
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

  /**
   * Build API params from filters, search, and pagination
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

  const { data, isLoading, isError, error } = useGetTickets(params);
  const deleteTicket = useDeleteTicket();

  const tickets = data?.tickets || [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalTickets: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleDeleteClick = useCallback((ticketId: string, ticketNumber: string) => {
    setTicketToDelete({ id: ticketId, number: ticketNumber });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setTicketToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!ticketToDelete) return;

    try {
      await deleteTicket.mutateAsync(ticketToDelete.id);
      setDeleteModalOpen(false);
      setTicketToDelete(null);
    } catch (err) {
      console.error('Delete ticket error:', err);
    }
  }, [ticketToDelete, deleteTicket]);

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
          <h1 className="text-2xl font-semibold text-gray-900">Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage event tickets and bookings
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
                placeholder="Search ticket number or customer name..."
                className="input-search"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalTickets} tickets</p>
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
                <option value="PENDING">Pending</option>
                <option value="BOOKED">Booked</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="USED">Used</option>
                <option value="EXPIRED">Expired</option>
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
              <th className="table-header-cell">Ticket Number</th>
              <th className="table-header-cell">Customer Name</th>
              <th className="table-header-cell">Event</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell-right">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {isLoading && (
              <>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="table-row animate-pulse">
                    <td className="table-cell"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-4 w-40 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                    <td className="table-cell"><div className="flex items-center justify-end gap-2"><div className="h-8 w-24 bg-gray-200 rounded-lg"></div></div></td>
                  </tr>
                ))}
              </>
            )}

            {isError && !isLoading && (
              <tr>
                <td colSpan={5} className="table-cell-center py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FiAlertTriangle className="text-brand-accent" size={48} />
                    <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !isError && tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="table-cell-center">
                  <p className="text-gray-500">No tickets found.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && tickets.map((ticket: ITicket) => (
              <tr key={ticket._id} className="table-row">
                <td className="table-cell font-medium text-gray-900">{ticket.ticketNumber}</td>
                <td className="table-cell text-gray-600">{ticket.details.name}</td>
                <td className="table-cell text-gray-500">
                  {typeof ticket.event === 'object' && ticket.event !== null 
                    ? (ticket.event as any).name 
                    : 'N/A'}
                </td>
                <td className="table-cell">
                  <StatusBadge status={ticket.status} type="ticket-status" />
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/tickets/${ticket._id}`)} 
                      className="text-green-600 hover:text-green-800"
                      title="View Details"
                    >
                      <HiOutlineEye size={20} />
                    </button>
                    <button 
                      onClick={() => navigate(`/tickets/${ticket._id}/edit`)} 
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Status"
                    >
                      <HiOutlinePencil size={20} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDeleteClick(ticket._id, ticket.ticketNumber)}
                      className="text-red-600 hover:text-red-800"
                      disabled={deleteTicket.isPending}
                      title="Delete Ticket"
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
            totalItems={pagination.totalTickets}
            currentPageCount={tickets.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Ticket"
        message={ticketToDelete ? `Are you sure you want to delete ticket "${ticketToDelete.number}"?` : 'Are you sure?'}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteTicket.isPending}
      />
    </div>
  );
};

export default TicketList;
