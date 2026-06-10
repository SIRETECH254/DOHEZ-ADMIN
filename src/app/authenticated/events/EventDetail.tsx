import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdLocationOn, MdEvent, MdPeople } from 'react-icons/md';
import { HiOutlinePencil, HiOutlineCalendar, HiOutlineTicket, HiOutlinePlus, HiOutlineMinus } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetProductById } from '../../../tanstack/useProducts';
import { useBookTicket } from '../../../tanstack/useTickets';
import { useAuth } from '../../../contexts/AuthContext';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IProductCategory, IVariant } from '../../../types/api.types';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: productData, isLoading, isError, error } = useGetProductById(id!);
  const { mutate: bookTicket, isPending: isBooking } = useBookTicket();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [attendees, setAttendees] = useState<{ name: string; email: string; phone: string }[]>(
    [{ name: '', email: '', phone: '' }]
  );

  const product = (productData as any)?.product;

  useEffect(() => {
    if (product) {
      // Initialize variants from product.selectedVariantOptions
      const initialVariants = product.selectedVariantOptions?.reduce((acc: any, sv: any) => {
        const vId = typeof sv.variantId === 'object' ? sv.variantId._id : sv.variantId;
        if (sv.optionIds && sv.optionIds.length > 0) {
            acc[vId] = sv.optionIds[0];
        }
        return acc;
      }, {});
      setSelectedVariants(initialVariants || {});
    }
  }, [product]);

  // SKU Matching Logic
  const matchedSku = useMemo(() => {
    if (!product?.skus || product.skus.length === 0) return null;
    
    return product.skus.find((sku: any) => {
      return sku.attributes.every((attr: any) => 
        selectedVariants[attr.variantId] === attr.optionId
      );
    });
  }, [product?.skus, selectedVariants]);

  useEffect(() => {
    setAttendees(prev => {
        const newAttendees = [...prev];
        if (quantity > newAttendees.length) {
            for (let i = newAttendees.length; i < quantity; i++) {
                newAttendees.push({ name: '', email: '', phone: '' });
            }
        } else if (quantity < newAttendees.length) {
            return newAttendees.slice(0, quantity);
        }
        return newAttendees;
    });
  }, [quantity]);

  const handleVariantSelect = (variantId: string, optionId: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantId]: optionId }));
  };

  const handleAttendeeChange = (index: number, field: string, value: string) => {
    setAttendees(prev => {
        const newAttendees = [...prev];
        newAttendees[index] = { ...newAttendees[index], [field]: value };
        return newAttendees;
    });
  };

  const handleBookTicket = () => {
    if (!product) return;

    // Validate that all variants have a selection
    const allVariantsSelected = (product.variants as IVariant[])?.every(v => {
        const hasSelectionInProduct = product.selectedVariantOptions?.some((sv: any) => {
            const vId = typeof sv.variantId === 'object' ? sv.variantId._id : sv.variantId;
            return vId === v._id && sv.optionIds?.length > 0;
        });
        return !hasSelectionInProduct || selectedVariants[v._id];
    });

    if (!allVariantsSelected) {
      alert('Please select all available options.');
      return;
    }

    const ticketsRequested = [
        {
            skuId: matchedSku?._id || product.skus?.[0]?._id || product._id,
            quantity,
            attendees
        }
    ];
      
    bookTicket({
        eventId: product._id,
        ticketsRequested,
        paymentMethod: 'mpesa',
        phoneNumber: user?.phone || '254712345678'
    }, {
        onSuccess: (response: any) => {
            navigate('/events/pay-tickets', { state: { bookingData: response.data } });
        }
    });
  };

  const currentPrice = useMemo(() => {
    if (matchedSku) return matchedSku.price;
    
    let price = product?.price || 0;
    Object.entries(selectedVariants).forEach(([vId, oId]) => {
        const variant = product?.variants?.find((v: any) => v._id === vId);
        const option = variant?.options?.find((o: any) => o._id === oId);
        if (option?.price) price += option.price;
    });
    return price;
  }, [product, selectedVariants, matchedSku]);

  if (isLoading) return <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-[60vh]"><div className="animate-spin h-12 w-12 border-4 border-brand-primary border-t-transparent rounded-full" /></div>;
  
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'Failed to load event';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <FiAlertTriangle className="text-brand-accent" size={64} />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500">{errorMessage}</p>
        <button onClick={() => navigate('/events')} className="btn-primary mt-4">Back to List</button>
      </div>
    );
  }

  if (!product) return <div className="p-6 text-gray-500 text-center">Event not found.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/events')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors group">
            <MdArrowBack size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {(product.category as IProductCategory)?.name}
              </span>
              <span className="text-xs text-gray-400 font-medium">ID: {product._id}</span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate(`/events/${id}/edit`)} className="btn-secondary flex items-center gap-2 self-start sm:self-center shadow-sm">
          <HiOutlinePencil size={20} /> Edit Event
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-video rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm relative group">
            {product.images?.[activeImageIndex] ? (
              <img src={product.images[activeImageIndex].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300"><MdEvent size={64} /></div>
            )}
            <div className="absolute top-4 left-4">
                <StatusBadge status={product.status ? 'ACTIVE' : 'INACTIVE'} type="product-status" />
            </div>
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img: any, idx: number) => (
                <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-brand-primary ring-4 ring-brand-primary/10' : 'border-transparent hover:border-gray-200'}`}>
                  <img src={img.url} className="h-full w-full object-cover" alt="thumbnail" />
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2"><MdEvent className="text-brand-primary" /> About Event</h3>
                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{product.details || 'No additional details provided for this event.'}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Venue & Address</h3>
                    <div className="flex items-start gap-2 text-gray-700">
                        <MdLocationOn className="text-brand-primary mt-1 shrink-0" />
                        <div>
                            <p className="font-bold text-sm">{product.venue}</p>
                            <p className="text-xs text-gray-500 leading-normal">{product.location?.address}</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Time</h3>
                    <div className="flex items-start gap-2 text-gray-700">
                        <HiOutlineCalendar className="text-brand-primary mt-1 shrink-0" size={18} />
                        <div>
                            <p className="font-bold text-sm">{product.startDate ? new Date(product.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                            <p className="text-xs text-gray-500">{product.startDate ? new Date(product.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} - {product.endDate ? new Date(product.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</span>
                    <p className="text-4xl font-black text-brand-primary">${currentPrice.toFixed(2)}</p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2"><HiOutlineTicket className="text-brand-primary" /> Ticket Tiers</h3>
                    <div className="space-y-3">
                        {(product.variants as IVariant[])?.map(v => {
                            const selectedOptionsForVariant = product.selectedVariantOptions?.reduce((acc: string[], sv: any) => {
                                const vId = typeof sv.variantId === 'object' ? sv.variantId._id : sv.variantId;
                                if (vId === v._id) {
                                    acc.push(...sv.optionIds);
                                }
                                return acc;
                            }, []);

                            if (!selectedOptionsForVariant || selectedOptionsForVariant.length === 0) return null;
                            const allowedOptions = v.options.filter(o => selectedOptionsForVariant.includes(o._id));

                            return (
                                <div key={v._id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Ticket Tier</span>
                                    <div className="mt-2 space-y-2">
                                        {allowedOptions.map(opt => (
                                            <button 
                                                key={opt._id} 
                                                onClick={() => handleVariantSelect(v._id, opt._id)}
                                                className={`w-full text-left bg-white rounded-xl border p-3 shadow-sm transition-all ${
                                                    selectedVariants[v._id] === opt._id 
                                                        ? 'border-brand-primary ring-2 ring-brand-primary/10' 
                                                        : 'border-gray-200 hover:border-brand-primary/30'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-xs font-bold text-gray-700">{opt.value || opt.name}</span>
                                                    <span className="text-brand-primary font-bold text-xs">${(product.price + (opt.price || 0)).toFixed(2)}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-50 space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Quantity</span>
                        <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                            <button 
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-500"
                            >
                                <HiOutlineMinus size={18} />
                            </button>
                            <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                            <button 
                                onClick={() => setQuantity(prev => prev + 1)}
                                className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-500"
                            >
                                <HiOutlinePlus size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Attendee Details</h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                            {attendees.map((a, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Attendee {idx + 1}</p>
                                    <div className="grid grid-cols-1 gap-3">
                                        <input 
                                            type="text" 
                                            placeholder="Full Name" 
                                            className="w-full text-xs border-gray-200 rounded-xl p-3 focus:ring-brand-primary focus:border-brand-primary outline-none" 
                                            value={a.name} 
                                            onChange={(e) => handleAttendeeChange(idx, 'name', e.target.value)} 
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input 
                                                type="email" 
                                                placeholder="Email" 
                                                className="w-full text-xs border-gray-200 rounded-xl p-3 focus:ring-brand-primary focus:border-brand-primary outline-none" 
                                                value={a.email} 
                                                onChange={(e) => handleAttendeeChange(idx, 'email', e.target.value)} 
                                            />
                                            <input 
                                                type="tel" 
                                                placeholder="Phone" 
                                                className="w-full text-xs border-gray-200 rounded-xl p-3 focus:ring-brand-primary focus:border-brand-primary outline-none" 
                                                value={a.phone} 
                                                onChange={(e) => handleAttendeeChange(idx, 'phone', e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleBookTicket} 
                    disabled={isBooking} 
                    className="w-full btn-primary h-14 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-xl shadow-brand-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <HiOutlineTicket size={22} />
                    {isBooking ? 'Booking...' : 'Book Tickets'}
                </button>
            </div>
            
            <div className="bg-brand-primary/5 rounded-3xl p-6 border border-brand-primary/10 space-y-3">
                <div className="flex items-center gap-2 text-brand-primary font-bold text-sm uppercase tracking-wider"><MdPeople size={20} /> Organizer Info</div>
                <div>
                    <p className="text-xs text-brand-primary/60 font-medium uppercase tracking-tighter">Vendor</p>
                    <p className="text-sm font-bold text-gray-900">{typeof product.vendor === 'object' ? product.vendor.name : 'Unknown Vendor'}</p>
                </div>
                <div>
                    <p className="text-xs text-brand-primary/60 font-medium uppercase tracking-tighter">Branch</p>
                    <p className="text-sm font-bold text-gray-900">{typeof product.branch === 'object' ? product.branch.name : 'Primary Branch'}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
