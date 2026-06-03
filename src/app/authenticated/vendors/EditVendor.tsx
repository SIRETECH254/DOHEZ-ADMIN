import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineLocationMarker, 
  HiOutlineClipboardCheck, 
  HiOutlinePhotograph,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineDocumentText,
  HiOutlineIdentification,
  HiOutlineClipboardList,
  HiOutlineTag,
  HiOutlineShieldCheck,
  HiOutlineOfficeBuilding,
  HiOutlinePencilAlt,
  HiOutlineSearch,
  HiOutlineExclamation
} from 'react-icons/hi';
import { useUpdateVendor, useGetVendorById } from '../../../tanstack/useVendors';
import { useGetVendorCategories } from '../../../tanstack/useVendorCategories';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import { useGetServices } from '../../../tanstack/useServices';
import { useSearchLocation } from '../../../tanstack/useLocations';
import type { IVendorCategory, IUser, IService, ILocationResult, VendorLocation } from '../../../types/api.types';
import StatusBadge from '../../../components/ui/StatusBadge';

const TABS = [
  { key: 'basic', label: 'Basic Info', step: 1 },
  { key: 'media', label: 'Branding', step: 2 },
  { key: 'location', label: 'Location', step: 3 },
  { key: 'owner', label: 'Ownership', step: 4 },
  { key: 'business', label: 'Business Info', step: 5 },
  { key: 'service', label: 'Primary Service', step: 6 },
  { key: 'category', label: 'Category & Status', step: 7 },
  { key: 'summary', label: 'Summary', step: 8 },
];

