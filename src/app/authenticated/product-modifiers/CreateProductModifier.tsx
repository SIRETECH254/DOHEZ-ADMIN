import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdRemove } from 'react-icons/md';
import { useCreateProductModifier } from '../../../tanstack/useProductModifiers';

const CreateProductModifier: React.FC = () => {
  const navigate = useNavigate();
  const createProductModifier = useCreateProductModifier();

  const [form, setForm] = useState({
    name: '',
    required: false,
    minSelection: 0,
    maxSelection: 1,
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
      await createProductModifier.mutateAsync(form);
      navigate('/product-modifiers');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to create modifier');
    }
  }, [form, createProductModifier, navigate]);

  return (
    <div className="p-6">
      <button onClick={() => navigate('/product-modifiers')} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors">
        <MdArrowBack className="mr-2" /> Back to Modifiers
      </button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Modifier</h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {inlineError && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{inlineError}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="label">Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" required />
            </div>
            <div className="space-y-1">
              <label className="label">Required</label>
              <input type="checkbox" checked={form.required} onChange={(e) => setForm({...form, required: e.target.checked})} />
            </div>
            <div className="space-y-1">
              <label className="label">Min Selection</label>
              <input type="number" value={form.minSelection} onChange={(e) => setForm({...form, minSelection: Number(e.target.value)})} className="input" />
            </div>
            <div className="space-y-1">
              <label className="label">Max Selection</label>
              <input type="number" value={form.maxSelection} onChange={(e) => setForm({...form, maxSelection: Number(e.target.value)})} className="input" />
            </div>
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
            <button type="submit" className="btn-primary flex-1" disabled={createProductModifier.isPending}>{createProductModifier.isPending ? 'Creating...' : 'Create'}</button>
            <button type="button" onClick={() => navigate('/product-modifiers')} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModifier;
