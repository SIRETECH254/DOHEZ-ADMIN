import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { useGetProductCategoryById, useUpdateProductCategory } from '../../../tanstack/useProductCategories';
import { useGetProductTypes } from '../../../tanstack/useProductTypes';
import type { IProductType } from '../../../types/api.types';

const EditProductCategory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: categoryData, isLoading, isError, error } = useGetProductCategoryById(id!);
  const category = categoryData?.category;
  const updateProductCategory = useUpdateProductCategory();
  const { data: productTypesData, isLoading: isLoadingTypes } = useGetProductTypes({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    details: '',
    productType: '',
    sort: 0,
  });
  const [icon, setIcon] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const productTypes = productTypesData?.productTypes || [];

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        details: category.details || '',
        productType: typeof category.productType === 'string' ? category.productType : (category.productType as IProductType)?._id || '',
        sort: category.sort || 0,
      });
      setPreviewUrl(category.icon || null);
    }
  }, [category]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setIcon(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(category?.icon || null);
    }
  };

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name || !form.productType) {
      setInlineError('Name and Product Type are required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('details', form.details.trim());
    formData.append('productType', form.productType);
    formData.append('sort', String(form.sort));
    if (icon) {
      formData.append('icon', icon);
    }

    try {
      await updateProductCategory.mutateAsync({ id: id!, data: formData });
      navigate(`/product-categories/${id}`);
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to update product category');
    }
  }, [form, icon, updateProductCategory, id, navigate]);

  if (isLoading) return <div className="p-6 text-gray-500">Loading product category data...</div>;
  if (isError) return <div className="p-6 text-red-500">Error: {(error as any)?.response?.data?.message || 'Failed to load product category'}</div>;
  if (!category) return <div className="p-6 text-gray-500">Product category not found.</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate(`/product-categories/${id}`)} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors">
        <MdArrowBack className="mr-2" /> Back to Details
      </button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product Category: {category.name}</h1>
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
                  {form.name ? form.name.substring(0, 2).toUpperCase() : 'PC'}
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
              <label className="label">Product Type <span className="text-red-500">*</span></label>
              <select value={form.productType} onChange={(e) => setForm({...form, productType: e.target.value})} className="input" required disabled={isLoadingTypes}>
                <option value="">Select a product type</option>
                {productTypes.map((pt: IProductType) => <option key={pt._id} value={pt._id}>{pt.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="label">Sort Order</label>
              <input type="number" value={form.sort} onChange={(e) => setForm({...form, sort: Number(e.target.value)})} className="input" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="label">Details</label>
            <textarea value={form.details} onChange={(e) => setForm({...form, details: e.target.value})} className="input min-h-[100px] py-3" />
          </div>

          <div className="pt-4 flex gap-4">
            <button type="submit" className="btn-primary flex-1" disabled={updateProductCategory.isPending}>{updateProductCategory.isPending ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" onClick={() => navigate(`/product-categories/${id}`)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductCategory;
