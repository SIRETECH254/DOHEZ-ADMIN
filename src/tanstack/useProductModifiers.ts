import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productModifierAPI } from '../api';
import type { CreateProductModifierPayload, UpdateProductModifierPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useCreateProductModifier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductModifierPayload) => productModifierAPI.createProductModifier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productModifiers'] });
    },
  });
};

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

export const useUpdateProductModifier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductModifierPayload }) =>
      productModifierAPI.updateProductModifier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productModifiers'] });
      queryClient.invalidateQueries({ queryKey: ['productModifier', variables.id] });
    },
  });
};

export const useDeleteProductModifier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productModifierAPI.deleteProductModifier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productModifiers'] });
    },
  });
};
