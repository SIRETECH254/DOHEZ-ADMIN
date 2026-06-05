import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineTrash } from 'react-icons/hi';
import { FiShoppingCart, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { MdArrowForward } from 'react-icons/md';
import { useGetCart, useRemoveCartItem, useUpdateCartQuantity, useClearCart } from '../../../tanstack/useCart';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { data: cartData, isLoading } = useGetCart();
  const removeCartItem = useRemoveCartItem();
  const updateQuantity = useUpdateCartQuantity();
  const clearCart = useClearCart();

  const [expandedVendors, setExpandedVendors] = useState<Record<string, boolean>>({});
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});

  const cart = cartData?.cart;

  const groupedByVendor = useMemo(() => {
    if (!cart?.cartGroups) return [];
    const groups = cart.cartGroups.reduce((acc: any, group: any) => {
      const vendorId = group.vendorId._id;
      if (!acc[vendorId]) {
        acc[vendorId] = {
          vendor: group.vendorId,
          branches: [],
          vendorSubtotal: 0
        };
      }
      acc[vendorId].branches.push(group);
      acc[vendorId].vendorSubtotal += group.groupSubtotal;
      return acc;
    }, {});
    return Object.values(groups);
  }, [cart?.cartGroups]);

  const toggleVendor = (vendorId: string) => {
    setExpandedVendors(prev => ({ ...prev, [vendorId]: !prev[vendorId] }));
  };

  const toggleBranch = (branchId: string) => {
    setExpandedBranches(prev => ({ ...prev, [branchId]: !prev[branchId] }));
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8 animate-pulse">
        <header className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
          <div className="h-8 w-64 bg-gray-200 rounded-lg" />
        </header>

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-5 w-48 bg-gray-200 rounded" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-6 w-6 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.totalItems === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FiShoppingCart className="text-gray-300 mb-4" size={64} />
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Looks like you haven't added anything to your cart yet.</p>
        <button onClick={() => navigate('/products')} className="btn-primary mt-6">Shop Products</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <HiOutlineArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Your Cart ({cart.totalItems} items)</h1>
      </header>

      <div className="space-y-4">
        {groupedByVendor.map((vendorGroup: any) => (
          <div key={vendorGroup.vendor._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Vendor Accordion Header */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xl">
                    {vendorGroup.vendor.name[0]}
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-bold text-gray-900">{vendorGroup.vendor.name}</h2>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/vendors/${vendorGroup.vendor._id}`); }}
                      className="flex items-center gap-1 text-sm text-brand-primary font-semibold hover:underline"
                    >
                      View Vendor <MdArrowForward size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => toggleVendor(vendorGroup.vendor._id)}>
                        {expandedVendors[vendorGroup.vendor._id] ? <FiChevronUp size={24} className="text-gray-400" /> : <FiChevronDown size={24} className="text-gray-400" />}
                    </button>
                </div>
              </div>

              <div className="my-6 border-t border-gray-100" />

              <div className="flex items-center justify-between text-sm">
                <p className="font-bold text-gray-500">ITEMS: {vendorGroup.branches.reduce((acc: number, b: any) => acc + b.items.length, 0)}</p>
                <p className="font-bold text-gray-900">TOTAL: <span className="text-brand-primary text-lg">KES {vendorGroup.vendorSubtotal.toFixed(2)}</span></p>
              </div>
            </div>

            {/* Vendor Accordion Content (Branches) */}
            {expandedVendors[vendorGroup.vendor._id] && (
              <div className="p-6 pt-0 space-y-4 animate-fadeIn">
                {vendorGroup.branches.map((group: any) => (
                  <div key={group._id} className="border border-gray-100 rounded-2xl overflow-hidden">
                    {/* Branch Accordion Header */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-700">{group.branchId.name}</h3>
                            <div className="flex items-center gap-4">
                                <button className="px-4 py-1.5 bg-brand-primary text-white text-[10px] font-bold rounded-lg hover:bg-brand-primary/90 transition-colors">
                                    Order 
                                </button>
                                <button onClick={() => toggleBranch(group._id)}>
                                    <FiChevronDown className={`text-gray-400 transition-transform duration-200 ${expandedBranches[group._id] ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="my-4 border-t border-gray-100" />

                        <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
                            <span>ITEMS: {group.items.length}</span>
                            <span>TOTAL: <span className="text-gray-900">KES {group.groupSubtotal.toFixed(2)}</span></span>
                        </div>
                    </div>

                    {/* Branch Accordion Content (Items) */}
                    {expandedBranches[group._id] && (
                      <div className="p-4 space-y-4 bg-white border-t border-gray-100 animate-fadeIn">
                        {group.items.map((item: any) => (
                          <div key={item._id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                            
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-lg">{item.productId.name}</h4>
                              
                              {item.variants && item.variants.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">VARIANTS:</p>
                                  <ul className="text-sm text-gray-700 space-y-0.5 mt-1">
                                    {(item.productId.variants as any[])?.map((v: any) => {
                                      const selection = item.variants?.find((sv: any) => sv.variantId === (v._id || v));
                                      if (!selection) return null;
                                      const option = v.options?.find((o: any) => o._id === selection.optionId);
                                      return (
                                        <li key={v._id || v} className="flex items-center gap-2">
                                          <span className="text-gray-400">•</span> 
                                          <span className="font-medium">{v.name}:</span> {option?.value || option?.name || selection.optionId}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              )}
                              
                              {item.modifiers && item.modifiers.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">MODIFIERS:</p>
                                  <ul className="text-sm text-gray-700 space-y-0.5 mt-1">
                                    {(item.productId.modifiers as any[])?.map((m: any) => {
                                      const selections = item.modifiers?.filter((sm: any) => sm.modifierId === (m._id || m)) || [];
                                      if (selections.length === 0) return null;
                                      return (
                                        <li key={m._id || m} className="flex items-start gap-2">
                                          <span className="text-gray-400 mt-1">•</span> 
                                          <div>
                                            <span className="font-medium">{m.name}:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {selections.map((s: any) => {
                                                const option = m.options?.find((o: any) => o._id === s.optionId);
                                                return (
                                                  <span key={s.optionId} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                    {option?.value || option?.name || s.optionId}
                                                  </span>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              )}
                              
                              <p className="text-lg font-black text-gray-900 mt-4">KES {item.priceAtAddition.toFixed(2)}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gag-y-2 ">

                              <div className="flex items-center justify-between gap-3 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
                                <button 
                                  onClick={() => updateQuantity.mutate({ branchId: group.branchId._id, cartItemId: item._id, quantity: Math.max(1, item.quantity - 1) })}
                                  className="h-8 w-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-500 font-bold transition-colors"
                                >-</button>
                                <span className="font-bold w-6 text-center text-gray-900">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity.mutate({ branchId: group.branchId._id, cartItemId: item._id, quantity: item.quantity + 1 })}
                                  className="h-8 w-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-500 font-bold transition-colors"
                                >+</button>
                              </div>

                              <button 
                                  onClick={() => removeCartItem.mutate({ branchId: group.branchId._id, cartItemId: item._id })}
                                  className="h-10 w-10 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <HiOutlineTrash size={20} />
                              </button>

                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="w-full">
        <button 
          onClick={() => clearCart.mutate()}
          className="flex items-center gap-2 justify-center w-full text-red-500 border border-red-500 rounded-md px-4 py-3 cursor-pointer"
          disabled={clearCart.isPending}
        >
          <HiOutlineTrash size={20} />
          Clear All Items
        </button>
      </div>
    </div>
  );
};

export default Cart;
