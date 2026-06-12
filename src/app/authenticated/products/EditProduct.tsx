import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt, MdStore, MdMiscellaneousServices } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineClipboardCheck, 
  HiOutlinePencilAlt,
  HiOutlineSearch,
  HiOutlineExclamation,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineDuplicate,
  HiOutlineAdjustments,
  HiOutlineTrash,
  HiOutlinePhotograph
} from 'react-icons/hi';
import { useGetProductById, useUpdateProduct } from '../../../tanstack/useProducts';
import { useGetProductCategories } from '../../../tanstack/useProductCategories';
import { useGetProductVariants } from '../../../tanstack/useProductVariants';
import { useGetProductModifiers } from '../../../tanstack/useProductModifiers';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useGetBranches } from '../../../tanstack/useBranches';
import { useGetServices } from '../../../tanstack/useServices';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IProductCategory, IVariant, IProductModifier, IVendor, IBranch, IService, IProduct } from '../../../types/api.types';

const TABS = [
  { key: 'vendor', label: 'Vendor & Branch', step: 1 },
  { key: 'service', label: 'Service', step: 2 },
  { key: 'basic', label: 'Basic Info', step: 3 },
  { key: 'category', label: 'Category', step: 4 },
  { key: 'price', label: 'Prices & Status', step: 5 },
  { key: 'variants', label: 'Variants', step: 6 },
  { key: 'modifiers', label: 'Modifiers', step: 7 },
  { key: 'images', label: 'Images', step: 8 },
  { key: 'summary', label: 'Summary', step: 9 },
];

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: productData, isLoading: isProductLoading } = useGetProductById(id!);
  const product = (productData as any)?.product as IProduct;
  const updateProduct = useUpdateProduct();
  
  const [activeTab, setActiveTab] = useState('vendor');
  const [currentStep, setCurrentStep] = useState(1);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const [form, setForm] = useState({
    vendor: '',
    branch: '',
    service: '',
    name: '',
    details: '',
    category: '',
    price: 0,
    offerPrice: 0,
    status: true,
    variants: [] as string[],
    modifiers: [] as string[],
    selectedVariantOptions: [] as { variantId: string; optionId: string }[],
    selectedModifierOptions: [] as { modifierId: string; optionId: string }[],
    images: [] as File[],
  });

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setImages] = useState<{ url: string; publicId: string }[]>([]);

  // Vendor search state
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [debouncedVendorSearchQuery, setDebouncedVendorSearchQuery] = useState('');
  const { data: vendorsData, isLoading: isSearchingVendors } = useGetVendors({
    search: debouncedVendorSearchQuery,
  });

  // Branch fetch state (dependent on vendor)
  const { data: branchesData, isLoading: isLoadingBranches } = useGetBranches({
    vendorId: form.vendor,
  });

  // Service search state
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [debouncedServiceSearchQuery, setDebouncedServiceSearchQuery] = useState('');
  const { data: servicesData, isLoading: isSearchingServices } = useGetServices({
    search: debouncedServiceSearchQuery,
  });

  // Category search state
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [debouncedCategorySearchQuery, setDebouncedCategorySearchQuery] = useState('');
  const { data: categoriesData, isLoading: isSearchingCategories } = useGetProductCategories({
    search: debouncedCategorySearchQuery,
  });

  const { data: variantsData } = useGetProductVariants({});
  const { data: modifiersData } = useGetProductModifiers();

  useEffect(() => {
    if (product) {
      const selectedVariantOptions = product.selectedVariantOptions?.flatMap((sv: any) => 
        (sv.optionIds || []).map((optionId: string) => ({
          variantId: typeof sv.variantId === 'string' ? sv.variantId : (sv.variantId as any)?._id,
          optionId: optionId
        }))
      ) || [];

      const selectedModifierOptions = product.selectedModifierOptions?.flatMap((sm: any) => 
        (sm.optionIds || []).map((optionId: string) => ({
          modifierId: typeof sm.modifierId === 'string' ? sm.modifierId : (sm.modifierId as any)?._id,
          optionId: optionId
        }))
      ) || [];

      const variants = Array.from(new Set(selectedVariantOptions.map(so => so.variantId)));
      const modifiers = Array.from(new Set(selectedModifierOptions.map(so => so.modifierId)));

      setForm({
        vendor: typeof product.vendor === 'string' ? product.vendor : (product.vendor as any)?._id || '',
        branch: typeof product.branch === 'string' ? product.branch : (product.branch as any)?._id || '',
        service: typeof product.service === 'string' ? product.service : (product.service as any)?._id || '',
        name: product.name || '',
        details: product.details || '',
        category: typeof product.category === 'string' ? product.category : (product.category as IProductCategory)?._id || '',
        price: product.price || 0,
        offerPrice: product.offerPrice || 0,
        status: product.status,
        variants,
        modifiers,
        selectedVariantOptions,
        selectedModifierOptions,
        images: [],
      });
      setImages(product.images || []);
    }
  }, [product]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVendorSearchQuery(vendorSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [vendorSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedServiceSearchQuery(serviceSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [serviceSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCategorySearchQuery(categorySearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [categorySearchQuery]);

  const vendors = (vendorsData as any)?.vendors || [];
  const branches = (branchesData as any)?.branches || [];
  const services = (servicesData as any)?.services || [];
  const categories = (categoriesData as any)?.categories || [];
  const variants = (variantsData as any)?.variants || [];
  const modifiers = (modifiersData as any)?.modifiers || [];

  const toggleVariantOption = (variantId: string, optionId: string) => {
    setForm(prev => {
      const isSelected = prev.selectedVariantOptions.some(
        so => so.variantId === variantId && so.optionId === optionId
      );
      
      let nextSelectedOptions;
      if (isSelected) {
        nextSelectedOptions = prev.selectedVariantOptions.filter(
          so => !(so.variantId === variantId && so.optionId === optionId)
        );
      } else {
        nextSelectedOptions = [...prev.selectedVariantOptions, { variantId, optionId }];
      }

      const hasOptionsSelected = nextSelectedOptions.some(so => so.variantId === variantId);
      let nextVariants = prev.variants;
      if (hasOptionsSelected && !prev.variants.includes(variantId)) {
        nextVariants = [...prev.variants, variantId];
      } else if (!hasOptionsSelected && prev.variants.includes(variantId)) {
        nextVariants = prev.variants.filter(id => id !== variantId);
      }

      return {
        ...prev,
        selectedVariantOptions: nextSelectedOptions,
        variants: nextVariants
      };
    });
  };

  const toggleModifierOption = (modifierId: string, optionId: string) => {
    setForm(prev => {
      const isSelected = prev.selectedModifierOptions.some(
        so => so.modifierId === modifierId && so.optionId === optionId
      );
      
      let nextSelectedOptions;
      if (isSelected) {
        nextSelectedOptions = prev.selectedModifierOptions.filter(
          so => !(so.modifierId === modifierId && so.optionId === optionId)
        );
      } else {
        nextSelectedOptions = [...prev.selectedModifierOptions, { modifierId, optionId }];
      }

      const hasOptionsSelected = nextSelectedOptions.some(so => so.modifierId === modifierId);
      let nextModifiers = prev.modifiers;
      if (hasOptionsSelected && !prev.modifiers.includes(modifierId)) {
        nextModifiers = [...prev.modifiers, modifierId];
      } else if (!hasOptionsSelected && prev.modifiers.includes(modifierId)) {
        nextModifiers = prev.modifiers.filter(id => id !== modifierId);
      }

      return {
        ...prev,
        selectedModifierOptions: nextSelectedOptions,
        modifiers: nextModifiers
      };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setForm(prev => ({ ...prev, images: [...prev.images, ...files] }));
      const newUrls = files.map(f => URL.createObjectURL(f));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateTabNavigation = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (!targetTab) return false;
    if (targetTab.step < currentStep) return true;
    
    if (currentStep === 1) return !!form.vendor && !!form.branch;
    if (currentStep === 2) return !!form.service;
    if (currentStep === 3) return !!form.name;
    if (currentStep === 4) return !!form.category;
    
    return true;
  };

  const handleTabChange = (key: string) => {
    if (validateTabNavigation(key)) {
      setActiveTab(key);
      setCurrentStep(TABS.find(t => t.key === key)?.step || 1);
    }
  };

  const goToNextStep = () => {
    const currentIndex = TABS.findIndex(t => t.key === activeTab);
    if (currentIndex < TABS.length - 1) {
      const nextTab = TABS[currentIndex + 1];
      if (validateTabNavigation(nextTab.key)) {
        setActiveTab(nextTab.key);
        setCurrentStep(nextTab.step);
        setInlineError(null);
      } else {
        setInlineError('Please fill in required fields to continue.');
      }
    }
  };

  const goToPrevStep = () => {
    const currentIndex = TABS.findIndex(t => t.key === activeTab);
    if (currentIndex > 0) {
      const prevTab = TABS[currentIndex - 1];
      setActiveTab(prevTab.key);
      setCurrentStep(prevTab.step);
      setInlineError(null);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (activeTab !== 'summary') return;
    setInlineError(null);

    const groupedVariantOptions = form.variants.map(vId => ({
      variantId: vId,
      optionIds: form.selectedVariantOptions
        .filter(so => so.variantId === vId)
        .map(so => so.optionId)
    })).filter(group => group.optionIds.length > 0);

    const groupedModifierOptions = form.modifiers.map(mId => ({
      modifierId: mId,
      optionIds: form.selectedModifierOptions
        .filter(so => so.modifierId === mId)
        .map(so => so.optionId)
    })).filter(group => group.optionIds.length > 0);

    const formData = new FormData();
    formData.append('vendor', form.vendor);
    formData.append('branch', form.branch);
    formData.append('service', form.service);
    formData.append('name', form.name);
    formData.append('details', form.details);
    formData.append('category', form.category);
    formData.append('price', String(form.price));
    formData.append('offerPrice', String(form.offerPrice));
    formData.append('status', String(form.status));
    formData.append('variants', JSON.stringify(form.variants));
    formData.append('modifiers', JSON.stringify(form.modifiers));
    formData.append('selectedVariantOptions', JSON.stringify(groupedVariantOptions));
    formData.append('selectedModifierOptions', JSON.stringify(groupedModifierOptions));
    formData.append('existingImages', JSON.stringify(existingImages));
    form.images.forEach(image => formData.append('images', image));

    try {
      await updateProduct.mutateAsync({ productId: id!, data: formData });
      navigate(`/products/${id}`);
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to update product');
    }
  }, [form, updateProduct, id, navigate, activeTab, existingImages]);

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
    const selectedVendor = vendors.find((v: IVendor) => v._id === form.vendor) || (product?.vendor && typeof product.vendor !== 'string' ? (product.vendor as IVendor) : null);
    const selectedBranch = branches.find((b: IBranch) => b._id === form.branch) || (product?.branch && typeof product.branch !== 'string' ? (product.branch as IBranch) : null);
    const selectedService = services.find((s: IService) => s._id === form.service) || (product?.service && typeof product.service !== 'string' ? (product.service as IService) : null);
    const selectedCategory = categories.find((c: IProductCategory) => c._id === form.category) || (product?.category && typeof product.category !== 'string' ? (product.category as IProductCategory) : null);

    switch (activeTab) {
      case 'vendor':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="label">Search Vendor <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" value={vendorSearchQuery} onChange={e => setVendorSearchQuery(e.target.value)} className="input pr-10" placeholder="Type to search vendor..." />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isSearchingVendors ? <div className="animate-spin h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full" /> : <HiOutlineSearch className="text-gray-400" />}
                  </div>
                </div>
              </div>

              {selectedVendor && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Selected Vendor</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-brand-primary bg-brand-primary/5 flex items-center gap-4 animate-fadeIn">
                    <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold">{selectedVendor.name[0]}</div>
                    <span className="font-bold text-gray-900">{selectedVendor.name}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendors.map((v: IVendor) => (
                  <button key={v._id} type="button" onClick={() => setForm({...form, vendor: v._id, branch: ''})} className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${form.vendor === v._id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'}`}>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${form.vendor === v._id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-brand-primary'}`}>{v.name[0]}</div>
                    <span className="font-semibold text-gray-900 truncate">{v.name}</span>
                  </button>
                ))}
              </div>

              {form.vendor && (
                <div className="pt-6 border-t border-gray-100 space-y-4 animate-fadeIn">
                  <label className="label">Select Branch <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isLoadingBranches ? (
                      [...Array(2)].map((_, i) => (
                        <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
                      ))
                    ) : (
                      branches.map((b: IBranch) => (
                        <button key={b._id} type="button" onClick={() => setForm({...form, branch: b._id})} className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${form.branch === b._id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'}`}>
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${form.branch === b._id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-brand-primary'}`}>{b.name[0]}</div>
                          <span className="font-semibold text-gray-900 truncate">{b.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'service':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="label">Search Service <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" value={serviceSearchQuery} onChange={e => setServiceSearchQuery(e.target.value)} className="input pr-10" placeholder="Type to search service..." />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isSearchingServices ? <div className="animate-spin h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full" /> : <HiOutlineSearch className="text-gray-400" />}
                  </div>
                </div>
              </div>

              {selectedService && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Selected Service</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-brand-primary bg-brand-primary/5 flex items-center gap-4 animate-fadeIn">
                    <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold">{selectedService.name[0]}</div>
                    <span className="font-bold text-gray-900">{selectedService.name}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((s: IService) => (
                  <button key={s._id} type="button" onClick={() => setForm({...form, service: s._id})} className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${form.service === s._id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'}`}>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${form.service === s._id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-brand-primary'}`}>{s.name[0]}</div>
                    <span className="font-semibold text-gray-900 truncate">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'basic':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="label">Product Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" placeholder="Enter product name" required />
              </div>
              <div className="space-y-1">
                <label className="label">Details</label>
                <textarea value={form.details} onChange={e => setForm({...form, details: e.target.value})} className="input min-h-[120px] py-3" placeholder="Enter product details..." />
              </div>
            </div>
          </div>
        );
      case 'category':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="label">Search Category <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" value={categorySearchQuery} onChange={e => setCategorySearchQuery(e.target.value)} className="input pr-10" placeholder="Type to search category..." />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isSearchingCategories ? <div className="animate-spin h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full" /> : <HiOutlineSearch className="text-gray-400" />}
                  </div>
                </div>
              </div>

              {selectedCategory && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Selected Category</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-brand-primary bg-brand-primary/5 flex items-center gap-4 animate-fadeIn">
                    <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold">{selectedCategory.name[0]}</div>
                    <span className="font-bold text-gray-900">{selectedCategory.name}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((c: IProductCategory) => (
                  <button key={c._id} type="button" onClick={() => setForm({...form, category: c._id})} className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${form.category === c._id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'}`}>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${form.category === c._id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-brand-primary'}`}>{c.name[0]}</div>
                    <span className="font-semibold text-gray-900 truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'price':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="label">Price ($) <span className="text-red-500">*</span></label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="input" placeholder="0.00" required />
              </div>
              <div className="space-y-1">
                <label className="label">Offer Price ($)</label>
                <input type="number" value={form.offerPrice} onChange={e => setForm({...form, offerPrice: Number(e.target.value)})} className="input" placeholder="0.00" />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
                <label className="label">Status</label>
                <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{form.status ? 'Active' : 'Inactive'}</p>
                        <p className="text-xs text-gray-500">Show or hide this product from customers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={form.status} onChange={e => setForm({...form, status: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                </div>
            </div>
          </div>
        );
      case 'variants':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 gap-8">
                {variants.map((v: IVariant) => {
                  const isActive = form.variants.includes(v._id);
                  return (
                    <div key={v._id} className={`p-6 rounded-3xl border transition-all space-y-6 ${isActive ? 'border-brand-primary bg-brand-primary/[0.02] shadow-sm' : 'border-gray-100 bg-gray-50/50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-brand-primary' : 'bg-gray-300'}`} />
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${isActive ? 'text-brand-primary' : 'text-gray-500'}`}>{v.name}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {v.options.map(option => {
                          const isOptionSelected = form.selectedVariantOptions.some(so => so.variantId === v._id && so.optionId === option._id);
                          return (
                            <button key={option._id} type="button" onClick={() => toggleVariantOption(v._id, option._id)} className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 bg-white ${isOptionSelected ? 'border-brand-primary shadow-md' : 'border-gray-200 hover:border-brand-primary/30'}`}>
                              <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 ${isOptionSelected ? 'bg-brand-primary border-brand-primary' : 'border-gray-300'}`}>
                                {isOptionSelected && <HiCheck className="text-white text-xs" />}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={`text-xs font-bold truncate ${isOptionSelected ? 'text-gray-900' : 'text-gray-600'}`}>{option.value || option.name}</span>
                                {option.price !== undefined && <span className="text-[10px] font-bold text-gray-400 mt-0.5">${option.price}</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      case 'modifiers':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 gap-8">
                {modifiers.map((m: IProductModifier) => {
                  const isActive = form.modifiers.includes(m._id);
                  return (
                    <div key={m._id} className={`p-6 rounded-3xl border transition-all space-y-6 ${isActive ? 'border-brand-primary bg-brand-primary/[0.02] shadow-sm' : 'border-gray-100 bg-gray-50/50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-brand-primary' : 'bg-gray-300'}`} />
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${isActive ? 'text-brand-primary' : 'text-gray-500'}`}>{m.name}</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {m.options.map(option => {
                          const isOptionSelected = form.selectedModifierOptions.some(so => so.modifierId === m._id && so.optionId === option._id);
                          return (
                            <button key={option._id} type="button" onClick={() => toggleModifierOption(m._id, option._id)} className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 bg-white ${isOptionSelected ? 'border-brand-primary shadow-md' : 'border-gray-200 hover:border-brand-primary/30'}`}>
                              <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 ${isOptionSelected ? 'bg-brand-primary border-brand-primary' : 'border-gray-300'}`}>
                                {isOptionSelected && <HiCheck className="text-white text-xs" />}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={`text-xs font-bold truncate ${isOptionSelected ? 'text-gray-900' : 'text-gray-600'}`}>{option.value || option.name}</span>
                                {option.price !== undefined && <span className="text-[10px] font-bold text-gray-400 mt-0.5">${option.price}</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      case 'images':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-2">
              <label className="label">Product Gallery</label>
              <div 
                className="relative h-48 w-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-brand-primary/50 transition-colors"
              >
                <input type="file" multiple onChange={handleImageChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center text-gray-400">
                  <MdCameraAlt size={32} />
                  <span className="text-sm font-medium mt-1">Add Images to Gallery</span>
                </div>
              </div>
            </div>

            {(existingImages.length > 0 || previewUrls.length > 0) && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Current Gallery</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map((img, idx) => (
                    <div key={`existing-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100">
                      <img src={img.url} alt={`Gallery ${idx}`} className="h-full w-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx, true)}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  ))}
                  {previewUrls.map((url, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden group border border-brand-primary/20">
                      <img src={url} alt={`New Gallery ${idx}`} className="h-full w-full object-cover" />
                      <div className="absolute top-2 left-2 bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">New</div>
                      <button 
                        type="button"
                        onClick={() => removeImage(idx, false)}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'summary':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <div className="flex items-center gap-2 text-brand-primary">
                            <MdStore size={20} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Vendor & Branch</h3>
                        </div>
                        <button type="button" onClick={() => handleTabChange('vendor')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Vendor</span>
                            <p className="text-sm font-semibold">{selectedVendor?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Branch</span>
                            <p className="text-sm font-semibold">{selectedBranch?.name || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <div className="flex items-center gap-2 text-brand-primary">
                            <MdMiscellaneousServices size={20} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Service</h3>
                        </div>
                        <button type="button" onClick={() => handleTabChange('service')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Service Name</span>
                        <p className="text-sm font-semibold">{selectedService?.name || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-2 text-brand-primary">
                        <HiOutlineDocumentText size={20} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Product Info</h3>
                    </div>
                    <button type="button" onClick={() => handleTabChange('basic')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Name</span>
                        <p className="text-sm font-semibold">{form.name}</p>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Category</span>
                        <p className="text-sm font-semibold">{selectedCategory?.name || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Details</span>
                        <p className="text-sm text-gray-600 line-clamp-3">{form.details || 'No details provided'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-2 text-brand-primary">
                        <HiOutlineCurrencyDollar size={20} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Pricing & Status</h3>
                    </div>
                    <button type="button" onClick={() => handleTabChange('price')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Regular Price</span>
                        <p className="text-sm font-semibold">${form.price.toFixed(2)}</p>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Offer Price</span>
                        <p className="text-sm font-semibold">${form.offerPrice.toFixed(2)}</p>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                        <div><StatusBadge status={form.status} type="product-status" /></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <div className="flex items-center gap-2 text-brand-primary">
                            <HiOutlineDuplicate size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Variants</h3>
                        </div>
                        <button type="button" onClick={() => handleTabChange('variants')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                    </div>
                    <div className="space-y-3">
                        {form.variants.length > 0 ? form.variants.map(id => {
                            const v = variants.find((v: IVariant) => v._id === id);
                            const selectedOptions = form.selectedVariantOptions.filter(so => so.variantId === id);
                            return (
                                <div key={id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm space-y-2 animate-fadeIn">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{v?.name || 'Variant'}</span>
                                        <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-full">{selectedOptions.length} Options</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedOptions.map(so => {
                                            const opt = v?.options.find((o: any) => o._id === so.optionId);
                                            return (
                                                <span key={so.optionId} className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-50 border border-gray-100 text-[11px] font-medium text-gray-700">
                                                    {opt?.value || opt?.name || 'Option'}
                                                    {opt?.price ? <span className="ml-1 text-brand-primary font-bold">(+${opt.price})</span> : null}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-gray-200">
                                <span className="text-xs text-gray-400 italic">No variants selected</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <div className="flex items-center gap-2 text-brand-primary">
                            <HiOutlineAdjustments size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Modifiers</h3>
                        </div>
                        <button type="button" onClick={() => handleTabChange('modifiers')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                    </div>
                    <div className="space-y-3">
                        {form.modifiers.length > 0 ? form.modifiers.map(id => {
                            const m = modifiers.find((m: IProductModifier) => m._id === id);
                            const selectedOptions = form.selectedModifierOptions.filter(so => so.modifierId === id);
                            return (
                                <div key={id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm space-y-2 animate-fadeIn">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{m?.name || 'Modifier'}</span>
                                        <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-full">{selectedOptions.length} Options</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedOptions.map(so => {
                                            const opt = m?.options.find((o: any) => o._id === so.optionId);
                                            return (
                                                <span key={so.optionId} className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-50 border border-gray-100 text-[11px] font-medium text-gray-700">
                                                    {opt?.value || opt?.name || 'Option'}
                                                    {opt?.price ? <span className="ml-1 text-brand-primary font-bold">(+${opt.price})</span> : null}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-gray-200">
                                <span className="text-xs text-gray-400 italic">No modifiers selected</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-2 text-brand-primary">
                        <HiOutlinePhotograph size={20} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Gallery</h3>
                    </div>
                    <button type="button" onClick={() => handleTabChange('images')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                </div>
                <div className="ml-2">
                    {existingImages.length === 0 && previewUrls.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-4 text-center bg-white rounded-2xl border border-dashed border-gray-200">No gallery images added</p>
                    ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {[...existingImages, ...previewUrls.map(url => ({url}))].map((item, idx) => (
                                <div key={`summary-gallery-${idx}`} className="aspect-square rounded-xl overflow-hidden border border-gray-200">
                                    <img src={item.url} className="h-full w-full object-cover" alt={`Gallery ${idx}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex items-start gap-4">
                <HiOutlineClipboardCheck className="text-brand-primary shrink-0 mt-0.5" size={24} />
                <p className="text-sm text-brand-primary/80 leading-relaxed">Please review all information before updating. New images will be added to the product gallery.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isProductLoading) {
    return <div className="p-6 max-w-5xl mx-auto flex items-center justify-center h-[60vh]"><div className="animate-spin h-12 w-12 border-4 border-brand-primary border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(`/products/${id}`)} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors group">
        <MdArrowBack className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Product Details
      </button>
      
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <div className="text-sm font-medium text-gray-400">Step {currentStep} of {TABS.length}</div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {renderStepHeader()}
        
        <div className="p-5">
          <form className="space-y-8">
            {inlineError && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3 animate-shake"><HiOutlineExclamation className="shrink-0" />{inlineError}</div>}
            
            {renderContent()}

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
              <button type="button" onClick={currentStep === 1 ? () => navigate(`/products/${id}`) : goToPrevStep} className="btn-secondary px-8">{currentStep === 1 ? 'Cancel' : 'Previous'}</button>
              {activeTab === 'summary' ? (
                <button type="button" onClick={handleSubmit} className="btn-primary px-12" disabled={updateProduct.isPending}>{updateProduct.isPending ? 'Processing...' : 'Update Product'}</button>
              ) : (
                <button type="button" onClick={goToNextStep} className="btn-primary px-12">Continue</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
