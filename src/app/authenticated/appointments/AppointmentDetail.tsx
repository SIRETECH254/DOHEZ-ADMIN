import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineClipboardCheck, HiOutlineScissors, HiOutlineUser } from 'react-icons/hi';
import { FiAlertTriangle, FiClock, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import { MdStore } from 'react-icons/md';
import { 
  useGetAppointmentById, 
  useCheckInAppointment, 
  useCompleteAppointment, 
  useCancelAppointment, 
  useMarkNoShowAppointment 
} from '../../../tanstack/useAppointments';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IAppointment, IUser, IVendor, IBranch } from '../../../types/api.types';
import { formatCurrency } from '../../../utils';

const AppointmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetAppointmentById(id || '');
  
  const checkIn = useCheckInAppointment();
  const complete = useCompleteAppointment();
  const cancel = useCancelAppointment();
  const markNoShow = useMarkNoShowAppointment();

  const appointment = data as IAppointment;
  const customer = appointment?.customer as unknown as IUser;
  const vendor = appointment?.vendor as unknown as IVendor;
  const branch = appointment?.branch as unknown as IBranch;

  const handleAction = async (action: () => Promise<any>, actionName: string) => {
    if (!id) return;
    try {
      await action();
    } catch (err) {
      console.error(`Failed to ${actionName}:`, err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 bg-gray-100 rounded-xl"></div>
            <div className="h-64 bg-gray-100 rounded-xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-100 rounded-xl"></div>
            <div className="h-48 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !appointment) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Appointment</h2>
          <p className="text-red-700">{(error as any)?.response?.data?.message || 'Could not find the requested appointment.'}</p>
          <button onClick={() => navigate('/appointments')} className="mt-4 btn-primary">
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  const isPending = appointment.status === 'PENDING';
  const isConfirmed = appointment.status === 'CONFIRMED';
  const isCompleted = appointment.status === 'COMPLETED';
  const isCancelled = appointment.status === 'CANCELLED';
  const isNoShow = appointment.status === 'NO_SHOW';

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/appointments')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <HiOutlineArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Appointment Details
        </h1>
      </div>

      {/* Actions Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
         <div>
           <p className="text-sm text-gray-500">
              Booked on {new Date(appointment.createdAt).toLocaleString()}
           </p>
           <div className="mt-1">
             <StatusBadge status={appointment.status} type="appointment-status" />
           </div>
         </div>
         <div className="flex flex-wrap items-center gap-3">
           {isPending && (
             <button 
              onClick={() => navigate(`/appointments/${appointment._id}/confirm`)}
              className="btn-primary px-8"
             >
               Confirm Appointment
             </button>
           )}
           {isCompleted && (appointment as any).paymentStatus !== 'PAID' && (
             <button 
              onClick={() => navigate(`/appointments/${appointment._id}/pay`)}
              className="btn-primary bg-blue-600 hover:bg-blue-700"
             >
               Pay
             </button>
           )}
           {!isCancelled && !isCompleted && !isNoShow && (
             <>
               {isConfirmed && !appointment.checkedInAt && (
                 <>
                   <button 
                    onClick={() => navigate(`/appointments/${appointment._id}/reschedule`)}
                    className="btn-secondary"
                   >
                     Reschedule
                   </button>
                   <button 
                    onClick={() => handleAction(() => checkIn.mutateAsync(appointment._id), 'check-in')}
                    disabled={checkIn.isPending}
                    className="btn-primary"
                   >
                     Check In
                   </button>
                 </>
               )}
               {(isConfirmed || appointment.checkedInAt) && (
                 <button 
                  onClick={() => handleAction(() => complete.mutateAsync(appointment._id), 'complete')}
                  disabled={complete.isPending}
                  className="btn-primary bg-green-600 hover:bg-green-700 border-none"
                 >
                   Complete
                 </button>
               )}
               {!isPending && (
                 <button 
                  onClick={() => handleAction(() => markNoShow.mutateAsync(appointment._id), 'mark no-show')}
                  disabled={markNoShow.isPending}
                  className="btn-secondary text-orange-600 border-orange-200 hover:bg-orange-50"
                 >
                   No Show
                 </button>
               )}
               <button 
                onClick={() => handleAction(() => cancel.mutateAsync(appointment._id), 'cancel')}
                disabled={cancel.isPending}
                className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
               >
                 Cancel
               </button>
             </>
           )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Main Info */}
        <div className="space-y-6">
          {/* Summary Section */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-2 text-brand-primary border-b border-gray-100 pb-4">
              <HiOutlineClipboardCheck size={24} />
              <h2 className="text-lg font-bold uppercase tracking-wider">
                Appointment Summary
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Appointment #</p>
                  <p className="text-sm font-semibold text-gray-900">{appointment.appointmentNumber}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Scheduled Time</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <FiCalendar className="text-brand-primary" />
                    {new Date(appointment.overallStartTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Status</p>
                  <div className="flex items-center gap-2">
                    <FiClock className="text-brand-primary" />
                    <span className="text-sm font-semibold text-gray-900">{appointment.status}</span>
                  </div>
               </div>
               {appointment.checkedInAt && (
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Checked In</p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                      <FiCheckCircle />
                      {new Date(appointment.checkedInAt).toLocaleTimeString()}
                    </div>
                 </div>
               )}
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Booking Fee</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(appointment.bookingFeeAmount)}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Remaining Balance</p>
                  <p className="text-sm font-bold text-brand-primary">{formatCurrency(appointment.remainingAmount)}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Total Value</p>
                  <p className="text-lg font-black text-gray-900">{formatCurrency(appointment.bookingFeeAmount + appointment.remainingAmount)}</p>
               </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-brand-primary border-b border-gray-100 pb-4">
              <HiOutlineScissors size={24} />
              <h2 className="text-lg font-bold uppercase tracking-wider">
                Service Items
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointment.items.map((item: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900">{item.service?.name || 'Service'}</p>
                      <p className="text-xs text-gray-500">{item.durationMinutes} mins</p>
                    </div>
                    <span className="font-bold text-brand-primary">{formatCurrency(item.amount)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-xs font-bold border border-gray-100 shadow-sm">
                      {item.staff?.firstName?.[0] || 'A'}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Assigned Staff</p>
                      <p className="text-xs font-semibold text-gray-700">{item.staff?.firstName || 'Any Available Staff'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-2 rounded-lg border border-gray-100">
                    <FiClock className="text-brand-primary" />
                    <span>{new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer & Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-2 text-brand-primary border-b border-gray-100 pb-4 mb-6">
              <HiOutlineUser size={24} />
              <h2 className="text-lg font-bold uppercase tracking-wider">Customer Details</h2>
            </div>
            {customer ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   {customer.avatar ? (
                     <img src={customer.avatar} alt="Avatar" className="h-16 w-16 rounded-3xl object-cover border-2 border-white shadow-md" />
                   ) : (
                     <div className="h-16 w-16 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-2xl border-2 border-white shadow-md">
                        {customer.firstName?.[0]}{customer.lastName?.[0]}
                     </div>
                   )}
                   <div>
                      <p className="text-lg font-bold text-gray-900">{customer.firstName} {customer.lastName}</p>
                      <p className="text-xs font-medium text-gray-500">ID: #{customer._id?.substring(customer._id.length - 6)}</p>
                   </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Email Address</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{customer.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Phone Number</p>
                    <p className="text-sm font-semibold text-gray-900">{customer.phone}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No customer information available</p>
            )}
          </div>

          {/* Location Info */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-2 text-brand-primary border-b border-gray-100 pb-4 mb-6">
              <MdStore size={24} />
              <h2 className="text-lg font-bold uppercase tracking-wider">Branch & Vendor</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Vendor</p>
                  <p className="text-sm font-bold text-gray-900">{vendor?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500 truncate">{vendor?.email}</p>
                </div>
                <div className="h-px bg-gray-50 w-full" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Branch</p>
                  <p className="text-sm font-bold text-gray-900">{branch?.name || 'N/A'}</p>
                  {branch?.location?.address && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{branch.location.address}</p>
                  )}
                  <p className="text-xs font-semibold text-brand-primary mt-1">{branch?.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;
