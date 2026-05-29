import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetTaskById } from '../../../tanstack/useTasks';
import StatusBadge from '../../../components/ui/StatusBadge';

/**
 * Skeleton component for TaskDetail loading state
 */
const TaskDetailSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
    </header>

    <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="h-32 w-32 rounded-3xl bg-gray-200"></div>
        <div className="space-y-4 flex-1">
          <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-20 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { data: task, isLoading, isError, error } = useGetTaskById(taskId!);

  if (isLoading) return <TaskDetailSkeleton />;
  
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'Failed to load task';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <FiAlertTriangle className="text-brand-accent" size={64} />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500 max-md">{errorMessage}</p>
        <button onClick={() => navigate('/tasks')} className="btn-primary mt-4">Back to Tasks</button>
      </div>
    );
  }

  if (!task) return <div className="p-6 text-gray-500 text-center">Task not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/tasks')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <HiOutlineArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{task.name}</h1>
            <p className="text-sm text-gray-500">ID: {task._id}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/tasks/${taskId}/edit`)}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePencil size={20} />
          Edit Task
        </button>
      </header>

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          {task.image ? (
            <img src={task.image} alt={task.name} className="h-48 w-48 rounded-3xl object-cover shadow-md" />
          ) : (
            <div className="h-48 w-48 rounded-3xl bg-brand-primary/5 flex items-center justify-center text-brand-primary text-4xl font-bold border border-brand-primary/10">
              {task.name ? task.name.substring(0, 2).toUpperCase() : 'TA'}
            </div>
          )}
          
          <div className="space-y-6 flex-1">
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h2>
              <p className="text-gray-900 leading-relaxed">
                {task.description || <span className="text-gray-400 italic">No description provided.</span>}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Status</h2>
                <StatusBadge status={task.isActive ? 'ACTIVE' : 'INACTIVE'} type="task-status" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Created At</h2>
                <p className="text-gray-900">{new Date(task.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