const EditVendor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: vendorData, isLoading: isVendorLoading } = useGetVendorById(id!);
  const vendor = vendorData?.vendor;
  const updateVendor = useUpdateVendor();
  
  const [activeTab, setActiveTab] = useState('basic');
  const [currentStep, setCurrentStep] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    userId: '',
    name: '',
    description: '',
    categoryId: '',
    serviceId: '',
    phone: '',
    email: '',
    kraPin: '',
    regNo: '',
    location: '',
    isActive: true,
  });
  
  const [logo, setLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    if (vendor) {
      const currentUserId = typeof vendor.userId === 'string' ? vendor.userId : (vendor.userId as IUser)?._id;
      const currentCategoryId = typeof vendor.vendorCategory === 'string' ? vendor.vendorCategory : (vendor.vendorCategory as IVendorCategory)?._id;
      const currentServiceId = typeof vendor.service === 'string' ? vendor.service : (vendor.service as IService)?._id;
      const currentAddress = typeof vendor.location === 'string' ? vendor.location : (vendor.location as VendorLocation)?.address || '';

      setForm({
        userId: currentUserId || '',
        name: vendor.name,
        description: vendor.details || '',
        categoryId: currentCategoryId || '',
        serviceId: currentServiceId || '',
        phone: vendor.phone,
        email: vendor.email,
        kraPin: vendor.kraPin || '',
        regNo: vendor.regNo || '',
        location: currentAddress,
        isActive: vendor.isActive,
      });
      setPreviewUrl(vendor.logo || null);
      setCoverPreviewUrl(vendor.cover || null);

      // Pre-fill search queries to show current selections in lists
      if (currentAddress) setLocationQuery(currentAddress);
      
      // Stop pre-filling search inputs with names to keep them clear as requested
      setOwnerSearchQuery('');
      setServiceSearchQuery('');
      setCategorySearchQuery('');
    }
  }, [vendor]);

  // Location search state
  const [locationQuery, setLocationQuery] = useState('');
  const [debouncedLocationQuery, setDebouncedLocationQuery] = useState('');
  const { data: locationResults, isLoading: isSearchingLocation } = useSearchLocation(debouncedLocationQuery);

  // Owner search state
  const [ownerSearchQuery, setOwnerSearchQuery] = useState('');
  const [debouncedOwnerSearchQuery, setDebouncedOwnerSearchQuery] = useState('');
  const { 
    data: usersData, 
    isLoading: isSearchingUsers,
    isError: isUsersError,
    error: usersError
  } = useGetAllUsers({ 
    search: debouncedOwnerSearchQuery, 
    limit: 5 
  });

  // Service search state
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [debouncedServiceSearchQuery, setDebouncedServiceSearchQuery] = useState('');
  const { 
    data: servicesData, 
    isLoading: isSearchingServices,
    isError: isServicesError,
    error: servicesError
  } = useGetServices({ 
    search: debouncedServiceSearchQuery, 
    limit: 10 
  });

  // Category search state
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [debouncedCategorySearchQuery, setDebouncedCategorySearchQuery] = useState('');
  const { 
    data: categoriesData, 
    isLoading: isSearchingCategories,
    isError: isCategoriesError,
    error: categoriesError
  } = useGetVendorCategories({ 
    search: debouncedCategorySearchQuery, 
    limit: 10 
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocationQuery(locationQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [locationQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedOwnerSearchQuery(ownerSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [ownerSearchQuery]);

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

  const categories = categoriesData?.categories || [];
  const users = usersData?.users || [];
  const services = servicesData?.services || [];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setLogo(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setCover(file);
    if (file) {
      setCoverPreviewUrl(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const triggerCoverInput = useCallback(() => {
    coverInputRef.current?.click();
  }, []);

  const validateTabNavigation = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (!targetTab) return false;
    
    // Can always go back
    if (targetTab.step < currentStep) return true;
    
    // Forwards validation
    if (currentStep === 1) {
      return !!(form.name && form.email && form.phone);
    }
    if (currentStep === 2) return true; // Media is optional
    if (currentStep === 3) return true; // Location is optional
    if (currentStep === 4) return !!form.userId;
    if (currentStep === 5) return true; // Business info optional
    if (currentStep === 6) return !!form.serviceId;
    if (currentStep === 7) return !!form.categoryId;
    
    return true;
  };

  const handleTabChange = (key: string) => {
    if (validateTabNavigation(key)) {
      setActiveTab(key);
      const step = TABS.find(t => t.key === key)?.step || 1;
      setCurrentStep(step);
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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab !== 'summary') return;
    
    setInlineError(null);

    if (!form.name || !form.userId || !form.categoryId || !form.email || !form.phone || !form.serviceId) {
      setInlineError('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'serviceId') {
        formData.append('service', String(value));
      } else {
        formData.append(key, String(value));
      }
    });
    if (logo) formData.append('logo', logo);
    if (cover) formData.append('cover', cover);

    try {
      await updateVendor.mutateAsync({ vendorId: id!, data: formData });
      navigate('/vendors');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update vendor';
      setInlineError(errorMessage);
    }
  }, [form, logo, cover, updateVendor, navigate, activeTab, id]);

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
    const selectedUser = users.find((u: IUser) => u._id === form.userId) || 
                         (vendor && typeof vendor.userId !== 'string' && (vendor.userId as IUser)?._id === form.userId ? (vendor.userId as IUser) : null);
    
    const selectedService = services.find((s: IService) => s._id === form.serviceId) ||
                            (vendor && typeof vendor.service !== 'string' && (vendor.service as IService)?._id === form.serviceId ? (vendor.service as IService) : null);
    
    const selectedCategory = categories.find((c: IVendorCategory) => c._id === form.categoryId) ||
                             (vendor && typeof vendor.vendorCategory !== 'string' && (vendor.vendorCategory as IVendorCategory)?._id === form.categoryId ? (vendor.vendorCategory as IVendorCategory) : null);

    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="label">Vendor Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" placeholder="e.g. Quick Laundry" required />
              </div>
              <div className="space-y-1">
                <label className="label">Email <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input" placeholder="contact@example.com" required />
              </div>
              <div className="space-y-1">
                <label className="label">Phone <span className="text-red-500">*</span></label>
                <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input" placeholder="+254..." required />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="label">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input min-h-[100px] py-3" placeholder="Describe the vendor..." />
              </div>
            </div>
          </div>
        );
      case 'media':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-2">
              <label className="label">Cover Image</label>
              <div 
                onClick={triggerCoverInput}
                className="relative h-48 w-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-brand-primary/50 transition-colors"
              >
                <input type="file" ref={coverInputRef} onChange={handleCoverChange} accept="image/*" className="hidden" />
                {coverPreviewUrl ? (
                  <img src={coverPreviewUrl} alt="Cover Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <MdCameraAlt size={32} />
                    <span className="text-sm font-medium mt-1">Upload Cover</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <MdCameraAlt className="text-white text-3xl" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="label">Vendor Logo</label>
              <div 
                onClick={triggerFileInput}
                className="relative h-32 w-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-brand-primary/50 transition-colors"
              >
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                {previewUrl ? (
                  <img src={previewUrl} alt="Logo Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <MdCameraAlt size={32} />
                    <span className="text-sm font-medium mt-1">Upload Logo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <MdCameraAlt className="text-white text-3xl" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'location':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <label className="label">Search Location <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="text" 
                  value={locationQuery} 
                  onChange={(e) => setLocationQuery(e.target.value)} 
                  className="input pr-10" 
                  placeholder="Type to search address..." 
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isSearchingLocation ? (
                    <div className="animate-spin h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full" />
                  ) : (
                    <HiOutlineLocationMarker className="text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {locationResults && locationResults.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-2 border border-gray-100 max-h-48 overflow-y-auto">
                {locationResults.map((loc: ILocationResult) => (
                  <button
                    key={loc.place_id}
                    type="button"
                    onClick={() => {
                      setForm({...form, location: loc.formatted_address});
                      setLocationQuery(loc.formatted_address);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 ${
                      form.location === loc.formatted_address ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-white'
                    }`}
                  >
                    <HiOutlineLocationMarker className="shrink-0" />
                    <span className="text-sm truncate">{loc.formatted_address}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-1">
              <label className="label">Selected Location</label>
              <input type="text" value={form.location} readOnly className="input bg-gray-50 text-gray-500" placeholder="Location will appear here" />
            </div>
          </div>
        );
      case 'owner':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="label">Search Owner <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={ownerSearchQuery} 
                    onChange={(e) => setOwnerSearchQuery(e.target.value)} 
                    className="input pr-10" 
                    placeholder="Search by name or email..." 
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isSearchingUsers ? (
                      <div className="animate-spin h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full" />
                    ) : (
                      <HiOutlineSearch className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {selectedUser && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Selected Owner</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-brand-primary bg-brand-primary/5 shadow-sm flex items-center gap-4 relative animate-fadeIn">
                    <div className="h-12 w-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {selectedUser?.firstName?.[0] || ''}{selectedUser?.lastName?.[0] || ''}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-gray-900 truncate">{selectedUser?.firstName} {selectedUser?.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{selectedUser?.email}</p>
                    </div>
                    <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-brand-primary flex items-center justify-center shadow-sm">
                      <HiCheck className="text-white w-4 h-4" />
                    </div>
                  </div>
                  <div className="h-px bg-gray-100 w-full mt-4" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Loading state */}
                {isSearchingUsers && (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-gray-100 flex items-center gap-4 animate-pulse">
                      <div className="h-12 w-12 rounded-full bg-gray-200" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                )}

                {/* Error state */}
                {isUsersError && !isSearchingUsers && (
                  <div className="col-span-1 md:col-span-2 py-10 flex flex-col items-center justify-center text-red-500 bg-red-50 rounded-3xl border border-red-100">
                    <HiOutlineExclamation size={48} className="mb-2" />
                    <p className="font-bold">Error loading users</p>
                    <p className="text-xs">{(usersError as any)?.response?.data?.message || 'Something went wrong'}</p>
                  </div>
                )}

                {/* Empty state */}
                {!isSearchingUsers && !isUsersError && users.length === 0 && (
                  <div className="col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="relative mb-3">
                      <HiOutlineSearch size={48} className="text-gray-200" />
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                        <HiCheck className="text-red-400 rotate-45" size={16} />
                      </div>
                    </div>
                    <p className="text-sm font-medium">No users found matching your search</p>
                  </div>
                )}

                {/* Data state */}
                {!isSearchingUsers && !isUsersError && 
                  users.map((u: IUser) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => setForm({...form, userId: u._id})}
                      className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
                        form.userId === u._id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        form.userId === u._id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {u?.firstName?.[0]}{u?.lastName?.[0]}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-gray-900 truncate">{u?.firstName} {u?.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{u?.email}</p>
                      </div>
                    </button>
                  ))
                }
              </div>
            </div>
          </div>
        );
      case 'business':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="label">KRA PIN</label>
                <input type="text" value={form.kraPin} onChange={(e) => setForm({...form, kraPin: e.target.value})} className="input" placeholder="e.g. A012345678X" />
              </div>
              <div className="space-y-1">
                <label className="label">Registration Number</label>
                <input type="text" value={form.regNo} onChange={(e) => setForm({...form, regNo: e.target.value})} className="input" placeholder="e.g. CPR/2024/123456" />
              </div>
            </div>
          </div>
        );
      case 'service':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="label">Search Primary Service <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={serviceSearchQuery} 
                    onChange={(e) => setServiceSearchQuery(e.target.value)} 
                    className="input pr-10" 
                    placeholder="Search for a service..." 
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isSearchingServices ? (
                      <div className="animate-spin h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full" />
                    ) : (
                      <HiOutlineSearch className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {selectedService && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Selected Service</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-brand-primary bg-brand-primary/5 shadow-sm flex items-center gap-4 relative animate-fadeIn">
                    <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold shadow-sm">
                      {selectedService?.name?.[0]}
                    </div>
                    <span className="font-bold text-gray-900 truncate">{selectedService?.name}</span>
                    <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-brand-primary flex items-center justify-center shadow-sm">
                      <HiCheck className="text-white w-4 h-4" />
                    </div>
                  </div>
                  <div className="h-px bg-gray-100 w-full mt-4" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Loading state */}
                {isSearchingServices && (
                  Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-gray-100 flex items-center gap-4 animate-pulse">
                      <div className="h-10 w-10 rounded-xl bg-gray-200" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  ))
                )}

                {/* Error state */}
                {isServicesError && !isSearchingServices && (
                  <div className="col-span-1 md:col-span-2 py-10 flex flex-col items-center justify-center text-red-500 bg-red-50 rounded-3xl border border-red-100">
                    <HiOutlineExclamation size={48} className="mb-2" />
                    <p className="font-bold">Error loading services</p>
                    <p className="text-xs">{(servicesError as any)?.response?.data?.message || 'Something went wrong'}</p>
                  </div>
                )}

                {/* Empty state */}
                {!isSearchingServices && !isServicesError && services.length === 0 && (
                  <div className="col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="relative mb-3">
                      <HiOutlineSearch size={48} className="text-gray-200" />
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                        <HiCheck className="text-red-400 rotate-45" size={16} />
                      </div>
                    </div>
                    <p className="text-sm font-medium">No services found matching your search</p>
                  </div>
                )}

                {/* Data state */}
                {!isSearchingServices && !isServicesError && 
                  services.map((s: IService) => (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => setForm({...form, serviceId: s._id})}
                      className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
                        form.serviceId === s._id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                        form.serviceId === s._id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-brand-primary'
                      }`}>
                        {s?.name?.[0]}
                      </div>
                      <span className="font-semibold text-gray-900 truncate">{s?.name}</span>
                    </button>
                  ))
                }
              </div>
            </div>
          </div>
        );
      case 'category':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="label">Search Category <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={categorySearchQuery} 
                    onChange={(e) => setCategorySearchQuery(e.target.value)} 
                    className="input pr-10" 
                    placeholder="Search for a category..." 
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isSearchingCategories ? (
                      <div className="animate-spin h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full" />
                    ) : (
                      <HiOutlineSearch className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {selectedCategory && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Selected Category</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-brand-primary bg-brand-primary/5 shadow-sm flex items-center gap-4 relative animate-fadeIn">
                    <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold shadow-sm">
                      {selectedCategory?.name?.[0]}
                    </div>
                    <span className="font-bold text-gray-900 truncate">{selectedCategory?.name}</span>
                    <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-brand-primary flex items-center justify-center shadow-sm">
                      <HiCheck className="text-white w-4 h-4" />
                    </div>
                  </div>
                  <div className="h-px bg-gray-100 w-full mt-4" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Loading state */}
                {isSearchingCategories && (
                  Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-gray-100 flex items-center gap-4 animate-pulse">
                      <div className="h-10 w-10 rounded-xl bg-gray-200" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  ))
                )}

                {/* Error state */}
                {isCategoriesError && !isSearchingCategories && (
                  <div className="col-span-1 md:col-span-2 py-10 flex flex-col items-center justify-center text-red-500 bg-red-50 rounded-3xl border border-red-100">
                    <HiOutlineExclamation size={48} className="mb-2" />
                    <p className="font-bold">Error loading categories</p>
                    <p className="text-xs">{(categoriesError as any)?.response?.data?.message || 'Something went wrong'}</p>
                  </div>
                )}

                {/* Empty state */}
                {!isSearchingCategories && !isCategoriesError && categories.length === 0 && (
                  <div className="col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="relative mb-3">
                      <HiOutlineSearch size={48} className="text-gray-200" />
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                        <HiCheck className="text-red-400 rotate-45" size={16} />
                      </div>
                    </div>
                    <p className="text-sm font-medium">No categories found matching your search</p>
                  </div>
                )}

                {/* Data state */}
                {!isSearchingCategories && !isCategoriesError && 
                  categories.map((c: IVendorCategory) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => setForm({...form, categoryId: c._id})}
                      className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
                        form.categoryId === c._id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                        form.categoryId === c._id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-brand-primary'
                      }`}>
                        {c.name[0]}
                      </div>
                      <span className="font-semibold text-gray-900 truncate">{c.name}</span>
                    </button>
                  ))
                }
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-3">
              <label className="label">Initial Account Status</label>
              <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{form.isActive ? 'Active' : 'Inactive'}</p>
                  <p className="text-xs text-gray-500">Enable or disable this vendor immediately upon registration</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>
            </div>
          </div>
        );
      case 'summary':
        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Step 1: Basic Information */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineOfficeBuilding size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Basic Information</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('basic')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <HiOutlineOfficeBuilding size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Vendor Name</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{form.name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <HiOutlineMail size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Contact Email</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{form.email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <HiOutlinePhone size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Contact Phone</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{form.phone || 'N/A'}</p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <HiOutlineDocumentText size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Description</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                    {form.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Branding */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlinePhotograph size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Branding & Media</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('media')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="space-y-6 ml-2">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Cover Image</span>
                  <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    {coverPreviewUrl ? (
                      <img src={coverPreviewUrl} className="h-40 w-full object-cover" alt="Cover" />
                    ) : (
                      <p className="text-xs text-gray-400 italic py-6 text-center bg-white">No cover image uploaded</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Vendor Logo</span>
                  <div className="flex items-center gap-4">
                    {previewUrl ? (
                      <img src={previewUrl} className="h-20 w-20 rounded-2xl object-cover border-2 border-white shadow-md" alt="Logo" />
                    ) : (
                      <div className="h-20 w-20 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-2xl shadow-sm border-2 border-white">
                        {form.name ? form.name[0] : 'V'}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 font-medium italic">Logo will appear as shown here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Location */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineLocationMarker size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Business Location</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('location')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="ml-2 flex items-start gap-3 bg-white p-4 rounded-2xl border border-gray-100">
                <HiOutlineLocationMarker className="text-brand-primary mt-0.5 shrink-0" size={18} />
                <p className="text-sm font-medium text-gray-900">{form.location || 'N/A'}</p>
              </div>
            </div>

            {/* Step 4: Ownership */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineUser size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Vendor Ownership</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('owner')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="ml-2 flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 w-full">
                <div className="h-12 w-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  {selectedUser ? `${selectedUser?.firstName?.[0] || ''}${selectedUser?.lastName?.[0] || ''}` : '?'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 truncate">{selectedUser ? `${selectedUser?.firstName || ''} ${selectedUser?.lastName || ''}` : 'N/A'}</p>
                  <p className="text-xs text-gray-500 truncate">{selectedUser?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Step 5: Business Info */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineIdentification size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Business Verification</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('business')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <HiOutlineIdentification size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">KRA PIN</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 uppercase tracking-widest">{form.kraPin || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <HiOutlineClipboardList size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Registration No.</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 uppercase tracking-widest">{form.regNo || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Step 6: Primary Service */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiCheck size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Primary Service</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('service')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="ml-2 space-y-1">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <HiCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Selected Service</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{selectedService?.name || 'N/A'}</p>
              </div>
            </div>

            {/* Step 7: Category & Status */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineTag size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Category & Status</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('category')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <HiOutlineTag size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Vendor Category</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{selectedCategory?.name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <HiOutlineShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Account Status</span>
                  </div>
                  <div className="pt-1">
                    <StatusBadge status={form.isActive} type="vendor-status" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex items-start gap-4">
              <HiOutlineClipboardCheck className="text-brand-primary shrink-0 mt-0.5" size={24} />
              <p className="text-sm text-brand-primary/80 leading-relaxed">
                Review complete. Please ensure all information above is accurate. By clicking "Update Vendor", you confirm that you have verified all provided details.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isVendorLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate('/vendors')} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors group">
        <MdArrowBack className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Vendors
      </button>
      
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Vendor</h1>
        <div className="text-sm font-medium text-gray-400">Step {currentStep} of {TABS.length}</div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {renderStepHeader()}
        
        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-8">
            {inlineError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3 animate-shake">
                <HiOutlineClipboardCheck className="shrink-0 text-red-500" />
                {inlineError}
              </div>
            )}
            
            {renderContent()}

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={currentStep === 1 ? () => navigate('/vendors') : goToPrevStep}
                className="btn-secondary px-8"
              >
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </button>
              
              {activeTab === 'summary' ? (
                <button 
                  key="submit-btn"
                  type="submit" 
                  className="btn-primary px-12 shadow-lg shadow-brand-primary/20" 
                  disabled={updateVendor.isPending}
                >
                  {updateVendor.isPending ? 'Processing...' : 'Update Vendor'}
                </button>
              ) : (
                <button
                  key="continue-btn"
                  type="button"
                  onClick={goToNextStep}
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

export default EditVendor;