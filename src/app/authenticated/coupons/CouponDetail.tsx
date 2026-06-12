import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTicket, HiOutlineCalendar, HiOutlineUsers, HiOutlineTag } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';
import { useGetCouponById } from '../../../tanstack/useCoupons';
import StatusBadge from '../../../components/ui/StatusBadge';

const CouponDetailSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white rounded-3xl h-[400px] border border-gray-100"></div>
      <div className="bg-white rounded-3xl h-[400px] border border-gray-100"></div>
    </div>
  </div>
);

const CouponDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: couponData, isLoading, isError, error } = useGetCouponById(id || '');
  const coupon = couponData?.coupon;

  if (isLoading) return <CouponDetailSkeleton />;
  
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'Failed to load coupon';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <FiAlertTriangle className="text-brand-accent" size={64} />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500 max-w-md">{errorMessage}</p>
        <button onClick={() => navigate('/coupons')} className="btn-primary mt-4">Back to Coupons</button>
      </div>
    );
  }

  if (!coupon) return <div className="p-6 text-gray-500 text-center">Coupon not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex sm:items-center flex-col sm:flex-row sm:justify-between gap-y-3">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/coupons')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <HiOutlineArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{coupon.name}</h1>
            <p className="text-sm text-gray-500 font-mono tracking-wider">{coupon.code}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/coupons/${id}/edit`)}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePencil size={20} />
          Edit Coupon
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Info & Discount */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="h-32 w-32 rounded-3xl bg-brand-primary/5 flex items-center justify-center text-brand-primary text-4xl font-bold border border-brand-primary/10 shadow-inner">
                {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : 'FIX'}
              </div>
              
              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Discount Type</h2>
                    <p className="text-gray-900 font-bold capitalize">{coupon.discountType}</p>
                  </div>
                  <div>
                    <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</h2>
                    <StatusBadge status={coupon.isActive} type="coupon-status" />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description</h2>
                  <p className="text-gray-900 leading-relaxed text-sm">
                    {coupon.description || <span className="text-gray-400 italic">No description provided.</span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Value</h3>
                <p className="text-lg font-bold text-brand-primary">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `KES ${coupon.discountValue}`}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Min Order</h3>
                <p className="text-lg font-bold text-gray-900">KES {coupon.minimumOrderAmount}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Max Discount</h3>
                <p className="text-lg font-bold text-gray-900">{coupon.maximumDiscountAmount ? `KES ${coupon.maximumDiscountAmount}` : 'Unlimited'}</p>
              </div>
            </div>
          </div>

          {/* Targets Section */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <HiOutlineTicket className="text-brand-primary" /> Application Targets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-tight">Products</h4>
                <div className="space-y-2">
                  {coupon.applicableProducts?.length > 0 ? (
                    coupon.applicableProducts.map((p: any, idx: number) => (
                      <div key={idx} className="px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-medium border border-green-100">
                        Applicable: {p.name || p}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">All products applicable</p>
                  )}
                  {coupon.excludedProducts?.map((p: any, idx: number) => (
                    <div key={idx} className="px-3 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-100">
                      Excluded: {p.name || p}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-tight">Categories</h4>
                <div className="space-y-2">
                  {coupon.applicableCategories?.length > 0 ? (
                    coupon.applicableCategories.map((c: any, idx: number) => (
                      <div key={idx} className="px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-medium border border-green-100">
                        Applicable: {c.name || c}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">All categories applicable</p>
                  )}
                  {coupon.excludedCategories?.map((c: any, idx: number) => (
                    <div key={idx} className="px-3 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-100">
                      Excluded: {c.name || c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Limits */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <HiOutlineUsers className="text-brand-primary" /> Usage Statistics
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-tight mb-1">Total Uses</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-brand-primary">{coupon.usedCount}</span>
                  <span className="text-xs text-gray-400">/ {coupon.hasUsageLimit ? coupon.usageLimit : '∞'}</span>
                </div>
                {coupon.hasUsageLimit && (
                  <div className="h-1.5 w-full bg-gray-100 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="h-full bg-brand-primary rounded-full" 
                      style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit!) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <HiOutlineCalendar className="text-brand-primary" /> Validity & Limits
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">First-time Only</span>
                <span className={`font-bold ${coupon.isFirstTimeOnly ? 'text-brand-primary' : 'text-gray-400'}`}>
                  {coupon.isFirstTimeOnly ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-50">
                <span className="text-gray-500">Has Expiry</span>
                <span className={`font-bold ${coupon.hasExpiry ? 'text-amber-600' : 'text-gray-400'}`}>
                  {coupon.hasExpiry ? 'Yes' : 'No'}
                </span>
              </div>
              {coupon.hasExpiry && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 mt-2">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight mb-1">Expiry Date</p>
                  <p className="text-sm font-bold text-amber-700">
                    {new Date(coupon.expiryDate!).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <HiOutlineTag className="text-brand-primary" /> Scope
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">Vendor</h4>
                <p className="text-sm font-bold text-gray-900">{(coupon.vendor as any)?.name || 'Global (All Vendors)'}</p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">Branch</h4>
                <p className="text-sm font-bold text-gray-900">{(coupon.branch as any)?.name || 'Global (All Branches)'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponDetail;

