import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useCreateRole } from '../../../tanstack/useRoles';
import type { CreateRolePayload } from '../../../types/api.types';

const CreateRole: React.FC = () => {
  const navigate = useNavigate();
  const createRole = useCreateRole();

  const [form, setForm] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: '',
    isActive: true,
  });

  const [inlineError, setInlineError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name || !form.displayName || !form.permissions) {
      setInlineError('Please fill in all required fields (Name, Display Name, and Permissions).');
      return;
    }

    const payload: CreateRolePayload = {
      name: form.name.trim(),
      displayName: form.displayName.trim(),
      description: form.description.trim(),
      permissions: form.permissions.split(',').map(p => p.trim()).filter(p => p !== ''),
      isActive: form.isActive,
    };

    try {
      await createRole.mutateAsync(payload);
      navigate('/roles');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to create role';
      setInlineError(errorMessage);
    }
  }, [form, createRole, navigate]);

  return (
    <div className="p-6">
      <button 
        onClick={() => navigate('/roles')} 
        className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors"
      >
        <MdArrowBack className="mr-2" /> Back to Roles
      </button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Role</h1>
        <p className="text-sm text-gray-500 mt-1">Define a new system role and its permissions</p>
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
              />
              <p className="text-[10px] text-gray-400">Used by the system. Lowercase, underscores allowed.</p>
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
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                <span className="ml-3 text-sm text-gray-700 font-medium">
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button 
              type="submit" 
              className="btn-primary flex-1" 
              disabled={createRole.isPending}
            >
              {createRole.isPending ? 'Creating Role...' : 'Create Role'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/roles')}
              className="btn-secondary flex-1"
              disabled={createRole.isPending}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRole;
