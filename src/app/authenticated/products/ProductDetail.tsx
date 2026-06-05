import React, { useState, useMemo ,useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlinePlus, HiOutlineMinus } from 'react-icons/hi';
import { FiAlertTriangle, FiShoppingCart } from 'react-icons/fi';
import { useGetProductById } from '../../../tanstack/useProducts';
import { useAddToCart } from '../../../tanstack/useCart';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IProductCategory, IVariant, IProductModifier } from '../../../types/api.types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Hooks must be declared before any early returns
  const { data: productData, isLoading, isError, error } = useGetProductById(id!);
  const addToCart = useAddToCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});

  const product = (productData as any)?.product;

  useEffect(() => {
    if (product) {
      // Initialize variants from product.selectedVariantOptions
      const initialVariants = product.selectedVariantOptions?.reduce((acc: any, sv: any) => {
        const vId = typeof sv.variantId === 'object' ? sv.variantId._id : sv.variantId;
        if (sv.optionIds && sv.optionIds.length > 0) {
            acc[vId] = sv.optionIds[0]; // Assuming single selection per variant based on previous logic
        }
        return acc;
      }, {});
      setSelectedVariants(initialVariants || {});

      // Initialize modifiers from product.selectedModifierOptions
      const initialModifiers = product.selectedModifierOptions?.reduce((acc: any, sm: any) => {
        const mId = typeof sm.modifierId === 'object' ? sm.modifierId._id : sm.modifierId;
        if (sm.optionIds && sm.optionIds.length > 0) {
            acc[mId] = sm.optionIds;
        }
        return acc;
      }, {});
      setSelectedModifiers(initialModifiers || {});
    }
  }, [product]);

  // SKU Matching Logic (now safely declared)
  const matchedSku = useMemo(() => {
    if (!product?.skus || product.skus.length === 0) return null;
    
    return product.skus.find((sku: any) => {
      return sku.attributes.every((attr: any) => 
        selectedVariants[attr.variantId] === attr.optionId
      );
    });
  }, [product?.skus, selectedVariants]);

  // Loading & Error States
  if (isLoading) return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 aspect-square bg-gray-200 rounded-3xl"></div>
            <div className="lg:col-span-5 space-y-4">
                <div className="h-10 w-2/3 bg-gray-200 rounded"></div>
                <div className="h-6 w-full bg-gray-200 rounded"></div>
            </div>
        </div>
    </div>
  );
  
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'Failed to load product';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <FiAlertTriangle className="text-brand-accent" size={64} />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500">{errorMessage}</p>
        <button onClick={() => navigate('/products')} className="btn-primary mt-4">Back to List</button>
      </div>
    );
  }

  if (!product) return <div className="p-6 text-gray-500 text-center">Product not found.</div>;

  // Selection Handlers
  const handleVariantSelect = (variantId: string, optionId: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantId]: optionId }));
  };

  const handleModifierToggle = (modifierId: string, optionId: string, _min: number, max: number) => {
    setSelectedModifiers(prev => {
      const current = prev[modifierId] || [];
      const isSelected = current.includes(optionId);
      
      if (isSelected) {
        return { ...prev, [modifierId]: current.filter(id => id !== optionId) };
      } else {
        if (current.length < max) {
          return { ...prev, [modifierId]: [...current, optionId] };
        }
        return prev;
      }
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Validate that all variants have a selection
    const allVariantsSelected = (product.variants as IVariant[]).every(v => selectedVariants[v._id]);
    if (!allVariantsSelected) {
      alert('Please select all available variants.');
      return;
    }

    const payload = {
      vendorId: typeof product.vendor === 'object' ? product.vendor._id : product.vendor,
      branchId: typeof product.branch === 'object' ? product.branch._id : product.branch,
      productId: product._id,
      skuId: matchedSku?._id || product.skus?.[0]?._id,
      quantity,
      priceAtAddition: matchedSku?.price || (product.offerPrice > 0 ? product.offerPrice : product.price),
      variants: Object.entries(selectedVariants).map(([vId, oId]) => ({ variantId: vId, optionId: oId })),
      modifiers: Object.entries(selectedModifiers).flatMap(([mId, options]) => 
        options.map(oId => ({ modifierId: mId, optionId: oId }))
      )
    };

    try {
      await addToCart.mutateAsync(payload as any);
      // Optional: show success toast
    } catch (err) {
      console.error('Failed to add to cart', err);
    }
  };

  // Pricing display
  const currentPrice = matchedSku?.price || (product.offerPrice > 0 ? product.offerPrice : product.price);
  const showDiscount = product.offerPrice > 0 && product.offerPrice < product.price;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/products')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors group">
            <HiOutlineArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
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
        <button onClick={() => navigate(`/products/${id}/edit`)} className="btn-secondary flex items-center gap-2 self-start sm:self-center">
          <HiOutlinePencil size={20} /> Edit Product
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100">
            {product.images?.[activeImageIndex] ? (
              <img 
                src={product.images[activeImageIndex].url} 
                alt={product.name} 
                className="w-full h-full object-cover animate-fadeIn"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                No Image Available
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-24 w-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-brand-primary ring-4 ring-brand-primary/10' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <img src={img.url} className="h-full w-full object-cover" alt={`${product.name} thumbnail ${idx}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Price</span>
                <div className="flex items-center gap-3">
                    <p className="text-4xl font-black text-brand-primary">${currentPrice.toFixed(2)}</p>
                    {showDiscount && (
                        <p className="text-xl font-bold text-gray-400 line-through">${product.price.toFixed(2)}</p>
                    )}
                </div>
              </div>
              <StatusBadge status={product.status ? 'ACTIVE' : 'INACTIVE'} type="product-status" />
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.details || 'No description available for this product.'}
              </p>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-6">
            {/* Variants */}
            {(product.variants as IVariant[])?.map((v) => {
              // Aggregate all selected option IDs for this variantId from product data
              const selectedOptionsForVariant = product.selectedVariantOptions?.reduce((acc: string[], sv: any) => {
                const vId = typeof sv.variantId === 'object' ? sv.variantId._id : sv.variantId;
                if (vId === v._id) {
                    acc.push(...sv.optionIds);
                }
                return acc;
              }, []);
              
              if (!selectedOptionsForVariant || selectedOptionsForVariant.length === 0) return null;

              // Get option objects
              const allowedOptions = v.options.filter(o => selectedOptionsForVariant.includes(o._id));
              
              return (
                <div key={v._id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{v.name}</h3>
                    {selectedVariants[v._id] && (
                      <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-full uppercase tracking-wider">Selected</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allowedOptions.map(opt => (
                      <button
                        key={opt._id}
                        onClick={() => handleVariantSelect(v._id, opt._id)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                          selectedVariants[v._id] === opt._id
                            ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-brand-primary/30'
                        }`}
                      >
                        {opt.value || opt.name}
                        {opt.price ? <span className="ml-1 opacity-70">(+${opt.price})</span> : null}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Modifiers */}
            {(product.modifiers as IProductModifier[])?.map((m) => {
              // Aggregate all selected option IDs for this modifierId from product data
              const selectedOptionsForModifier = product.selectedModifierOptions?.reduce((acc: string[], sm: any) => {
                const mId = typeof sm.modifierId === 'object' ? sm.modifierId._id : sm.modifierId;
                if (mId === m._id) {
                    acc.push(...sm.optionIds);
                }
                return acc;
              }, []);
              
              if (!selectedOptionsForModifier || selectedOptionsForModifier.length === 0) return null;

              // Get option objects
              const allowedOptions = m.options.filter(o => selectedOptionsForModifier.includes(o._id));

              return (
                <div key={m._id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{m.name}</h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {m.required ? 'Required' : 'Optional'} ({selectedModifiers[m._id]?.length || 0}/{m.maxSelection})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allowedOptions.map(opt => {
                      const isSelected = (selectedModifiers[m._id] || []).includes(opt._id);
                      return (
                        <button
                          key={opt._id}
                          onClick={() => handleModifierToggle(m._id, opt._id, m.minSelection, m.maxSelection)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                            isSelected
                              ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-brand-primary/30'
                          }`}
                        >
                          {opt.value || opt.name}
                          {opt.price ? <span className="ml-1 text-xs opacity-70">(+${opt.price})</span> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Area */}
          <div className="pt-8 border-t border-gray-100 space-y-6">
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

            <button
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
              className="w-full btn-primary h-14 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-xl shadow-brand-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart size={22} />
              {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
