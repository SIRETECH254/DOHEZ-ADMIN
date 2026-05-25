import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskAPI } from '../api';
import type { CreateTaskPayload, UpdateTaskPayload, GetTasksParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskData: CreateTaskPayload | FormData) => taskAPI.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useGetTasks = (params?: GetTasksParams) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const response = await taskAPI.getTasks(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useGetTaskById = (taskId: string) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await taskAPI.getTaskById(taskId);
      return response.data.data;
    },
    enabled: !!taskId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, taskData }: { taskId: string; taskData: UpdateTaskPayload | FormData }) =>
      taskAPI.updateTask(taskId, taskData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => taskAPI.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
