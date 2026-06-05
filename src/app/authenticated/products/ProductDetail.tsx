import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetProductById } from '../../../tanstack/useProducts';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IProductCategory, IVariant } from '../../../types/api.types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: productData, isLoading, isError, error } = useGetProductById(id!);
  const product = (productData as any)?.product;

  if (isLoading) return <div className="p-6 text-gray-500">Loading...</div>;
  
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'Failed to load product';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <FiAlertTriangle className="text-brand-accent" size={64} />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500">{errorMessage}</p>
        <button onClick={() => navigate('/products')} className="btn-primary mt-4">Back to List</button>
      </div>
    );
  }

  if (!product) return <div className="p-6 text-gray-500 text-center">Product not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-3">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/products')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <HiOutlineArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500">ID: {product._id}</p>
          </div>
        </div>
        <button onClick={() => navigate(`/products/${id}/edit`)} className="btn-primary flex items-center gap-2">
          <HiOutlinePencil size={20} /> Edit Product
        </button>
      </header>

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="grid grid-cols-2 gap-2">
              {product.images?.map((img: any, i: number) => <img key={i} src={img.url} className="h-24 w-24 object-cover rounded-lg" alt={product.name} />)}
          </div>
          
          <div className="space-y-6 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Category</h2>
                <p className="text-gray-900 font-medium">{(product.category as IProductCategory)?.name || 'N/A'}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Price</h2>
                <p className="text-gray-900 font-medium">${product.price.toFixed(2)}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Status</h2>
                <StatusBadge status={product.status ? 'ACTIVE' : 'INACTIVE'} type="product-status" />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Details</h2>
              <p className="text-gray-900 leading-relaxed text-sm">
                {product.details || 'No details provided.'}
              </p>
            </div>
            
            <div className="pt-6 border-t border-gray-100">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Variants</h2>
              <div className="flex flex-wrap gap-2">
                  {(product.variants as IVariant[])?.map((v: IVariant) => <StatusBadge key={v._id} status={v.name} type="product-status" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
