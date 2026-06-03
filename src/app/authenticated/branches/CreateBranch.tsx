import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineLocationMarker, 
  HiOutlineClipboardCheck, 
  HiOutlinePhotograph,
  HiOutlinePencilAlt,
  HiOutlineOfficeBuilding,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineExclamation
} from 'react-icons/hi';
import { useCreateBranch } from '../../../tanstack/useBranches';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useSearchLocation } from '../../../tanstack/useLocations';
import type { IVendor, ILocationResult, WorkingHours } from '../../../types/api.types';

const TABS = [
  { key: 'owner', label: 'Vendor', step: 1 },
  { key: 'basic', label: 'Basic Info', step: 2 },
  { key: 'media', label: 'Branding', step: 3 },
  { key: 'gallery', label: 'Gallery', step: 4 },
  { key: 'location', label: 'Location', step: 5 },
  { key: 'hours', label: 'Working Hours', step: 6 },
  { key: 'summary', label: 'Summary', step: 7 },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const CreateBranch: React.FC = () => {
  const navigate = useNavigate();
  const createBranch = useCreateBranch();
  
  const [activeTab, setActiveTab] = useState('owner');
  const [currentStep, setCurrentStep] = useState(1);
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    vendorId: '',
    name: '',
    email: '',
    phone: '',
    location: {
      address: '',
      coordinates: { lat: 0, lng: 0 }
    },
    workingHours: {
      monday: { start: '08:00', end: '18:00' },
      tuesday: { start: '08:00', end: '18:00' },
      wednesday: { start: '08:00', end: '18:00' },
      thursday: { start: '08:00', end: '18:00' },
      friday: { start: '08:00', end: '18:00' },
      saturday: { start: '09:00', end: '16:00' },
      sunday: { start: '00:00', end: '00:00' },
    } as WorkingHours,
  });
  
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [inlineError, setInlineError] = useState<string | null>(null);

  // Vendor search state
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [debouncedVendorSearchQuery, setDebouncedVendorSearchQuery] = useState('');
  const { data: vendorsData, isLoading: isSearchingVendors } = useGetVendors({ 
    search: debouncedVendorSearchQuery, 
    limit: 5 
  });

  // Location search state
  const [locationQuery, setLocationQuery] = useState('');
  const [debouncedLocationQuery, setDebouncedLocationQuery] = useState('');
  const { data: locationResults, isLoading: isSearchingLocation } = useSearchLocation(debouncedLocationQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVendorSearchQuery(vendorSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [vendorSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocationQuery(locationQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [locationQuery]);

  const vendors = vendorsData?.vendors || [];
  const selectedVendor = vendors.find((v: IVendor) => v._id === form.vendorId);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setCover(file);
    if (file) {
      setCoverPreviewUrl(URL.createObjectURL(file));
    } else {
      setCoverPreviewUrl(null);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerCoverInput = useCallback(() => {
    coverInputRef.current?.click();
  }, []);

  const triggerGalleryInput = useCallback(() => {
    galleryInputRef.current?.click();
  }, []);

  const validateTabNavigation = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (!targetTab) return false;
    
    if (targetTab.step < currentStep) return true;
    
    if (currentStep === 1) return !!form.vendorId;
    if (currentStep === 2) return !!(form.name && form.email && form.phone);
    if (currentStep === 3) return true;
    if (currentStep === 4) return true;
    if (currentStep === 5) return true;
    if (currentStep === 6) return true;
    
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

    if (!form.vendorId || !form.name || !form.email || !form.phone) {
      setInlineError('Please fill in all required fields (Vendor, Name, Email, and Phone).');
      return;
    }

    const formData = new FormData();
    formData.append('vendorId', form.vendorId);
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('phone', form.phone);
    formData.append('location', JSON.stringify(form.location));
    formData.append('workingHours', JSON.stringify(form.workingHours));
    
    if (cover) formData.append('cover', cover);
    
    galleryFiles.forEach((file) => {
      formData.append('gallery', file);
    });

    try {
      await createBranch.mutateAsync(formData);
      navigate('/branches');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to create branch';
      setInlineError(errorMessage);
    }
  }, [form, cover, galleryFiles, createBranch, navigate, activeTab]);

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
    switch (activeTab) {
      case 'owner':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="label">Search Vendor <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={vendorSearchQuery} 
                    onChange={(e) => setVendorSearchQuery(e.target.value)} 
                    className="input pr-10" 
                    placeholder="Search by name or email..." 
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isSearchingVendors ? (
                      <div className="animate-spin h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full" />
                    ) : (
                      <HiOutlineSearch className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {selectedVendor && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Selected Vendor</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-brand-primary bg-brand-primary/5 shadow-sm flex items-center gap-4 relative animate-fadeIn">
                    <div className="h-12 w-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {selectedVendor?.name?.[0] || 'V'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-gray-900 truncate">{selectedVendor?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{selectedVendor?.email}</p>
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
                {isSearchingVendors && (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-gray-100 flex items-center gap-4 animate-pulse">
                      <div className="h-12 w-12 rounded-full bg-gray-200" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                )}

                {/* Empty state */}
                {!isSearchingVendors && vendors.length === 0 && (
                  <div className="col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="relative mb-3">
                      <HiOutlineSearch size={48} className="text-gray-200" />
                    </div>
                    <p className="text-sm font-medium">No vendors found matching your search</p>
                  </div>
                )}

                {/* Data state */}
                {!isSearchingVendors && 
                  vendors.map((v: IVendor) => (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => setForm({...form, vendorId: v._id})}
                      className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
                        form.vendorId === v._id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        form.vendorId === v._id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {v?.name?.[0]}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-gray-900 truncate">{v?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{v?.email}</p>
                      </div>
                    </button>
                  ))
                }
              </div>
            </div>
          </div>
        );
      case 'basic':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div className="space-y-1">
                <label className="label">Branch Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" placeholder="e.g. Nairobi CBD Branch" required />
              </div>
              <div className="space-y-1">
                <label className="label">Email <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input" placeholder="branch@example.com" required />
              </div>
              <div className="space-y-1">
                <label className="label">Phone <span className="text-red-500">*</span></label>
                <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input" placeholder="+254..." required />
              </div>
            </div>
          </div>
        );
      case 'media':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-2">
              <label className="label">Branch Cover Image</label>
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
                    <span className="text-sm font-medium mt-1">Upload Branch Photo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <MdCameraAlt className="text-white text-3xl" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'gallery':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-2">
              <label className="label">Branch Gallery (Optional)</label>
              <div 
                onClick={triggerGalleryInput}
                className="relative h-48 w-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-brand-primary/50 transition-colors"
              >
                <input type="file" ref={galleryInputRef} onChange={handleGalleryChange} accept="image/*" multiple className="hidden" />
                <div className="flex flex-col items-center text-gray-400">
                  <MdCameraAlt size={32} />
                  <span className="text-sm font-medium mt-1">Add Images to Gallery</span>
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <MdCameraAlt className="text-white text-3xl" />
                </div>
              </div>
            </div>

            {galleryPreviews.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Current Selection</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {galleryPreviews.map((url, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden group border border-brand-primary/20">
                      <img src={url} alt={`New Gallery ${idx}`} className="h-full w-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
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
      case 'location':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <label className="label">Search Location</label>
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
                      setForm({
                        ...form, 
                        location: { 
                          address: loc.formatted_address,
                          coordinates: loc.geometry.location,
                        }
                      });
                      setLocationQuery(loc.formatted_address);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 ${
                      form.location.address === loc.formatted_address ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-white'
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
              <input type="text" value={form.location.address} readOnly className="input bg-gray-50 text-gray-500" placeholder="Location will appear here" />
            </div>
          </div>
        );
      case 'hours':
        return (
          <div className="space-y-4 animate-fadeIn max-h-[60vh] overflow-y-auto pr-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Set Operational Hours</h3>
            {DAYS.map((day) => (
              <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-sm font-semibold capitalize text-gray-700 w-24">{day}</span>
                <div className="flex items-center gap-3">
                  <input 
                    type="time" 
                    value={(form.workingHours as any)[day].start} 
                    onChange={(e) => setForm({
                      ...form, 
                      workingHours: {
                        ...form.workingHours,
                        [day]: { ...(form.workingHours as any)[day], start: e.target.value }
                      }
                    })}
                    className="input-time"
                  />
                  <span className="text-gray-400">to</span>
                  <input 
                    type="time" 
                    value={(form.workingHours as any)[day].end} 
                    onChange={(e) => setForm({
                      ...form, 
                      workingHours: {
                        ...form.workingHours,
                        [day]: { ...(form.workingHours as any)[day], end: e.target.value }
                      }
                    })}
                    className="input-time"
                  />
                </div>
                <div className="ml-4">
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Closed?</label>
                  <button 
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      workingHours: {
                        ...form.workingHours,
                        [day]: (form.workingHours as any)[day].start === '00:00' && (form.workingHours as any)[day].end === '00:00' 
                          ? { start: '08:00', end: '18:00' }
                          : { start: '00:00', end: '00:00' }
                      }
                    })}
                    className={`h-6 w-10 rounded-full transition-colors relative ${
                      (form.workingHours as any)[day].start === '00:00' && (form.workingHours as any)[day].end === '00:00' ? 'bg-red-400' : 'bg-green-400'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      (form.workingHours as any)[day].start === '00:00' && (form.workingHours as any)[day].end === '00:00' ? 'left-5' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'summary':
        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Vendor Step */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineOfficeBuilding size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Vendor</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('owner')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="ml-2">
                <p className="text-sm font-semibold">{selectedVendor?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500">{selectedVendor?.email}</p>
              </div>
            </div>

            {/* Basic Info Step */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineOfficeBuilding size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Basic Information</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('basic')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Branch Name</label>
                  <p className="text-sm font-semibold">{form.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Email</label>
                  <p className="text-sm font-semibold">{form.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Phone</label>
                  <p className="text-sm font-semibold">{form.phone}</p>
                </div>
              </div>
            </div>

            {/* Media Step */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlinePhotograph size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Branding</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('media')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="ml-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-2">Cover Image</label>
                {coverPreviewUrl ? (
                  <div className="h-32 w-full rounded-2xl overflow-hidden border border-gray-200">
                    <img src={coverPreviewUrl} className="h-full w-full object-cover" alt="Cover" />
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No cover image uploaded</p>
                )}
              </div>
            </div>

            {/* Gallery Step */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlinePhotograph size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Gallery</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('gallery')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="ml-2">
                {galleryPreviews.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4 text-center bg-white rounded-2xl border border-dashed border-gray-200">No gallery images added</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {galleryPreviews.map((url, idx) => (
                      <div key={`summary-gallery-${idx}`} className="aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img src={url} className="h-full w-full object-cover" alt={`Gallery ${idx}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location Step */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineLocationMarker size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Location</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('location')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <p className="text-sm font-medium ml-2">{form.location.address || 'No location selected'}</p>
            </div>

            <div className="mt-8 p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex items-start gap-4">
              <HiOutlineClipboardCheck className="text-brand-primary shrink-0 mt-0.5" size={24} />
              <p className="text-sm text-brand-primary/80 leading-relaxed">
                Please review all information. By clicking "Create Branch", you confirm that you have verified all provided details.
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
      <button onClick={() => navigate('/branches')} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors group">
        <MdArrowBack className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Branches
      </button>
      
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add New Branch</h1>
        <div className="text-sm font-medium text-gray-400">Step {currentStep} of {TABS.length}</div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {renderStepHeader()}
        
        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-8">
            {inlineError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3">
                <HiOutlineExclamation className="shrink-0 text-red-500" />
                {inlineError}
              </div>
            )}
            
            {renderContent()}

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={currentStep === 1 ? () => navigate('/branches') : goToPrevStep}
                className="btn-secondary px-8"
              >
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </button>
              
              {activeTab === 'summary' ? (
                <button 
                  key="submit-btn"
                  type="submit" 
                  className="btn-primary px-12 shadow-lg shadow-brand-primary/20" 
                  disabled={createBranch.isPending}
                >
                  {createBranch.isPending ? 'Processing...' : 'Create Branch'}
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

export default CreateBranch;
