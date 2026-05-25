import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { branchAPI } from '../api';
import type { CreateBranchPayload, UpdateBranchPayload, GetBranchesParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBranchPayload) => branchAPI.createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
};

export const useGetBranches = (params?: GetBranchesParams) => {
  return useQuery({
    queryKey: ['branches', params],
    queryFn: async () => {
      const response = await branchAPI.getBranches(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useGetBranchById = (branchId: string) => {
  return useQuery({
    queryKey: ['branch', branchId],
    queryFn: async () => {
      const response = await branchAPI.getBranchById(branchId);
      return response.data.data;
    },
    enabled: !!branchId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, data }: { branchId: string; data: UpdateBranchPayload | FormData }) =>
      branchAPI.updateBranch(branchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch', variables.branchId] });
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branchId: string) => branchAPI.deleteBranch(branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
};
