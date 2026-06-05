import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineTrash } from 'react-icons/hi';
import { FiShoppingCart } from 'react-icons/fi';
import { useGetCart, useRemoveCartItem, useUpdateCartQuantity } from '../../../tanstack/useCart';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { data: cartData, isLoading } = useGetCart();
  const removeCartItem = useRemoveCartItem();
  const updateQuantity = useUpdateCartQuantity();

  if (isLoading) return <div className="p-6 text-gray-500">Loading cart...</div>;

  const cart = cartData?.cart;

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

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
        {cart.cartGroups.map((group: any) => (
          <div key={group._id} className="space-y-4">
            <h3 className="font-bold text-gray-900">{(group.vendorId as any).name} - {(group.branchId as any).name}</h3>
            {group.items.map((item: any) => (
              <div key={item._id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{(item.productId as any).name}</h4>
                  {item.variants && item.variants.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Variants: {item.variants.map((v: any) => v.optionId).join(', ')}
                    </div>
                  )}
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Modifiers: {item.modifiers.map((m: any) => m.optionId).join(', ')}
                    </div>
                  )}
                  <p className="text-sm text-gray-500">${item.priceAtAddition.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => updateQuantity.mutate({ branchId: (group.branchId as any)._id, cartItemId: item._id, quantity: Math.max(1, item.quantity - 1) })}
                    className="h-8 w-8 rounded-lg bg-gray-100"
                  >-</button>
                  <span className="font-bold">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity.mutate({ branchId: (group.branchId as any)._id, cartItemId: item._id, quantity: item.quantity + 1 })}
                    className="h-8 w-8 rounded-lg bg-gray-100"
                  >+</button>
                </div>
                <button 
                    onClick={() => removeCartItem.mutate({ branchId: (group.branchId as any)._id, cartItemId: item._id })}
                    className="text-red-500 p-2"
                >
                  <HiOutlineTrash />
                </button>
              </div>
            ))}
            <div className="text-right font-bold text-brand-primary">Subtotal: ${group.groupSubtotal.toFixed(2)}</div>
          </div>
        ))}
        <div className="pt-6 border-t border-gray-100 flex justify-between items-center text-xl font-black">
            <span>Total:</span>
            <span>${cart.totalCartValue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default Cart;
