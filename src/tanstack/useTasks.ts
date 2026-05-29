import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskAPI } from '../api';
import type { CreateTaskPayload, UpdateTaskPayload, GetTasksParams } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Create task
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskData: CreateTaskPayload | FormData) => {
      const response = await taskAPI.createTask(taskData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      console.log('Task created successfully');
    },
    onError: (error: any) => console.error('Error creating task:', error),
  });
};

// Get tasks
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

// Get task by ID
export const useGetTaskById = (taskId: string) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await taskAPI.getTaskById(taskId);
      return response.data.data.task;
    },
    enabled: !!taskId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, taskData }: { taskId: string; taskData: UpdateTaskPayload | FormData }) => {
      const response = await taskAPI.updateTask(taskId, taskData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      console.log('Task updated successfully');
    },
    onError: (error: any) => console.error('Error updating task:', error),
  });
};

// Delete task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await taskAPI.deleteTask(taskId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      console.log('Task deleted successfully');
    },
    onError: (error: any) => console.error('Error deleting task:', error),
  });
};
