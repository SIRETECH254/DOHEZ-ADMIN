/**
 * StatusBadge Component
 * 
 * A reusable badge component that displays user status with icons.
 * 
 * @component
 */

import React from 'react';
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiClock,
  FiUser,
  FiShield,
  FiHelpCircle,
} from 'react-icons/fi';

export type BadgeType = 'user-role' | 'user-status' | 'verified-status' | 'system-role' | 'task-status' | 'service-status' | 'packaging-status' | 'vendor-type-status' | 'vendor-category-status' | 'vendor-status' | 'product-status' | 'order-status' | 'payment-status' | 'invoice-status' | 'appointment-status' | 'ticket-status' | 'laundry-status' | 'coupon-status';

interface StatusBadgeProps {
  status: string | boolean;
  type: BadgeType;
  className?: string;
}

/**
 * StatusBadge component for displaying user status badges
 * 
 * @param status - The status string (e.g., 'ACTIVE', 'ADMIN', 'VERIFIED')
 * @param type - The type of badge
 * @param className - Optional additional className
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type,
  className = '',
}) => {
  const getIcon = (status: string | boolean, badgeType: BadgeType): React.ReactNode => {
    const upperStatus = typeof status === 'string' ? status.toUpperCase() : String(status).toUpperCase();

    switch (badgeType) {
      case 'user-role':
        switch (upperStatus) {
          case 'SUPER-ADMIN':
            return <FiShield className="h-3 w-3" />;
          case 'ADMIN':
            return <FiShield className="h-3 w-3" />;
          case 'VENDOR-ADMIN-BRANCH':
            return <FiShield className="h-3 w-3" />;
          case 'CUSTOMER':
            return <FiUser className="h-3 w-3" />;
          default:
            return <FiUser className="h-3 w-3" />;
        }

      case 'user-status':
        switch (upperStatus) {
          case 'ACTIVE':
            return <FiCheckCircle className="h-3 w-3" />;
          case 'INACTIVE':
            return <FiXCircle className="h-3 w-3" />;
          case 'SUSPENDED':
            return <FiAlertCircle className="h-3 w-3" />;
          case 'PENDING':
            return <FiClock className="h-3 w-3" />;
          default:
            return <FiHelpCircle className="h-3 w-3" />;
        }

      case 'verified-status':
        if (status === true || status === 'true' || upperStatus === 'VERIFIED' || upperStatus === 'YES') {
          return <FiCheckCircle className="h-3 w-3" />;
        }
        return <FiXCircle className="h-3 w-3" />;

      case 'system-role':
        if (status === true || status === 'true' || upperStatus === 'SYSTEM' || upperStatus === 'YES') {
          return <FiShield className="h-3 w-3" />;
        }
        return <FiUser className="h-3 w-3" />;

      case 'task-status':
      case 'service-status':
      case 'packaging-status':
      case 'vendor-type-status':
      case 'vendor-category-status':
      case 'vendor-status':
      case 'product-status':
        if (status === true || status === 'true' || upperStatus === 'ACTIVE' || upperStatus === 'YES') {
          return <FiCheckCircle className="h-3 w-3" />;
        }
        return <FiXCircle className="h-3 w-3" />;

      case 'order-status':
        switch (upperStatus) {
          case 'PLACED':
            return <FiClock className="h-3 w-3" />;
          case 'CONFIRMED':
            return <FiCheckCircle className="h-3 w-3" />;
          case 'PACKED':
          case 'SHIPPED':
            return <FiClock className="h-3 w-3" />;
          case 'OUT_FOR_DELIVERY':
            return <FiClock className="h-3 w-3" />;
          case 'DELIVERED':
            return <FiCheckCircle className="h-3 w-3" />;
          case 'CANCELLED':
          case 'REFUNDED':
            return <FiXCircle className="h-3 w-3" />;
          default:
            return <FiHelpCircle className="h-3 w-3" />;
        }

      case 'appointment-status':
        switch (upperStatus) {
          case 'PENDING':
            return <FiClock className="h-3 w-3" />;
          case 'CONFIRMED':
          case 'COMPLETED':
            return <FiCheckCircle className="h-3 w-3" />;
          case 'CANCELLED':
            return <FiXCircle className="h-3 w-3" />;
          case 'NO_SHOW':
            return <FiAlertCircle className="h-3 w-3" />;
          default:
            return <FiHelpCircle className="h-3 w-3" />;
        }

      case 'payment-status':
      case 'invoice-status':
        switch (upperStatus) {
          case 'PAID':
            return <FiCheckCircle className="h-3 w-3" />;
          case 'UNPAID':
          case 'CANCELLED':
            return <FiXCircle className="h-3 w-3" />;
          case 'PENDING':
            return <FiClock className="h-3 w-3" />;
          case 'PARTIAL':
          case 'PARTIALLY_REFUNDED':
          case 'REFUNDED':
            return <FiAlertCircle className="h-3 w-3" />;
          default:
            return <FiHelpCircle className="h-3 w-3" />;
        }

      case 'ticket-status':
        switch (upperStatus) {
          case 'PENDING':
            return <FiClock className="h-3 w-3" />;
          case 'BOOKED':
          case 'USED':
            return <FiCheckCircle className="h-3 w-3" />;
          case 'CANCELLED':
            return <FiXCircle className="h-3 w-3" />;
          case 'EXPIRED':
            return <FiAlertCircle className="h-3 w-3" />;
          default:
            return <FiHelpCircle className="h-3 w-3" />;
        }

      case 'laundry-status':
        switch (upperStatus) {
          case 'PENDING':
            return <FiClock className="h-3 w-3" />;
          case 'CONFIRMED':
            return <FiCheckCircle className="h-3 w-3" />;
          case 'PICKED_UP':
          case 'IN_PROGRESS':
            return <FiClock className="h-3 w-3" />;
          case 'COMPLETED':
          case 'DELIVERED':
            return <FiCheckCircle className="h-3 w-3" />;
          default:
            return <FiHelpCircle className="h-3 w-3" />;
        }

      case 'coupon-status':
        if (status === true || status === 'true' || upperStatus === 'ACTIVE' || upperStatus === 'YES') {
          return <FiCheckCircle className="h-3 w-3" />;
        }
        return <FiXCircle className="h-3 w-3" />;

      default:
        return <FiHelpCircle className="h-3 w-3" />;
    }
  };

  const getStatusVariant = (
    status: string | boolean,
    badgeType: BadgeType
  ): { bg: string; text: string; iconColor: string } => {
    const upperStatus = typeof status === 'string' ? status.toUpperCase() : String(status).toUpperCase();

    if (badgeType === 'user-role') {
      switch (upperStatus) {
        case 'SUPER-ADMIN':
          return {
            bg: 'bg-red-100',
            text: 'text-red-700',
            iconColor: '#DC2626',
          };
        case 'ADMIN':
          return {
            bg: 'bg-purple-100',
            text: 'text-purple-700',
            iconColor: '#7C3AED',
          };
        case 'VENDOR-ADMIN-BRANCH':
          return {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            iconColor: '#2563EB',
          };
        case 'CUSTOMER':
          return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            iconColor: '#16A34A',
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#4B5563',
          };
      }
    }

    if (badgeType === 'user-status') {
      switch (upperStatus) {
        case 'ACTIVE':
          return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            iconColor: '#16A34A',
          };
        case 'INACTIVE':
          return {
            bg: 'bg-red-100',
            text: 'text-red-700',
            iconColor: '#DC2626',
          };
        case 'SUSPENDED':
          return {
            bg: 'bg-red-100',
            text: 'text-red-700',
            iconColor: '#DC2626',
          };
        case 'PENDING':
          return {
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            iconColor: '#CA8A04',
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#4B5563',
          };
      }
    }

    if (badgeType === 'verified-status') {
      if (status === true || status === 'true' || upperStatus === 'VERIFIED' || upperStatus === 'YES') {
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          iconColor: '#16A34A',
        };
      }
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        iconColor: '#DC2626',
      };
    }

    if (badgeType === 'system-role') {
      if (status === true || status === 'true' || upperStatus === 'SYSTEM' || upperStatus === 'YES') {
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-700',
          iconColor: '#7C3AED',
        };
      }
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        iconColor: '#2563EB',
      };
    }

    if (badgeType === 'task-status' || badgeType === 'service-status' || badgeType === 'packaging-status' || badgeType === 'vendor-type-status' || badgeType === 'vendor-category-status' || badgeType === 'vendor-status' || badgeType === 'product-status' || badgeType === 'coupon-status') {
      if (status === true || status === 'true' || upperStatus === 'ACTIVE' || upperStatus === 'YES') {
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          iconColor: '#16A34A',
        };
      }
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        iconColor: '#DC2626',
      };
    }

    if (badgeType === 'laundry-status') {
      switch (upperStatus) {
        case 'PENDING':
          return { bg: 'bg-yellow-100', text: 'text-yellow-700', iconColor: '#CA8A04' };
        case 'CONFIRMED':
          return { bg: 'bg-indigo-100', text: 'text-indigo-700', iconColor: '#4F46E5' };
        case 'PICKED_UP':
          return { bg: 'bg-blue-100', text: 'text-blue-700', iconColor: '#2563EB' };
        case 'IN_PROGRESS':
          return { bg: 'bg-purple-100', text: 'text-purple-700', iconColor: '#7C3AED' };
        case 'COMPLETED':
          return { bg: 'bg-green-100', text: 'text-green-700', iconColor: '#16A34A' };
        case 'DELIVERED':
          return { bg: 'bg-teal-100', text: 'text-teal-700', iconColor: '#0D9488' };
        default:
          return { bg: 'bg-gray-100', text: 'text-gray-700', iconColor: '#4B5563' };
      }
    }

    if (badgeType === 'order-status') {
      switch (upperStatus) {
        case 'PLACED':
          return { bg: 'bg-blue-100', text: 'text-blue-700', iconColor: '#2563EB' };
        case 'CONFIRMED':
          return { bg: 'bg-indigo-100', text: 'text-indigo-700', iconColor: '#4F46E5' };
        case 'PACKED':
        case 'SHIPPED':
        case 'OUT_FOR_DELIVERY':
          return { bg: 'bg-yellow-100', text: 'text-yellow-700', iconColor: '#CA8A04' };
        case 'DELIVERED':
          return { bg: 'bg-green-100', text: 'text-green-700', iconColor: '#16A34A' };
        case 'CANCELLED':
        case 'REFUNDED':
          return { bg: 'bg-red-100', text: 'text-red-700', iconColor: '#DC2626' };
        default:
          return { bg: 'bg-gray-100', text: 'text-gray-700', iconColor: '#4B5563' };
      }
    }

    if (badgeType === 'appointment-status') {
      switch (upperStatus) {
        case 'PENDING':
          return { bg: 'bg-yellow-100', text: 'text-yellow-700', iconColor: '#CA8A04' };
        case 'CONFIRMED':
          return { bg: 'bg-indigo-100', text: 'text-indigo-700', iconColor: '#4F46E5' };
        case 'COMPLETED':
          return { bg: 'bg-green-100', text: 'text-green-700', iconColor: '#16A34A' };
        case 'CANCELLED':
          return { bg: 'bg-red-100', text: 'text-red-700', iconColor: '#DC2626' };
        case 'NO_SHOW':
          return { bg: 'bg-orange-100', text: 'text-orange-700', iconColor: '#EA580C' };
        default:
          return { bg: 'bg-gray-100', text: 'text-gray-700', iconColor: '#4B5563' };
      }
    }

    if (badgeType === 'payment-status' || badgeType === 'invoice-status') {
      switch (upperStatus) {
        case 'PAID':
          return { bg: 'bg-green-100', text: 'text-green-700', iconColor: '#16A34A' };
        case 'UNPAID':
        case 'CANCELLED':
          return { bg: 'bg-red-100', text: 'text-red-700', iconColor: '#DC2626' };
        case 'PENDING':
          return { bg: 'bg-yellow-100', text: 'text-yellow-700', iconColor: '#CA8A04' };
        case 'PARTIAL':
        case 'PARTIALLY_REFUNDED':
        case 'REFUNDED':
          return { bg: 'bg-orange-100', text: 'text-orange-700', iconColor: '#EA580C' };
        default:
          return { bg: 'bg-gray-100', text: 'text-gray-700', iconColor: '#4B5563' };
      }
    }

    if (badgeType === 'ticket-status') {
      switch (upperStatus) {
        case 'PENDING':
          return { bg: 'bg-yellow-100', text: 'text-yellow-700', iconColor: '#CA8A04' };
        case 'BOOKED':
          return { bg: 'bg-blue-100', text: 'text-blue-700', iconColor: '#2563EB' };
        case 'USED':
          return { bg: 'bg-green-100', text: 'text-green-700', iconColor: '#16A34A' };
        case 'CANCELLED':
          return { bg: 'bg-red-100', text: 'text-red-700', iconColor: '#DC2626' };
        case 'EXPIRED':
          return { bg: 'bg-gray-100', text: 'text-gray-700', iconColor: '#4B5563' };
        default:
          return { bg: 'bg-gray-100', text: 'text-gray-700', iconColor: '#4B5563' };
      }
    }


    return {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      iconColor: '#4B5563',
    };
  };

  const formatStatus = (status: string | boolean, badgeType: BadgeType): string => {
    if (badgeType === 'verified-status') {
      if (status === true || status === 'true' || String(status).toUpperCase() === 'VERIFIED' || String(status).toUpperCase() === 'YES') {
        return 'Verified';
      }
      return 'Not Verified';
    }

    if (badgeType === 'system-role') {
      if (status === true || status === 'true' || String(status).toUpperCase() === 'SYSTEM' || String(status).toUpperCase() === 'YES') {
        return 'System Role';
      }
      return 'Custom Role';
    }

    if (badgeType === 'task-status' || badgeType === 'service-status' || badgeType === 'packaging-status' || badgeType === 'vendor-type-status' || badgeType === 'vendor-category-status' || badgeType === 'vendor-status' || badgeType === 'product-status' || badgeType === 'coupon-status') {
      if (status === true || status === 'true' || String(status).toUpperCase() === 'ACTIVE' || String(status).toUpperCase() === 'YES') {
        return 'Active';
      }
      return 'Inactive';
    }

    const statusStr = typeof status === 'string' ? status : String(status);
    return statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase().replace(/_/g, ' ');
  };

  const variant = getStatusVariant(status, type);
  const icon = getIcon(status, type);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs whitespace-nowrap font-semibold ${variant.bg} ${variant.text} ${className}`}
    >
      <span style={{ color: variant.iconColor }}>{icon}</span>
      <span>{formatStatus(status, type)}</span>
    </span>
  );
};

export default StatusBadge;
