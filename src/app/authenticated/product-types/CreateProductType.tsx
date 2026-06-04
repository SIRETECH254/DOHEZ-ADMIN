import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { useCreateProductType } from '../../../tanstack/useProductTypes';
import { useGetServices } from '../../../tanstack/useServices';
import type { IService } from '../../../types/api.types';

const CreateProductType: React.FC = () => {
  const navigate = useNavigate();
  const createProductType = useCreateProductType();
  const { data: servicesData, isLoading: isLoadingServices } = useGetServices({ all: true });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    service: '',
    order: 0,
  });
  const [icon, setIcon] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const services = servicesData?.services || [];

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setIcon(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name || !form.service) {
      setInlineError('Name and Service are required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('details', form.description.trim());
    formData.append('service', form.service);
    formData.append('order', String(form.order));
    if (icon) {
      formData.append('icon', icon);
    }

    try {
      await createProductType.mutateAsync(formData);
      navigate('/product-types');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to create product type');
    }
  }, [form, icon, createProductType, navigate]);

  return (
    <div className="p-6">
      <button onClick={() => navigate('/product-types')} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors">
        <MdArrowBack className="mr-2" /> Back to Product Types
      </button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Product Type</h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {inlineError && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{inlineError}</div>}
          
          <div className="flex flex-col items-center mb-8">
            <div onClick={triggerFileInput} className="relative group cursor-pointer">
              <input type="file" ref={fileInputRef} onChange={handleIconChange} accept="image/*" className="hidden" />
              {previewUrl ? (
                <img src={previewUrl} alt="Icon Preview" className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md group-hover:opacity-75 transition-opacity" />
              ) : (
                <div className="h-32 w-32 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-4xl font-bold border-4 border-white shadow-md group-hover:opacity-75 transition-opacity">
                  {form.name ? form.name.substring(0, 2).toUpperCase() : 'PT'}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/40 rounded-full p-2"><MdCameraAlt className="text-white text-2xl" /></div>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 font-medium">Click to change icon</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="label">Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" required />
            </div>
            <div className="space-y-1">
              <label className="label">Service <span className="text-red-500">*</span></label>
              <select value={form.service} onChange={(e) => setForm({...form, service: e.target.value})} className="input" required disabled={isLoadingServices}>
                <option value="">Select a service</option>
                {services.map((s: IService) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="label">Order</label>
              <input type="number" value={form.order} onChange={(e) => setForm({...form, order: Number(e.target.value)})} className="input" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input min-h-[100px] py-3" />
          </div>

          <div className="pt-4 flex gap-4">
            <button type="submit" className="btn-primary flex-1" disabled={createProductType.isPending}>{createProductType.isPending ? 'Creating...' : 'Create'}</button>
            <button type="button" onClick={() => navigate('/product-types')} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductType;
