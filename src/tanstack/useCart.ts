import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartAPI } from '../api';
import type { AddToCartPayload, UpdateCartQuantityPayload, RemoveCartItemPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get cart
export const useGetCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await cartAPI.getCart();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Add to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddToCartPayload) => {
      const response = await cartAPI.addToCart(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      console.log('Item added to cart successfully');
    },
    onError: (error: any) => console.error('Error adding to cart:', error),
  });
};

// Update cart quantity
export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateCartQuantityPayload) => {
      const response = await cartAPI.updateQuantity(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      console.log('Cart quantity updated successfully');
    },
    onError: (error: any) => console.error('Error updating cart quantity:', error),
  });
};

// Remove cart item
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RemoveCartItemPayload) => {
      const response = await cartAPI.removeItem(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      console.log('Item removed from cart successfully');
    },
    onError: (error: any) => console.error('Error removing item from cart:', error),
  });
};

// Clear cart
export const useClearCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await cartAPI.clearCart();
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      console.log('Cart cleared successfully');
    },
    onError: (error: any) => console.error('Error clearing cart:', error),
  });
};
