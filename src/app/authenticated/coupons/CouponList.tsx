import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiAlertTriangle, FiFilter, FiList } from 'react-icons/fi';
import { useGetAllCoupons, useDeleteCoupon } from '../../../tanstack/useCoupons';
import { useGetBranches } from '../../../tanstack/useBranches';
import { useAuth } from '../../../contexts/AuthContext';
import StatusBadge from '../../../components/ui/StatusBadge';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Pagination from '../../../components/ui/Pagination';
import type { ICoupon, IBranch } from '../../../types/api.types';

const CouponList: React.FC = () => {
  const navigate = useNavigate();
  const { vendor, branch } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: branchesData } = useGetBranches({ vendorId: vendor?._id });
  const branches = branchesData?.branches || [];

  const params = useMemo(() => {
    const apiParams: any = { page: currentPage, limit: itemsPerPage };
    if (vendor?._id) apiParams.vendor = vendor._id;
    if (debouncedSearch.trim()) apiParams.search = debouncedSearch.trim();
    if (filterStatus !== 'all') apiParams.isActive = filterStatus === 'active';
    if (branch?._id) {
      apiParams.branch = branch._id;
    } else if (filterBranch !== 'all') {
      apiParams.branch = filterBranch;
    }
    return apiParams;
  }, [debouncedSearch, filterStatus, filterBranch, branch?._id, vendor?._id, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetAllCoupons(params);
  const deleteCoupon = useDeleteCoupon();
  const coupons = data?.coupons || [];
  const pagination = data?.pagination ?? { currentPage: 1, totalPages: 1, totalCoupons: 0 };

  const handleDeleteClick = useCallback((id: string, name: string) => {
    setCouponToDelete({ id, name });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!couponToDelete) return;
    try {
      await deleteCoupon.mutateAsync(couponToDelete.id);
      setDeleteModalOpen(false);
      setCouponToDelete(null);
    } catch (err) {
      console.error('Delete coupon error:', err);
    }
  }, [couponToDelete, deleteCoupon]);

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const errorMessage = (error as any)?.response?.data?.message ?? (error as any)?.message ?? 'An error occurred';

  return (
    <div className="p-6 space-y-6">
      <header>
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Coupons</h1>
          <p className="mt-1 text-sm text-gray-500">Manage discount coupons</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Search coupons..." 
                className="input-search pl-10" 
              />
            </div>
          </div>
          <Link to="/coupons/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span>Add Coupon</span>
            <MdAdd size={24} />
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Showing {pagination.totalCoupons} coupons</p>
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
              <th className="table-header-cell">Name</th>
              <th className="table-header-cell">Code</th>
              <th className="table-header-cell">Used</th>
              <th className="table-header-cell">Branch</th>
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
                    <td className="table-cell"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-4 w-12 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                    <td className="table-cell"><div className="flex justify-end gap-2"><div className="h-8 w-8 bg-gray-200 rounded-lg"></div><div className="h-8 w-8 bg-gray-200 rounded-lg"></div><div className="h-8 w-8 bg-gray-200 rounded-lg"></div></div></td>
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

            {!isLoading && !isError && coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="table-cell-center py-12">
                  <p className="text-gray-500">No coupons found.</p>
                  {(debouncedSearch || filterStatus !== 'all') && (
                    <p className="mt-2 text-sm text-gray-400">Try adjusting your search or filters.</p>
                  )}
                </td>
              </tr>
            )}

            {!isLoading && !isError && coupons.map((c: ICoupon) => (
              <tr key={c._id} className="table-row">
                <td className="table-cell table-cell-text font-medium text-gray-900">{c.name}</td>
                <td className="table-cell table-cell-text font-mono text-xs">{c.code}</td>
                <td className="table-cell table-cell-text">{c.usedCount}</td>
                <td className="table-cell table-cell-text">{(c.branch as any)?.name || 'All'}</td>
                <td className="table-cell"><StatusBadge status={c.isActive} type="coupon-status" /></td>
                <td className="table-cell-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => navigate(`/coupons/${c._id}`)} className="text-green-600 hover:text-green-800 transition-colors"><HiOutlineEye size={20} /></button>
                    <button onClick={() => navigate(`/coupons/${c._id}/edit`)} className="text-blue-600 hover:text-blue-800 transition-colors"><HiOutlinePencil size={20} /></button>
                    <button onClick={() => handleDeleteClick(c._id, c.name)} className="text-red-600 hover:text-red-800 transition-colors"><HiOutlineTrash size={20} /></button>
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
            totalItems={pagination.totalCoupons}
            currentPageCount={coupons.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        onConfirm={handleDeleteConfirm} 
        title="Delete Coupon" 
        message={`Are you sure you want to delete coupon "${couponToDelete?.name}"? This action cannot be undone.`} 
        confirmText="Delete" 
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default CouponList;

