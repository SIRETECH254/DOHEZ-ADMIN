import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetProducts, useDeleteProduct } from '../../../tanstack/useProducts';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IProduct } from '../../../types/api.types';
import { getInitials } from '../../../utils';

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const params = useMemo(() => {
    const apiParams: any = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch.trim() || undefined,
    };
    if (filterStatus !== 'all') {
      apiParams.status = filterStatus === 'active';
    }
    return apiParams;
  }, [debouncedSearch, filterStatus, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetProducts(params);
  const deleteProduct = useDeleteProduct();

  const products = data?.products || [];
  const pagination = data?.pagination ?? { currentPage: 1, totalPages: 1, totalProducts: 0 };
  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred';

  const handleDeleteClick = useCallback((id: string, name: string) => {
    setItemToDelete({ id, name });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteProduct.mutateAsync(itemToDelete.id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Delete product error:', err);
    }
  }, [itemToDelete, deleteProduct]);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all products</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="input-search"
              />
            </div>
          </div>
          <Link to="/products/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span>Add Product</span>
            <MdAdd size={24}/>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Showing {pagination.totalProducts} products</p>
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

      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Name</th>
              <th className="table-header-cell">Price</th>
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
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                    <td className="table-cell"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
                    <td className="table-cell text-right"><div className="h-8 w-24 bg-gray-200 rounded ml-auto"></div></td>
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

            {!isLoading && !isError && products.length === 0 && (
              <tr>
                <td colSpan={4} className="table-cell-center py-12">
                  <p className="text-gray-500">No products found.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && products.map((product: IProduct) => (
              <tr key={product._id} className="table-row">
                <td className="table-cell font-medium text-gray-900 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {product.images?.[0] ? (
                      <img src={product.images[0].url} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary text-sm font-bold border border-brand-primary/20">
                        {getInitials({ firstName: product.name, lastName: '' })}
                      </div>
                    )}
                    <span>{product.name}</span>
                  </div>
                </td>
                <td className="table-cell">
                    <div className="font-medium text-gray-900">
                        ${product.offerPrice ? product.offerPrice.toFixed(2) : product.price.toFixed(2)}
                    </div>
                    {product.offerPrice && (
                        <div className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</div>
                    )}
                </td>
                <td className="table-cell">
                    <StatusBadge status={product.status ? 'ACTIVE' : 'INACTIVE'} type="product-status" />
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => navigate(`/products/${product._id}`)} className="text-green-600"><HiOutlineEye size={20} /></button>
                    <button onClick={() => navigate(`/products/${product._id}/edit`)} className="text-blue-600"><HiOutlinePencil size={20} /></button>
                    <button onClick={() => handleDeleteClick(product._id, product.name)} className="text-red-600"><HiOutlineTrash size={20} /></button>
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
            currentPageCount={products.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${itemToDelete?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteProduct.isPending}
      />
    </div>
  );
};

export default ProductList;
