import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetPackaging, useDeletePackaging } from '../../../tanstack/usePackaging';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IPackaging } from '../../../types/api.types';

const PackagingList: React.FC = () => {
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
  const [packagingToDelete, setPackagingToDelete] = useState<{
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
      apiParams.isActive = filterStatus === 'active';
    }

    return apiParams;
  }, [debouncedSearch, filterStatus, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetPackaging(params);
  const deletePackaging = useDeletePackaging();

  const packagingItems = data?.packaging || [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalPackaging: 0,
  };

  const handleDeleteClick = useCallback((id: string, name: string) => {
    setPackagingToDelete({ id, name });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setPackagingToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!packagingToDelete) return;

    try {
      await deletePackaging.mutateAsync(packagingToDelete.id);
      setDeleteModalOpen(false);
      setPackagingToDelete(null);
    } catch (err) {
      console.error('Delete packaging error:', err);
    }
  }, [packagingToDelete, deletePackaging]);

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
      {/* Page header */}
      <header className="">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Packaging</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage packaging options for products and orders
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
                placeholder="Search packaging..."
                className="input-search"
              />
            </div>
          </div>

          <Link to="/packaging/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span>Add Packaging</span>
            <MdAdd size={24} />
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalPackaging} items</p>
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

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Name</th>
              <th className="table-header-cell">Price</th>
              <th className="table-header-cell">Default</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell-right">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {isLoading && (
              <>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="table-row animate-pulse">
                    <td className="table-cell"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-4 w-12 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                    <td className="table-cell-right"><div className="flex justify-end gap-2"><div className="h-8 w-8 bg-gray-200 rounded-lg"></div><div className="h-8 w-8 bg-gray-200 rounded-lg"></div><div className="h-8 w-8 bg-gray-200 rounded-lg"></div></div></td>
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

            {!isLoading && !isError && packagingItems.length === 0 && (
              <tr>
                <td colSpan={5} className="table-cell-center">
                  <p className="text-gray-500">No packaging items found.</p>
                  {debouncedSearch || filterStatus !== 'all' ? (
                    <p className="mt-2 text-sm text-gray-400">Try adjusting your search or filters.</p>
                  ) : null}
                </td>
              </tr>
            )}

            {!isLoading && !isError && packagingItems.map((item: IPackaging) => (
              <tr key={item._id} className="table-row">
                <td className="table-cell table-cell-text font-medium text-gray-900">{item.name}</td>
                <td className="table-cell table-cell-text">${item.price.toFixed(2)}</td>
                <td className="table-cell">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isDefault ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.isDefault ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="table-cell">
                  <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} type="packaging-status" />
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => navigate(`/packaging/${item._id}`)} className="text-green-600 hover:text-green-800">
                      <HiOutlineEye size={20} />
                    </button>
                    <button onClick={() => navigate(`/packaging/${item._id}/edit`)} className="text-blue-600 hover:text-blue-800">
                      <HiOutlinePencil size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(item._id, item.name)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      disabled={deletePackaging.isPending}
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
            totalItems={pagination.totalPackaging}
            currentPageCount={packagingItems.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Packaging"
        message={
          packagingToDelete
            ? `Are you sure you want to delete packaging "${packagingToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this packaging? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deletePackaging.isPending}
      />
    </div>
  );
};

export default PackagingList;
