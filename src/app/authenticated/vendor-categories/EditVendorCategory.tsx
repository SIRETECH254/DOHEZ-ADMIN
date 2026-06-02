import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { useGetVendorCategoryById, useUpdateVendorCategory } from '../../../tanstack/useVendorCategories';
import { useGetVendorTypes } from '../../../tanstack/useVendorTypes';
import type { IVendorType } from '../../../types/api.types';

const EditVendorCategory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: categoryData, isLoading, isError, error } = useGetVendorCategoryById(id!);
  const category = categoryData?.category;
  const updateCategory = useUpdateVendorCategory();
  const { data: vendorTypesData, isLoading: isLoadingTypes } = useGetVendorTypes({ all: true });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    vendorType: '',
    isActive: true,
  });
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const vendorTypes = vendorTypesData?.vendorTypes || [];

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        description: category.description || '',
        vendorType: typeof category.vendorType === 'string' ? category.vendorType : category.vendorType?._id || '',
        isActive: category.isActive,
      });
      setPreviewUrl(category.image || null);
    }
  }, [category]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setImage(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(category?.image || null);
    }
  };

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name || !form.vendorType) {
      setInlineError('Category name and vendor type are required.');
      return;
    }

    let payload: FormData | any;

    if (image) {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('vendorType', form.vendorType);
      formData.append('isActive', String(form.isActive));
      formData.append('image', image);
      payload = formData;
    } else {
      payload = form;
    }

    try {
      await updateCategory.mutateAsync({ id: id!, data: payload });
      navigate(`/vendor-categories/${id}`);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update category';
      setInlineError(errorMessage);
    }
  }, [form, image, updateCategory, id, navigate]);

  if (isLoading) return <div className="p-6 text-gray-500">Loading category data...</div>;
  if (isError) return <div className="p-6 text-red-500">Error: {(error as any)?.response?.data?.message || 'Failed to load category'}</div>;
  if (!category) return <div className="p-6 text-gray-500">Category not found.</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate(`/vendor-categories/${id}`)} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors">
        <MdArrowBack className="mr-2" /> Back to Category Details
      </button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Category: {category.name}</h1>
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
                  alt="Category Preview" 
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md group-hover:opacity-75 transition-opacity"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-4xl font-bold border-4 border-white shadow-md group-hover:opacity-75 transition-opacity">
                  {form.name ? form.name.substring(0, 2).toUpperCase() : 'CT'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="label">Category Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" required />
            </div>

            <div className="space-y-1">
              <label className="label">Vendor Type <span className="text-red-500">*</span></label>
              <select 
                value={form.vendorType} 
                onChange={(e) => setForm({...form, vendorType: e.target.value})} 
                className="input"
                required
                disabled={isLoadingTypes}
              >
                <option value="">Select a vendor type</option>
                {vendorTypes.map((type: IVendorType) => (
                  <option key={type._id} value={type._id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input min-h-[100px] py-3" />
          </div>

          <div className="space-y-1">
            <label className="label">Status</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
              <span className="ml-3 text-sm text-gray-700 font-medium">{form.isActive ? 'Active' : 'Inactive'}</span>
            </label>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="submit" className="btn-primary flex-1" disabled={updateCategory.isPending}>{updateCategory.isPending ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" onClick={() => navigate(`/vendor-categories/${id}`)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVendorCategory;
