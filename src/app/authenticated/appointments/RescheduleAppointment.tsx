import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { 
  HiOutlineCalendar,
  HiOutlineExclamation,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineScissors
} from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { 
  useGetAppointmentById, 
  useRescheduleAppointment 
} from '../../../tanstack/useAppointments';
import { useGetAvailability } from '../../../tanstack/useAvailability';
import type { IAppointment, IScheduleOption, IUser, IVendor, IBranch } from '../../../types/api.types';

const RescheduleAppointment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: appointmentData, isLoading: isLoadingAppointment, isError: isErrorAppointment } = useGetAppointmentById(id || '');
  const rescheduleAppointment = useRescheduleAppointment();
  const getAvailability = useGetAvailability();

  const appointment = appointmentData as IAppointment;
  const customer = appointment?.customer as unknown as IUser;
  const vendor = appointment?.vendor as unknown as IVendor;
  const branch = appointment?.branch as unknown as IBranch;

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<IScheduleOption | null>(null);
  const [availabilityOptions, setAvailabilityOptions] = useState<IScheduleOption[]>([]);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Initialize date from appointment if available
  useEffect(() => {
    if (appointment?.overallStartTime) {
      setDate(new Date(appointment.overallStartTime).toISOString().split('T')[0]);
    }
  }, [appointment]);

  const fetchAvailability = useCallback(async () => {
    if (!appointment || !date) return;

    try {
      const serviceIds = appointment.items.map((item: any) => 
        typeof item.service === 'object' ? item.service._id : item.service
      );
      
      const payload = {
        date,
        branch: typeof appointment.branch === 'object' ? (appointment.branch as any)._id : appointment.branch,
        vendor: typeof appointment.vendor === 'object' ? (appointment.vendor as any)._id : appointment.vendor,
        items: serviceIds,
        // We can pass preferred staff from the existing appointment if we want to keep them, 
        // or let the user see all options. For now, let's just use the services.
      };
      
      const response = await getAvailability.mutateAsync(payload);
      const data = response?.scheduleOptions || [];
      setAvailabilityOptions(data);
      setSelectedSlot(null);
      
      if (data.length === 0) {
        setInlineError('No availability found for the selected date.');
      } else {
        setInlineError(null);
      }
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to fetch availability');
    }
  }, [appointment, date, getAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedSlot) return;

    try {
      const payload = {
        items: selectedSlot.items.map(item => ({
          serviceId: item.serviceId,
          staffId: item.staffId,
          startTime: item.startTime,
          endTime: item.endTime,
          amount: item.amount,
          durationMinutes: item.durationMinutes
        })),
      };

      await rescheduleAppointment.mutateAsync({ id, data: payload });
      navigate(`/appointments/${id}`);
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to reschedule appointment');
    }
  };

  if (isLoadingAppointment) {
    return (
      <div className="p-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="h-64 bg-gray-100 rounded-3xl"></div>
      </div>
    );
  }

  if (isErrorAppointment || !appointment) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Appointment</h2>
          <button onClick={() => navigate('/appointments')} className="mt-4 btn-primary">
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(`/appointments/${id}`)} className="flex items-center text-gray-500 mb-6 hover:text-brand-primary transition-colors group">
        <MdArrowBack className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Details
      </button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reschedule Appointment</h1>
        <p className="text-sm text-gray-500">Update the time slot for Appointment #{appointment.appointmentNumber}</p>
      </div>

      <div className="space-y-6">
        {/* Info Summary */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Current Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                {customer?.firstName?.[0]}{customer?.lastName?.[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{customer?.firstName} {customer?.lastName}</p>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Selected Services</p>
              {appointment.items.map((item: any, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <HiOutlineScissors className="text-brand-primary shrink-0" />
                  <span>{item.service?.name || 'Service'}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Location</p>
              <p className="text-sm font-semibold text-gray-900">{vendor?.name}</p>
              <p className="text-xs text-gray-500">{branch?.name}</p>
            </div>
          </div>
        </div>

        {/* Availability Selection */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6">
            {inlineError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3">
                <HiOutlineExclamation className="shrink-0 text-red-500" />
                {inlineError}
              </div>
            )}

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Select New Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-gray-900 w-full" 
                />
              </div>
              <button 
                type="button" 
                onClick={fetchAvailability}
                className="btn-primary py-2 px-4 text-xs"
                disabled={getAvailability.isPending}
              >
                {getAvailability.isPending ? 'Finding...' : 'Find Slots'}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Available Time Slots</h3>
              <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {getAvailability.isPending ? (
                  Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse bg-gray-50 rounded-2xl" />)
                ) : availabilityOptions.length > 0 ? (
                  availabilityOptions.map((slot, idx) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-start text-left w-full ${
                          isSelected ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:border-brand-primary/30'
                        }`}
                      >
                        <div className="w-full space-y-3">
                          <div className="flex items-center gap-2">
                             <HiOutlineCalendar className="text-brand-primary shrink-0" size={20} />
                             <span className="font-bold text-gray-900">
                               {new Date(slot.overallStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.overallEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                          
                          <div className="flex flex-col gap-2 w-full">
                            {slot.items.map((i, idx) => (
                              <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 space-y-1 w-full">
                                 <div className="flex items-center gap-2"><HiOutlineScissors size={14} className="text-gray-400" /> <span className="font-semibold text-gray-800">Service:</span> {i.serviceName}</div>
                                 <div className="flex items-center gap-2"><HiOutlineUser size={14} className="text-gray-400" /> <span className="font-semibold text-gray-800">Staff:</span> {i.staffName}</div>
                                 <div className="flex items-center gap-2"><HiOutlineClock size={14} className="text-gray-400" /> <span className="font-semibold text-gray-800">Duration:</span> {i.durationMinutes} mins</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                     <HiOutlineCalendar size={48} className="mx-auto mb-2 opacity-20" />
                     <p>Pick a date and click "Find Slots"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate(`/appointments/${id}`)}
                className="btn-secondary px-8"
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                className="btn-primary px-12 shadow-lg shadow-brand-primary/20" 
                disabled={rescheduleAppointment.isPending || !selectedSlot}
              >
                {rescheduleAppointment.isPending ? 'Rescheduling...' : 'Reschedule Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RescheduleAppointment;
