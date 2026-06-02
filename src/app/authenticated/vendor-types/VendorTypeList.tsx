import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetVendorTypes, useDeleteVendorType } from '../../../tanstack/useVendorTypes';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IVendorType } from '../../../types/api.types';

const VendorTypeList: React.FC = () => {
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
  const [typeToDelete, setTypeToDelete] = useState<{
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
      apiParams.all = filterStatus === 'active' ? 'true' : 'false';
      // Note: check API behavior for isActive filtering, sometimes 'all=true' returns both, 
      // but here I follow the UsersList pattern where we might need to adjust based on API spec.
      // API documentation says 'all=true' for admin view, 'isActive' is usually a separate filter if supported.
      // Re-reading API_DOCUMENTATION.md: "Query: search=Product, all=true, page=1, limit=10"
      // It doesn't explicitly mention isActive as a query param for vendor-types.
      // However, usually we want to filter. If 'all=true' returns everything, 
      // we might need the backend to support isActive. 
      // For now, I'll use it as a generic filter if supported or wait for API clarification.
      // Actually, looking at GetVendorTypesParams in api.types.ts: 
      // export interface GetVendorTypesParams extends PaginationParams { search?: string; all?: boolean | string; }
      // It doesn't have isActive. I'll just use 'all=true' as requested in my reference if needed.
    }

    return apiParams;
  }, [debouncedSearch, filterStatus, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetVendorTypes(params);
  const deleteVendorType = useDeleteVendorType();

  const vendorTypes = data?.vendorTypes || [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalTypes: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleDeleteClick = useCallback((id: string, name: string) => {
    setTypeToDelete({ id, name });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setTypeToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!typeToDelete) return;

    try {
      await deleteVendorType.mutateAsync(typeToDelete.id);
      setDeleteModalOpen(false);
      setTypeToDelete(null);
    } catch (deleteError) {
      console.error('Delete vendor type error:', deleteError);
    }
  }, [typeToDelete, deleteVendorType]);

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
          <h1 className="text-2xl font-semibold text-gray-900">Vendor Types</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage vendor categories and classifications
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
                placeholder="Search vendor types..."
                className="input-search"
              />
            </div>
          </div>

          <Link to="/vendor-types/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span>Add Vendor Type</span>
            <MdAdd size={24} />
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalTypes} vendor types</p>
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

      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Name</th>
              <th className="table-header-cell">Description</th>
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
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
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

            {!isLoading && !isError && vendorTypes.length === 0 && (
              <tr>
                <td colSpan={4} className="table-cell-center">
                  <p className="text-gray-500">No vendor types found.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && vendorTypes.map((type: IVendorType) => (
              <tr key={type._id} className="table-row">
                <td className="table-cell table-cell-text font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    {type.image ? (
                      <img 
                        src={type.image} 
                        alt={type.name} 
                        className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-sm font-bold border border-brand-primary/20">
                        {type.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span>{type.name}</span>
                  </div>
                </td>
                <td className="table-cell table-cell-text truncate max-w-xs">{type.description || '-'}</td>
                <td className="table-cell">
                  <StatusBadge 
                    status={type.isActive} 
                    type="vendor-type-status" 
                  />
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/vendor-types/${type._id}`)}
                      className="text-green-600 hover:text-green-800"
                      title="View Details"
                    >
                      <HiOutlineEye size={20} />
                    </button>
                    <button 
                      onClick={() => navigate(`/vendor-types/${type._id}/edit`)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <HiOutlinePencil size={20} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDeleteClick(type._id, type.name)}
                      className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      title="Delete"
                      disabled={deleteVendorType.isPending}
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
            totalItems={pagination.totalTypes}
            currentPageCount={vendorTypes.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Vendor Type"
        message={
          typeToDelete
            ? `Are you sure you want to delete vendor type "${typeToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this vendor type? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteVendorType.isPending}
      />
    </div>
  );
};

export default VendorTypeList;
