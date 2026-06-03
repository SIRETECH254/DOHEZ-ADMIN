import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetVendors, useDeleteVendor } from '../../../tanstack/useVendors';
import { useGetVendorCategories } from '../../../tanstack/useVendorCategories';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IVendor, IVendorCategory } from '../../../types/api.types';
import { getInitials } from '../../../utils';

const VendorList: React.FC = () => {
  const navigate = useNavigate();
  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<{
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

    if (filterCategory !== 'all') {
      apiParams.categoryId = filterCategory;
    }

    if (filterStatus !== 'all') {
      apiParams.isActive = filterStatus === 'active';
    }

    return apiParams;
  }, [debouncedSearch, filterCategory, filterStatus, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetVendors(params);
  const { data: categoriesData } = useGetVendorCategories({ all: true });
  const deleteVendor = useDeleteVendor();

  const vendors = data?.vendors || [];
  const categories = categoriesData?.categories || [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalVendors: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleDeleteClick = useCallback((id: string, name: string) => {
    setVendorToDelete({ id, name });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setVendorToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!vendorToDelete) return;

    try {
      await deleteVendor.mutateAsync(vendorToDelete.id);
      setDeleteModalOpen(false);
      setVendorToDelete(null);
    } catch (e) {
      console.error('Delete vendor error:', e);
    }
  }, [vendorToDelete, deleteVendor]);

  const handleCategoryFilterChange = (value: string) => {
    setFilterCategory(value);
    setCurrentPage(1);
  };

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
          <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
          <p className="mt-1 text-sm text-gray-500">Manage vendor profiles and branches</p>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vendors..."
                className="input-search"
              />
            </div>
          </div>
          <Link to="/vendors/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span>Add Vendor</span>
            <MdAdd size={24} />
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalVendors} vendors</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterCategory}
                onChange={(e) => handleCategoryFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Categories</option>
                {categories.map((c: IVendorCategory) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
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

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Name</th>
              <th className="table-header-cell">Email</th>
              <th className="table-header-cell">Phone</th>
              <th className="table-header-cell">Category</th>
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
                    <td className="table-cell"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
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
                <td colSpan={6} className="table-cell-center py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FiAlertTriangle className="text-brand-accent" size={48} />
                    <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !isError && vendors.length === 0 && (
              <tr>
                <td colSpan={6} className="table-cell-center">
                  <p className="text-gray-500">No vendors found.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && vendors.map((v: IVendor) => (
              <tr key={v._id} className="table-row">
                <td className="table-cell table-cell-text font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    {v.logo ? (
                      <img src={v.logo} alt={v.name} className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-sm font-bold border border-brand-primary/20">
                        {getInitials(v.name)}
                      </div>
                    )}
                    <span>{v.name}</span>
                  </div>
                </td>
                <td className="table-cell table-cell-text">{v.email}</td>
                <td className="table-cell table-cell-text">{v.phone}</td>
                <td className="table-cell">
                  {typeof v.vendorCategory === 'object' && v.vendorCategory 
                    ? (v.vendorCategory as IVendorCategory).name 
                    : '-'}
                </td>
                <td className="table-cell">
                  <StatusBadge status={v.isActive} type="vendor-status" />
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => navigate(`/vendors/${v._id}`)} className="text-green-600 hover:text-green-800"><HiOutlineEye size={20} /></button>
                    <button onClick={() => navigate(`/vendors/${v._id}/edit`)} className="text-blue-600 hover:text-blue-800"><HiOutlinePencil size={20} /></button>
                    <button type="button" onClick={() => handleDeleteClick(v._id, v.name)} className="text-red-600 hover:text-red-800" disabled={deleteVendor.isPending}><HiOutlineTrash size={20} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalVendors}
          currentPageCount={vendors.length}
          onPageChange={setCurrentPage}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Vendor"
        message={vendorToDelete ? `Delete vendor "${vendorToDelete.name}"?` : 'Delete this vendor?'}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteVendor.isPending}
      />
    </div>
  );
};

export default VendorList;
