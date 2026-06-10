import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdConfirmationNumber } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetTicket, useUpdateTicket } from '../../../tanstack/useTickets';
import StatusBadge from '../../../components/ui/StatusBadge';

const EditTicket: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ticketData, isLoading, isError, error } = useGetTicket(id!);
  const updateTicket = useUpdateTicket();

  const ticket = (ticketData as any)?.ticket;
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
    }
  }, [ticket]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !status) return;

    updateTicket.mutate({ 
      ticketId: id, 
      ticketData: { status: status as any } 
    }, {
      onSuccess: () => navigate('/tickets')
    });
  }, [id, status, updateTicket, navigate]);

  if (isLoading) return <div className="p-6 animate-pulse">Loading ticket...</div>;

  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred fetching ticket';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <FiAlertTriangle className="text-brand-accent" size={64} />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500 max-w-md">{errorMessage}</p>
        <button onClick={() => navigate('/tickets')} className="btn-primary mt-4">Back to Tickets</button>
      </div>
    );
  }

  if (!ticket) return <div className="p-6 text-center py-20">Ticket not found.</div>;

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/tickets')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <MdArrowBack size={24} className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Update Ticket Status</h1>
      </div>

      <div className="max-w-2xl bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
        {/* Ticket Info Summary */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <MdConfirmationNumber size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ticket Number</p>
            <p className="text-lg font-bold text-gray-900">{ticket.ticketNumber}</p>
          </div>
          <div className="ml-auto">
            <StatusBadge status={ticket.status} type="ticket-status" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="status" className="label text-base font-semibold text-gray-700">Select New Status</label>
            <p className="text-sm text-gray-500 mb-4">Update the current lifecycle state of this ticket.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['PENDING', 'BOOKED', 'CANCELLED', 'USED', 'EXPIRED'].map((s) => (
                <label 
                  key={s} 
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    status === s 
                      ? 'border-brand-primary bg-brand-primary/5 shadow-sm' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="status" 
                      value={s} 
                      checked={status === s}
                      onChange={(e) => setStatus(e.target.value)}
                      className="auth-checkbox h-5 w-5"
                    />
                    <span className="font-semibold text-gray-700">{s}</span>
                  </div>
                  <StatusBadge status={s} type="ticket-status" />
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              className="btn-primary flex-1" 
              disabled={updateTicket.isPending || status === ticket.status}
            >
              {updateTicket.isPending ? 'Updating...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/tickets')} 
              className="btn-utility flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTicket;
