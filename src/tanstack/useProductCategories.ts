import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productCategoryAPI } from '../api';
import type { CreateProductCategoryPayload, UpdateProductCategoryPayload, GetProductCategoriesParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create product category
export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductCategoryPayload | FormData) => {
      const response = await productCategoryAPI.createProductCategory(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      console.log('Product category created successfully');
    },
    onError: (error: any) => console.error('Error creating product category:', error),
  });
};

// Get product categories
export const useGetProductCategories = (params?: GetProductCategoriesParams) => {
  return useQuery({
    queryKey: ['productCategories', params],
    queryFn: async () => {
      const response = await productCategoryAPI.getProductCategories(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get product category by ID
export const useGetProductCategoryById = (id: string) => {
  return useQuery({
    queryKey: ['productCategory', id],
    queryFn: async () => {
      const response = await productCategoryAPI.getProductCategoryById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update product category
export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductCategoryPayload | FormData }) => {
      const response = await productCategoryAPI.updateProductCategory(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      queryClient.invalidateQueries({ queryKey: ['productCategory', variables.id] });
      console.log('Product category updated successfully');
    },
    onError: (error: any) => console.error('Error updating product category:', error),
  });
};

// Delete product category
export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productCategoryAPI.deleteProductCategory(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      console.log('Product category deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting product category:', error),
  });
};
