import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { 
  HiCheck, 
  HiOutlineLocationMarker, 
  HiOutlineClipboardCheck, 
  HiOutlineTruck,
  HiOutlineShoppingBag,
  HiOutlineCreditCard,
  HiOutlineTicket,
  HiOutlineInformationCircle,
  HiOutlinePencilAlt
} from 'react-icons/hi';
import { useGetCart } from '../../../tanstack/useCart';
import { useCreateOrder } from '../../../tanstack/useOrders';
import { useGetUserAddresses } from '../../../tanstack/useAddresses';
import { useAuth } from '../../../contexts/AuthContext';

const TABS = [
  { key: 'location', label: 'Location', step: 1 },
  { key: 'type', label: 'Order Type', step: 2 },
  { key: 'address', label: 'Address', step: 3 },
  { key: 'payment', label: 'Payment', step: 4 },
  { key: 'summary', label: 'Summary', step: 5 },
];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const vendorId = searchParams.get('vendorId');
  const branchId = searchParams.get('branchId');

  const { data: cartData, isLoading: isLoadingCart } = useGetCart();
  const { data: addressesData, isLoading: isLoadingAddresses } = useGetUserAddresses();
  const createOrder = useCreateOrder();

  const [activeTab, setActiveTab] = useState('location');
  const [currentStep, setCurrentStep] = useState(1);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const [form, setForm] = useState({
    location: 'in_shop' as 'in_shop' | 'away',
    type: 'pickup' as 'pickup' | 'delivery',
    addressId: '',
    paymentPreference: {
      mode: 'pay_now' as 'post_to_bill' | 'pay_now' | 'cash' | 'cod',
      method: 'mpesa_stk' as 'mpesa_stk' | undefined,
      phone: user?.phone || '',
    }
  });

  useEffect(() => {
    if (user?.phone) {
        setForm(prev => ({
            ...prev,
            paymentPreference: {
                ...prev.paymentPreference,
                phone: user.phone
            }
        }));
    }
  }, [user]);

  // Filter cart items for this branch
  const branchCart = useMemo(() => {
    if (!cartData?.cart?.cartGroups) return null;
    return cartData.cart.cartGroups.find((group: any) => 
      group.vendorId._id === vendorId && group.branchId._id === branchId
    );
  }, [cartData, vendorId, branchId]);

  useEffect(() => {
    if (!vendorId || !branchId) {
      navigate('/cart');
    }
  }, [vendorId, branchId, navigate]);

  const validateTabNavigation = (targetKey: string) => {
    const targetTab = TABS.find(t => t.key === targetKey);
    if (!targetTab) return false;
    
    // Can always go back
    if (targetTab.step < currentStep) return true;
    
    // Forwards validation
    if (currentStep === 1) return !!form.location;
    if (currentStep === 2) return !!form.type;
    if (currentStep === 3) {
      if (form.type === 'delivery') return !!form.addressId;
      return true;
    }
    if (currentStep === 4) return !!form.paymentPreference.mode;
    
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
        // Skip address tab if not delivery
        if (nextTab.key === 'address' && form.type !== 'delivery') {
            setActiveTab('payment');
            setCurrentStep(4);
        } else {
            setActiveTab(nextTab.key);
            setCurrentStep(nextTab.step);
        }
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
      // Skip address tab if not delivery when going back
      if (prevTab.key === 'address' && form.type !== 'delivery') {
          setActiveTab('type');
          setCurrentStep(2);
      } else {
          setActiveTab(prevTab.key);
          setCurrentStep(prevTab.step);
      }
      setInlineError(null);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'summary') return;
    
    setInlineError(null);

    if (!vendorId || !branchId) {
        setInlineError('Missing vendor or branch information.');
        return;
    }

    try {
      const res = await createOrder.mutateAsync({
        vendorId,
        branchId,
        location: form.location,
        type: form.type,
        addressId: form.type === 'delivery' ? form.addressId : undefined,
        paymentPreference: form.paymentPreference
      });
      
      if (res?.invoiceId) {
        navigate(`/payment/${res.invoiceId}/${form.paymentPreference.phone}/${res.orderId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to place order');
    }
  }, [form, vendorId, branchId, createOrder, navigate, activeTab]);

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
              // Hide address tab if not delivery, but keep it in steps for simplicity or handle skip
              if (tab.key === 'address' && form.type !== 'delivery' && activeTab !== 'address') return null;

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
                      <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
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
      case 'location':
        return (
          <div className="space-y-6 animate-fadeIn">
            <p className="text-gray-500 text-sm">Where are you placing this order from?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'in_shop', label: 'In-Shop', icon: HiOutlineShoppingBag, desc: 'Ordering while at the branch' },
                { id: 'away', label: 'Away', icon: HiOutlineLocationMarker, desc: 'Ordering from home or office' }
              ].map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setForm({ ...form, location: loc.id as any })}
                  className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${
                    form.location === loc.id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/20'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${form.location === loc.id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <loc.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{loc.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{loc.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'type':
        return (
          <div className="space-y-6 animate-fadeIn">
            <p className="text-gray-500 text-sm">How would you like to receive your order?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'pickup', label: 'Pick Up', icon: HiOutlineShoppingBag, desc: 'I will collect it myself' },
                { id: 'delivery', label: 'Delivery', icon: HiOutlineTruck, desc: 'Have it delivered to my location' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.id as any })}
                  className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${
                    form.type === t.id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/20'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${form.type === t.id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <t.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'address':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm">Select a delivery address</p>
                <button type="button" onClick={() => navigate('/profile/edit')} className="text-brand-primary text-xs font-bold hover:underline">
                    Manage Addresses
                </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {isLoadingAddresses ? (
                [1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-3xl animate-pulse" />)
              ) : addressesData?.addresses?.length > 0 ? (
                addressesData.addresses.map((addr: any) => (
                  <button
                    key={addr._id}
                    type="button"
                    onClick={() => setForm({ ...form, addressId: addr._id })}
                    className={`p-5 rounded-3xl border-2 transition-all text-left flex items-center gap-4 ${
                      form.addressId === addr._id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/20'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl ${form.addressId === addr._id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <HiOutlineLocationMarker size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{addr.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{addr.address}</p>
                    </div>
                    {form.addressId === addr._id && <HiCheck className="text-brand-primary" size={24} />}
                  </button>
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <HiOutlineLocationMarker className="mx-auto text-gray-300 mb-2" size={48} />
                  <p className="text-gray-500 text-sm font-medium">No addresses found</p>
                  <button onClick={() => navigate('/profile/edit')} className="btn-primary mt-4 py-2 px-6 text-xs">Add New Address</button>
                </div>
              )}
            </div>
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-6 animate-fadeIn">
            <p className="text-gray-500 text-sm">How would you like to pay?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'pay_now', label: 'Pay Now', icon: HiOutlineCreditCard, desc: 'Online payment (M-Pesa)' },
                { id: 'post_to_bill', label: 'Post to Bill', icon: HiOutlineTicket, desc: 'Add to your existing bill' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm({ ...form, paymentPreference: { 
                    ...form.paymentPreference,
                    mode: p.id as any, 
                    method: p.id === 'pay_now' ? 'mpesa_stk' : undefined 
                  } })}
                  className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${
                    form.paymentPreference.mode === p.id ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/20'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${form.paymentPreference.mode === p.id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <p.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{p.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {form.paymentPreference.mode === 'pay_now' && (
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                <p className="text-gray-900 font-bold text-sm">Select Payment Method</p>
                <div className="bg-white p-4 rounded-3xl border-2 border-brand-primary/50 shadow-sm">
                    <div className="flex flex-col items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-brand-primary text-white p-3 rounded-2xl">
                              <HiOutlineCreditCard size={24} />
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm">M-Pesa</h3>
                        </div>
                        <div className="w-full">
                           
                            <input 
                                type="text"
                                value={form.paymentPreference.phone}
                                onChange={(e) => setForm({...form, paymentPreference: { ...form.paymentPreference, phone: e.target.value }})}
                                className="input text-xs mt-1 w-full"
                                placeholder="Enter phone number..."
                            />
                        </div>
                        <HiCheck className="text-brand-primary" size={24} />
                    </div>
                </div>
            </div>
        )}
          </div>
        );
      case 'summary':
        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Items Summary */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                    <HiOutlineShoppingBag size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Order Items</h3>
                </div>
              </div>
              <div className="space-y-3 ml-2">
                  {branchCart?.items.map((item: any) => (
                      <div key={item._id} className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                              <p className="font-bold text-gray-900">{item.productId.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-gray-900">KES {(item.priceAtAddition * item.quantity).toFixed(2)}</p>
                      </div>
                  ))}
              </div>
            </div>

            {/* Selection Summary */}
            {[
                { 
                    label: 'Location', 
                    display: (
                        <div>
                            <span className="text-gray-400">Where: </span>
                            <span className="font-bold text-gray-900">{form.location === 'in_shop' ? 'In-Shop' : 'Away'}</span>
                        </div>
                    ),
                    icon: HiOutlineLocationMarker, 
                    tab: 'location' 
                },
                { 
                    label: 'Order Type', 
                    display: (
                        <div>
                            <span className="text-gray-400">Type: </span>
                            <span className="font-bold text-gray-900">{form.type === 'pickup' ? 'Pick Up' : 'Delivery'}</span>
                        </div>
                    ),
                    icon: HiOutlineTruck, 
                    tab: 'type' 
                },
                { 
                    label: 'Payment Details', 
                    display: (
                        <div>
                            <span className="text-gray-400">Method: </span>
                            <span className="font-bold text-gray-900">{form.paymentPreference.mode === 'pay_now' ? 'M-Pesa' : form.paymentPreference.mode.toUpperCase()}</span>
                            {form.paymentPreference.mode === 'pay_now' && (
                                <div className="mt-1">
                                    <span className="text-gray-400">Number: </span>
                                    <span className="font-bold text-gray-900">{form.paymentPreference.phone || 'N/A'}</span>
                                </div>
                            )}
                        </div>
                    ),
                    icon: HiOutlineCreditCard, 
                    tab: 'payment' 
                },
                ...(form.type === 'delivery' ? [{ 
                    label: 'Delivery Address', 
                    display: (
                        <div>
                            <span className="text-gray-400">Address: </span>
                            <span className="font-bold text-gray-900">
                                {addressesData?.addresses?.find((a: any) => a._id === form.addressId)?.name || 'N/A'}
                            </span>
                        </div>
                    ),
                    icon: HiOutlineLocationMarker, 
                    tab: 'address' 
                }] : [])
            ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-2 text-brand-primary">
                        <item.icon size={20} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">{item.label}</h3>
                    </div>
                    <button type="button" onClick={() => handleTabChange(item.tab)} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors">
                        <HiOutlinePencilAlt size={18} />
                    </button>
                  </div>
                  <div className="ml-2 text-sm">
                    {item.display}
                  </div>
                </div>
            ))}

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                    <HiOutlineClipboardCheck size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Price Breakdown</h3>
                </div>
              </div>
              <div className="space-y-3 ml-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold text-gray-900">KES {branchCart?.groupSubtotal.toFixed(2)}</span>
                </div>
                {/* Placeholder for discount/packaging calculations */}
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Discount/Coupon</span>
                    <span className="font-bold text-gray-500">N/A</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Packaging Fee</span>
                    <span className="font-bold text-gray-500">N/A</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <p className="font-bold text-brand-primary uppercase">Total</p>
                    <p className="text-lg font-black text-brand-primary">
                        KES {branchCart?.groupSubtotal.toFixed(2)}
                    </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex items-start gap-4">
              <HiOutlineInformationCircle className="text-brand-primary shrink-0 mt-0.5" size={24} />
              <p className="text-sm text-brand-primary/80 leading-relaxed">
                Please review your order details. Once you click "Complete Order", your order will be sent to the branch for fulfillment.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoadingCart && activeTab === 'summary') {
    return <div className="p-10 text-center animate-pulse text-gray-400">Loading order details...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate('/cart')} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors group">
        <MdArrowBack className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Cart
      </button>
      
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <div className="text-sm font-medium text-gray-400">Step {currentStep} of {TABS.length}</div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {renderStepHeader()}
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {inlineError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3 animate-shake">
                <HiOutlineClipboardCheck className="shrink-0 text-red-500" />
                {inlineError}
              </div>
            )}
            
            {renderContent()}

            <div className="pt-8 border-t border-gray-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={currentStep === 1 ? () => navigate('/cart') : goToPrevStep}
                className="btn-secondary px-8"
              >
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </button>
              
              {activeTab === 'summary' ? (
                <button 
                  key="submit-btn"
                  type="submit" 
                  className="btn-primary px-12 shadow-lg shadow-brand-primary/20" 
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? 'Placing Order...' : 'Complete Order'}
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

export default Checkout;
