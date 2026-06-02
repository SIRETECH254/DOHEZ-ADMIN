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

export type BadgeType = 'user-role' | 'user-status' | 'verified-status' | 'system-role' | 'task-status' | 'service-status' | 'vendor-type-status';

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

    if (badgeType === 'task-status' || badgeType === 'service-status') {
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

    if (badgeType === 'task-status' || badgeType === 'service-status') {
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
