import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetTasks, useDeleteTask } from '../../../tanstack/useTasks';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { ITask } from '../../../types/api.types';

const TaskList: React.FC = () => {
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
  const [taskToDelete, setTaskToDelete] = useState<{
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
      all: true, // Request all tasks including inactive ones for admin view
    };

    // Add search if provided
    if (debouncedSearch.trim()) {
      apiParams.search = debouncedSearch.trim();
    }

    // Add status filter if not "all"
    if (filterStatus !== 'all') {
      apiParams.isActive = filterStatus === 'active';
    }

    return apiParams;
  }, [debouncedSearch, filterStatus, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetTasks(params);
  const deleteTask = useDeleteTask();

  const tasks = data?.tasks || [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  /**
   * Open delete confirmation modal
   */
  const handleDeleteClick = useCallback((taskId: string, taskName: string) => {
    setTaskToDelete({ id: taskId, name: taskName });
    setDeleteModalOpen(true);
  }, []);

  /**
   * Close delete confirmation modal
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setTaskToDelete(null);
  }, []);

  /**
   * Confirm and execute task deletion
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask.mutateAsync(taskToDelete.id);
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (deleteError) {
      console.error('Delete task error:', deleteError);
    }
  }, [taskToDelete, deleteTask]);

  /**
   * Handle filter changes
   */
  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
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
      {/* Page header with title and Add Task button */}
      <header className="">
        {/* title and description */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage main task categories and services
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
                placeholder="Search tasks..."
                className="input-search"
              />
            </div>
          </div>

          {/* Add task button */}
          <Link to="/tasks/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span className="">Add Task</span>
            <MdAdd size={24}/>
          </Link>
        </div>

        {/* task count & filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* task count */}
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalTasks} tasks</p>
          </div>

          {/* filters */}
          <div className="flex flex-wrap gap-2">
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

      {/* tasks table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Task</th>
              <th className="table-header-cell">Description</th>
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
                      <div className="h-4 w-48 bg-gray-200 rounded"></div>
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
            {!isLoading && !isError && tasks.length === 0 && (
              <tr>
                <td colSpan={4} className="table-cell-center">
                  <p className="text-gray-500">No tasks found.</p>
                  {debouncedSearch || filterStatus !== 'all' ? (
                    <p className="mt-2 text-sm text-gray-400">
                      Try adjusting your search or filters.
                    </p>
                  ) : null}
                </td>
              </tr>
            )}

            {!isLoading && !isError && tasks.map((task: ITask) => (
              <tr key={task._id} className="table-row">
                <td className="table-cell table-cell-text font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    {task.image ? (
                      <img 
                        src={task.image} 
                        alt={task.name} 
                        className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xs font-bold border border-brand-primary/20">
                        {task.name ? task.name.substring(0, 2).toUpperCase() : 'TA'}
                      </div>
                    )}
                    <span>{task.name}</span>
                  </div>
                </td>
                <td className="table-cell table-cell-text max-w-xs truncate">
                  {task.description || '-'}
                </td>
                <td className="table-cell">
                  <StatusBadge 
                    status={task.isActive ? 'ACTIVE' : 'INACTIVE'} 
                    type="task-status" 
                  />
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      className="text-green-600 hover:text-green-800"
                      title="View details"
                    >
                      <HiOutlineEye size={20} />
                    </button>
                    <button 
                      onClick={() => navigate(`/tasks/${task._id}/edit`)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit task"
                    >
                      <HiOutlinePencil size={20} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDeleteClick(task._id, task.name)}
                      className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      title="Delete task"
                      disabled={deleteTask.isPending}
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
            totalItems={pagination.totalTasks}
            currentPageCount={tasks.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={
          taskToDelete
            ? `Are you sure you want to delete task "${taskToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this task? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteTask.isPending}
      />
    </div>
  );
};

export default TaskList;
