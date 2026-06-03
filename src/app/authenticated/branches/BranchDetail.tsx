import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { MdLocationOn } from 'react-icons/md';
import { useGetBranchById } from '../../../tanstack/useBranches';
import type { IVendor } from '../../../types/api.types';

/**
 * Skeleton component for BranchDetail loading state
 */
const BranchDetailSkeleton = () => (
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
        <div className="h-32 w-32 rounded-full bg-gray-200"></div>
        <div className="space-y-4 flex-1">
          <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-20 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const BranchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: branchData, isLoading, isError, error } = useGetBranchById(id!);
  const branch = branchData?.branch;

  if (isLoading) return <BranchDetailSkeleton />;
  
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'Failed to load branch';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <FiAlertTriangle className="text-brand-accent" size={64} />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500 max-md">{errorMessage}</p>
        <button onClick={() => navigate('/branches')} className="btn-primary mt-4">Back to Branches</button>
      </div>
    );
  }

  if (!branch) return <div className="p-6 text-gray-500 text-center">Branch not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex sm:items-center flex-col sm:flex-row sm:justify-between gap-y-3">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/branches')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <HiOutlineArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{branch.name}</h1>
            <p className="text-sm text-gray-500">ID: {branch._id}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/branches/${id}/edit`)}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePencil size={20} />
          Edit Branch
        </button>
      </header>

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          {branch.cover ? (
            <img src={branch.cover} alt={branch.name} className="h-48 w-48 rounded-3xl object-cover shadow-md" />
          ) : (
            <div className="h-48 w-48 rounded-3xl bg-brand-primary/5 flex items-center justify-center text-brand-primary text-4xl font-bold border border-brand-primary/10">
              <MdLocationOn size={48} />
            </div>
          )}
          
          <div className="space-y-6 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Vendor</h2>
                <p className="text-gray-900 font-medium">
                  {typeof branch.vendorId === 'object' && branch.vendorId !== null 
                    ? (branch.vendorId as IVendor).name 
                    : 'Vendor Name Unavailable'}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Email</h2>
                <p className="text-gray-900 font-medium">{branch.email}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Phone</h2>
                <p className="text-gray-900 font-medium">{branch.phone}</p>
              </div>
              <div className="sm:col-span-2">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Address</h2>
                <p className="text-gray-900 font-medium">{branch.location?.address || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDetail;
