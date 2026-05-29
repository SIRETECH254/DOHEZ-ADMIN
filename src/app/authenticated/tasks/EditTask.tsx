import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useGetTaskById, useUpdateTask } from '../../../tanstack/useTasks';

const EditTask: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { data: task, isLoading, isError, error } = useGetTaskById(taskId!);
  const updateTask = useUpdateTask();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setForm({
        name: task.name || '',
        description: task.description || '',
        isActive: task.isActive,
      });
      setPreviewUrl(task.image || null);
    }
  }, [task]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setImage(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(task?.image || null);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!form.name) {
      setInlineError('Task name is required.');
      return;
    }

    let payload: FormData | typeof form;

    if (image) {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('isActive', String(form.isActive));
      formData.append('image', image);
      payload = formData;
    } else {
      payload = form;
    }

    try {
      await updateTask.mutateAsync({ taskId: taskId!, taskData: payload });
      navigate(`/tasks/${taskId}`);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update task';
      setInlineError(errorMessage);
    }
  }, [form, image, updateTask, taskId, navigate]);

  if (isLoading) return <div className="p-6 text-gray-500">Loading task data...</div>;
  if (isError) return <div className="p-6 text-red-500">Error: {(error as any)?.response?.data?.message || 'Failed to load task'}</div>;
  if (!task) return <div className="p-6 text-gray-500">Task not found.</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate(`/tasks/${taskId}`)} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors">
        <MdArrowBack className="mr-2" /> Back to Task Details
      </button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Task: {task.name}</h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 ">
        <form onSubmit={handleSubmit} className="space-y-6">
          {inlineError && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{inlineError}</div>}
          
          <div className="space-y-4">
            <label className="label">Task Image</label>
            <div className="flex items-center gap-4">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-20 w-20 rounded-full object-cover border" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xl font-bold border border-brand-primary/20">
                  {form.name ? form.name.substring(0, 2).toUpperCase() : 'TA'}
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange} 
                className="input" 
                accept="image/*"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="label">Task Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" required />
          </div>
          <div className="space-y-1">
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input min-h-[100px] py-3" />
          </div>
          <div className="space-y-1">
            <label className="label">Status</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
              <span className="ml-3 text-sm text-gray-700 font-medium">{form.isActive ? 'Active' : 'Inactive'}</span>
            </label>
          </div>
          <div className="pt-4 flex gap-4">
            <button type="submit" className="btn-primary flex-1" disabled={updateTask.isPending}>{updateTask.isPending ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" onClick={() => navigate(`/tasks/${taskId}`)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTask;
