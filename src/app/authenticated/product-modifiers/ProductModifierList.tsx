import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetProductModifiers, useDeleteProductModifier } from '../../../tanstack/useProductModifiers';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IProductModifier } from '../../../types/api.types';
import { getInitials } from '../../../utils';

const ProductModifierList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError, error } = useGetProductModifiers();
  const deleteProductModifier = useDeleteProductModifier();

  // Assuming data structure { modifiers: [...] } based on patterns
  const allModifiers = (data as any)?.modifiers || (Array.isArray(data) ? data : []);
  const filteredModifiers = useMemo(() => {
    return allModifiers.filter((m: any) => m.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
  }, [allModifiers, debouncedSearch]);

  const paginatedModifiers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredModifiers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredModifiers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredModifiers.length / itemsPerPage);
  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred';

  const handleDeleteClick = useCallback((id: string, name: string) => {
    setItemToDelete({ id, name });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteProductModifier.mutateAsync(itemToDelete.id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Delete product modifier error:', err);
    }
  }, [itemToDelete, deleteProductModifier]);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Product Modifiers</h1>
          <p className="mt-1 text-sm text-gray-500">Manage modifiers for products</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search modifiers..."
                className="input-search"
              />
            </div>
          </div>
          <Link to="/product-modifiers/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span>Add Modifier</span>
            <MdAdd size={24}/>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Showing {filteredModifiers.length} modifiers</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
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

      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Name</th>
              <th className="table-header-cell">Required</th>
              <th className="table-header-cell">Options Count</th>
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
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                    <td className="table-cell"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
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

            {!isLoading && !isError && paginatedModifiers.length === 0 && (
              <tr>
                <td colSpan={4} className="table-cell-center py-12">
                  <p className="text-gray-500">No modifiers found.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && paginatedModifiers.map((modifier: IProductModifier) => (
              <tr key={modifier._id} className="table-row">
                <td className="table-cell font-medium text-gray-900 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-sm font-bold border border-brand-primary/20">
                      {getInitials({ firstName: modifier.name, lastName: '' })}
                    </div>
                    <span>{modifier.name}</span>
                  </div>
                </td>
                <td className="table-cell">{modifier.required ? 'Yes' : 'No'}</td>
                <td className="table-cell">{modifier.options.length}</td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => navigate(`/product-modifiers/${modifier._id}`)} className="text-green-600"><HiOutlineEye size={20} /></button>
                    <button onClick={() => navigate(`/product-modifiers/${modifier._id}/edit`)} className="text-blue-600"><HiOutlinePencil size={20} /></button>
                    <button onClick={() => handleDeleteClick(modifier._id, modifier.name)} className="text-red-600"><HiOutlineTrash size={20} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError && totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredModifiers.length}
            currentPageCount={paginatedModifiers.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Modifier"
        message={`Are you sure you want to delete "${itemToDelete?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteProductModifier.isPending}
      />
    </div>
  );
};

export default ProductModifierList;
