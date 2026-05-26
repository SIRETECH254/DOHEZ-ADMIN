import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productTypeAPI } from '../api';
import type { CreateProductTypePayload, UpdateProductTypePayload, GetProductTypesParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create product type
export const useCreateProductType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductTypePayload | FormData) => {
      const response = await productTypeAPI.createProductType(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productTypes'] });
      console.log('Product type created successfully');
    },
    onError: (error: any) => console.error('Error creating product type:', error),
  });
};

// Get product types
export const useGetProductTypes = (params?: GetProductTypesParams) => {
  return useQuery({
    queryKey: ['productTypes', params],
    queryFn: async () => {
      const response = await productTypeAPI.getProductTypes(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get product type by ID
export const useGetProductTypeById = (id: string) => {
  return useQuery({
    queryKey: ['productType', id],
    queryFn: async () => {
      const response = await productTypeAPI.getProductTypeById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update product type
export const useUpdateProductType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductTypePayload | FormData }) => {
      const response = await productTypeAPI.updateProductType(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productTypes'] });
      queryClient.invalidateQueries({ queryKey: ['productType', variables.id] });
      console.log('Product type updated successfully');
    },
    onError: (error: any) => console.error('Error updating product type:', error),
  });
};

// Delete product type
export const useDeleteProductType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productTypeAPI.deleteProductType(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productTypes'] });
      console.log('Product type deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting product type:', error),
  });
};
