import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdVerified } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetUserById } from '../../../tanstack/useUsers';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IUser, IRole, IProduct } from '../../../types/api.types';
import { getInitials } from '../../../utils';

/**
 * Skeleton component for UserDetail loading state
 */
const UserDetailSkeleton = () => (
  <div className="p-6 animate-pulse">
    <div className="flex items-center gap-4 mb-8">
      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
      <div className="h-8 w-48 bg-gray-200 rounded"></div>
    </div>
    
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="h-32 w-32 rounded-full bg-gray-200 shadow-md"></div>
        <div className="space-y-4 flex-1">
          <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
          <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-24 w-full bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-24 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// Detail page for viewing a specific user's information
export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetUserById(userId!);

  if (isLoading) return <UserDetailSkeleton />;

  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred fetching user details';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <FiAlertTriangle className="text-brand-accent" size={64} />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500 max-w-md">{errorMessage}</p>
        <button 
          onClick={() => navigate('/users')}
          className="btn-primary mt-4"
        >
          Back to Users
        </button>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-gray-500">User not found.</p>
        <button onClick={() => navigate('/users')} className="btn-utility mt-4">
          Back to Users
        </button>
      </div>
    );
  }

  const user: IUser = data.user;
  const initials = getInitials(user);
  const isStaff = (user.roles as IRole[]).some((r: IRole) => r.name === 'staff');

  return (
    <div className="p-6">
      {/* Header section with back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/users')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <MdArrowBack size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
        </div>

        <button 
          onClick={() => navigate(`/users/${user._id}/edit`)}
          className="btn-primary py-2 px-6 text-sm w-full sm:w-auto"
        >
          Edit User
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
        {/* Identity Section */}
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          <div className="relative">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={`${user.firstName} ${user.lastName}`} 
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-4xl font-bold border-4 border-white shadow-md">
                {initials}
              </div>
            )}
            {user.isVerified && (
              <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm">
                <MdVerified className="text-brand-secondary text-2xl" />
              </div>
            )}
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} type="user-status" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Roles:</span>
                  <div className="flex flex-wrap gap-1">
                    {(user.roles as IRole[]).map((role: IRole) => (
                      <StatusBadge 
                        key={role._id} 
                        status={role.displayName || role.name} 
                        type="user-role" 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1  gap-6 pt-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</p>
                <p className="text-gray-700 font-medium">{user.phone || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Member Since</p>
                <p className="text-gray-700 font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Login</p>
                <p className="text-gray-700 font-medium">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor & Branch Section */}
        {(user?.vendor || user?.branch) && (
          <div className="pt-8 border-t border-gray-50">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Work Association</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {user.vendor && (
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Vendor</p>
                  <p className="text-lg font-bold text-brand-primary">
                    {typeof user.vendor === 'object' ? user.vendor.name : 'Vendor ID: ' + user.vendor}
                  </p>
                </div>
              )}
              {user.branch && (
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Branch</p>
                  <p className="text-lg font-bold text-brand-secondary">
                    {typeof user.branch === 'object' ? user.branch.name : 'Branch ID: ' + user.branch}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Staff Specific Data */}
        {isStaff && (
          <>
            {/* Working Hours */}
            <div className="pt-8 border-t border-gray-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {user.workingHours && Object.entries(user.workingHours).map(([day, hours]: [string, any]) => (
                  <div key={day} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <span className="capitalize text-sm font-semibold text-gray-600">{day}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {hours.start && hours.end ? `${hours.start} - ${hours.end}` : <span className="text-gray-400">Off</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="pt-8 border-t border-gray-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Assigned Services</h3>
              <div className="flex flex-wrap gap-3">
                {user.services && user.services.length > 0 ? (
                  (user.services as (string | IProduct)[]).map((service: string | IProduct) => {
                    const serviceName = typeof service === 'object' ? service.name : service;
                    const serviceId = typeof service === 'object' ? service._id : service;
                    return (
                      <div key={serviceId} className="px-4 py-2 bg-brand-primary/5 text-brand-primary border border-brand-primary/20 rounded-full text-sm font-semibold">
                        {serviceName}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 italic">No services assigned.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
