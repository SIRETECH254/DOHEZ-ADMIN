import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdEdit } from 'react-icons/md';
import { 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineOfficeBuilding, 
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineClipboardList,
  HiOutlineCurrencyDollar
} from 'react-icons/hi';
import { useGetLaundryById } from '../../../tanstack/useLaundries';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatCurrency } from '../../../utils';

const LaundryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: laundryData, isLoading } = useGetLaundryById(id || '');

  const laundry = laundryData?.laundry

  const laundryServices = laundry?.services || [];

  


  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Loading laundry details...</div>;
  }

  if (!laundry) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500 mb-4">Laundry booking not found.</p>
        <button onClick={() => navigate('/laundries')} className="btn-primary">Back to List</button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/laundries')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MdArrowBack size={24} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laundry Details</h1>
            <p className="text-sm text-gray-500">#{laundry.laundryNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => navigate(`/laundries/${laundry._id}/edit`)}
            className="btn-secondary flex items-center gap-2 flex-1 sm:flex-none"
          >
            <MdEdit /> Edit Booking
          </button>
          <StatusBadge status={laundry.status} type="laundry-status" className="py-2 px-4 text-sm" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Location Info */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 text-brand-primary border-b pb-4">
              <HiOutlineUser size={20} />
              <h2 className="font-bold uppercase text-xs tracking-wider">Customer Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-lg">
                  {laundry.customer?.firstName?.[0]}{laundry.customer?.lastName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{laundry.customer?.firstName} {laundry.customer?.lastName}</p>
                  <p className="text-xs text-gray-500">Customer ID: {laundry.customer?._id?.substring(0, 8)}...</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HiOutlineMail className="text-gray-400" /> {laundry.customer?.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HiOutlinePhone className="text-gray-400" /> {laundry.customer?.phone}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 text-brand-primary border-b pb-4">
              <HiOutlineLocationMarker size={20} />
              <h2 className="font-bold uppercase text-xs tracking-wider">Pickup & Branch</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Pickup Address</p>
                  <div className="flex items-start gap-2">
                    <HiOutlineLocationMarker className="text-brand-primary mt-0.5" />
                    <p className="text-sm text-gray-700">{laundry.location?.address}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Date</p>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <HiOutlineCalendar className="text-gray-400" /> {new Date(laundry.pickUpDate?.day).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Time</p>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <HiOutlineClock className="text-gray-400" /> {laundry.pickUpDate?.hour}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 border-l pl-6 border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Service Provider</p>
                  <div className="flex items-center gap-2 text-sm text-gray-900 font-semibold">
                    <HiOutlineOfficeBuilding className="text-gray-400" /> {laundry.vendor?.name}
                  </div>
                  <p className="text-xs text-gray-500 ml-6">{laundry.branch?.name}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-brand-primary border-b pb-4">
              <HiOutlineClipboardList size={20} />
              <h2 className="font-bold uppercase text-xs tracking-wider">Requested Services</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {laundryServices.map((service: any) => (
                <div key={service._id} className="py-3 flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{service.name}</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(service.price)}</span>
                </div>
              ))}
              {laundryServices.length === 0 && (
                <p className="py-4 text-center text-gray-400 text-sm italic">No service details found.</p>
              )}
            </div>
          </section>
        </div>

        {/* Payment Summary */}
        <div className="space-y-6">
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 text-brand-primary border-b pb-4">
              <HiOutlineCurrencyDollar size={20} />
              <h2 className="font-bold uppercase text-xs tracking-wider">Payment Status</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Booking Fee</span>
                <span className="text-sm font-bold text-green-600">PAID</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Amount Paid</span>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(laundry.bookingFee)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-dashed">
                <span className="text-sm font-bold text-gray-900">Remaining Balance</span>
                <span className="text-lg font-black text-brand-primary">{formatCurrency(laundry.remainingAmount)}</span>
              </div>
              <button 
                onClick={() => navigate(`/payment/laundry?laundryId=${laundry._id}&amount=${laundry.remainingAmount}&phone=${laundry.customer?.phone}`)}
                className="w-full btn-primary py-3"
                disabled={laundry.remainingAmount === 0}
              >
                {laundry.remainingAmount === 0 ? 'Fully Paid' : 'Pay Balance Now'}
              </button>
            </div>
          </section>

          <section className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Metadata</h3>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Created</span>
                <span className="text-gray-600">{new Date(laundry.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Last Updated</span>
                <span className="text-gray-600">{new Date(laundry.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LaundryDetail;
