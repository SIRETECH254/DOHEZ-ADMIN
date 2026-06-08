import { useMemo } from 'react'

interface IUserNames {
  firstName?: string;
  lastName?: string;
}

/**
 * Helper to generate initials from a user object, names, or a single string.
 * @param data - Object containing firstName and lastName, or a single name string.
 * @returns The initials or 'U' as a fallback.
 */
export const getInitials = (data?: IUserNames | string) => {
  if (typeof data === 'string') {
    return data.substring(0, 2).toUpperCase() || 'U';
  }
  
  const initials = [data?.firstName, data?.lastName]
    .filter(Boolean)
    .map((value) => value?.[0]?.toUpperCase())
    .join('')
  return initials || 'U'
}

/**
 * Hook to generate initials from a user object or a string.
 * @param data - Object containing firstName and lastName, or a single name string.
 * @returns The initials or 'U' as a fallback.
 */
export const useInitials = (data?: IUserNames | string) => {
  return useMemo(() => getInitials(data), [
    typeof data === 'string' ? data : data?.firstName,
    typeof data === 'string' ? undefined : data?.lastName
  ])
}

/**
 * Formats a number as a currency string.
 * @param amount - The numeric amount to format.
 * @param currency - The currency code (default: 'KES').
 * @returns A formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

