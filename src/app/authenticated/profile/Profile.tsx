import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useGetProfile } from '../../../tanstack/useUsers';
import { 
  MdVerified, 
  MdOutlineChevronRight, 
  MdShoppingBag, 
  MdEvent, 
  MdConfirmationNumber, 
  MdLocalLaundryService, 
  MdLocationOn, 
  MdLock,
  MdEdit
} from 'react-icons/md';
import type { IRole } from '../../../types/api.types';

const ProfileSkeleton = () => {
  return (
    <div className=" p-6 animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="h-32 w-32 rounded-full bg-gray-200 shadow-md"></div>
        <div className="mt-6 h-8 w-48 bg-gray-200 rounded-lg"></div>
        <div className="mt-2 h-5 w-32 bg-gray-100 rounded-md"></div>
        
        <div className="mt-2 flex flex-col items-center gap-1">
          <div className="h-4 w-40 bg-gray-50 rounded"></div>
          <div className="h-4 w-32 bg-gray-50 rounded"></div>
        </div>
        
        <div className="mt-3 h-7 w-32 bg-gray-100 rounded-full"></div>
        <div className="mt-6 h-10 w-full max-w-[200px] bg-gray-100 rounded-xl border border-gray-200"></div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="mt-8 space-y-3">
        <div className="h-6 w-32 bg-gray-200 rounded-md ml-2"></div>
        
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-100"></div>
                <div className="h-5 w-32 bg-gray-100 rounded-md"></div>
              </div>
              <div className="h-6 w-6 bg-gray-50 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { data: profileData, isLoading } = useGetProfile();

  // Consolidate user data, preferring TanStack Query results
  // Note: profileData is { user: IUser } according to API docs
  const user = useMemo(() => profileData?.user || authUser, [profileData, authUser]);


  const fullName = useMemo(() => {
    if (!user) return 'User';
    return `${user.firstName} ${user.lastName}`;
  }, [user]);

  const roleDisplay = useMemo(() => {
    if (!user || !user.roles || user.roles.length === 0) return 'User';
    return user.roles.map((r: IRole) => r.displayName).join(', ');
  }, [user]);

  const handleAction = useCallback((action: string) => {
    console.log(`Action clicked: ${action}`);
    // Future implementation: navigation or modal
  }, []);

  const handleEditProfile = useCallback(() => {
    navigate('/profile/edit');
  }, [navigate]);

  if (isLoading && !user) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="alert alert-error">User profile not found.</div>
      </div>
    );
  }

  return (
    <div className=" p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start sm:gap-x-8 gap-y-4">
        
        <div className="relative">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={fullName} 
              className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="h-32 w-32 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-4xl font-bold border-4 border-white shadow-md">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
          )}
          {user.isVerified && (
            <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm">
              <MdVerified className="text-brand-secondary text-2xl" />
            </div>
          )}
        </div>
        
        <div className="space-y-3">

          <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>

          <p className="text-gray-500 font-medium">{roleDisplay}</p>
          
          <div className="flex flex-col items-center text-sm text-gray-500">
            <span>{user.email}</span>
            {user.phone && <span>{user.phone}</span>}
          </div>
          
          {user.isVerified ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
              <MdVerified size={16} />
              Verified Account
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold">
              Pending Verification
            </div>
          )}

          <button 
            onClick={handleEditProfile}
            className="btn-utility mt-6 w-full max-w-[200px] py-2.5 text-sm"
          >
            <MdEdit className="mr-2" size={18} />
            Edit Profile
          </button>

        </div>

      </div>

      {/* Quick Actions */}
      <div className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 ml-2">Quick Actions</h2>
        
        <div className="grid grid-cols-1 gap-3">
          {/* My Orders */}
          <button
            onClick={() => handleAction('orders')}
            className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-brand-primary/30 hover:shadow-md group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-50 text-gray-600 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                <MdShoppingBag size={24} />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                My Orders
              </span>
            </div>
            <MdOutlineChevronRight size={24} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
          </button>

          {/* My Appointments */}
          <button
            onClick={() => handleAction('appointments')}
            className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-brand-primary/30 hover:shadow-md group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-50 text-gray-600 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                <MdEvent size={24} />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                My Appointments
              </span>
            </div>
            <MdOutlineChevronRight size={24} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
          </button>

          {/* My Tickets */}
          <button
            onClick={() => handleAction('tickets')}
            className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-brand-primary/30 hover:shadow-md group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-50 text-gray-600 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                <MdConfirmationNumber size={24} />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                My Tickets
              </span>
            </div>
            <MdOutlineChevronRight size={24} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
          </button>

          {/* My Laundry */}
          <button
            onClick={() => handleAction('laundry')}
            className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-brand-primary/30 hover:shadow-md group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-50 text-gray-600 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                <MdLocalLaundryService size={24} />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                My Laundry
              </span>
            </div>
            <MdOutlineChevronRight size={24} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
          </button>

          {/* My Address */}
          <button
            onClick={() => handleAction('address')}
            className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-brand-primary/30 hover:shadow-md group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-50 text-gray-600 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                <MdLocationOn size={24} />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                My Address
              </span>
            </div>
            <MdOutlineChevronRight size={24} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
          </button>

          {/* Change Password */}
          <button
            onClick={() => navigate('/profile/change-password')}
            className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-brand-primary/30 hover:shadow-md group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-50 text-gray-600 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                <MdLock size={24} />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                Change Password
              </span>
            </div>
            <MdOutlineChevronRight size={24} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
