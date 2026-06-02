import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetVendorCategories, useDeleteVendorCategory } from '../../../tanstack/useVendorCategories';
import { useGetVendorTypes } from '../../../tanstack/useVendorTypes';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IVendorCategory, IVendorType } from '../../../types/api.types';

const VendorCategoryList: React.FC = () => {
  const navigate = useNavigate();
  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterVendorType, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
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
      all: true, // Always fetch all categories for admin view
    };

    if (debouncedSearch.trim()) {
      apiParams.search = debouncedSearch.trim();
    }

    if (filterVendorType !== 'all') {
      apiParams.vendorType = filterVendorType;
    }

    // Note: API might not support isActive directly in query, check GetVendorCategoriesParams
    // For now mirroring VendorTypeList logic
    return apiParams;
  }, [debouncedSearch, filterVendorType, filterStatus, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetVendorCategories(params);
  const { data: vendorTypesData } = useGetVendorTypes({ all: true });
  const deleteVendorCategory = useDeleteVendorCategory();

  const categories = data?.categories || [];
  const vendorTypes = vendorTypesData?.vendorTypes || [];

  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalCategories: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleDeleteClick = useCallback((id: string, name: string) => {
    setCategoryToDelete({ id, name });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!categoryToDelete) return;

    try {
      await deleteVendorCategory.mutateAsync(categoryToDelete.id);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (deleteError) {
      console.error('Delete vendor category error:', deleteError);
    }
  }, [categoryToDelete, deleteVendorCategory]);

  const handleVendorTypeFilterChange = (value: string) => {
    setFilterRole(value);
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
      <header className="">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Vendor Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage vendor categories under different vendor types
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
                placeholder="Search categories..."
                className="input-search"
              />
            </div>
          </div>

          <Link to="/vendor-categories/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span>Add Category</span>
            <MdAdd size={24} />
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalCategories} categories</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterVendorType}
                onChange={(e) => handleVendorTypeFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Vendor Types</option>
                {vendorTypes.map((type: IVendorType) => (
                  <option key={type._id} value={type._id}>
                    {type.name}
                  </option>
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

      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Name</th>
              <th className="table-header-cell">Vendor Type</th>
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
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
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

            {!isLoading && !isError && categories.length === 0 && (
              <tr>
                <td colSpan={4} className="table-cell-center">
                  <p className="text-gray-500">No categories found.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && categories.map((category: IVendorCategory) => (
              <tr key={category._id} className="table-row">
                <td className="table-cell table-cell-text font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-sm font-bold border border-brand-primary/20">
                        {category.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span>{category.name}</span>
                  </div>
                </td>
                <td className="table-cell table-cell-text">
                  {typeof category.vendorType === 'object' && category.vendorType 
                    ? (category.vendorType as IVendorType).name 
                    : '-'}
                </td>
                <td className="table-cell">
                  <StatusBadge 
                    status={category.isActive} 
                    type="vendor-category-status" 
                  />
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/vendor-categories/${category._id}`)}
                      className="text-green-600 hover:text-green-800"
                      title="View Details"
                    >
                      <HiOutlineEye size={20} />
                    </button>
                    <button 
                      onClick={() => navigate(`/vendor-categories/${category._id}/edit`)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <HiOutlinePencil size={20} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDeleteClick(category._id, category.name)}
                      className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      title="Delete"
                      disabled={deleteVendorCategory.isPending}
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
            totalItems={pagination.totalCategories}
            currentPageCount={categories.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={
          categoryToDelete
            ? `Are you sure you want to delete category "${categoryToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this category? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteVendorCategory.isPending}
      />
    </div>
  );
};

export default VendorCategoryList;
