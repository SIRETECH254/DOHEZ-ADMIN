import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const CreateRole: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/roles')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <HiOutlineArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create New Role</h1>
          <p className="text-sm text-gray-500">Add a new role to the system</p>
        </div>
      </header>

      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 italic">Create role form placeholder...</p>
      </div>
    </div>
  );
};

export default CreateRole;
