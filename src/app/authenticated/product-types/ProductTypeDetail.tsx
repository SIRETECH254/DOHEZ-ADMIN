import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetProductTypeById } from '../../../tanstack/useProductTypes';
import type { IService } from '../../../types/api.types';

const ProductTypeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: productTypeData, isLoading, isError, error } = useGetProductTypeById(id!);
  const productType = productTypeData?.productType;

  if (isLoading) return <div className="p-6 text-gray-500">Loading...</div>;
  
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'Failed to load product type';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <FiAlertTriangle className="text-brand-accent" size={64} />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500">{errorMessage}</p>
        <button onClick={() => navigate('/product-types')} className="btn-primary mt-4">Back to List</button>
      </div>
    );
  }

  if (!productType) return <div className="p-6 text-gray-500 text-center">Product type not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-3">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/product-types')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <HiOutlineArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{productType.name}</h1>
            <p className="text-sm text-gray-500">ID: {productType._id}</p>
          </div>
        </div>
        <button onClick={() => navigate(`/product-types/${id}/edit`)} className="btn-primary flex items-center gap-2">
          <HiOutlinePencil size={20} /> Edit Product Type
        </button>
      </header>

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          {productType.icon ? (
            <img src={productType.icon} alt={productType.name} className="h-48 w-48 rounded-3xl object-cover shadow-md" />
          ) : (
            <div className="h-48 w-48 rounded-3xl bg-brand-primary/5 flex items-center justify-center text-brand-primary text-4xl font-bold border border-brand-primary/10">
              {productType.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          
          <div className="space-y-6 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Service</h2>
                <p className="text-gray-900 font-medium">{(productType.service as IService)?.name || 'N/A'}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Order</h2>
                <p className="text-gray-900 font-medium">{productType.order}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Slug</h2>
                <p className="text-gray-900 font-medium">{productType.slug}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h2>
              <p className="text-gray-900 leading-relaxed text-sm">
                {productType.details || <span className="text-gray-400 italic">No description provided.</span>}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTypeDetail;
