import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { useCreateVendorType } from '../../../tanstack/useVendorTypes';

const CreateVendorType: React.FC = () => {
  const navigate = useNavigate();
  const createVendorType = useCreateVendorType();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setImage(file);
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

    if (!form.name) {
      setInlineError('Vendor type name is required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('description', form.description.trim());
    formData.append('isActive', String(form.isActive));
    if (image) {
      formData.append('image', image);
    }

    try {
      await createVendorType.mutateAsync(formData);
      navigate('/vendor-types');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to create vendor type';
      setInlineError(errorMessage);
    }
  }, [form, image, createVendorType, navigate]);

  return (
    <div className="p-6">
      <button onClick={() => navigate('/vendor-types')} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors">
        <MdArrowBack className="mr-2" /> Back to Vendor Types
      </button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Vendor Type</h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 ">
        <form onSubmit={handleSubmit} className="space-y-6">
          {inlineError && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{inlineError}</div>}
          
          <div className="flex flex-col items-center mb-8">
            <div 
              onClick={triggerFileInput}
              className="relative group cursor-pointer"
            >
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Vendor Type Preview" 
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md group-hover:opacity-75 transition-opacity"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-4xl font-bold border-4 border-white shadow-md group-hover:opacity-75 transition-opacity">
                  {form.name ? form.name.substring(0, 2).toUpperCase() : 'VT'}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/40 rounded-full p-2">
                  <MdCameraAlt className="text-white text-2xl" />
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 font-medium">Click to change photo</p>
          </div>

          <div className="space-y-1">
            <label className="label">Vendor Type Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={form.name} 
              onChange={(e) => setForm({...form, name: e.target.value})} 
              className="input" 
              placeholder="e.g. Product Vendor" 
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="label">Description</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({...form, description: e.target.value})} 
              className="input min-h-[100px] py-3" 
              placeholder="Describe the vendor type..." 
            />
          </div>

          <div className="space-y-1">
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

          <div className="pt-4 flex gap-4">
            <button 
              type="submit" 
              className="btn-primary flex-1" 
              disabled={createVendorType.isPending}
            >
              {createVendorType.isPending ? 'Creating...' : 'Create Vendor Type'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/vendor-types')} 
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

export default CreateVendorType;
