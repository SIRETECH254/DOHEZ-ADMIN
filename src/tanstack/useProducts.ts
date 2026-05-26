import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productAPI } from '../api';
import type { CreateProductPayload, UpdateProductPayload, GetProductsParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductPayload | FormData) => {
      const response = await productAPI.createProduct(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      console.log('Product created successfully');
    },
    onError: (error: any) => console.error('Error creating product:', error),
  });
};

// Get all products
export const useGetProducts = (params?: GetProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await productAPI.getProducts(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get product by ID
export const useGetProductById = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await productAPI.getProductById(productId);
      return response.data.data;
    },
    enabled: !!productId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: UpdateProductPayload | FormData }) => {
      const response = await productAPI.updateProduct(productId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      console.log('Product updated successfully');
    },
    onError: (error: any) => console.error('Error updating product:', error),
  });
};

// Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await productAPI.deleteProduct(productId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      console.log('Product deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting product:', error),
  });
};

// Update product SKU
export const useUpdateProductSKU = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, skuId, skuData }: { productId: string; skuId: string; skuData: any }) => {
      const response = await productAPI.updateProductSKU(productId, skuId, skuData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      console.log('Product SKU updated successfully');
    },
    onError: (error: any) => console.error('Error updating product SKU:', error),
  });
};
