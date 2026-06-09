import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineSearch,
  HiOutlineOfficeBuilding,
  HiOutlineScissors,
  HiOutlineCalendar,
  HiOutlineClipboardCheck,
  HiOutlineExclamation,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlinePencilAlt,
  HiOutlineMail,
  HiOutlinePhone
} from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useAdminCreateAppointment } from '../../../tanstack/useAppointments';
import { useGetVendors } from '../../../tanstack/useVendors';
import { useGetBranches } from '../../../tanstack/useBranches';
import { useGetProducts } from '../../../tanstack/useProducts';
import { useGetStaff, useGetAllUsers } from '../../../tanstack/useUsers';
import { useGetAvailability } from '../../../tanstack/useAvailability';
import { formatCurrency } from '../../../utils';
import type { IVendor, IBranch, IService, IUser, IScheduleOption } from '../../../types/api.types';

const TABS = [
  { key: 'customer', label: 'Customer', step: 1 },
  { key: 'location', label: 'Vendor & Branch', step: 2 },
  { key: 'services', label: 'Services', step: 3 },
  { key: 'staff', label: 'Staff', step: 4 },
  { key: 'availability', label: 'Availability', step: 5 },
  { key: 'summary', label: 'Summary', step: 6 },
];

const CreateAppointment: React.FC = () => {
  const navigate = useNavigate();
  const createAppointment = useAdminCreateAppointment();
  const getAvailability = useGetAvailability();
  
  const [activeTab, setActiveTab] = useState('customer');
  const [currentStep, setCurrentStep] = useState(1);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    customerId: '',
    vendorId: '',
    branchId: '',
    serviceIds: [] as string[],
    staffId: '', // Single staff for availability query, though payload supports multiple items
    date: new Date().toISOString().split('T')[0],
  });

  const [selectedCustomer, setSelectedCustomer] = useState<IUser | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<IVendor | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<IBranch | null>(null);
  const [selectedServices, setSelectedServices] = useState<IService[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<IScheduleOption | null>(null);

  // Search States
  const [customerSearch, setCustomerSearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  // Data Fetching
  const { data: customersData, isLoading: isLoadingCustomers, isError: isErrorCustomers } = useGetAllUsers({ search: customerSearch, limit: 10 });
  const { data: vendorsData, isLoading: isLoadingVendors, isError: isErrorVendors } = useGetVendors({ search: vendorSearch, limit: 10 });
  const { data: branchesData, isLoading: isLoadingBranches, isError: isErrorBranches } = useGetBranches({ vendorId: form.vendorId });
  
  // Fetch products for the selected vendor and branch
  const { data: productsData, isLoading: isLoadingProducts, isError: isErrorProducts } = useGetProducts({ 
    search: serviceSearch,
    vendor: form.vendorId,
    branch: form.branchId,
  });
  
  const { data: staffDataResponse, isLoading: isLoadingStaff, isError: isErrorStaff } = useGetStaff();

  const customers = customersData?.users || [];
  const vendors = vendorsData?.vendors || [];
  const branches = branchesData?.branches || [];
  const products = productsData?.products || [];
  const allStaff = staffDataResponse?.users || [];

  // Filter staff by branch if they have branch field
  const filteredStaff = useMemo(() => {
    if (!form.branchId) return [];
    return allStaff.filter((s: IUser) => {
      const branchId = typeof s.branch === 'object' ? (s.branch as any)?._id : s.branch;
      return branchId === form.branchId;
    });
  }, [allStaff, form.branchId]);

  // Availability Options
  const [availabilityOptions, setAvailabilityOptions] = useState<IScheduleOption[]>([]);

  const fetchAvailability = useCallback(async () => {
    if (!form.branchId || !form.vendorId || form.serviceIds.length === 0 || !form.date) {
      setInlineError('Please select branch, services, and date.');
      return;
    }

    try {
      const payload = {
        date: form.date,
        branch: form.branchId,
        vendor: form.vendorId,
        items: form.serviceIds,
        preferredStaffs: form.staffId ? [form.staffId] : [],
      };
      const response = await getAvailability.mutateAsync(payload);
      // Accessing response.scheduleOptions based on the provided API response structure
      const data = response?.scheduleOptions || [];
      setAvailabilityOptions(data);
      if (data && data.length > 0) {
        setInlineError(null);
      } else {
        setInlineError('No availability found for the selected criteria.');
      }
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to fetch availability');
    }
  }, [form, getAvailability]);

  const validateTabNavigation = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (!targetTab) return false;
    
    if (targetTab.step < currentStep) return true;
    
    if (currentStep === 1) return !!form.customerId;
    if (currentStep === 2) return !!(form.vendorId && form.branchId);
    if (currentStep === 3) return form.serviceIds.length > 0;
    if (currentStep === 4) return true; // Staff is optional
    if (currentStep === 5) return !!selectedSlot;
    
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
      
      // Removed: Automatic availability fetch

      if (validateTabNavigation(nextTab.key) || nextTab.key === 'staff' || nextTab.key === 'availability') {
        setActiveTab(nextTab.key);
        setCurrentStep(nextTab.step);
        setInlineError(null);
      } else {
        setInlineError('Please complete the current step to continue.');
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
    if (activeTab !== 'summary' || !selectedSlot) return;

    try {
      const payload = {
        customerId: form.customerId,
        vendor: form.vendorId,
        branch: form.branchId,
        items: selectedSlot.items.map(item => ({
          serviceId: item.serviceId,
          staffId: item.staffId,
          startTime: item.startTime,
          endTime: item.endTime,
          amount: item.amount,
          durationMinutes: item.durationMinutes
        })),
      };

      await createAppointment.mutateAsync(payload);
      navigate('/appointments');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to create appointment');
    }
  }, [form, selectedSlot, createAppointment, navigate, activeTab]);

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
      case 'customer':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <label className="label">Search Customer <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="text" 
                  value={customerSearch} 
                  onChange={(e) => setCustomerSearch(e.target.value)} 
                  className="input pr-10" 
                  placeholder="Search by name, email or phone..." 
                />
                <HiOutlineSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoadingCustomers ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-gray-100 animate-pulse flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : isErrorCustomers ? (
                <div className="col-span-full py-12 text-center text-red-500 flex flex-col items-center gap-2">
                  <FiAlertTriangle size={32} />
                  <p>Failed to load customers.</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <p>No customers found.</p>
                </div>
              ) : (
                customers.map((c: IUser) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, customerId: c._id });
                      setSelectedCustomer(c);
                    }}
                    className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
                      form.customerId === c._id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                      form.customerId === c._id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {c.firstName?.[0]}{c.lastName?.[0]}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-gray-900 truncate">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{c.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-4">
              <label className="label">Select Vendor <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="text" 
                  value={vendorSearch} 
                  onChange={(e) => setVendorSearch(e.target.value)} 
                  className="input pr-10" 
                  placeholder="Search vendors..." 
                />
                <HiOutlineSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoadingVendors ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-gray-100 animate-pulse h-20 bg-gray-50" />
                  ))
                ) : isErrorVendors ? (
                  <div className="col-span-full py-12 text-center text-red-500 flex flex-col items-center gap-2">
                    <FiAlertTriangle size={32} />
                    <p>Failed to load vendors.</p>
                  </div>
                ) : vendors.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-gray-500">
                    <p>No vendors found.</p>
                  </div>
                ) : (
                  vendors.map((v: IVendor) => (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, vendorId: v._id, branchId: '' });
                        setSelectedVendor(v);
                        setSelectedBranch(null);
                      }}
                      className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
                        form.vendorId === v._id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <HiOutlineOfficeBuilding className="text-gray-400" />
                      </div>
                      <span className="font-semibold text-gray-900">{v.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {form.vendorId && (
              <div className="space-y-4 animate-slideUp">
                <label className="label">Select Branch <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoadingBranches ? (
                    Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-16 animate-pulse bg-gray-50 rounded-2xl" />)
                  ) : isErrorBranches ? (
                    <div className="col-span-full py-12 text-center text-red-500 flex flex-col items-center gap-2">
                      <FiAlertTriangle size={32} />
                      <p>Failed to load branches.</p>
                    </div>
                  ) : branches.length > 0 ? (
                    branches.map((b: IBranch) => (
                      <button
                        key={b._id}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, branchId: b._id });
                          setSelectedBranch(b);
                        }}
                        className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
                          form.branchId === b._id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
                        }`}
                      >
                        <span className="font-semibold text-gray-900">{b.name}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No branches found for this vendor.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="relative">
              <input 
                type="text" 
                value={serviceSearch} 
                onChange={(e) => setServiceSearch(e.target.value)} 
                className="input pr-10" 
                placeholder="Search products..." 
              />
              <HiOutlineSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoadingProducts ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-gray-100 animate-pulse h-20 bg-gray-50" />
                ))
              ) : isErrorProducts ? (
                <div className="col-span-full py-12 text-center text-red-500 flex flex-col items-center gap-2">
                  <FiAlertTriangle size={32} />
                  <p>Failed to load products.</p>
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <p>No products found.</p>
                </div>
              ) : (
                products.map((p: any) => {
                  const isSelected = form.serviceIds.includes(p._id);
                  return (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => {
                        const newIds = isSelected 
                          ? form.serviceIds.filter(id => id !== p._id)
                          : [...form.serviceIds, p._id];
                        setForm({ ...form, serviceIds: newIds });
                        
                        const newSelected = isSelected
                          ? selectedServices.filter(item => item._id !== p._id)
                          : [...selectedServices, p];
                        setSelectedServices(newSelected);
                      }}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 text-left ${
                        isSelected ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
                          <HiOutlineScissors className="text-brand-primary" />
                        </div>
                        <span className="font-semibold text-gray-900">{p.name}</span>
                      </div>
                      {isSelected && <HiCheck className="text-brand-primary w-5 h-5" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'staff':
        return (
          <div className="space-y-6 animate-fadeIn">
            <p className="text-sm text-gray-500">You can optionally select a preferred staff member.</p>
            
            {isLoadingStaff ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-gray-100 animate-pulse h-20 bg-gray-50" />
                ))}
              </div>
            ) : isErrorStaff ? (
              <div className="py-12 text-center text-red-500 flex flex-col items-center gap-2">
                <FiAlertTriangle size={32} />
                <p>Failed to load staff.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Any Available Staff */}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, staffId: '' })}
                  className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
                    !form.staffId ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                    Any
                  </div>
                  <span className="font-semibold text-gray-900">Any Available Staff</span>
                </button>

                {/* Separator Line */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-100"></div>
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">OR</span>
                  <div className="flex-1 h-px bg-gray-100"></div>
                </div>

                {/* Staff List */}
                {filteredStaff.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-4">No specific staff members available for this branch.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredStaff.map((s: IUser) => (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => setForm({ ...form, staffId: s._id })}
                        className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
                          form.staffId === s._id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                          form.staffId === s._id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {s.firstName?.[0]}{s.lastName?.[0]}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-gray-900 truncate">{s.firstName} {s.lastName}</p>
                          <p className="text-xs text-gray-500 truncate">{s.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'availability':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Appointment Date</label>
                  <input 
                    type="date" 
                    value={form.date} 
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-gray-900" 
                  />
               </div>
               <button 
                type="button" 
                onClick={fetchAvailability}
                className="btn-primary py-2 px-4 text-xs"
                disabled={getAvailability.isPending}
               >
                 {getAvailability.isPending ? 'Finding...' : 'Find Available Slots'}
               </button>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pr-2">
              {getAvailability.isPending ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse bg-gray-50 rounded-2xl" />)
              ) : availabilityOptions.length > 0 ? (
                availabilityOptions.map((slot, idx) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-start text-left w-full ${
                        isSelected ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
                      }`}
                    >
                      <div className="w-full space-y-3">
                        <div className="flex items-center gap-2">
                           <HiOutlineCalendar className="text-brand-primary shrink-0" size={20} />
                           <span className="font-bold text-gray-900">
                             {new Date(slot.overallStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.overallEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                        
                        <div className="flex flex-col gap-2 w-full">
                          {slot.items.map((i, idx) => (
                            <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 space-y-1 w-full">
                               <div className="flex items-center gap-2"><HiOutlineScissors size={14} className="text-gray-400" /> <span className="font-semibold text-gray-800">Service:</span> {i.serviceName}</div>
                               <div className="flex items-center gap-2"><HiOutlineUser size={14} className="text-gray-400" /> <span className="font-semibold text-gray-800">Staff:</span> {i.staffName}</div>
                               <div className="flex items-center gap-2"><HiOutlineClock size={14} className="text-gray-400" /> <span className="font-semibold text-gray-800">Duration:</span> {i.durationMinutes} mins</div>
                               <div className="flex items-center gap-2"><HiOutlineCurrencyDollar size={14} className="text-gray-400" /> <span className="font-semibold text-gray-800">Amount:</span> {formatCurrency(i.amount)}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total Amount at the bottom */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center w-full">
                        <div className="text-[10px] text-gray-400 uppercase font-bold">Total Amount</div>
                        <div className="text-sm font-bold text-brand-primary">{formatCurrency(slot.totalAmount)}</div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-400">
                   <HiOutlineCalendar size={48} className="mx-auto mb-2 opacity-20" />
                   <p>Click "Find Available Slots" to see options for this date.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineUser size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Customer Information</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('customer')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <HiOutlineUser size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Full Name</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{selectedCustomer?.firstName} {selectedCustomer?.lastName}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <HiOutlineMail size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Email Address</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{selectedCustomer?.email}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <HiOutlinePhone size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Phone Number</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{selectedCustomer?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineOfficeBuilding size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Vendor & Branch</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('location')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <HiOutlineOfficeBuilding size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Branch Name</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{selectedBranch?.name}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <HiOutlineOfficeBuilding size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Vendor Name</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{selectedVendor?.name}</p>
                </div>
              </div>
            </div>

            {/* Selected Services */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineScissors size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Selected Services</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('services')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="ml-2 space-y-3">
                {selectedServices.map(s => (
                  <div key={s._id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                    <HiOutlineScissors className="text-brand-primary" size={16} />
                    <span className="text-sm font-medium text-gray-700">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduled Time & Price */}
            {selectedSlot && (
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <HiOutlineCalendar size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Scheduled Time & Price</h3>
                  </div>
                  <button type="button" onClick={() => handleTabChange('availability')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                    <HiOutlinePencilAlt size={18} />
                  </button>
                </div>
                <div className="ml-2 space-y-4">
                      <div className="flex items-center gap-4 bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/10">
                    <HiOutlineCalendar className="text-brand-primary" size={24} />
                    <div>
                      <p className="text-xs font-bold text-brand-primary uppercase tracking-tight">Appointment Time</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(selectedSlot.overallStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedSlot.overallEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(selectedSlot.overallStartTime).toLocaleDateString([], { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <HiOutlineClock size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Total Duration</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{selectedSlot.totalDurationMinutes} mins</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <HiOutlineCurrencyDollar size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Total Price</span>
                      </div>
                      <p className="text-sm font-bold text-brand-primary">{formatCurrency(selectedSlot.totalAmount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex items-start gap-4">
              <HiOutlineClipboardCheck className="text-brand-primary shrink-0 mt-0.5" size={24} />
              <p className="text-sm text-brand-primary/80 leading-relaxed">
                By clicking "Create Appointment", you will book this slot for the customer. This action will mark the appointment as CONFIRMED.
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
      <button onClick={() => navigate('/appointments')} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors group">
        <MdArrowBack className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Appointments
      </button>
      
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Book New Appointment</h1>
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
                onClick={currentStep === 1 ? () => navigate('/appointments') : goToPrevStep}
                className="btn-secondary px-8"
              >
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </button>
              
              {activeTab === 'summary' ? (
                <button 
                  key="submit-btn"
                  type="submit" 
                  className="btn-primary px-12 shadow-lg shadow-brand-primary/20" 
                  disabled={createAppointment.isPending || !selectedSlot}
                >
                  {createAppointment.isPending ? 'Booking...' : 'Create Appointment'}
                </button>
              ) : (
                <button
                  key="continue-btn"
                  type="button"
                  onClick={goToNextStep}
                  className="btn-primary px-12 shadow-lg shadow-brand-primary/20"
                >
                  {activeTab === 'availability' && !selectedSlot ? 'Select a Slot' : 'Continue'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAppointment;
