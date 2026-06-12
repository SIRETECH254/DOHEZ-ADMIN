import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineExclamation, 
  HiOutlineTicket, 
  HiOutlineCurrencyDollar, 
  HiOutlineCalendar, 
  HiOutlineUsers,
  HiOutlineFilter,
  HiOutlineOfficeBuilding,
  HiOutlineClipboardCheck,
  HiOutlinePencilAlt
} from 'react-icons/hi';
import {FiSearch} from "react-icons/fi"
import { useCreateCoupon } from '../../../tanstack/useCoupons';
import { useGetProducts } from '../../../tanstack/useProducts';
import { useGetProductCategories } from '../../../tanstack/useProductCategories';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useGetBranches } from '../../../tanstack/useBranches';
import type { IProduct, IProductCategory, IVendor, IBranch } from '../../../types/api.types';

const TABS = [
  { key: 'basic', label: 'Basic Info', step: 1 },
  { key: 'discount', label: 'Discount Rules', step: 2 },
  { key: 'limits', label: 'Usage Limits', step: 3 },
  { key: 'targets', label: 'Targets', step: 4 },
  { key: 'scope', label: 'Scope', step: 5 },
  { key: 'summary', label: 'Summary', step: 6 },
];

const CreateCoupon: React.FC = () => {
  const navigate = useNavigate();
  const createCoupon = useCreateCoupon();
  const [activeTab, setActiveTab] = useState('basic');
  const [currentStep, setCurrentStep] = useState(1);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minimumOrderAmount: 0,
    maximumDiscountAmount: 0,
    hasExpiry: false,
    expiryDate: '',
    hasUsageLimit: false,
    usageLimit: 0,
    isFirstTimeOnly: false,
    applicableProducts: [] as string[],
    excludedProducts: [] as string[],
    applicableCategories: [] as string[],
    excludedCategories: [] as string[],
    vendor: '',
    branch: ''
  });

  // Search states
  const [productSearch, setProductSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [branchSearch, setBranchSearch] = useState('');

  const { data: productsData } = useGetProducts({ search: productSearch, limit: 10 });
  const { data: categoriesData } = useGetProductCategories({ search: categorySearch, limit: 10 });
  const { data: vendorsData } = useGetVendors({ search: vendorSearch, limit: 10 });
  const { data: branchesData } = useGetBranches({ search: branchSearch, limit: 10 });

  const validateTabNavigation = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (!targetTab) return false;
    if (targetTab.step < currentStep) return true;
    
    if (currentStep === 1) return !!form.name;
    if (currentStep === 2) return form.discountValue > 0;
    
    return true;
  };

  const handleTabChange = (key: string) => {
    if (validateTabNavigation(key)) {
      setActiveTab(key);
      setCurrentStep(TABS.find(t => t.key === key)?.step || 1);
    }
  };

  const toggleItem = (list: string[], item: string) => {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  };

  const handleSubmit = useCallback(async () => {
    try {
      await createCoupon.mutateAsync(form);
      navigate('/coupons');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to create coupon');
    }
  }, [form, createCoupon, navigate]);

  const renderStepHeader = () => {
    const progress = (currentStep / TABS.length) * 100;
    
    return (
      <div className="bg-white border-b border-gray-100 space-y-4 p-4 rounded-t-3xl">
        <div className="flex flex-col sm:flex-row  items-start sm:items-center sm:justify-between gap-y-3">
          {/* current step & label */}
          <div className="flex flex-row items-center gap-x-2">
            <div className="h-6 w-6 rounded-full items-center justify-center bg-brand-primary text-white text-xs font-bold flex">
              {currentStep}
            </div>
            <span className="text-sm font-semibold text-brand-primary uppercase tracking-wider">
              {TABS.find(tab => tab.key === activeTab)?.label}
            </span>
          </div>
       
          {/* Step numbers and labels */}
          <div className="flex flex-row items-center gap-x-3 md:gap-x-5">
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              const isCompleted = currentStep > tab.step;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className="items-center flex flex-col"
                  disabled={!validateTabNavigation(tab.key)}
                  type="button"
                >
                  <div className="items-center flex flex-col">
                    {/* Step number circle */}
                    <div className={`h-7 w-7 rounded-full items-center justify-center flex transition-all ${
                      isActive 
                        ? 'bg-brand-primary ring-4 ring-brand-primary/20 shadow-lg' 
                        : isCompleted 
                          ? 'bg-brand-primary/40' 
                          : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <HiCheck className="w-5 h-5 text-white" />
                      ) : (
                        <span className={`text-sm font-bold ${
                          isActive ? 'text-white' : 'text-gray-400'
                        }`}>
                          {tab.step}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <label className="label">Coupon Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Summer Sale 2024" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" />
            </div>
            <div className="space-y-1">
              <label className="label">Details / Description</label>
              <textarea placeholder="Explain what this coupon is for..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input min-h-[120px]" />
            </div>
          </div>
        );
      case 'discount':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="label">Discount Type</label>
                <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value as any})} className="input">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="label">Discount Value ({form.discountType === 'percentage' ? '%' : 'KES'}) <span className="text-red-500">*</span></label>
                <input type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: Number(e.target.value)})} className="input" />
              </div>
              <div className="space-y-1">
                <label className="label">Minimum Order Amount (KES)</label>
                <input type="number" value={form.minimumOrderAmount} onChange={e => setForm({...form, minimumOrderAmount: Number(e.target.value)})} className="input" />
              </div>
              {form.discountType === 'percentage' && (
                <div className="space-y-1">
                  <label className="label">Maximum Discount Amount (KES)</label>
                  <input type="number" value={form.maximumDiscountAmount} onChange={e => setForm({...form, maximumDiscountAmount: Number(e.target.value)})} className="input" />
                </div>
              )}
            </div>
          </div>
        );
      case 'limits':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm"><HiOutlineCalendar className="text-brand-primary" size={20} /></div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Set Expiry Date</p>
                  <p className="text-xs text-gray-500">Automatically disable coupon after a specific date</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.hasExpiry} onChange={e => setForm({...form, hasExpiry: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-brand-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            {form.hasExpiry && (
              <div className="animate-slideDown">
                <label className="label">Expiry Date</label>
                <input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className="input" />
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm"><HiOutlineTicket className="text-brand-primary" size={20} /></div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Usage Limit</p>
                  <p className="text-xs text-gray-500">Limit how many times this coupon can be used overall</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.hasUsageLimit} onChange={e => setForm({...form, hasUsageLimit: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-brand-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            {form.hasUsageLimit && (
              <div className="animate-slideDown">
                <label className="label">Total Usage Limit</label>
                <input type="number" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: Number(e.target.value)})} className="input" placeholder="e.g. 100" />
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm"><HiOutlineUsers className="text-brand-primary" size={20} /></div>
                <div>
                  <p className="text-sm font-bold text-gray-900">First-Time Customers Only</p>
                  <p className="text-xs text-gray-500">Restrict this coupon to users who haven't placed an order yet</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.isFirstTimeOnly} onChange={e => setForm({...form, isFirstTimeOnly: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-brand-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        );
      case 'targets':
        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Products Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <HiOutlineTicket className="text-brand-primary" /> Products
              </h3>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="input pl-10" />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {productsData?.products.map((p: IProduct) => (
                  <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium">{p.name}</span>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => setForm({...form, applicableProducts: toggleItem(form.applicableProducts, p._id)})}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${form.applicableProducts.includes(p._id) ? 'bg-brand-primary text-white' : 'bg-white border text-gray-600 hover:bg-brand-primary/10'}`}
                      >
                        Applicable
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setForm({...form, excludedProducts: toggleItem(form.excludedProducts, p._id)})}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${form.excludedProducts.includes(p._id) ? 'bg-red-500 text-white' : 'bg-white border text-gray-600 hover:bg-red-50'}`}
                      >
                        Excluded
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories Selection */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <HiOutlineFilter className="text-brand-primary" /> Categories
              </h3>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search categories..." value={categorySearch} onChange={e => setCategorySearch(e.target.value)} className="input pl-10" />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {categoriesData?.categories.map((c: IProductCategory) => (
                  <div key={c._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium">{c.name}</span>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => setForm({...form, applicableCategories: toggleItem(form.applicableCategories, c._id)})}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${form.applicableCategories.includes(c._id) ? 'bg-brand-primary text-white' : 'bg-white border text-gray-600 hover:bg-brand-primary/10'}`}
                      >
                        Applicable
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setForm({...form, excludedCategories: toggleItem(form.excludedCategories, c._id)})}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${form.excludedCategories.includes(c._id) ? 'bg-red-500 text-white' : 'bg-white border text-gray-600 hover:bg-red-50'}`}
                      >
                        Excluded
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'scope':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <HiOutlineUsers className="text-brand-primary" /> Vendor Scope
              </h3>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search vendors..." value={vendorSearch} onChange={e => setVendorSearch(e.target.value)} className="input pl-10" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setForm({...form, vendor: ''})}
                  className={`p-3 text-sm rounded-xl border transition-all ${!form.vendor ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  All Vendors
                </button>
                {vendorsData?.vendors.map((v: IVendor) => (
                  <button 
                    key={v._id}
                    type="button"
                    onClick={() => setForm({...form, vendor: v._id})}
                    className={`p-3 text-sm rounded-xl border transition-all truncate ${form.vendor === v._id ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <HiOutlineOfficeBuilding className="text-brand-primary" /> Branch Scope
              </h3>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search branches..." value={branchSearch} onChange={e => setBranchSearch(e.target.value)} className="input pl-10" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setForm({...form, branch: ''})}
                  className={`p-3 text-sm rounded-xl border transition-all ${!form.branch ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  All Branches
                </button>
                {branchesData?.branches.map((b: IBranch) => (
                  <button 
                    key={b._id}
                    type="button"
                    onClick={() => setForm({...form, branch: b._id})}
                    className={`p-3 text-sm rounded-xl border transition-all truncate ${form.branch === b._id ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'summary':
        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Step 1: Basic Info */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineTicket size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Basic Information</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('basic')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-tight">Coupon Name</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{form.name || 'N/A'}</p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-tight">Description</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                    {form.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Discount Rules */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineCurrencyDollar size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Discount Rules</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('discount')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 ml-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Type</span>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{form.discountType}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Value</span>
                  <p className="text-sm font-bold text-brand-primary">
                    {form.discountType === 'percentage' ? `${form.discountValue}%` : `KES ${form.discountValue}`}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Min Order</span>
                  <p className="text-sm font-semibold text-gray-900">KES {form.minimumOrderAmount}</p>
                </div>
                {form.discountType === 'percentage' && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Max Discount</span>
                    <p className="text-sm font-semibold text-gray-900">{form.maximumDiscountAmount ? `KES ${form.maximumDiscountAmount}` : 'Unlimited'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Limits */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineCalendar size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Usage Limits</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('limits')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 ml-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Expiry</span>
                  <p className="text-sm font-semibold text-gray-900">{form.hasExpiry ? form.expiryDate : 'No Expiry'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Usage Limit</span>
                  <p className="text-sm font-semibold text-gray-900">{form.hasUsageLimit ? form.usageLimit : 'Unlimited'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Audience</span>
                  <p className="text-sm font-semibold text-gray-900">{form.isFirstTimeOnly ? 'First-Time Only' : 'All Customers'}</p>
                </div>
              </div>
            </div>

            {/* Step 4: Targets */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineFilter size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Targets</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('targets')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ml-2">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Products</span>
                  <p className="text-xs text-gray-600">
                    {form.applicableProducts.length > 0 ? `${form.applicableProducts.length} Applicable` : 'All'} | 
                    {form.excludedProducts.length > 0 ? ` ${form.excludedProducts.length} Excluded` : ' None Excluded'}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Categories</span>
                  <p className="text-xs text-gray-600">
                    {form.applicableCategories.length > 0 ? `${form.applicableCategories.length} Applicable` : 'All'} | 
                    {form.excludedCategories.length > 0 ? ` ${form.excludedCategories.length} Excluded` : ' None Excluded'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 5: Scope */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineOfficeBuilding size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Scope</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('scope')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 ml-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Vendor</span>
                  <p className="text-sm font-semibold text-gray-900">
                    {form.vendor ? vendorsData?.vendors.find((v: IVendor) => v._id === form.vendor)?.name : 'Global (All Vendors)'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Branch</span>
                  <p className="text-sm font-semibold text-gray-900">
                    {form.branch ? branchesData?.branches.find((b: IBranch) => b._id === form.branch)?.name : 'Global (All Branches)'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex items-start gap-3">
              <HiOutlineClipboardCheck className="text-brand-primary shrink-0 mt-0.5" size={20} />
              <p className="text-xs text-brand-primary/80 leading-relaxed">
                Please review all coupon details before confirming. You can go back to any step to make corrections.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate('/coupons')} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary group transition-colors">
        <MdArrowBack className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Coupons
      </button>
      
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create New Coupon</h1>
        <div className="text-sm font-medium text-gray-400">Step {currentStep} of {TABS.length}</div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {renderStepHeader()}
        
        <div className="p-6">
          <form className="space-y-6">
            {inlineError && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100 animate-shake">
                <HiOutlineExclamation className="shrink-0" />
                <span className="text-sm font-medium">{inlineError}</span>
              </div>
            )}
            
            {renderContent()}

            <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
              <button 
                type="button" 
                onClick={() => currentStep > 1 ? handleTabChange(TABS[currentStep - 2].key) : navigate('/coupons')} 
                className="btn-secondary px-8"
              >
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </button>
              
              {activeTab === 'summary' ? (
                <button 
                  type="button" 
                  onClick={handleSubmit} 
                  className="btn-primary px-12 shadow-lg shadow-brand-primary/20" 
                  disabled={createCoupon.isPending}
                >
                  {createCoupon.isPending ? 'Creating...' : 'Create Coupon'}
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={() => handleTabChange(TABS[currentStep].key)} 
                  className="btn-primary px-12 shadow-lg shadow-brand-primary/20"
                >
                  Continue
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCoupon;

