import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productCategoryAPI } from '../api';
import type { CreateProductCategoryPayload, UpdateProductCategoryPayload, GetProductCategoriesParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductCategoryPayload | FormData) => productCategoryAPI.createProductCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
    },
  });
};

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

export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductCategoryPayload | FormData }) =>
      productCategoryAPI.updateProductCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      queryClient.invalidateQueries({ queryKey: ['productCategory', variables.id] });
    },
  });
};

export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productCategoryAPI.deleteProductCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
    },
  });
};
