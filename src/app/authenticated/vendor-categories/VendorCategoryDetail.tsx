import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetVendorCategoryById } from '../../../tanstack/useVendorCategories';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IVendorType } from '../../../types/api.types';

const VendorCategoryDetailSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
    </header>

    <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="h-32 w-32 rounded-3xl bg-gray-200"></div>
        <div className="space-y-4 flex-1">
          <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-20 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const VendorCategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: categoryData, isLoading, isError, error } = useGetVendorCategoryById(id!);
  const category = categoryData?.category;

  if (isLoading) return <VendorCategoryDetailSkeleton />;
  
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'Failed to load category';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <FiAlertTriangle className="text-brand-accent" size={64} />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500 max-md">{errorMessage}</p>
        <button onClick={() => navigate('/vendor-categories')} className="btn-primary mt-4">Back to Categories</button>
      </div>
    );
  }

  if (!category) return <div className="p-6 text-gray-500 text-center">Category not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex sm:items-center flex-col sm:flex-row sm:justify-between gap-y-3">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/vendor-categories')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <HiOutlineArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-sm text-gray-500">ID: {category._id}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/vendor-categories/${id}/edit`)}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePencil size={20} />
          Edit Category
        </button>
      </header>

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          {category.image ? (
            <img src={category.image} alt={category.name} className="h-48 w-48 rounded-3xl object-cover shadow-md" />
          ) : (
            <div className="h-48 w-48 rounded-3xl bg-brand-primary/5 flex items-center justify-center text-brand-primary text-4xl font-bold border border-brand-primary/10">
              {category.name ? category.name.substring(0, 2).toUpperCase() : 'CT'}
            </div>
          )}
          
          <div className="space-y-6 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Vendor Type</h2>
                <p className="text-gray-900 font-medium">
                  {typeof category.vendorType === 'object' && category.vendorType !== null 
                    ? (category.vendorType as IVendorType).name 
                    : 'Vendor Type Unavailable'}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Status</h2>
                <StatusBadge status={category.isActive} type="vendor-category-status" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Slug</h2>
                <p className="text-gray-900 font-medium">{category.slug}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h2>
              <p className="text-gray-900 leading-relaxed text-sm">
                {category.description || <span className="text-gray-400 italic">No description provided.</span>}
              </p>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Created At</h2>
              <p className="text-gray-900 text-sm">
                {new Date(category.createdAt).toLocaleDateString(undefined, { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCategoryDetail;
