import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useGetUserById, useUpdateUser } from '../../../tanstack/useUsers';
import { useGetProducts } from '../../../tanstack/useProducts';
import { getInitials } from '../../../utils';
import type { IUser, IRole, IProduct } from '../../../types/api.types';
import StatusBadge from '../../../components/ui/StatusBadge';

// Edit page for modifying a specific user's information
export default function EditUser() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetUserById(userId!);
  const updateUser = useUpdateUser();

  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    phone: '', 
    isActive: true,
    workingHours: {
      monday: { start: '', end: '' },
      tuesday: { start: '', end: '' },
      wednesday: { start: '', end: '' },
      thursday: { start: '', end: '' },
      friday: { start: '', end: '' },
      saturday: { start: '', end: '' },
      sunday: { start: '', end: '' },
    },
    services: [] as string[]
  });

  useEffect(() => {
    if (data?.user) {
      // Normalize services to an array of IDs
      const initialServices = Array.isArray(data.user.services)
        ? data.user.services.map((s: string | IProduct) => (typeof s === 'string' ? s : s._id))
        : [];

      setForm({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        phone: data.user.phone || '',
        isActive: data.user.isActive,
        workingHours: data.user.workingHours || {
          monday: { start: '', end: '' },
          tuesday: { start: '', end: '' },
          wednesday: { start: '', end: '' },
          thursday: { start: '', end: '' },
          friday: { start: '', end: '' },
          saturday: { start: '', end: '' },
          sunday: { start: '', end: '' },
        },
        services: initialServices,
      });
    }
  }, [data]);

  const user: IUser | undefined = data?.user;
  const isStaff = user && (user.roles as IRole[]).some((r: IRole) => r.name === 'staff');

  // Fetch products for service selection
  const { data: productData } = useGetProducts(
    isStaff && user?.vendor && user?.branch 
      ? { vendor: typeof user.vendor === 'string' ? user.vendor : user.vendor._id, 
          branch: typeof user.branch === 'string' ? user.branch : user.branch._id } 
      : {}
  );
  const products: IProduct[] = productData?.products || [];

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is staff and prepare payload
    const isStaffUser = user && (user.roles as IRole[]).some((r: IRole) => r.name === 'staff');
    const payload: any = { ...form };
    
    if (!isStaffUser) {
      delete payload.workingHours;
      delete payload.services;
    }

    updateUser.mutate({ userId: userId!, data: payload }, {
      onSuccess: () => navigate('/users')
    });
  }, [form, userId, updateUser, navigate, user]);

  if (isLoading) return <div className="p-6">Loading user...</div>;
  if (!user) return <div className="p-6">User not found.</div>;

  const handleServiceToggle = (serviceId: string) => {
    setForm(prev => {
      const services = prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId];
      return { ...prev, services };
    });
  };

  return (
    <div className="p-6">
      <button onClick={() => navigate('/users')} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary">
        <MdArrowBack className="mr-2" /> Back to Users
      </button>
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>
      
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
        {/* Read-only Avatar/Initials & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={`${user.firstName} ${user.lastName}`} 
                className="h-20 w-20 rounded-full object-cover border border-gray-200" 
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-2xl font-bold border border-brand-primary/20">
                {getInitials(user)}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">{user.firstName} {user.lastName}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Roles:</span>
                {(user.roles as IRole[]).map((role: IRole) => (
                  <StatusBadge 
                    key={role._id} 
                    status={role.displayName || role.name} 
                    type="user-role" 
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Status:</span>
                <StatusBadge 
                  status={user.isActive ? 'ACTIVE' : 'INACTIVE'} 
                  type="user-status" 
                />
               </div>
               
               {/* Display Vendor/Branch names if available */}
               <div className="text-sm text-gray-600 space-y-1 mt-2">
                 {user?.vendor && (
                   <p><span className="font-medium text-gray-500">Vendor:</span> {typeof user.vendor === 'object' ? user.vendor.name : 'Loaded'}</p>
                 )}
                 {user?.branch && (
                   <p><span className="font-medium text-gray-500">Branch:</span> {typeof user.branch === 'object' ? user.branch.name : 'Loaded'}</p>
                 )}
               </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name Input */}
            <div className="space-y-1">
              <label className="label">First Name</label>
              <input name="firstName" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} className="input" placeholder="First Name" />
            </div>
            {/* Last Name Input */}
            <div className="space-y-1">
              <label className="label">Last Name</label>
              <input name="lastName" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} className="input" placeholder="Last Name" />
            </div>
          </div>
          
          {/* Read Only Email Input */}
          <div className="space-y-1">
            <label className="label">Email (Read Only)</label>
            <input name="email" value={user.email} className="input-disabled" readOnly />
          </div>

          {/* Phone Input */}
          <div className="space-y-1">
            <label className="label">Phone</label>
            <input name="phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input" placeholder="Phone" />
          </div>

          {/* Account Status Toggle */}
          <div className="space-y-1">
            <label className="label">Account Status</label>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.isActive} 
                  onChange={(e) => setForm({...form, isActive: e.target.checked})} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                <span className="ml-3 text-sm text-gray-700 font-medium">
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>

          {/* Working Hours Section for Staff */}
          {isStaff && (
            <div className="space-y-3 mt-6 border-t pt-6">
              <h3 className="text-md font-semibold text-gray-900">Working Hours</h3>
              {Object.entries(form.workingHours).map(([day, hours]) => (
                <div key={day} className="grid grid-cols-3 gap-4 items-center">
                  <span className="capitalize text-sm text-gray-600 font-medium">{day}</span>
                  <input 
                    type="time" 
                    value={hours.start}
                    onChange={(e) => setForm({
                      ...form, 
                      workingHours: { ...form.workingHours, [day]: { ...hours, start: e.target.value } }
                    })}
                    className="input" 
                  />
                  <input 
                    type="time" 
                    value={hours.end}
                    onChange={(e) => setForm({
                      ...form, 
                      workingHours: { ...form.workingHours, [day]: { ...hours, end: e.target.value } }
                    })}
                    className="input" 
                  />
                </div>
              ))}
            </div>
          )}

          {/* Staff Services Section */}
          {isStaff && (
            <div className="space-y-3 mt-6 border-t pt-6">
              <h3 className="text-md font-semibold text-gray-900">Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {products.map((product) => (
                  <label key={product._id} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={form.services.includes(product._id)}
                      onChange={() => handleServiceToggle(product._id)}
                      className="auth-checkbox"
                    />
                    <span className="text-sm text-gray-700">{product.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <button type="submit" className="btn-primary" disabled={updateUser.isPending}>
            {updateUser.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
