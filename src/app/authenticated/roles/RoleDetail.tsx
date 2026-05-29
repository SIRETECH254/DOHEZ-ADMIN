import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const RoleDetail: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
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
          <h1 className="text-2xl font-semibold text-gray-900">Role Details</h1>
          <p className="text-sm text-gray-500">ID: {roleId}</p>
        </div>
      </header>

      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 italic">Role details page content placeholder...</p>
      </div>
    </div>
  );
};

export default RoleDetail;
