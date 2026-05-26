// Export all hooks from tanstack folder

// Auth hooks
export * from './useAuth';

// User hooks
export {
  useGetProfile,
  useUpdateProfile,
  useChangePassword,
  useGetNotificationPreferences,
  useUpdateNotificationPreferences,
  useAdminCreateUser,
  useGetStaff,
  useGetAllUsers,
  useGetUserById,
  useUpdateUser,
  useUpdateUserStatus,
  useSetUserAdmin,
  useGetUserRoles,
  useDeleteUser,
  useAssignRole,
  useRemoveRole
} from './useUsers';

// Role hooks
export {
  useGetAllRoles,
  useGetCustomers as useGetCustomersByRole,
  useGetRoleById,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useGetUsersByRole
} from './useRoles';

// Service hooks
export * from './useServices';

// Appointment hooks
export * from './useAppointments';

// Break hooks
export * from './useBreaks';

// Availability hooks
export * from './useAvailability';

// Payment hooks
export {
  useGetPayments,
  useGetPaymentById,
  usePayTicketInvoices,
  useConfirmAppointmentPayment,
  usePayAppointmentInvoice,
  usePayInvoice,
  useQueryMpesaStatus
} from './usePayments';

// Laundry hooks
export * from './useLaundries';

// Receipt hooks
export * from './useReceipts';

// Invoice hooks
export * from './useInvoices';

// Ticket hooks
export * from './useTickets';

// Task hooks
export * from './useTasks';

// Vendor Type hooks
export * from './useVendorTypes';

// Vendor Category hooks
export * from './useVendorCategories';

// Vendor hooks
export * from './useVendors';

// Branch hooks
export * from './useBranches';

// Product Type hooks
export * from './useProductTypes';

// Product Category hooks
export * from './useProductCategories';

// Product hooks
export * from './useProducts';

// Product Modifier hooks
export * from './useProductModifiers';

// Packaging hooks
export * from './usePackaging';

// Location hooks
export * from './useLocations';

// Cart hooks
export * from './useCart';

// Order hooks
export * from './useOrders';

// Coupon hooks
export * from './useCoupons';

// Address hooks
export * from './useAddresses';
