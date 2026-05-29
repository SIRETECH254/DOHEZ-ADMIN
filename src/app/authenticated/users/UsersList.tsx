import React, { useCallback ,useState,useMemo ,useEffect} from 'react';
import { useNavigate ,Link} from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { FiSearch ,FiFilter ,FiList ,FiAlertTriangle} from 'react-icons/fi';
import { useGetAllUsers, useDeleteUser } from '../../../tanstack/useUsers';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IUser, IRole }  from '../../../types/api.types';
import { getInitials } from '../../../utils';


const roles = [
  {
    name: 'super_admin',
    displayName: 'Super Admin',
    description: 'Complete system access and management.',
    isSystemRole: true,
    permissions: ['all'],
  },
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full business and user management.',
    isSystemRole: true,
    permissions: ['manage_users', 'manage_vendors', 'manage_orders'],
  },
  {
    name: 'vendor_admin',
    displayName: 'Vendor Administrator',
    description: 'Full management of vendor-specific data and branches.',
    isSystemRole: true,
    permissions: ['manage_vendor', 'manage_branches', 'manage_staff', 'manage_products'],
  },
  {
    name: 'branch_admin',
    displayName: 'Branch Administrator',
    description: 'Management of a specific branch and its operations.',
    isSystemRole: true,
    permissions: ['manage_branch', 'manage_branch_staff', 'manage_branch_orders'],
  },
  {
    name: 'staff',
    displayName: 'Staff',
    description: 'Internal operational access.',
    isSystemRole: true,
    permissions: ['view_orders', 'update_order_status'],
  },
  {
    name: 'rider',
    displayName: 'Delivery Rider',
    description: 'Access to delivery tasks and updates.',
    isSystemRole: true,
    permissions: ['view_assigned_orders', 'update_delivery_status'],
  },
  {
    name: 'customer',
    displayName: 'Customer',
    description: 'Standard end-user access.',
    isSystemRole: true,
    permissions: ['place_order', 'view_own_orders'],
  },
];

const UsersList: React.FC = () => {
  const navigate = useNavigate();
  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  
    /**
   * Debounce search input to reduce API calls
   * Updates debouncedSearch after 500ms of no typing
   */
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearch(searchTerm);
        // Reset to page 1 when search changes
        setCurrentPage(1);
      }, 500);
  
      return () => clearTimeout(timer);
    }, [searchTerm]);

      /**
   * Build API params from filters, search, and pagination
   * Memoized to prevent unnecessary API calls
   */
  const params = useMemo(() => {
    const apiParams: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Add search if provided
    if (debouncedSearch.trim()) {
      apiParams.search = debouncedSearch.trim();
    }

    // Add role filter if not "all"
    if (filterRole !== 'all') {
      apiParams.role = filterRole;
    }

    // Add status filter if not "all"
    if (filterStatus !== 'all') {
      apiParams.status = filterStatus === 'active' ? 'active' : 'inactive';
    }

    return apiParams;
  }, [debouncedSearch, filterRole, filterStatus, currentPage, itemsPerPage]);


  const { data, isLoading , isError ,error} = useGetAllUsers(params);


  const deleteUser = useDeleteUser();

  const users = data?.users || [];

  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

   /**
   * Open delete confirmation modal
   * Sets the user to delete and opens the modal
   */
   const handleDeleteClick = useCallback((userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteModalOpen(true);
  }, []);

  /**
   * Close delete confirmation modal
   * Clears the user to delete and closes the modal
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  }, []);

  /**
   * Confirm and execute user deletion
   * Calls the delete mutation and closes modal on success
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete) return;

    try {
      await deleteUser.mutateAsync(userToDelete.id);
      // Close modal on success
      setDeleteModalOpen(false);
      setUserToDelete(null);
      // Cache invalidation handled by mutation onSuccess
    } catch (deleteError) {
      // Error handling is done in mutation's onError callback
      console.error('Delete user error:', deleteError);
      // Keep modal open on error so user can retry
    }
  }, [userToDelete, deleteUser]);

  /**
   * Handle filter changes
   * Resets to page 1 when filters change
   */
  const handleRoleFilterChange = (value: string) => {
    setFilterRole(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  /**
   * Get error message from API response
   */
  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred';




  return (
    <div className="p-6 space-y-6">

     {/* Page header with title and Add User button */}
     <header className="">

      {/* title and description */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage user accounts and permissions
        </p>
      </div>

      {/* search Bar and Add button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Search input */}
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="input-search"
            />
          </div>
        </div>

        {/* Add user button */}
        <Link to="/users/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
          <span className="">Add User</span>
          <MdAdd size={24}/>
        </Link>

      </div>    

      {/* user count & filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* user count */}
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalUsers} users</p>
          </div>

          {/* filters */}
          <div className="flex flex-wrap gap-2">
            {/* Role filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterRole}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role.name} value={role.name}>
                    {role.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterStatus}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Items per page */}
            <div className="relative">
              <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
      </div>

     </header>
      
      {/* users table  */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Name</th>
              <th className="table-header-cell">Email</th>
              <th className="table-header-cell">Phone</th>
              <th className="table-header-cell">Roles</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell-right">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">

            {/* Loading state: skeleton rows */}
            {isLoading && (
              <>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="table-row animate-pulse">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Error state */}
            {isError && !isLoading && (
              <tr>
                <td colSpan={6} className="table-cell-center py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FiAlertTriangle className="text-brand-accent" size={48} />
                    <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && !isError && users.length === 0 && (
              <tr>
                <td colSpan={6} className="table-cell-center">
                  <p className="text-gray-500">No users found.</p>
                  {debouncedSearch || filterRole !== 'all' || filterStatus !== 'all' ? (
                    <p className="mt-2 text-sm text-gray-400">
                      Try adjusting your search or filters.
                    </p>
                  ) : null}
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
               users.map((user: IUser) => (
                  <tr key={user._id} className="table-row">
                    <td className="table-cell table-cell-text font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={`${user.firstName} ${user.lastName}`} 
                            className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-sm font-bold border border-brand-primary/20">
                            {getInitials(user)}
                          </div>
                        )}
                        <span>{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="table-cell table-cell-text">{user.email}</td>
                    <td className="table-cell table-cell-text">{user.phone}</td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role: IRole) => (
                          <StatusBadge 
                            key={role._id} 
                            status={role.displayName || role.name} 
                            type="user-role" 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="table-cell">
                      <StatusBadge 
                        status={user.isActive ? 'ACTIVE' : 'INACTIVE'} 
                        type="user-status" 
                      />
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/users/${user._id}`)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <HiOutlineEye size={20} />
                        </button>
                        <button 
                          onClick={() => navigate(`/users/${user._id}/edit`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <HiOutlinePencil size={20} />
                        </button>
                        <button 
                          type="button"
                          onClick={() =>
                            handleDeleteClick(user._id, `${user.firstName} ${user.lastName}`)
                          }
                          className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          title="Delete user"
                          disabled={deleteUser.isPending}
                        >
                          <HiOutlineTrash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
            ))}

          </tbody>
          
        </table>
      </div>

      {/* Pagination - separate from table container */}
      {!isLoading && !isError && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalUsers}
            currentPageCount={users.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={
          userToDelete
            ? `Are you sure you want to delete user "${userToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this user? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteUser.isPending}
      />

    </div>
  );
};

export default UsersList;
