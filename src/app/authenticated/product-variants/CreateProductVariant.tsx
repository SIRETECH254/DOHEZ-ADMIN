import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdRemove } from 'react-icons/md';
import { useCreateProductVariant } from '../../../tanstack/useProductVariants';

const CreateProductVariant: React.FC = () => {
  const navigate = useNavigate();
  const createProductVariant = useCreateProductVariant();

  const [form, setForm] = useState({
    name: '',
    options: [{ name: '', price: 0 }],
  });
  const [inlineError, setInlineError] = useState<string | null>(null);

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
      await createProductVariant.mutateAsync(form);
      navigate('/product-variants');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to create variant');
    }
  }, [form, createProductVariant, navigate]);

  return (
    <div className="p-6">
      <button onClick={() => navigate('/product-variants')} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors">
        <MdArrowBack className="mr-2" /> Back to Product Variants
      </button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Product Variant</h1>
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
            <button type="submit" className="btn-primary flex-1" disabled={createProductVariant.isPending}>{createProductVariant.isPending ? 'Creating...' : 'Create'}</button>
            <button type="button" onClick={() => navigate('/product-variants')} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductVariant;
