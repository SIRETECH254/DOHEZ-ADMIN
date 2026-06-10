import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt, MdLocationOn, MdAccessTime } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineExclamation,
  HiOutlineSearch,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineCalendar,
  HiOutlineTicket,
  HiOutlineLocationMarker,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineClipboardCheck,
  HiOutlineDuplicate
} from 'react-icons/hi';
import { FiSearch } from 'react-icons/fi';
import { useCreateEvent } from '../../../tanstack/useProducts';
import { useGetServices } from '../../../tanstack/useServices';
import { useGetProductCategories } from '../../../tanstack/useProductCategories';
import { useGetProductVariants } from '../../../tanstack/useProductVariants';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useGetBranches } from '../../../tanstack/useBranches';
import { useSearchLocation } from '../../../tanstack/useLocations';
import type { IProductCategory, IVariant, IVendor, IBranch, IService } from '../../../types/api.types';

const TABS = [
  { key: 'basic', label: 'Basic Info', step: 1 },
  { key: 'service', label: 'Service', step: 2 },
  { key: 'category', label: 'Category', step: 3 },
  { key: 'vendor', label: 'Vendor & Branch', step: 4 },
  { key: 'price', label: 'Price & Tickets', step: 5 },
  { key: 'location', label: 'Location', step: 6 },
  { key: 'venue', label: 'Venue', step: 7 },
  { key: 'dates', label: 'Dates & Time', step: 8 },
  { key: 'variants', label: 'Variants', step: 9 },
  { key: 'images', label: 'Images', step: 10 },
  { key: 'summary', label: 'Summary', step: 11 },
];

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const createEvent = useCreateEvent();
  
  const [activeTab, setActiveTab] = useState('basic');
  const [currentStep, setCurrentStep] = useState(1);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    details: '',
    service: '',
    category: '',
    vendor: '',
    branch: '',
    price: 0,
    startDate: '',
    endDate: '',
    venue: '',
    maxTicket: 0,
    openAt: '',
    location: {
      address: '',
      coordinates: { lat: 0, lng: 0 }
    },
    variants: [] as string[],
    selectedVariantOptions: [] as { variantId: string; optionId: string }[],
    images: [] as File[],
  });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Category Search state with debounce
  const [categorySearch, setCategorySearch] = useState('');
  const [debouncedCategorySearch, setDebouncedCategorySearch] = useState('');
  const { data: categoriesData, isLoading: isSearchingCategories } = useGetProductCategories({ 
    search: debouncedCategorySearch 
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCategorySearch(categorySearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [categorySearch]);

  const categories = (categoriesData as any)?.categories || [];

  // Service Search state with debounce
  const [serviceSearch, setServiceSearch] = useState('');
  const [debouncedServiceSearch, setDebouncedServiceSearch] = useState('');
  const { data: servicesData, isLoading: isSearchingServices } = useGetServices({ 
    search: debouncedServiceSearch 
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedServiceSearch(serviceSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [serviceSearch]);

  const services = (servicesData as any)?.services || [];

  // Vendor Search state with debounce
  const [vendorSearch, setVendorSearch] = useState('');
  const [debouncedVendorSearch, setDebouncedVendorSearch] = useState('');
  const { data: vendorsData, isLoading: isSearchingVendors } = useGetVendors({ 
    search: debouncedVendorSearch 
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVendorSearch(vendorSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [vendorSearch]);

  const vendors = (vendorsData as any)?.vendors || [];

  const { data: branchesData } = useGetBranches({ vendorId: form.vendor });
  const branches = (branchesData as any)?.branches || [];

  // Location Search
  const [locationSearch, setLocationSearch] = useState('');
  const { data: locationResults, isLoading: isSearchingLocation } = useSearchLocation(locationSearch);

  const { data: variantsData } = useGetProductVariants({});
  const variants = (variantsData as any)?.variants || [];

  const validateTabNavigation = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (!targetTab) return false;
    if (targetTab.step < currentStep) return true;
    
    if (currentStep === 1) return !!form.name;
    if (currentStep === 2) return !!form.service;
    if (currentStep === 3) return !!form.category;
    if (currentStep === 4) return !!form.vendor && !!form.branch;
    if (currentStep === 5) return form.price > 0;
    if (currentStep === 6) return !!form.location.address;
    if (currentStep === 7) return !!form.venue;
    if (currentStep === 8) return !!form.startDate && !!form.endDate;
    
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

  const renderStepHeader = () => {
    const progress = (currentStep / TABS.length) * 100;
    return (
      <div className="bg-white border-b border-gray-100 space-y-4 p-4 rounded-t-3xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-y-3">
          <div className="flex flex-row items-center gap-x-2">
            <div className="h-6 w-6 rounded-full items-center justify-center bg-brand-primary text-white text-xs font-bold flex">
              {currentStep}
            </div>
            <span className="text-sm font-semibold text-brand-primary uppercase tracking-wider">
              {TABS.find(tab => tab.key === activeTab)?.label}
            </span>
          </div>
          <div className="flex flex-row items-center gap-x-3 md:gap-x-5 overflow-x-auto pb-2 sm:pb-0">
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              const isCompleted = currentStep > tab.step;
              return (
                <button key={tab.key} onClick={() => handleTabChange(tab.key)} className="items-center flex flex-col" disabled={!validateTabNavigation(tab.key)} type="button">
                  <div className={`h-7 w-7 rounded-full items-center justify-center flex transition-all ${isActive ? 'bg-brand-primary ring-4 ring-brand-primary/20 shadow-lg' : isCompleted ? 'bg-brand-primary/40' : 'bg-gray-100'}`}>
                    {isCompleted ? <HiCheck className="w-5 h-5 text-white" /> : <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>{tab.step}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  };

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

      return { ...prev, selectedVariantOptions: nextSelectedOptions, variants: nextVariants };
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

  const handleSubmit = async () => {
    setInlineError(null);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'images') {
        form.images.forEach(img => formData.append('images', img));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    try {
      await createEvent.mutateAsync(formData);
      navigate('/events');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to create event');
    }
  };

  const renderContent = () => {
    const selectedService = services.find((s: IService) => s._id === form.service);
    const selectedCategory = categories.find((c: IProductCategory) => c._id === form.category);
    const selectedVendor = vendors.find((v: IVendor) => v._id === form.vendor);
    const selectedBranch = branches.find((b: IBranch) => b._id === form.branch);

    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="label">Event Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" placeholder="e.g. Summer Concert" required />
              </div>
              <div className="space-y-1">
                <label className="label">Event Details</label>
                <textarea value={form.details} onChange={e => setForm({...form, details: e.target.value})} className="input min-h-[120px] py-3" placeholder="Tell us about the event..." />
              </div>
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
                  <input type="text" value={serviceSearch} onChange={e => setServiceSearch(e.target.value)} className="input pr-10" placeholder="Type to search service..." />
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
      case 'category':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="label">Search Category <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" value={categorySearch} onChange={e => setCategorySearch(e.target.value)} className="input pr-10" placeholder="Type to search category..." />
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
      case 'vendor':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="label">Search Vendor <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" value={vendorSearch} onChange={e => setVendorSearch(e.target.value)} className="input pr-10" placeholder="Type to search vendor..." />
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
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <label className="label">Select Branch <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {branches.map((b: IBranch) => (
                      <button key={b._id} type="button" onClick={() => setForm({...form, branch: b._id})} className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${form.branch === b._id ? 'border-brand-secondary bg-brand-secondary/5 shadow-sm' : 'border-gray-100 hover:border-brand-secondary/30'}`}>
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${form.branch === b._id ? 'bg-brand-secondary text-white' : 'bg-gray-100 text-brand-secondary'}`}>{b.name[0]}</div>
                        <span className="font-semibold text-gray-900 truncate">{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'price':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="label">Base Price ($) <span className="text-red-500">*</span></label>
                <div className="relative">
                    <HiOutlineCurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="input pl-10" placeholder="0.00" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="label">Max Tickets <span className="text-red-500">*</span></label>
                <div className="relative">
                    <HiOutlineTicket className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="number" value={form.maxTicket} onChange={e => setForm({...form, maxTicket: Number(e.target.value)})} className="input pl-10" placeholder="500" required />
                </div>
              </div>
            </div>
          </div>
        );
      case 'location':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    value={locationSearch} 
                    onChange={e => setLocationSearch(e.target.value)} 
                    className="input pl-10" 
                    placeholder="Search address or venue location..." 
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {isSearchingLocation && <div className="p-4 text-center text-gray-400">Searching...</div>}
                {locationResults?.map((res: any) => (
                  <button 
                    key={res.place_id} 
                    type="button"
                    onClick={() => setForm({...form, location: { address: res.formatted_address, coordinates: res.geometry.location }})}
                    className={`p-3 text-left rounded-xl border transition-all hover:bg-gray-50 flex items-center gap-3 ${form.location.address === res.formatted_address ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-100'}`}
                  >
                    <MdLocationOn className="text-brand-primary shrink-0" />
                    <div>
                        <p className="text-sm font-semibold">{res.name}</p>
                        <p className="text-xs text-gray-500">{res.formatted_address}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selected Address</label>
                <p className="text-sm font-medium">{form.location.address || 'No address selected'}</p>
              </div>
            </div>
          </div>
        );
      case 'venue':
        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="space-y-1">
                    <label className="label">Venue Name <span className="text-red-500">*</span></label>
                    <input type="text" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className="input" placeholder="City Park, Madison Square, etc." />
                </div>
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                    <MdLocationOn size={48} />
                    <p className="mt-2 text-sm">Venue location is linked to the selected address</p>
                </div>
            </div>
        );
      case 'dates':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="label">Start Date & Time <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="datetime-local" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="input pl-10" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="label">End Date & Time <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="datetime-local" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="input pl-10" />
                    </div>
                </div>
            </div>
            <div className="space-y-1">
                <label className="label">Doors Open At</label>
                <div className="relative">
                    <MdAccessTime className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="time" value={form.openAt} onChange={e => setForm({...form, openAt: e.target.value})} className="input pl-10" />
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
      case 'images':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="relative h-48 w-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-brand-primary transition-colors overflow-hidden">
                <input type="file" multiple onChange={handleImageChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center text-gray-400">
                    <MdCameraAlt size={32} />
                    <span className="text-sm font-medium mt-1">Add Event Photos</span>
                </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                        <img src={url} className="w-full h-full object-cover" alt="Preview" />
                        <button onClick={() => {
                            setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
                            setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
                        }} className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <HiOutlineTrash size={14} />
                        </button>
                    </div>
                ))}
            </div>
          </div>
        );
      case 'summary':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiOutlineDocumentText size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Basic Info</h3>
                  </div>
                  <button type="button" onClick={() => handleTabChange('basic')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Name</span>
                  <p className="text-sm font-semibold">{form.name}</p>
                </div>
              </div>

              {/* Service */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiOutlineClipboardCheck size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Service</h3>
                  </div>
                  <button type="button" onClick={() => handleTabChange('service')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Service</span>
                  <p className="text-sm font-semibold">{selectedService?.name || 'N/A'}</p>
                </div>
              </div>

              {/* Category */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiOutlineClipboardCheck size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Category</h3>
                  </div>
                  <button type="button" onClick={() => handleTabChange('category')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Category</span>
                  <p className="text-sm font-semibold">{selectedCategory?.name || 'N/A'}</p>
                </div>
              </div>

              {/* Vendor & Branch */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiOutlineLocationMarker size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Vendor & Branch</h3>
                  </div>
                  <button type="button" onClick={() => handleTabChange('vendor')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
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

              {/* Price & Tickets */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiOutlineCurrencyDollar size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Price & Tickets</h3>
                  </div>
                  <button type="button" onClick={() => handleTabChange('price')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Price</span>
                    <p className="text-sm font-semibold">${form.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Max Tickets</span>
                    <p className="text-sm font-semibold">{form.maxTicket}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiOutlineLocationMarker size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Location</h3>
                  </div>
                  <button type="button" onClick={() => handleTabChange('location')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Address</span>
                  <p className="text-sm font-semibold truncate">{form.location.address || 'No address selected'}</p>
                </div>
              </div>

              {/* Venue */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiOutlineLocationMarker size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Venue</h3>
                  </div>
                  <button type="button" onClick={() => handleTabChange('venue')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Venue Name</span>
                  <p className="text-sm font-semibold">{form.venue || 'No venue provided'}</p>
                </div>
              </div>

              {/* Dates & Time */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiOutlineCalendar size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Schedule</h3>
                  </div>
                  <button type="button" onClick={() => handleTabChange('dates')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Starts</span>
                    <p className="text-sm font-semibold">{new Date(form.startDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Ends</span>
                    <p className="text-sm font-semibold">{new Date(form.endDate).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiOutlineDuplicate size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Variants</h3>
                  </div>
                  <button type="button" onClick={() => handleTabChange('variants')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                </div>
                <div className="space-y-2">
                  {form.variants.length > 0 ? form.variants.map(id => {
                    const v = variants.find((v: IVariant) => v._id === id);
                    const selectedOptions = form.selectedVariantOptions.filter(so => so.variantId === id);
                    return (
                      <div key={id} className="text-sm">
                        <span className="font-semibold">{v?.name}: </span>
                        <span>{selectedOptions.map(so => v?.options.find((o: any) => o._id === so.optionId)?.value || 'Option').join(', ')}</span>
                      </div>
                    );
                  }) : <p className="text-sm italic text-gray-500">No variants selected</p>}
                </div>
              </div>

              {/* Images */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiOutlinePhotograph size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Images</h3>
                  </div>
                  <button type="button" onClick={() => handleTabChange('images')} className="text-brand-primary transition-colors hover:scale-110"><HiOutlinePencilAlt size={18} /></button>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    {previewUrls.map((url, idx) => (
                      <img key={idx} src={url} alt={`Preview ${idx}`} className="h-16 w-16 rounded-xl object-cover border border-gray-200" />
                    ))}
                    {previewUrls.length === 0 && <p className="text-sm italic text-gray-500">No images added</p>}
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex items-start gap-4">
                <HiOutlineClipboardCheck className="text-brand-primary shrink-0 mt-0.5" size={24} />
                <p className="text-sm text-brand-primary/80 leading-relaxed">Please review all information before submitting.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate('/events')} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors group">
        <MdArrowBack className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Events
      </button>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
        <div className="text-sm font-medium text-gray-400">Step {currentStep} of {TABS.length}</div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {renderStepHeader()}

        <div className="p-5">
          <form className="space-y-8">
            {inlineError && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3 animate-shake"><HiOutlineExclamation className="shrink-0" size={20} />{inlineError}</div>}
            
            {renderContent()}

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
              <button type="button" onClick={currentStep === 1 ? () => navigate('/events') : goToPrevStep} className="btn-secondary px-8">{currentStep === 1 ? 'Cancel' : 'Previous'}</button>
              {activeTab === 'summary' ? (
                <button type="button" onClick={handleSubmit} className="btn-primary px-12" disabled={createEvent.isPending}>{createEvent.isPending ? 'Publishing...' : 'Publish Event'}</button>
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

export default CreateEvent;
