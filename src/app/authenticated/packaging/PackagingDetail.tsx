import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle, FiPackage, FiDollarSign, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useGetPackagingById } from '../../../tanstack/usePackaging';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IVendor, IBranch } from '../../../types/api.types';

/**
 * Skeleton component for PackagingDetail loading state
 */
const PackagingDetailSkeleton = () => (
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
        <div className="h-48 w-48 rounded-3xl bg-gray-200"></div>
        <div className="space-y-4 flex-1">
          <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-20 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const PackagingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: packagingData, isLoading, isError, error } = useGetPackagingById(id!);

  const packaging = packagingData?.packaging

  if (isLoading) return <PackagingDetailSkeleton />;
  
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'Failed to load packaging';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <FiAlertTriangle className="text-brand-accent" size={64} />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500 max-w-md">{errorMessage}</p>
        <button onClick={() => navigate('/packaging')} className="btn-primary mt-4">Back to Packaging</button>
      </div>
    );
  }

  if (!packaging) return <div className="p-6 text-gray-500 text-center">Packaging not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex sm:items-center flex-col sm:flex-row sm:justify-between gap-y-3">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/packaging')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <HiOutlineArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{packaging.name}</h1>
            <p className="text-sm text-gray-500">ID: {packaging._id}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/packaging/${id}/edit`)}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePencil size={20} />
          Edit Packaging
        </button>
      </header>

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="h-48 w-48 rounded-3xl bg-brand-primary/5 flex items-center justify-center text-brand-primary text-5xl font-bold border border-brand-primary/10">
            <FiPackage />
          </div>
          
          <div className="space-y-6 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FiDollarSign /> Price
                </h2>
                <p className="text-2xl font-bold text-gray-900">${packaging.price.toFixed(2)}</p>
              </div>

              <div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</h2>
                <StatusBadge status={packaging.isActive ? 'ACTIVE' : 'INACTIVE'} type="packaging-status" />
              </div>

              <div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FiCheckCircle /> Type
                </h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${packaging.isDefault ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {packaging.isDefault ? 'DEFAULT PACKAGING' : 'OPTIONAL PACKAGING'}
                </span>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Vendor Information</h2>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    {typeof packaging.vendor === 'object' ? (packaging.vendor as IVendor).name : 'Vendor Details Unavailable'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Associated Vendor</p>
                </div>
              </div>

              <div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Branch Information</h2>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    {typeof packaging.branch === 'object' ? (packaging.branch as IBranch).name : 'Branch Details Unavailable'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Associated Branch</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100 flex items-center gap-2 text-gray-500">
              <FiClock size={16} />
              <span className="text-xs font-medium">Created on {new Date(packaging.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagingDetail;
