import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { HiOutlineEye } from 'react-icons/hi';
import { FiSearch, FiFilter, FiAlertTriangle, FiList } from 'react-icons/fi';

import { useGetAppointments } from '../../../tanstack/useAppointments';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import type { IAppointment } from '../../../types/api.types';

const APPOINTMENT_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
];

const AppointmentList: React.FC = () => {
  const navigate = useNavigate();

  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /**
   * Debounce search input to reduce API calls
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /**
   * Build API params
   */
  const params = useMemo(() => {
    const apiParams: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (debouncedSearch.trim()) {
      apiParams.search = debouncedSearch.trim();
    }

    if (filterStatus !== 'all') {
      apiParams.status = filterStatus;
    }

    return apiParams;
  }, [debouncedSearch, filterStatus, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetAppointments(params);

  const appointments = data?.appointments || [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalAppointments: 0,
  };

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred while fetching appointments';

  const getCustomerName = (customer: any) => {
    if (typeof customer === 'object' && customer !== null) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown Customer';
    }
    return 'Unknown Customer';
  };

  const getBranchName = (branch: any) => {
    if (typeof branch === 'object' && branch !== null) {
      return branch.name || 'Unknown Branch';
    }
    return 'Unknown Branch';
  };

  const getCustomerInitials = (customer: any) => {
    if (typeof customer === 'object' && customer !== null) {
      const first = customer.firstName?.[0] || '';
      const last = customer.lastName?.[0] || '';
      return (first + last).toUpperCase() || '?';
    }
    return '?';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <header>
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer bookings and schedules
          </p>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by customer name or appointment number..."
                className="input-search"
              />
            </div>
          </div>

          <Link to="/appointments/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span>Add Appointment</span>
            <MdAdd size={24} />
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Showing {data?.pagination?.totalAppointments || 0} appointments</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterStatus}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Status</option>
                {APPOINTMENT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Items Per Page */}
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

      {/* Appointments Table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Customer</th>
              <th className="table-header-cell">Appointment #</th>
              <th className="table-header-cell">Branch</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Start Time</th>
              <th className="table-header-cell-right">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {/* Loading State */}
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
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </td>
                    <td className="table-cell">
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </td>
                    <td className="table-cell">
                      <div className="flex justify-end">
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Error State */}
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

            {/* Empty State */}
            {!isLoading && !isError && appointments.length === 0 && (
              <tr>
                <td colSpan={6} className="table-cell-center">
                  <p className="text-gray-500">No appointments found.</p>
                  {debouncedSearch || filterStatus !== 'all' ? (
                    <p className="mt-2 text-sm text-gray-400">Try adjusting your search or filters.</p>
                  ) : null}
                </td>
              </tr>
            )}

            {/* Data State */}
            {!isLoading && !isError && appointments.map((appointment: IAppointment) => (
              <tr key={appointment._id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-sm font-bold border border-brand-primary/20">
                      {getCustomerInitials(appointment.customer)}
                    </div>
                    <span className="font-medium text-gray-900">{getCustomerName(appointment.customer)}</span>
                  </div>
                </td>
                <td className="table-cell text-gray-700 font-mono text-xs">
                  {appointment.appointmentNumber}
                </td>
                <td className="table-cell text-gray-700">
                  {getBranchName(appointment.branch)}
                </td>
                <td className="table-cell">
                  <StatusBadge status={appointment.status} type="appointment-status" />
                </td>
                <td className="table-cell text-gray-700">
                  {new Date(appointment.overallStartTime).toLocaleString()}
                </td>
                <td className="table-cell text-right">
                  <button
                    onClick={() => navigate(`/appointments/${appointment._id}`)}
                    className="text-brand-primary hover:text-brand-primary/80 p-2 rounded-lg hover:bg-brand-primary/5 transition-colors"
                    title="View details"
                  >
                    <HiOutlineEye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && !isError && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalAppointments || 0}
            currentPageCount={appointments.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
