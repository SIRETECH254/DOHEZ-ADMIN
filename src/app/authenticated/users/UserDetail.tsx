import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useGetUserById } from '../../../tanstack/useUsers';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IUser, IRole } from '../../../types/api.types';
import { getInitials } from '../../../utils';

// Detail page for viewing a specific user's information
export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetUserById(userId!);

  if (isLoading) return <div className="p-6">Loading user details...</div>;
  if (!data?.user) return <div className="p-6">User not found.</div>;

  const user: IUser = data.user;
  const initials = getInitials(user);

  return (
    <div className="p-6">
      <button onClick={() => navigate('/users')} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary">
        <MdArrowBack className="mr-2" /> Back to Users
      </button>
      <h1 className="text-2xl font-bold mb-6">User Details</h1>
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={`${user.firstName} ${user.lastName}`} 
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-4xl font-bold border-4 border-white shadow-md">
                {initials}
              </div>
            )}
          </div>

          <div className="space-y-4 flex-1">
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <div className="flex items-center gap-2">
              <strong>Roles:</strong>
              <div className="flex flex-wrap gap-1">
                {(user.roles as IRole[]).map((role: IRole) => (
                  <StatusBadge 
                    key={role._id} 
                    status={role.displayName || role.name} 
                    type="user-role" 
                  />
                ))}
              </div>
            </div>
            <p><strong>Status:</strong> <StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} type="user-status" /></p>
          </div>
        </div>
      </div>
    </div>
  );
}
