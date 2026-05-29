import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useGetRoleById, useUpdateRole } from '../../../tanstack/useRoles';
import type { UpdateRolePayload } from '../../../types/api.types';

const EditRole: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { data: role, isLoading, isError, error } = useGetRoleById(roleId!);
  const updateRole = useUpdateRole();

  const [form, setForm] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: '',
    isActive: true,
  });

  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      setForm({
        name: role.name || '',
        displayName: role.displayName || '',
        description: role.description || '',
        permissions: role.permissions ? role.permissions.join(', ') : '',
        isActive: role.isActive,
      });
    }
  }, [role]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name || !form.displayName || !form.permissions) {
      setInlineError('Please fill in all required fields (Name, Display Name, and Permissions).');
      return;
    }

    const payload: UpdateRolePayload = {
      name: form.name.trim(),
      displayName: form.displayName.trim(),
      description: form.description.trim(),
      permissions: form.permissions.split(',').map(p => p.trim()).filter(p => p !== ''),
      isActive: form.isActive,
    };

    try {
      await updateRole.mutateAsync({ roleId: roleId!, roleData: payload });
      navigate(`/roles/${roleId}`);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update role';
      setInlineError(errorMessage);
    }
  }, [form, updateRole, roleId, navigate]);

  if (isLoading) return <div className="p-6 text-gray-500">Loading role data...</div>;
  if (isError) return <div className="p-6 text-red-500">Error: {(error as any)?.response?.data?.message || 'Failed to load role'}</div>;
  if (!role) return <div className="p-6 text-gray-500">Role not found.</div>;

  return (
    <div className="p-6">
      <button 
        onClick={() => navigate(`/roles/${roleId}`)} 
        className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors"
      >
        <MdArrowBack className="mr-2" /> Back to Role Details
      </button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Role: {role.displayName}</h1>
        <p className="text-sm text-gray-500 mt-1">Update system role details and permissions</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 ">
        <form onSubmit={handleSubmit} className="space-y-6">
          {inlineError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {inlineError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Display Name Input */}
            <div className="space-y-1">
              <label className="label">Display Name <span className="text-red-500">*</span></label>
              <input 
                type="text"
                value={form.displayName} 
                onChange={(e) => setForm({...form, displayName: e.target.value})} 
                className="input" 
                placeholder="e.g. Content Manager" 
                required
              />
            </div>

            {/* Internal Name (Slug) Input */}
            <div className="space-y-1">
              <label className="label">Internal Name <span className="text-red-500">*</span></label>
              <input 
                type="text"
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})} 
                className="input" 
                placeholder="e.g. content_manager" 
                required
                disabled={role.isSystemRole}
              />
              <p className="text-[10px] text-gray-400">
                {role.isSystemRole ? 'System names cannot be changed.' : 'Used by the system. Lowercase, underscores allowed.'}
              </p>
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-1">
            <label className="label">Description</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({...form, description: e.target.value})} 
              className="input min-h-[100px] py-3" 
              placeholder="Briefly describe the purpose of this role..."
            />
          </div>

          {/* Permissions Input */}
          <div className="space-y-1">
            <label className="label">Permissions <span className="text-red-500">*</span></label>
            <textarea 
              value={form.permissions} 
              onChange={(e) => setForm({...form, permissions: e.target.value})} 
              className="input min-h-[100px] py-3" 
              placeholder="e.g. view_users, edit_users, delete_users (comma separated)"
              required
            />
            <p className="text-[10px] text-gray-400">Enter permissions separated by commas.</p>
          </div>

          {/* Active Status Toggle */}
          <div className="space-y-1">
            <label className="label">Role Status</label>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.isActive} 
                  onChange={(e) => setForm({...form, isActive: e.target.checked})} 
                  className="sr-only peer"
                  disabled={role.isSystemRole && role.name === 'super_admin'}
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary ${role.isSystemRole && role.name === 'super_admin' ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                <span className="ml-3 text-sm text-gray-700 font-medium">
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
            {role.isSystemRole && role.name === 'super_admin' && (
              <p className="text-[10px] text-orange-500">Super Admin role must remain active.</p>
            )}
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button 
              type="submit" 
              className="btn-primary flex-1" 
              disabled={updateRole.isPending}
            >
              {updateRole.isPending ? 'Updating Role...' : 'Update Role'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate(`/roles/${roleId}`)}
              className="btn-secondary flex-1"
              disabled={updateRole.isPending}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRole;
