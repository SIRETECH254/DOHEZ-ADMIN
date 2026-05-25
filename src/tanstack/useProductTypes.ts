import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productTypeAPI } from '../api';
import type { CreateProductTypePayload, UpdateProductTypePayload, GetProductTypesParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useCreateProductType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductTypePayload | FormData) => productTypeAPI.createProductType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productTypes'] });
    },
  });
};

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

export const useUpdateProductType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductTypePayload | FormData }) =>
      productTypeAPI.updateProductType(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productTypes'] });
      queryClient.invalidateQueries({ queryKey: ['productType', variables.id] });
    },
  });
};

export const useDeleteProductType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productTypeAPI.deleteProductType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productTypes'] });
    },
  });
};
