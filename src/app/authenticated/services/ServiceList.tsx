import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetServices, useDeleteService } from '../../../tanstack/useServices';
import { useGetTasks } from '../../../tanstack/useTasks';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IService, ITask } from '../../../types/api.types';

const ServiceList: React.FC = () => {
  const navigate = useNavigate();
  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTask, setFilterTask] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  /**
   * Debounce search input to reduce API calls
   * Updates debouncedSearch after 500ms of no typing
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      // Reset to page 1 when search changes
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /**
   * Build API params from filters, search, and pagination
   * Memoized to prevent unnecessary API calls
   */
  const params = useMemo(() => {
    const apiParams: any = {
      page: currentPage,
      limit: itemsPerPage,
      all: true, // Request all services including inactive ones for admin view
    };

    // Add search if provided
    if (debouncedSearch.trim()) {
      apiParams.search = debouncedSearch.trim();
    }

    // Add task filter if not "all"
    if (filterTask !== 'all') {
      apiParams.task = filterTask;
    }

    // Add status filter if not "all"
    if (filterStatus !== 'all') {
      apiParams.isActive = filterStatus === 'active';
    }

    return apiParams;
  }, [debouncedSearch, filterStatus, filterTask, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetServices(params);
  const { data: tasksData } = useGetTasks({ all: true });
  const deleteService = useDeleteService();

  const services = data?.services || [];
  const tasks = tasksData?.tasks || [];
  
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalServices: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  /**
   * Open delete confirmation modal
   */
  const handleDeleteClick = useCallback((serviceId: string, serviceName: string) => {
    setServiceToDelete({ id: serviceId, name: serviceName });
    setDeleteModalOpen(true);
  }, []);

  /**
   * Close delete confirmation modal
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setServiceToDelete(null);
  }, []);

  /**
   * Confirm and execute service deletion
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!serviceToDelete) return;

    try {
      await deleteService.mutateAsync(serviceToDelete.id);
      setDeleteModalOpen(false);
      setServiceToDelete(null);
    } catch (deleteError) {
      console.error('Delete service error:', deleteError);
    }
  }, [serviceToDelete, deleteService]);

  /**
   * Handle filter changes
   */
  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleTaskFilterChange = (value: string) => {
    setFilterTask(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  /**
   * Get error message from API response
   */
  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred';

  return (
    <div className="p-6 space-y-6">
      {/* Page header with title and Add Service button */}
      <header className="">
        {/* title and description */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage individual services under task categories
          </p>
        </div>

        {/* search Bar and Add button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search input */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search services..."
                className="input-search"
              />
            </div>
          </div>

          {/* Add service button */}
          <Link to="/services/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span className="">Add Service</span>
            <MdAdd size={24}/>
          </Link>
        </div>

        {/* service count & filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* service count */}
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalServices} services</p>
          </div>

          {/* filters */}
          <div className="flex flex-wrap gap-2">
            {/* Task filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterTask}
                onChange={(e) => handleTaskFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Tasks</option>
                {tasks.map((task: ITask) => (
                  <option key={task._id} value={task._id}>
                    {task.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
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

            {/* Items per page */}
            <div className="relative">
              <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* services table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Service</th>
              <th className="table-header-cell">Task</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell-right">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {/* Loading state */}
            {isLoading && (
              <>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="table-row animate-pulse">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </td>
                    <td className="table-cell">
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Error state */}
            {isError && !isLoading && (
              <tr>
                <td colSpan={4} className="table-cell-center py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FiAlertTriangle className="text-brand-accent" size={48} />
                    <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && !isError && services.length === 0 && (
              <tr>
                <td colSpan={4} className="table-cell-center">
                  <p className="text-gray-500">No services found.</p>
                  {debouncedSearch || filterStatus !== 'all' || filterTask !== 'all' ? (
                    <p className="mt-2 text-sm text-gray-400">
                      Try adjusting your search or filters.
                    </p>
                  ) : null}
                </td>
              </tr>
            )}

            {!isLoading && !isError && services.map((service: IService) => (
              <tr key={service._id} className="table-row">
                <td className="table-cell table-cell-text font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    {service.image ? (
                      <img 
                        src={service.image} 
                        alt={service.name} 
                        className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xs font-bold border border-brand-primary/20">
                        {service.name ? service.name.substring(0, 2).toUpperCase() : 'SR'}
                      </div>
                    )}
                    <span>{service.name}</span>
                  </div>
                </td>
                <td className="table-cell table-cell-text">
                  {(service.task as ITask)?.name || '-'}
                </td>
                <td className="table-cell">
                  <StatusBadge 
                    status={service.isActive ? 'ACTIVE' : 'INACTIVE'} 
                    type="service-status" 
                  />
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/services/${service._id}`)}
                      className="text-green-600 hover:text-green-800"
                      title="View details"
                    >
                      <HiOutlineEye size={20} />
                    </button>
                    <button 
                      onClick={() => navigate(`/services/${service._id}/edit`)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit service"
                    >
                      <HiOutlinePencil size={20} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDeleteClick(service._id, service.name)}
                      className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      title="Delete service"
                      disabled={deleteService.isPending}
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

      {/* Pagination */}
      {!isLoading && !isError && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalServices}
            currentPageCount={services.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        message={
          serviceToDelete
            ? `Are you sure you want to delete service "${serviceToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this service? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteService.isPending}
      />
    </div>
  );
};

export default ServiceList;
