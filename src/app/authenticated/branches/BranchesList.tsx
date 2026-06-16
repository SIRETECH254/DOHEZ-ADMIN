import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd, MdLocationOn } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetBranches, useDeleteBranch } from '../../../tanstack/useBranches';
import { useAuth } from '../../../contexts/AuthContext';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IBranch, IVendor } from '../../../types/api.types';

const BranchesList: React.FC = () => {
  const navigate = useNavigate();
  const { vendor } = useAuth();
  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<{
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
    
    if (vendor?._id) {
      apiParams.vendorId = vendor._id;
    }

    return apiParams;
  }, [debouncedSearch, currentPage, itemsPerPage, vendor]);

  const { data, isLoading, isError, error } = useGetBranches(params);
  const deleteBranch = useDeleteBranch();

  const branches = data?.branches || [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalBranches: 0,
  };

  const handleDeleteClick = useCallback((branchId: string, branchName: string) => {
    setBranchToDelete({ id: branchId, name: branchName });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setBranchToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!branchToDelete) return;

    try {
      await deleteBranch.mutateAsync(branchToDelete.id);
      setDeleteModalOpen(false);
      setBranchToDelete(null);
    } catch (deleteError) {
      console.error('Delete branch error:', deleteError);
    }
  }, [branchToDelete, deleteBranch]);

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
          <h1 className="text-2xl font-semibold text-gray-900">Branches</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage vendor branches and locations
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
                placeholder="Search branches..."
                className="input-search"
              />
            </div>
          </div>

          <Link to="/branches/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span>Add Branch</span>
            <MdAdd size={24}/>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Showing {pagination.totalBranches} branches</p>
          </div>

          <div className="flex flex-wrap gap-2">
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
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Branches table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Name</th>
              <th className="table-header-cell">Vendor</th>
              <th className="table-header-cell">Email</th>
              <th className="table-header-cell">Phone</th>
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
                    <td className="table-cell"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    <td className="table-cell text-right"><div className="h-8 w-24 bg-gray-200 rounded ml-auto"></div></td>
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

            {!isLoading && !isError && branches.length === 0 && (
              <tr>
                <td colSpan={5} className="table-cell-center py-12">
                  <p className="text-gray-500">No branches found.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && branches.map((branch: IBranch) => (
              <tr key={branch._id} className="table-row">
                <td className="table-cell font-medium text-gray-900 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {branch.cover ? (
                      <img src={branch.cover} alt={branch.name} className="h-10 w-10 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                        <MdLocationOn size={20} />
                      </div>
                    )}
                    <span>{branch.name}</span>
                  </div>
                </td>
                <td className="table-cell text-gray-600 whitespace-nowrap">
                  {typeof branch.vendorId === 'string' ? branch.vendorId : (branch.vendorId as IVendor)?.name || 'N/A'}
                </td>
                <td className="table-cell text-gray-600 whitespace-nowrap">{branch.email}</td>
                <td className="table-cell text-gray-600 whitespace-nowrap">{branch.phone}</td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => navigate(`/branches/${branch._id}`)} className="text-green-600 hover:text-green-800">
                      <HiOutlineEye size={20} />
                    </button>
                    <button onClick={() => navigate(`/branches/${branch._id}/edit`)} className="text-blue-600 hover:text-blue-800">
                      <HiOutlinePencil size={20} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(branch._id, branch.name)}
                      className="text-red-600 hover:text-red-800"
                      disabled={deleteBranch.isPending}
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
            totalItems={pagination.totalBranches}
            currentPageCount={branches.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Branch"
        message={`Are you sure you want to delete branch "${branchToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteBranch.isPending}
      />
    </div>
  );
};

export default BranchesList;
