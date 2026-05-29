import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useGetUserById, useUpdateUser } from '../../../tanstack/useUsers';

// Edit page for modifying a specific user's information
export default function EditUser() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetUserById(userId!);
  const updateUser = useUpdateUser();

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });

  useEffect(() => {
    if (data?.user) {
      setForm({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        phone: data.user.phone || '',
      });
    }
  }, [data]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    updateUser.mutate({ userId: userId!, data: form as any }, {
      onSuccess: () => navigate('/users')
    });
  }, [form, userId, updateUser, navigate]);

  if (isLoading) return <div className="p-6">Loading user...</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate('/users')} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary">
        <MdArrowBack className="mr-2" /> Back to Users
      </button>
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
        <input name="firstName" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} className="input" placeholder="First Name" />
        <input name="lastName" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} className="input" placeholder="Last Name" />
        <input name="phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input" placeholder="Phone" />
        <button type="submit" className="btn-primary">Save Changes</button>
      </form>
    </div>
  );
}
