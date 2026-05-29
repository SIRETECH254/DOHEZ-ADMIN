import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetRoleById } from '../../../tanstack/useRoles';
import StatusBadge from '../../../components/ui/StatusBadge';

/**
 * Skeleton component for RoleDetail loading state
 */
const RoleDetailSkeleton = () => (
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

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-6">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-20 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
        </div>
      </div>
      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-6">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-8 w-32 bg-gray-200 rounded-full"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-8 w-32 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

const RoleDetail: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { data: role, isLoading, isError, error } = useGetRoleById(roleId!);

  if (isLoading) return <RoleDetailSkeleton />;
  
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'Failed to load role';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <FiAlertTriangle className="text-brand-accent" size={64} />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500 max-w-md">{errorMessage}</p>
        <button 
          onClick={() => navigate('/roles')}
          className="btn-primary mt-4"
        >
          Back to Roles
        </button>
      </div>
    );
  }

  if (!role) return <div className="p-6 text-gray-500">Role not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-3">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/roles')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <HiOutlineArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{role.displayName}</h1>
            <p className="text-sm text-gray-500">System Name: <code className="bg-gray-100 px-1 rounded">{role.name}</code></p>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/roles/${roleId}/edit`)}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePencil size={20} />
          Edit Role
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h2>
              <p className="text-gray-900 leading-relaxed">
                {role.description || <span className="text-gray-400 italic">No description provided.</span>}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Permissions</h2>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission: string) => (
                  <span 
                    key={permission} 
                    className="px-3 py-1 bg-brand-primary/5 text-brand-primary border border-brand-primary/10 rounded-full text-sm font-medium"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status & Meta */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Status</h2>
              <StatusBadge status={role.isActive ? 'ACTIVE' : 'INACTIVE'} type="user-status" />
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Type</h2>
              <div className="flex items-center gap-2">
                <StatusBadge status={role.isSystemRole} type="system-role" />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created At</span>
                <span className="text-gray-900 font-medium">{new Date(role.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-900 font-medium">{new Date(role.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetail;
