import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { branchAPI } from '../api';
import type { CreateBranchPayload, UpdateBranchPayload, GetBranchesParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create branch
export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBranchPayload | FormData) => {
      const response = await branchAPI.createBranch(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      console.log('Branch created successfully');
    },
    onError: (error: any) => console.error('Error creating branch:', error),
  });
};

// Get branches
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

// Get branch by ID
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

// Update branch
export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, data }: { branchId: string; data: UpdateBranchPayload | FormData }) => {
      const response = await branchAPI.updateBranch(branchId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch', variables.branchId] });
      console.log('Branch updated successfully');
    },
    onError: (error: any) => console.error('Error updating branch:', error),
  });
};

// Delete branch
export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (branchId: string) => {
      const response = await branchAPI.deleteBranch(branchId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      console.log('Branch deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting branch:', error),
  });
};
