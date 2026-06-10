import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdConfirmationNumber, MdEvent, MdEmail, MdPhone, MdPerson, MdQrCode, MdFileDownload } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetTicket } from '../../../tanstack/useTickets';
import StatusBadge from '../../../components/ui/StatusBadge';

/**
 * Skeleton component for TicketDetail loading state
 */
const TicketDetailSkeleton = () => (
  <div className="p-6 animate-pulse">
    <div className="flex items-center gap-4 mb-8">
      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
      <div className="h-8 w-48 bg-gray-200 rounded"></div>
    </div>
    
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-24 w-full bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-24 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ticketData, isLoading, isError, error } = useGetTicket(id!);

  const ticket = (ticketData as any)?.ticket;

  if (isLoading) return <TicketDetailSkeleton />;

  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred fetching ticket details';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <FiAlertTriangle className="text-brand-accent" size={64} />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500 max-w-md">{errorMessage}</p>
        <button 
          onClick={() => navigate('/tickets')}
          className="btn-primary mt-4"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-gray-500">Ticket not found.</p>
        <button onClick={() => navigate('/tickets')} className="btn-utility mt-4">
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/tickets')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <MdArrowBack size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Details</h1>
        </div>

        <button 
          onClick={() => navigate(`/tickets/${ticket._id}/edit`)}
          className="btn-primary py-2 px-6 text-sm w-full sm:w-auto"
        >
          Update Status
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Status & ID Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm">
                <MdConfirmationNumber size={32} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ticket Number</p>
                <h2 className="text-2xl font-bold text-gray-900">{ticket.ticketNumber}</h2>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm font-medium text-gray-500">Current Status:</span>
              <StatusBadge status={ticket.status} type="ticket-status" className="text-base py-1.5 px-4" />
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MdPerson className="text-brand-primary" /> Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</p>
                <p className="text-gray-700 font-medium text-lg">{ticket.details.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <MdEmail size={12} /> Email Address
                </p>
                <p className="text-gray-700 font-medium">{ticket.details.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <MdPhone size={12} /> Phone Number
                </p>
                <p className="text-gray-700 font-medium">{ticket.details.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Booking Date</p>
                <p className="text-gray-700 font-medium">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Event & Location */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MdEvent className="text-brand-primary" /> Event Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Event Name</p>
                <p className="text-gray-700 font-medium text-lg">
                  {typeof ticket.event === 'object' && ticket.event !== null ? (ticket.event as any).name : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ticket Type</p>
                <p className="text-gray-700 font-medium uppercase">{ticket.type}</p>
              </div>
              {ticket.branch && (
                 <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Branch</p>
                  <p className="text-gray-700 font-medium">
                    {typeof ticket.branch === 'object' ? (ticket.branch as any).name : 'Branch ID: ' + ticket.branch}
                  </p>
                </div>
              )}
              {ticket.vendor && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vendor</p>
                  <p className="text-gray-700 font-medium">
                    {typeof ticket.vendor === 'object' ? (ticket.vendor as any).name : 'Vendor ID: ' + ticket.vendor}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info (QR/PDF) */}
        <div className="space-y-8">
          {/* QR Code */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 self-start">
              <MdQrCode className="text-brand-primary" /> QR Code
            </h3>
            {ticket.qrCodeData ? (
              <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300">
                <div className="bg-white p-4 flex items-center justify-center border border-gray-100 shadow-inner rounded-xl">
                  <img
                    src={ticket.qrCodeData}
                    alt="Ticket QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>
            ) : (
              <div className="h-48 w-full bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 italic text-sm">
                No QR code data available
              </div>
            )}
          </div>

          {/* PDF Download */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MdFileDownload className="text-brand-primary" /> Downloads
            </h3>
            {ticket.pdfUrl ? (
              <a 
                href={ticket.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-utility flex items-center justify-center gap-2 w-full py-4 text-brand-primary hover:bg-brand-primary/5 transition-colors border-2 border-brand-primary/20"
              >
                <MdFileDownload size={20} />
                <span>Download PDF Ticket</span>
              </a>
            ) : (
              <p className="text-gray-500 italic text-sm text-center">No PDF available for download</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
