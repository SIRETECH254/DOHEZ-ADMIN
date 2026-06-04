import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { variantAPI } from '../api';
import type { CreateProductVariantPayload, UpdateProductVariantPayload, GetProductVariantsParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create product variant
export const useCreateProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductVariantPayload) => {
      const response = await variantAPI.createVariant(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVariants'] });
      console.log('Product variant created successfully');
    },
    onError: (error: any) => console.error('Error creating product variant:', error),
  });
};

// Get product variants
export const useGetProductVariants = (params?: GetProductVariantsParams) => {
  return useQuery({
    queryKey: ['productVariants', params],
    queryFn: async () => {
      const response = await variantAPI.getVariants(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get product variant by ID
export const useGetProductVariantById = (id: string) => {
  return useQuery({
    queryKey: ['productVariant', id],
    queryFn: async () => {
      const response = await variantAPI.getVariantById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update product variant
export const useUpdateProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductVariantPayload }) => {
      const response = await variantAPI.updateVariant(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productVariants'] });
      queryClient.invalidateQueries({ queryKey: ['productVariant', variables.id] });
      console.log('Product variant updated successfully');
    },
    onError: (error: any) => console.error('Error updating product variant:', error),
  });
};

// Delete product variant
export const useDeleteProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await variantAPI.deleteVariant(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVariants'] });
      console.log('Product variant deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting product variant:', error),
  });
};
