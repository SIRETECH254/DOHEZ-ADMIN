import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdRemove } from 'react-icons/md';
import { useGetProductVariantById, useUpdateProductVariant } from '../../../tanstack/useProductVariants';

const EditProductVariant: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: variantData, isLoading, isError, error } = useGetProductVariantById(id!);
  const variant = variantData;
  const updateProductVariant = useUpdateProductVariant();

  const [form, setForm] = useState({
    name: '',
    options: [{ name: '', price: 0 }],
  });
  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    if (variant) {
      setForm({
        name: variant.name || '',
        options: variant.options?.map((o: any) => ({ name: o.name, price: o.price })) || [{ name: '', price: 0 }],
      });
    }
  }, [variant]);

  const handleOptionChange = (index: number, field: string, value: string | number) => {
    const newOptions = [...form.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setForm({ ...form, options: newOptions });
  };

  const addOption = () => {
    setForm({ ...form, options: [...form.options, { name: '', price: 0 }] });
  };

  const removeOption = (index: number) => {
    setForm({ ...form, options: form.options.filter((_, i) => i !== index) });
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name || form.options.some(o => !o.name)) {
      setInlineError('Name and all options are required.');
      return;
    }

    try {
      await updateProductVariant.mutateAsync({ id: id!, data: form });
      navigate(`/product-variants/${id}`);
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to update variant');
    }
  }, [form, updateProductVariant, id, navigate]);

  if (isLoading) return <div className="p-6 text-gray-500">Loading variant data...</div>;
  if (isError) return <div className="p-6 text-red-500">Error: {(error as any)?.response?.data?.message || 'Failed to load variant'}</div>;
  if (!variant) return <div className="p-6 text-gray-500">Variant not found.</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate(`/product-variants/${id}`)} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors">
        <MdArrowBack className="mr-2" /> Back to Details
      </button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Variant: {variant.name}</h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {inlineError && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{inlineError}</div>}
          
          <div className="space-y-1">
              <label className="label">Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" required />
          </div>

          <div className="space-y-4">
            <label className="label">Options</label>
            {form.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                    <input type="text" value={option.name} onChange={(e) => handleOptionChange(index, 'name', e.target.value)} className="input" placeholder="Option Name" required />
                    <input type="number" value={option.price} onChange={(e) => handleOptionChange(index, 'price', Number(e.target.value))} className="input" placeholder="Price" required />
                    <button type="button" onClick={() => removeOption(index)} className="btn-secondary"><MdRemove/></button>
                </div>
            ))}
            <button type="button" onClick={addOption} className="btn-secondary">Add Option</button>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="submit" className="btn-primary flex-1" disabled={updateProductVariant.isPending}>{updateProductVariant.isPending ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" onClick={() => navigate(`/product-variants/${id}`)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductVariant;
