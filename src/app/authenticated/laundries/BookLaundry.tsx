import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineLocationMarker, 
  HiOutlineClipboardCheck, 
  HiOutlineOfficeBuilding,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlinePencilAlt
} from 'react-icons/hi';
import { FiSearch, FiAlertTriangle } from 'react-icons/fi';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useGetBranches } from '../../../tanstack/useBranches';
import { useGetProducts } from '../../../tanstack/useProducts';
import { useSearchLocation } from '../../../tanstack/useLocations';
import { useBookLaundry } from '../../../tanstack/usePayments';
import type { IVendor, IBranch, IProduct, ILocationResult } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';

const TABS = [
  { key: 'vendor', label: 'Vendor & Branch', step: 1 },
  { key: 'service', label: 'Services', step: 2 },
  { key: 'location', label: 'Location', step: 3 },
  { key: 'pickup', label: 'Pickup Date & Phone', step: 4 },
  { key: 'summary', label: 'Summary', step: 5 },
];

const BookLaundry: React.FC = () => {
  const navigate = useNavigate();
  const bookLaundry = useBookLaundry();
  
  const [activeTab, setActiveTab] = useState('vendor');
  const [currentStep, setCurrentStep] = useState(1);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const [form, setForm] = useState({
    vendorId: '',
    branchId: '',
    services: [] as string[],
    pickUpDate: {
      day: '',
      hour: '',
    },
    location: {
      address: '',
      coordinates: { lat: 0, lng: 0 },
      place_id: '',
    },
    phoneNumber: '',
    paymentMethod: 'mpesa' as const,
    bookingFee: 50, // Default booking fee
  });

  // Search states
  const [vendorSearch, setVendorSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [debouncedLocationQuery, setDebouncedLocationQuery] = useState('');

  // Queries
  const { data: vendorsData, isLoading: isLoadingVendors } = useGetVendors({ search: vendorSearch, limit: 10 });
  const { data: branchesData, isLoading: isLoadingBranches } = useGetBranches({ vendorId: form.vendorId });
  const { data: productsData, isLoading: isLoadingProducts, isError: isErrorProducts } = useGetProducts({ 
    branch: form.branchId,
    search: serviceSearch,
    limit: 50 
  });
  const { data: locationResults, isLoading: isSearchingLocation } = useSearchLocation(debouncedLocationQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocationQuery(locationQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [locationQuery]);

  const vendors = vendorsData?.vendors || [];
  const branches = branchesData?.branches || [];
  const products = productsData?.products || [];

  const handleServiceToggle = (serviceId: string) => {
    setForm(prev => {
      const services = prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId];
      return { ...prev, services };
    });
  };

  const validateTabNavigation = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (!targetTab) return false;
    if (targetTab.step < currentStep) return true;
    
    if (currentStep === 1) return !!(form.vendorId && form.branchId);
    if (currentStep === 2) return form.services.length > 0;
    if (currentStep === 3) return !!(form.location.address);
    if (currentStep === 4) return !!(form.pickUpDate.day && form.pickUpDate.hour && form.phoneNumber);
    
    return true;
  };

  const handleTabChange = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (targetTab && validateTabNavigation(targetKey)) {
      setActiveTab(targetTab.key);
      setCurrentStep(targetTab.step);
      setInlineError(null);
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
        setInlineError('Please fill in all required fields to continue.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'summary') return;
    
    setInlineError(null);
    try {
      const result = await bookLaundry.mutateAsync(form);
      // Navigate to payment page with IDs
      const params = new URLSearchParams({
        laundryId: result.laundryId || '',
        invoiceId: result.invoiceId || '',
        paymentId: result.paymentId || '',
        checkoutId: result.daraja?.checkoutRequestId || '',
        amount: form.bookingFee.toString(),
        phone: form.phoneNumber
      });
      navigate(`/payment/laundry?${params.toString()}`);
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to book laundry');
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
    const selectedVendor = vendors.find((v: IVendor) => v._id === form.vendorId);
    const selectedBranch = branches.find((b: IBranch) => b._id === form.branchId);
    const selectedProducts = products.filter((p: IProduct) => form.services.includes(p._id));

    switch (activeTab) {
      case 'vendor':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <label className="label">Select Vendor</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={vendorSearch} 
                  onChange={(e) => setVendorSearch(e.target.value)} 
                  className="input pl-10" 
                  placeholder="Search vendors..." 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto p-1">
                {isLoadingVendors ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-gray-100 animate-pulse bg-gray-50">
                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                  ))
                ) : (
                  vendors.map((v: IVendor) => (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => setForm({ ...form, vendorId: v._id, branchId: '' })}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        form.vendorId === v._id ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-100 hover:border-brand-primary/20'
                      }`}
                    >
                      <p className="font-bold text-gray-900">{v.name}</p>
                      <p className="text-xs text-gray-500">{v.email}</p>
                    </button>
                  ))
                )}
              </div>
              </div>

              {form.vendorId && (
              <div className="space-y-4 animate-slideIn">
                <label className="label">Select Branch</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoadingBranches ? (
                    [...Array(2)].map((_, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-gray-100 animate-pulse bg-gray-50">
                        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                      </div>
                    ))
                  ) : (
                    branches.map((b: IBranch) => (
                      <button
                        key={b._id}
                        type="button"
                        onClick={() => setForm({ ...form, branchId: b._id })}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          form.branchId === b._id ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-100 hover:border-brand-primary/20'
                        }`}
                      >
                        <p className="font-bold text-gray-900">{b.name}</p>
                        <p className="text-xs text-gray-500">{b.location?.address}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
              )}
          </div>
        );

      case 'service':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <label className="label">Search Services</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={serviceSearch} 
                  onChange={(e) => setServiceSearch(e.target.value)} 
                  className="input pl-10" 
                  placeholder="Search products..." 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-1">
              {isLoadingProducts ? (
                // Loading Skeleton
                [...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-gray-100 animate-pulse h-20 bg-gray-50" />
                ))
              ) : isErrorProducts ? (
                // Error State
                <div className="col-span-2 text-center text-red-500 py-8 flex flex-col items-center gap-2">
                  <FiAlertTriangle size={32} />
                  <p>Failed to load services.</p>
                </div>
              ) : products.length > 0 ? (
                // Data State
                products.map((p: IProduct) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => handleServiceToggle(p._id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      form.services.includes(p._id) ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-100 hover:border-brand-primary/20'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <p className="text-sm text-brand-primary">{formatCurrency(p.price)}</p>
                    </div>
                    {form.services.includes(p._id) && <HiCheck className="text-brand-primary w-6 h-6" />}
                  </button>
                ))
              ) : (
                // Empty State
                <p className="col-span-2 text-center text-gray-500 py-8">No services available for this branch.</p>
              )}
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <label className="label">Pickup Location</label>
              <div className="relative">
                <HiOutlineLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={locationQuery} 
                  onChange={(e) => setLocationQuery(e.target.value)} 
                  className="input pl-10" 
                  placeholder="Search address..." 
                />
              </div>
              {isSearchingLocation ? (
                <div className="bg-gray-50 rounded-2xl p-2 border border-gray-100 space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 animate-pulse bg-gray-200 rounded-xl" />
                  ))}
                </div>
              ) : locationResults && locationResults.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-2 border border-gray-100 max-h-40 overflow-y-auto">
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
                            place_id: loc.place_id 
                          }
                        });
                        setLocationQuery(loc.formatted_address);
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-white text-sm"
                    >
                      {loc.formatted_address}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'pickup':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="label">Pickup Date</label>
                <div className="relative">
                  <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="date" 
                    value={form.pickUpDate.day} 
                    onChange={(e) => setForm({ ...form, pickUpDate: { ...form.pickUpDate, day: e.target.value } })} 
                    className="input pl-10" 
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="label">Pickup Hour</label>
                <div className="relative">
                  <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="time" 
                    value={form.pickUpDate.hour} 
                    onChange={(e) => setForm({ ...form, pickUpDate: { ...form.pickUpDate, hour: e.target.value } })} 
                    className="input pl-10" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="label">M-Pesa Phone Number</label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={form.phoneNumber} 
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} 
                  className="input pl-10" 
                  placeholder="2547XXXXXXXX" 
                />
              </div>
            </div>
          </div>
        );

      case 'summary':
        const totalServiceAmount = selectedProducts.reduce((sum: number, p: IProduct) => sum + p.price, 0);
        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Step 1: Vendor & Branch */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineOfficeBuilding size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Vendor & Branch</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('vendor')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Vendor</span>
                  <p className="text-sm font-semibold text-gray-900">{selectedVendor?.name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Branch</span>
                  <p className="text-sm font-semibold text-gray-900">{selectedBranch?.name || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Step 2: Services */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineClipboardCheck size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Selected Services</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('service')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="space-y-3 ml-2">
                {selectedProducts.length > 0 ? (
                  selectedProducts.map((p: IProduct) => (
                    <div key={p._id} className="flex justify-between items-center text-sm bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <span className="text-gray-700 font-medium">{p.name}</span>
                      <span className="text-brand-primary font-bold">{formatCurrency(p.price)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic text-center py-4 bg-white rounded-xl border border-dashed border-gray-200">No services selected</p>
                )}
              </div>
            </div>

            {/* Step 3: Location */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineLocationMarker size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Pickup Location</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('location')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="ml-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm font-medium text-gray-900 leading-relaxed">{form.location.address || 'N/A'}</p>
              </div>
            </div>

            {/* Step 4: Pickup & Phone */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineCalendar size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Pickup & Contact</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('pickup')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 ml-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Pickup Date & Time</span>
                  <p className="text-sm font-semibold text-gray-900">{form.pickUpDate.day} at {form.pickUpDate.hour}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Contact Phone</span>
                  <p className="text-sm font-semibold text-gray-900">{form.phoneNumber || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Total Section */}
            <div className="bg-brand-primary/5 rounded-3xl p-6 border border-brand-primary/10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm font-medium">Booking Fee (Pay Now)</span>
                <span className="text-xl font-black text-brand-primary">{formatCurrency(form.bookingFee)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 border-t border-brand-primary/10 pt-4">
                <span className="uppercase tracking-widest font-bold">Total Est. Laundry Value</span>
                <span className="font-bold">{formatCurrency(totalServiceAmount)}</span>
              </div>
            </div>

            <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex items-start gap-3">
              <HiOutlineClipboardCheck className="text-brand-primary shrink-0 mt-0.5" size={20} />
              <p className="text-xs text-brand-primary/80 leading-relaxed">
                Review your laundry booking. Clicking "Confirm & Pay" will initiate an M-Pesa STK push for the booking fee.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate('/laundries')} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors group">
        <MdArrowBack className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Laundries
      </button>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Book New Laundry</h1>
        <div className="text-sm font-medium text-gray-400">Step {currentStep} of {TABS.length}</div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {renderStepHeader()}
        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-8">
            {inlineError && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {inlineError}
              </div>
            )}
            {renderContent()}
            <div className="pt-6 border-t flex justify-between gap-4">
              <button
                type="button"
                onClick={currentStep === 1 ? () => navigate('/laundries') : goToPrevStep}
                className="btn-secondary px-8"
              >
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </button>
              {activeTab === 'summary' ? (
                <button 
                  type="submit" 
                  disabled={bookLaundry.isPending}
                  className="btn-primary px-12 shadow-lg shadow-brand-primary/20"
                >
                  {bookLaundry.isPending ? 'Processing...' : 'Confirm & Pay'}
                </button>
              ) : (
                <button
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

export default BookLaundry;
