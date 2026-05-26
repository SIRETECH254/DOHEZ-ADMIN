import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productModifierAPI } from '../api';
import type { CreateProductModifierPayload, UpdateProductModifierPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create product modifier
export const useCreateProductModifier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductModifierPayload) => {
      const response = await productModifierAPI.createProductModifier(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productModifiers'] });
      console.log('Product modifier created successfully');
    },
    onError: (error: any) => console.error('Error creating product modifier:', error),
  });
};

// Get product modifiers
export const useGetProductModifiers = () => {
  return useQuery({
    queryKey: ['productModifiers'],
    queryFn: async () => {
      const response = await productModifierAPI.getProductModifiers();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get product modifier by ID
export const useGetProductModifierById = (id: string) => {
  return useQuery({
    queryKey: ['productModifier', id],
    queryFn: async () => {
      const response = await productModifierAPI.getProductModifierById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update product modifier
export const useUpdateProductModifier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductModifierPayload }) => {
      const response = await productModifierAPI.updateProductModifier(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productModifiers'] });
      queryClient.invalidateQueries({ queryKey: ['productModifier', variables.id] });
      console.log('Product modifier updated successfully');
    },
    onError: (error: any) => console.error('Error updating product modifier:', error),
  });
};

// Delete product modifier
export const useDeleteProductModifier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productModifierAPI.deleteProductModifier(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productModifiers'] });
      console.log('Product modifier deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting product modifier:', error),
  });
};
