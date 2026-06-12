import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineLocationMarker, 
  HiOutlineClipboardCheck, 
  HiOutlineOfficeBuilding,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlinePencilAlt
} from 'react-icons/hi';
import { useGetLaundryById, useUpdateLaundry } from '../../../tanstack/useLaundries';
import type { IProduct } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';
import StatusBadge from '../../../components/ui/StatusBadge';

const TABS = [
  { key: 'status', label: 'Booking Status', step: 1 },
  { key: 'vendor', label: 'Vendor & Branch', step: 2 },
  { key: 'service', label: 'Services', step: 3 },
  { key: 'location', label: 'Location', step: 4 },
  { key: 'pickup', label: 'Pickup Date & Phone', step: 5 },
  { key: 'summary', label: 'Summary', step: 6 },
];

const laundryStatuses = [
  'PENDING',
  'CONFIRMED',
  'PICKED_UP',
  'IN_PROGRESS',
  'COMPLETED',
  'DELIVERED',
];

const EditLaundry: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: laundryData, isLoading: isLoadingLaundry } = useGetLaundryById(id || '');

  const laundry = laundryData?.laundry 

  const updateLaundry = useUpdateLaundry();

  
  const [activeTab, setActiveTab] = useState('status');
  const [currentStep, setCurrentStep] = useState(1);
  const [inlineError, setInlineError] = useState<string | null>(null);


  const [form, setForm] = useState({
    status: '' as any,
    vendorId: '',
    branchId: '',
    services: [] as IProduct[],
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
  });

  useEffect(() => {
    if (laundry) {
      setForm({
        status: laundry.status,
        vendorId: typeof laundry.vendor === 'string' ? laundry.vendor : laundry.vendor?._id,
        branchId: typeof laundry.branch === 'string' ? laundry.branch : laundry.branch?._id,
        services: laundry.services || [],
        pickUpDate: {
          day: laundry.pickUpDate?.day?.split('T')[0] || '',
          hour: laundry.pickUpDate?.hour || '',
        },
        location: {
          address: laundry.location?.address || '',
          coordinates: laundry.location?.coordinates || { lat: 0, lng: 0 },
          place_id: laundry.location?.place_id || '',
        },
        phoneNumber: laundry.customer?.phone || '',
      });
    }
  }, [laundry]);

  const validateTabNavigation = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (!targetTab) return false;
    
    // In edit mode with laundry loaded, allow navigation
    if (laundry) return true;
    
    if (targetTab.step < currentStep) return true;
    
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
      await updateLaundry.mutateAsync({
        laundryId: id!,
        laundryData: {
          status: form.status,
          pickUpDate: form.pickUpDate,
          location: { address: form.location.address }
        }
      });
      navigate('/laundries');
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to update laundry');
    }
  };

  if (isLoadingLaundry) {
    return <div className="p-12 text-center text-gray-500">Loading laundry details...</div>;
  }

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
      case 'status':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
              <label className="label">Update Laundry Status</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {laundryStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setForm({ ...form, status })}
                    className={`p-4 rounded-2xl border text-sm font-bold transition-all ${
                      form.status === status 
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary shadow-sm' 
                        : 'border-gray-100 bg-white text-gray-500 hover:border-brand-primary/30'
                    }`}
                  >
                    {status.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex items-start gap-4">
              <HiOutlineShieldCheck className="text-brand-primary shrink-0 mt-0.5" size={24} />
              <p className="text-sm text-brand-primary/80 leading-relaxed">
                Updating the status will notify the customer. Please ensure you select the correct stage of the laundry process.
              </p>
            </div>
          </div>
        );

      case 'vendor':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center gap-2 text-brand-primary border-b border-gray-200 pb-4">
                <HiOutlineOfficeBuilding size={20} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Assigned Vendor & Branch</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Vendor</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {typeof laundry?.vendor === 'object' ? laundry.vendor.name : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Branch</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {typeof laundry?.branch === 'object' ? laundry.branch.name : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 italic">Vendor and branch information cannot be modified.</p>
          </div>
        );

      case 'service':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center gap-2 text-brand-primary border-b border-gray-200 pb-4">
                <HiOutlineClipboardCheck size={20} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Booked Services</h3>
              </div>
              <div className="space-y-3">
                {form.services.map((s: IProduct, index: number) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl border border-gray-100 flex items-center justify-between bg-white"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{s.name}</p>
                      <p className="text-sm text-brand-primary">{formatCurrency(s.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 italic">Services cannot be modified after booking.</p>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 text-brand-primary border-b border-gray-200 pb-4">
                <HiOutlineLocationMarker size={20} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Pickup Location</h3>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-gray-100">
                <HiOutlineLocationMarker className="text-brand-primary mt-0.5 shrink-0" size={18} />
                <p className="text-sm font-medium text-gray-900">{form.location.address}</p>
              </div>
            </div>
          </div>
        );

      case 'pickup':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center gap-2 text-brand-primary border-b border-gray-200 pb-4">
                <HiOutlineCalendar size={20} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Pickup Schedule</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Pickup Date</p>
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <HiOutlineCalendar className="text-gray-400" />
                    <span>{form.pickUpDate.day}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Pickup Time</p>
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <HiOutlineClock className="text-gray-400" />
                    <span>{form.pickUpDate.hour}</span>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Contact Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{form.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineShieldCheck size={20} />
                  <h3 className="font-bold uppercase text-xs">Status & Info</h3>
                </div>
                <button type="button" onClick={() => handleTabChange('status')} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <StatusBadge status={form.status} type="laundry-status" />
                <p className="text-xs text-gray-500">Laundry #: {laundry?.laundryNumber}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 text-brand-primary">
                  <HiOutlineOfficeBuilding size={20} />
                  <h3 className="font-bold uppercase text-xs">Vendor & Branch</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Vendor</p>
                  <p className="font-semibold text-gray-900">{typeof laundry?.vendor === 'object' ? laundry.vendor.name : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Branch</p>
                  <p className="font-semibold text-gray-900">{typeof laundry?.branch === 'object' ? laundry.branch.name : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 text-brand-primary border-b pb-3">
                <HiOutlineLocationMarker size={20} />
                <h3 className="font-bold uppercase text-xs">Pickup Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Location</p>
                  <p className="font-semibold text-gray-900">{form.location.address}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Date & Time</p>
                  <p className="font-semibold text-gray-900">{form.pickUpDate.day} at {form.pickUpDate.hour}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Phone</p>
                  <p className="font-semibold text-gray-900">{form.phoneNumber}</p>
                </div>
              </div>
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Laundry Booking</h1>
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
                  disabled={updateLaundry.isPending}
                  className="btn-primary px-12 shadow-lg shadow-brand-primary/20"
                >
                  {updateLaundry.isPending ? 'Saving...' : 'Save Changes'}
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

export default EditLaundry;
