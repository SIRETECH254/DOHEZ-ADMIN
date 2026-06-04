import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetProductModifierById } from '../../../tanstack/useProductModifiers';

const ProductModifierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: modifier, isLoading, isError, error } = useGetProductModifierById(id!);

  if (isLoading) return <div className="p-6 text-gray-500">Loading...</div>;
  
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'Failed to load product modifier';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <FiAlertTriangle className="text-brand-accent" size={64} />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500">{errorMessage}</p>
        <button onClick={() => navigate('/product-modifiers')} className="btn-primary mt-4">Back to List</button>
      </div>
    );
  }

  if (!modifier) return <div className="p-6 text-gray-500 text-center">Modifier not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-3">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/product-modifiers')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <HiOutlineArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{modifier.name}</h1>
            <p className="text-sm text-gray-500">ID: {modifier._id}</p>
          </div>
        </div>
        <button onClick={() => navigate(`/product-modifiers/${id}/edit`)} className="btn-primary flex items-center gap-2">
          <HiOutlinePencil size={20} /> Edit Modifier
        </button>
      </header>

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Required</h2>
            <p className="text-gray-900 font-medium">{modifier.required ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Min Selection</h2>
            <p className="text-gray-900 font-medium">{modifier.minSelection}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Max Selection</h2>
            <p className="text-gray-900 font-medium">{modifier.maxSelection}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Options</h2>
          <div className="space-y-2">
            {modifier.options?.map((option: any, index: number) => (
                <div key={index} className="flex justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-900">{option.name}</span>
                    <span className="text-gray-600">${option.price.toFixed(2)}</span>
                </div>
            )) || <p className="text-gray-500">No options defined.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModifierDetail;
