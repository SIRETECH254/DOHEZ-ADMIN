import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useCreatePackaging } from '../../../tanstack/usePackaging';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useGetBranches } from '../../../tanstack/useBranches';
import type { IVendor, IBranch } from '../../../types/api.types';

const CreatePackaging: React.FC = () => {
  const navigate = useNavigate();
  const createPackaging = useCreatePackaging();
  
  // State for fetching vendors and branches
  const { data: vendorsData, isLoading: isLoadingVendors } = useGetVendors({ limit: 100 });
  const vendors = vendorsData?.vendors || [];

  const [form, setForm] = useState({
    name: '',
    price: 0,
    isDefault: false,
    isActive: true,
    vendor: '',
    branch: '',
  });

  const { data: branchesData, isLoading: isLoadingBranches } = useGetBranches({ 
    vendorId: form.vendor,
  });
  const branches = branchesData?.branches || [];

  const [inlineError, setInlineError] = useState<string | null>(null);

  // Reset branch when vendor changes
  useEffect(() => {
    if (form.vendor) {
      setForm(prev => ({ ...prev, branch: '' }));
    }
  }, [form.vendor]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name || form.price < 0 || !form.vendor || !form.branch) {
      setInlineError('All fields including Vendor and Branch are required.');
      return;
    }

    try {
      await createPackaging.mutateAsync(form);
      navigate('/packaging');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to create packaging');
    }
  }, [form, createPackaging, navigate]);

  return (
    <div className="p-6">
      <button 
        onClick={() => navigate('/packaging')} 
        className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors"
      >
        <MdArrowBack className="mr-2" /> Back to Packaging
      </button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Packaging</h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {inlineError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {inlineError}
            </div>
          )}

          <div className="space-y-1">
            <label className="label">Packaging Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={form.name} 
              onChange={(e) => setForm({...form, name: e.target.value})} 
              className="input" 
              placeholder="e.g. Standard Box" 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="label">Vendor <span className="text-red-500">*</span></label>
              <select 
                value={form.vendor} 
                onChange={(e) => setForm({...form, vendor: e.target.value})} 
                className="input"
                required
                disabled={isLoadingVendors}
              >
                <option value="">Select Vendor</option>
                {vendors.map((v: IVendor) => (
                  <option key={v._id} value={v._id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="label">Branch <span className="text-red-500">*</span></label>
              <select 
                value={form.branch} 
                onChange={(e) => setForm({...form, branch: e.target.value})} 
                className="input"
                required
                disabled={!form.vendor || isLoadingBranches}
              >
                <option value="">Select Branch</option>
                {branches.map((b: IBranch) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="label">Price ($) <span className="text-red-500">*</span></label>
            <input 
              type="number" 
              value={form.price} 
              onChange={(e) => setForm({...form, price: Number(e.target.value)})} 
              className="input" 
              placeholder="0.00" 
              min="0"
              step="0.01"
              required 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="label">Set as Default</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.isDefault} 
                  onChange={(e) => setForm({...form, isDefault: e.target.checked})} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                <span className="ml-3 text-sm text-gray-700 font-medium">{form.isDefault ? 'Default' : 'Optional'}</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="label">Status</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.isActive} 
                  onChange={(e) => setForm({...form, isActive: e.target.checked})} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                <span className="ml-3 text-sm text-gray-700 font-medium">{form.isActive ? 'Active' : 'Inactive'}</span>
              </label>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="submit" 
              className="btn-primary flex-1" 
              disabled={createPackaging.isPending}
            >
              {createPackaging.isPending ? 'Creating...' : 'Create Packaging'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/packaging')} 
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePackaging;
