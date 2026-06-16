import { api } from './config';
import type {
  // Auth types
  RegisterPayload,
  LoginPayload,
  VerifyOTPPayload,
  ResendOTPPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  RefreshTokenPayload,
  // User types
  UpdateProfilePayload,
  ChangePasswordPayload,
  UpdateNotificationPreferencesPayload,
  AdminCreateUserPayload,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  AssignRolePayload,
  GetCustomersParams,
  GetUsersParams,
  // Role types
  CreateRolePayload,
  UpdateRolePayload,
  GetRolesParams,
  // Break types
  CreateBreakPayload,
  UpdateBreakPayload,
  // Ticket types
  UpdateTicketPayload,
  BookTicketPayload,
  // Receipt types
  PaginationParams,
  // Laundry types
  BookLaundryPayload,
  PayLaundryInvoicePayload,
  UpdateLaundryPayload,
  // Task types
  CreateTaskPayload,
  UpdateTaskPayload,
  GetTasksParams,
  // Service types
  CreateServicePayload,
  UpdateServicePayload,
  GetServicesParams,
  // Vendor Type types
  CreateVendorTypePayload,
  UpdateVendorTypePayload,
  GetVendorTypesParams,
  // Vendor Category types
  CreateVendorCategoryPayload,
  UpdateVendorCategoryPayload,
  GetVendorCategoriesParams,
  // Vendor types
  RegisterVendorPayload,
  UpdateVendorPayload,
  GetVendorsParams,
  // Branch types
  CreateBranchPayload,
  UpdateBranchPayload,
  GetBranchesParams,
  // Product Type types
  CreateProductTypePayload,
  UpdateProductTypePayload,
  GetProductTypesParams,
  // Product Category types
  CreateProductCategoryPayload,
  UpdateProductCategoryPayload,
  GetProductCategoriesParams,
  // Product types
  CreateProductPayload,
  CreateEventPayload,
  CreateServiceProductPayload,
  UpdateProductPayload,
  GetProductsParams,
  // Product Variant types
  CreateProductVariantPayload,
  UpdateProductVariantPayload,
  GetProductVariantsParams,
  // Product Modifier types
  CreateProductModifierPayload,
  UpdateProductModifierPayload,
  // Packaging types
  CreatePackagingPayload,
  UpdatePackagingPayload,
  // Appointment types
  CreateAppointmentPayload,
  AdminCreateAppointmentPayload,
  RescheduleAppointmentPayload,
  // Availability types
  GetAvailabilityPayload,
  // Cart types
  AddToCartPayload,
  UpdateCartQuantityPayload,
  RemoveCartItemPayload,
  // Order types
  CreateOrderPayload,
  AdminCreateOrderPayload,
  UpdateOrderStatusPayload,
  GetOrdersParams,
  // Coupon types
  CreateCouponPayload,
  UpdateCouponPayload,
  GetCouponsParams,
  ValidateCouponPayload,
  ApplyCouponPayload,
  // Address types
  CreateAddressPayload,
  UpdateAddressPayload,
} from '../types/api.types';

// ============================================
// Auth API
// ============================================
export const authAPI = {
  // Register a new user account.
  register: (userData: RegisterPayload) => api.post('/api/auth/register', userData),

  // Verify a one-time password (OTP) for authentication.
  verifyOTP: (otpData: VerifyOTPPayload) => api.post('/api/auth/verify-otp', otpData),

  // Request a new OTP for verification.
  resendOTP: (data: ResendOTPPayload) => api.post('/api/auth/resend-otp', data),

  // Login with credentials and receive tokens.
  login: (credentials: LoginPayload) => api.post('/api/auth/login-admin', credentials),

  // Logout the current session.
  logout: () => api.post('/api/auth/logout'),

  // Request a password reset email.
  forgotPassword: (data: ForgotPasswordPayload) => api.post('/api/auth/forgot-password', data),

  // Reset password using a token link.
  resetPassword: (token: string, data: ResetPasswordPayload) => api.post(`/api/auth/reset-password/${token}`, data),

  // Refresh access token using a refresh token.
  refreshToken: (data: RefreshTokenPayload) => api.post('/api/auth/refresh-token', data),

  // Fetch the current authenticated user profile.
  getMe: () => api.get('/api/auth/me'),
};

// ============================================
// User API
// ============================================
export const userAPI = {
  // Get current user profile
  getProfile: () => api.get('/api/users/profile'),

  // Update own profile
  updateProfile: (profileData: UpdateProfilePayload | FormData) =>
    profileData instanceof FormData
      ? api.put('/api/users/profile', profileData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put('/api/users/profile', profileData),

  // Change password
  changePassword: (passwordData: ChangePasswordPayload) => api.put('/api/users/change-password', passwordData),

  // Get notification preferences
  getNotificationPreferences: () => api.get('/api/users/notifications'),

  // Update notification preferences
  updateNotificationPreferences: (preferences: UpdateNotificationPreferencesPayload) => api.put('/api/users/notifications', preferences),

  // Admin create customer
  adminCreateUser: (userData: AdminCreateUserPayload) => api.post('/api/users/admin-create', userData),

  // Get customers (admin/staff)
  getCustomers: (params?: GetCustomersParams) => api.get('/api/users/customers', { params }),

  // Get staff (any authenticated user)
  getStaff: () => api.get('/api/users/staff'),

  // Get all users (admin)
  getAllUsers: (params?: GetUsersParams) => api.get('/api/users', { params }),

  // Get user by ID (admin)
  getUserById: (userId: string) => api.get(`/api/users/${userId}`),

  // Update user (admin)
  updateUser: (userId: string, userData: UpdateUserPayload | FormData) =>
    userData instanceof FormData
      ? api.put(`/api/users/${userId}`, userData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/users/${userId}`, userData),

  // Update user status (admin)
  updateUserStatus: (userId: string, statusData: UpdateUserStatusPayload) => api.put(`/api/users/${userId}/status`, statusData),

  // Set user admin role (admin)
  setUserAdmin: (userId: string) => api.put(`/api/users/${userId}/admin`),

  // Get user roles (admin)
  getUserRoles: (userId: string) => api.get(`/api/users/${userId}/roles`),

  // Delete user (admin)
  deleteUser: (userId: string) => api.delete(`/api/users/${userId}`),

  // Assign role to user (admin)
  assignRole: (userId: string, roleData: AssignRolePayload) => api.post(`/api/users/${userId}/roles`, roleData),

  // Remove role from user (admin)
  removeRole: (userId: string, roleId: string) => api.delete(`/api/users/${userId}/roles/${roleId}`),
};

// ============================================
// Payment API
// ============================================
export const paymentAPI = {
  // Get all payments (Admin)
  getPayments: (params?: any) => api.get('/api/payments', { params }),

  // Get single payment details (Admin)
  getPaymentById: (paymentId: string) => api.get(`/api/payments/${paymentId}`),

  // Pay ticket invoices
  payTicketInvoices: (data: { invoiceIds: string[], method: string, payerPhone: string }) => 
    api.post('/api/payments/tickets/pay', data),

  // Book laundry
  bookLaundry: (payload: BookLaundryPayload) => api.post('/api/payments/laundries/book', payload),

  // Pay laundry invoice
  payLaundryInvoice: (payload: PayLaundryInvoicePayload) => api.post('/api/payments/laundries/pay', payload),

  // Confirm appointment and initiate payment
  confirmAppointment: (appointmentId: string, data: { method: string, payerPhone: string }) =>
    api.post(`/api/payments/appointments/confirm/${appointmentId}`, data),

  // Book tickets
  bookTicket: (data: BookTicketPayload) => api.post('/api/payments/tickets/book', data),

  // Pay appointment invoice
  payAppointmentInvoice: (data: { appointmentId: string, method: string, payerPhone: string }) =>
    api.post('/api/payments/appointments/pay', data),

  // Initiate payment for an invoice
  payInvoice: (data: { invoiceId: string, method: string, amount: number, payerPhone: string }) =>
    api.post('/api/payments/pay', data),

  // M-Pesa webhook callback
  mpesaWebhook: (data: any) => api.post('/api/payments/webhooks/mpesa', data),

  // Query M-Pesa status
  queryMpesaByCheckoutId: (checkoutId: string) => api.get(`/api/payments/mpesa/${checkoutId}`),
};

// ============================================
// Receipt API
// ============================================
export const receiptAPI = {
  // Get all receipts
  getReceipts: (params?: any) => api.get('/api/receipts', { params }),

  // Get receipt by ID
  getReceiptById: (receiptId: string) => api.get(`/api/receipts/${receiptId}`),
};

// ============================================
// Invoice API
// ============================================
export const invoiceAPI = {
  // Create invoice
  createInvoice: (data: { orderId: string }) => api.post('/api/invoices', data),

  // List all invoices
  getInvoices: (params?: any) => api.get('/api/invoices', { params }),

  // Get invoice by ID
  getInvoiceById: (invoiceId: string) => api.get(`/api/invoices/${invoiceId}`),
};

// ============================================
// Ticket API
// ============================================
export const ticketAPI = {
  // Get all tickets
  getTickets: (params?: any) => api.get('/api/tickets', { params }),

  // Get ticket details
  getTicket: (ticketId: string) => api.get(`/api/tickets/${ticketId}`),

  // Update ticket
  updateTicket: (ticketId: string, ticketData: UpdateTicketPayload) =>
    api.put(`/api/tickets/${ticketId}`, ticketData),

  // Delete ticket
  deleteTicket: (ticketId: string) => api.delete(`/api/tickets/${ticketId}`),
};

// ============================================
// Break API
// ============================================
export const breakAPI = {
  // Create break
  createBreak: (breakData: CreateBreakPayload) => api.post('/api/breaks', breakData),

  // List breaks
  getBreaks: (params?: any) => api.get('/api/breaks', { params }),

  // Get break details
  getBreak: (breakId: string) => api.get(`/api/breaks/${breakId}`),

  // Update break
  updateBreak: (breakId: string, breakData: UpdateBreakPayload) => api.put(`/api/breaks/${breakId}`, breakData),

  // Delete break
  deleteBreak: (breakId: string) => api.delete(`/api/breaks/${breakId}`),
};

// ============================================
// Laundry API
// ============================================
export const laundryAPI = {
  // Get all laundries
  getLaundries: (params?: any) => api.get('/api/laundries', { params }),

  // Get single laundry
  getLaundry: (laundryId: string) => api.get(`/api/laundries/${laundryId}`),

  // Update laundry
  updateLaundry: (laundryId: string, laundryData: UpdateLaundryPayload) =>
    api.put(`/api/laundries/${laundryId}`, laundryData),

  // Delete laundry
  deleteLaundry: (laundryId: string) => api.delete(`/api/laundries/${laundryId}`),

  // Book laundry
  bookLaundry: (payload: BookLaundryPayload) => api.post('/api/payments/laundries/book', payload),

  // Pay laundry invoice
  payLaundryInvoice: (payload: PayLaundryInvoicePayload) => api.post('/api/payments/laundries/pay', payload),
};

// ============================================
// Role API
// ============================================
export const roleAPI = {
  // Get all roles
  getAllRoles: (params?: GetRolesParams) => api.get('/api/roles', { params }),

  // Get customers (admin)
  getCustomers: () => api.get('/api/roles/customer/users'),

  // Get single role
  getRole: (roleId: string) => api.get(`/api/roles/${roleId}`),

  // Create role
  createRole: (roleData: CreateRolePayload) => api.post('/api/roles', roleData),

  // Update role
  updateRole: (roleId: string, roleData: UpdateRolePayload) => api.put(`/api/roles/${roleId}`, roleData),

  // Delete role
  deleteRole: (roleId: string) => api.delete(`/api/roles/${roleId}`),

  // Get users by role
  getUsersByRole: (roleId: string, params?: PaginationParams) => api.get(`/api/roles/${roleId}/users`, { params }),
};

// ============================================
// Task API
// ============================================
export const taskAPI = {
  // Create a new task category
  createTask: (taskData: CreateTaskPayload | FormData) =>
    taskData instanceof FormData
      ? api.post('/api/tasks', taskData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/tasks', taskData),

  // Get all task categories
  getTasks: (params?: GetTasksParams) => api.get('/api/tasks', { params }),

  // Get single task details
  getTaskById: (taskId: string) => api.get(`/api/tasks/${taskId}`),

  // Update task details
  updateTask: (taskId: string, taskData: UpdateTaskPayload | FormData) =>
    taskData instanceof FormData
      ? api.put(`/api/tasks/${taskId}`, taskData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/tasks/${taskId}`, taskData),

  // Delete task category
  deleteTask: (taskId: string) => api.delete(`/api/tasks/${taskId}`),
};

// ============================================
// Service API
// ============================================
export const serviceAPI = {
  // Create a new service under a task category
  createService: (serviceData: CreateServicePayload | FormData) =>
    serviceData instanceof FormData
      ? api.post('/api/services', serviceData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/services', serviceData),

  // Get all services
  getServices: (params?: GetServicesParams) => api.get('/api/services', { params }),

  // Get single service details
  getServiceById: (serviceId: string) => api.get(`/api/services/${serviceId}`),

  // Update service details
  updateService: (serviceId: string, serviceData: UpdateServicePayload | FormData) =>
    serviceData instanceof FormData
      ? api.put(`/api/services/${serviceId}`, serviceData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/services/${serviceId}`, serviceData),

  // Delete service
  deleteService: (serviceId: string) => api.delete(`/api/services/${serviceId}`),
};

// ============================================
// Vendor Type API
// ============================================
export const vendorTypeAPI = {
  // Create a new vendor type
  createVendorType: (vendorTypeData: CreateVendorTypePayload | FormData) =>
    vendorTypeData instanceof FormData
      ? api.post('/api/vendor-types', vendorTypeData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/vendor-types', vendorTypeData),

  // Get all vendor types
  getVendorTypes: (params?: GetVendorTypesParams) => api.get('/api/vendor-types', { params }),

  // Get single vendor type details by ID or Slug
  getVendorTypeById: (idOrSlug: string) => api.get(`/api/vendor-types/${idOrSlug}`),

  // Update vendor type details
  updateVendorType: (vendorTypeId: string, vendorTypeData: UpdateVendorTypePayload | FormData) =>
    vendorTypeData instanceof FormData
      ? api.put(`/api/vendor-types/${vendorTypeId}`, vendorTypeData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/vendor-types/${vendorTypeId}`, vendorTypeData),

  // Delete vendor type
  deleteVendorType: (vendorTypeId: string) => api.delete(`/api/vendor-types/${vendorTypeId}`),
};

// ============================================
// Vendor Category API
// ============================================
export const vendorCategoryAPI = {
  // Create a new vendor category
  createVendorCategory: (categoryData: CreateVendorCategoryPayload | FormData) =>
    categoryData instanceof FormData
      ? api.post('/api/vendor-categories', categoryData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/vendor-categories', categoryData),

  // Get all vendor categories
  getVendorCategories: (params?: GetVendorCategoriesParams) => api.get('/api/vendor-categories', { params }),

  // Get single vendor category details by ID or Slug
  getVendorCategoryById: (idOrSlug: string) => api.get(`/api/vendor-categories/${idOrSlug}`),

  // Update vendor category details
  updateVendorCategory: (categoryId: string, categoryData: UpdateVendorCategoryPayload | FormData) =>
    categoryData instanceof FormData
      ? api.put(`/api/vendor-categories/${categoryId}`, categoryData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/vendor-categories/${categoryId}`, categoryData),

  // Delete vendor category
  deleteVendorCategory: (categoryId: string) => api.delete(`/api/vendor-categories/${categoryId}`),
};

// ============================================
// Vendor API
// ============================================
export const vendorAPI = {
  // Register a new vendor
  registerVendor: (vendorData: RegisterVendorPayload | FormData) =>
    vendorData instanceof FormData
      ? api.post('/api/vendors/register', vendorData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/vendors/register', vendorData),

  // Get all vendors
  getVendors: (params?: GetVendorsParams) => api.get('/api/vendors', { params }),

  // Get single vendor details
  getVendorById: (vendorId: string) => api.get(`/api/vendors/${vendorId}`),

  // Update vendor profile
  updateVendor: (vendorId: string, vendorData: UpdateVendorPayload | FormData) =>
    vendorData instanceof FormData
      ? api.put(`/api/vendors/${vendorId}`, vendorData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/vendors/${vendorId}`, vendorData),

  // Delete vendor
  deleteVendor: (vendorId: string) => api.delete(`/api/vendors/${vendorId}`),
};

// ============================================
// Branch API
// ============================================
export const branchAPI = {
  // Create a new branch
  createBranch: (branchData: CreateBranchPayload | FormData) =>
    branchData instanceof FormData
      ? api.post('/api/branches', branchData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/branches', branchData),

  // Get all branches
  getBranches: (params?: GetBranchesParams) => api.get('/api/branches', { params }),

  // Get single branch details
  getBranchById: (branchId: string) => api.get(`/api/branches/${branchId}`),

  // Update branch details
  updateBranch: (branchId: string, branchData: UpdateBranchPayload | FormData) =>
    branchData instanceof FormData
      ? api.put(`/api/branches/${branchId}`, branchData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/branches/${branchId}`, branchData),

  // Delete branch
  deleteBranch: (branchId: string) => api.delete(`/api/branches/${branchId}`),
};

// ============================================
// Product Type API
// ============================================
export const productTypeAPI = {
  // Create a new product type
  createProductType: (productTypeData: CreateProductTypePayload | FormData) =>
    productTypeData instanceof FormData
      ? api.post('/api/product-types', productTypeData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/product-types', productTypeData),

  // Get all product types
  getProductTypes: (params?: GetProductTypesParams) => api.get('/api/product-types', { params }),

  // Get single product type details
  getProductTypeById: (productTypeId: string) => api.get(`/api/product-types/${productTypeId}`),

  // Update product type details
  updateProductType: (productTypeId: string, productTypeData: UpdateProductTypePayload | FormData) =>
    productTypeData instanceof FormData
      ? api.put(`/api/product-types/${productTypeId}`, productTypeData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/product-types/${productTypeId}`, productTypeData),

  // Delete product type
  deleteProductType: (productTypeId: string) => api.delete(`/api/product-types/${productTypeId}`),
};

// ============================================
// Product Category API
// ============================================
export const productCategoryAPI = {
  // Create a new product category
  createProductCategory: (categoryData: CreateProductCategoryPayload | FormData) =>
    categoryData instanceof FormData
      ? api.post('/api/product-categories', categoryData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/product-categories', categoryData),

  // Get all product categories
  getProductCategories: (params?: GetProductCategoriesParams) => api.get('/api/product-categories', { params }),

  // Get single product category details
  getProductCategoryById: (categoryId: string) => api.get(`/api/product-categories/${categoryId}`),

  // Update product category details
  updateProductCategory: (categoryId: string, categoryData: UpdateProductCategoryPayload | FormData) =>
    categoryData instanceof FormData
      ? api.put(`/api/product-categories/${categoryId}`, categoryData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/product-categories/${categoryId}`, categoryData),

  // Delete product category
  deleteProductCategory: (categoryId: string) => api.delete(`/api/product-categories/${categoryId}`),
};

// ============================================
// Product API
// ============================================
export const productAPI = {
  // Create a new product
  createProduct: (productData: CreateProductPayload | FormData) =>
    productData instanceof FormData
      ? api.post('/api/products', productData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/products', productData),

  // Create a new event
  createEvent: (eventData: CreateEventPayload | FormData) =>
    eventData instanceof FormData
      ? api.post('/api/products/events', eventData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/products/events', eventData),

  // Create a new service product
  createService: (serviceData: CreateServiceProductPayload | FormData) =>
    serviceData instanceof FormData
      ? api.post('/api/products/services', serviceData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/products/services', serviceData),

  // Get all products
  getProducts: (params?: GetProductsParams) => api.get('/api/products', { params }),

  // Get single product details
  getProductById: (productId: string) => api.get(`/api/products/${productId}`),

  // Update product details
  updateProduct: (productId: string, productData: UpdateProductPayload | FormData) =>
    productData instanceof FormData
      ? api.put(`/api/products/${productId}`, productData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/api/products/${productId}`, productData),

  // Delete product
  deleteProduct: (productId: string) => api.delete(`/api/products/${productId}`),

  // Update product SKU
  updateProductSKU: (productId: string, skuId: string, skuData: any) =>
    api.put(`/api/products/${productId}/skus/${skuId}`, skuData),
};

// ============================================
// Product Variant API
// ============================================
export const variantAPI = {
  // Attach variant to product
  attach: (data: { productId: string; variantId: string }) =>
    api.post('/api/variants/attach', data),

  // Detach variant from product
  detach: (data: { productId: string; variantId: string }) =>
    api.post('/api/variants/detach', data),

  // Create a new variant
  createVariant: (variantData: CreateProductVariantPayload) =>
    api.post('/api/variants', variantData),

  // Get all variants
  getVariants: (params?: GetProductVariantsParams) =>
    api.get('/api/variants', { params }),

  // Get single variant details
  getVariantById: (variantId: string) =>
    api.get(`/api/variants/${variantId}`),

  // Update variant details
  updateVariant: (variantId: string, variantData: UpdateProductVariantPayload) =>
    api.put(`/api/variants/${variantId}`, variantData),

  // Delete variant
  deleteVariant: (variantId: string) =>
    api.delete(`/api/variants/${variantId}`),
};

// ============================================
// Product Modifier API
// ============================================
export const productModifierAPI = {
  // Create a new product modifier
  createProductModifier: (modifierData: CreateProductModifierPayload) =>
    api.post('/api/product-modifiers', modifierData),

  // Get all product modifiers
  getProductModifiers: (params?: any) => api.get('/api/product-modifiers', { params }),

  // Get single product modifier details
  getProductModifierById: (modifierId: string) => api.get(`/api/product-modifiers/${modifierId}`),

  // Update product modifier details
  updateProductModifier: (modifierId: string, modifierData: UpdateProductModifierPayload) =>
    api.put(`/api/product-modifiers/${modifierId}`, modifierData),

  // Delete product modifier
  deleteProductModifier: (modifierId: string) => api.delete(`/api/product-modifiers/${modifierId}`),
};

// ============================================
// Packaging API
// ============================================
export const packagingAPI = {
  // Create a new packaging option
  createPackaging: (packagingData: CreatePackagingPayload) =>
    api.post('/api/packaging', packagingData),

  // Get all packaging options
  getPackaging: (params?: any) => api.get('/api/packaging', { params }),

  // Get single packaging details
  getPackagingById: (packagingId: string) => api.get(`/api/packaging/${packagingId}`),

  // Update packaging details
  updatePackaging: (packagingId: string, packagingData: UpdatePackagingPayload) =>
    api.put(`/api/packaging/${packagingId}`, packagingData),

  // Delete packaging
  deletePackaging: (packagingId: string) => api.delete(`/api/packaging/${packagingId}`),

  // Set default packaging
  setDefaultPackaging: (packagingId: string) => api.patch(`/api/packaging/${packagingId}/default`),
};

// ============================================
// Location API
// ============================================
export const locationAPI = {
  // Search for locations
  searchLocation: (query: string) => api.get(`/api/locations/search?query=${query}`),
};

// ============================================
// Appointment API
// ============================================
export const appointmentAPI = {
  // Create a new appointment
  createAppointment: (appointmentData: CreateAppointmentPayload) =>
    api.post('/api/appointments', appointmentData),

  // Create a new appointment by admin
  createAppointmentByAdmin: (appointmentData: AdminCreateAppointmentPayload) =>
    api.post('/api/appointments/admin', appointmentData),

  // Get my appointments
  getMyAppointments: (params?: any) => api.get('/api/appointments/my', { params }),

  // Get all appointments (admin/staff)
  getAppointments: (params?: any) => api.get('/api/appointments', { params }),

  // Get single appointment details
  getAppointmentById: (appointmentId: string) => api.get(`/api/appointments/${appointmentId}`),

  // Reschedule appointment
  rescheduleAppointment: (appointmentId: string, data: RescheduleAppointmentPayload) =>
    api.put(`/api/appointments/${appointmentId}/reschedule`, data),

  // Cancel appointment
  cancelAppointment: (appointmentId: string) => api.put(`/api/appointments/${appointmentId}/cancel`),

  // Check-in
  checkIn: (appointmentId: string) => api.put(`/api/appointments/${appointmentId}/check-in`),

  // Complete
  completeAppointment: (appointmentId: string) => api.put(`/api/appointments/${appointmentId}/complete`),

  // No-Show
  markNoShow: (appointmentId: string) => api.put(`/api/appointments/${appointmentId}/no-show`),
};

// ============================================
// Availability API
// ============================================
export const availabilityAPI = {
  // Fetch available schedule options
  getAvailability: (payload: GetAvailabilityPayload) =>
    api.post('/api/availability', payload),
};

// ============================================
// Cart API
// ============================================
export const cartAPI = {
  // Fetch current user's cart
  getCart: () => api.get('/api/cart'),

  // Add item to cart
  addToCart: (itemData: AddToCartPayload) => api.post('/api/cart/add', itemData),

  // Update item quantity
  updateQuantity: (data: UpdateCartQuantityPayload) => api.put('/api/cart/update', data),

  // Remove item from cart
  removeItem: (data: RemoveCartItemPayload) => api.delete('/api/cart/remove', { data }),

  // Clear full cart
  clearCart: () => api.delete('/api/cart/clear'),
};

// ============================================
// Order API
// ============================================
export const orderAPI = {
  // Create a new order from cart
  createOrder: (orderData: CreateOrderPayload) => api.post('/api/orders', orderData),

  // List authenticated user's orders
  getUserOrders: (params?: GetOrdersParams) => api.get('/api/orders/my-orders', { params }),

  // Get detailed order by ID
  getOrderById: (orderId: string) => api.get(`/api/orders/${orderId}`),

  // Admin: Create an order for a customer manually
  adminCreateOrder: (orderData: AdminCreateOrderPayload) => api.post('/api/orders/admin/create', orderData),

  // Admin: List all orders
  getOrders: (params?: GetOrdersParams) => api.get('/api/orders', { params }),

  // Admin: Update order fulfillment status
  updateOrderStatus: (orderId: string, data: UpdateOrderStatusPayload) => api.patch(`/api/orders/${orderId}/status`, data),

  // Admin: Assign a rider to an order
  assignRider: (orderId: string) => api.patch(`/api/orders/${orderId}/assign-rider`),

  // Admin: Delete an order
  deleteOrder: (orderId: string) => api.delete(`/api/orders/${orderId}`),
};

// ============================================
// Coupon API
// ============================================
export const couponAPI = {
  // Create a new coupon
  createCoupon: (couponData: CreateCouponPayload) => api.post('/api/coupons', couponData),

  // List coupons
  getAllCoupons: (params?: GetCouponsParams) => api.get('/api/coupons', { params }),

  // Get coupon details
  getCouponById: (couponId: string) => api.get(`/api/coupons/${couponId}`),

  // Update coupon
  updateCoupon: (couponId: string, couponData: UpdateCouponPayload) => api.put(`/api/coupons/${couponId}`, couponData),

  // Delete coupon
  deleteCoupon: (couponId: string) => api.delete(`/api/coupons/${couponId}`),

  // Validate coupon code
  validateCoupon: (data: ValidateCouponPayload, orderAmount: number) =>
    api.post(`/api/coupons/validate?orderAmount=${orderAmount}`, data),

  // Apply coupon to order
  applyCoupon: (data: ApplyCouponPayload) => api.post('/api/coupons/apply', data),

  // Get coupon statistics
  getCouponStats: (couponId: string) => api.get(`/api/coupons/${couponId}/stats`),

  // Generate new unique code
  generateNewCode: (couponId: string) => api.post(`/api/coupons/${couponId}/generate-code`),
};

// ============================================
// Address API
// ============================================
export const addressAPI = {
  // Create a new user address
  createAddress: (addressData: CreateAddressPayload) => api.post('/api/addresses', addressData),

  // Get all user addresses
  getUserAddresses: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/api/addresses', { params }),

  // Get single address by ID
  getAddressById: (addressId: string) => api.get(`/api/addresses/${addressId}`),

  // Update address
  updateAddress: (addressId: string, addressData: UpdateAddressPayload) =>
    api.put(`/api/addresses/${addressId}`, addressData),

  // Delete address
  deleteAddress: (addressId: string) => api.delete(`/api/addresses/${addressId}`),

  // Set default address
  setDefaultAddress: (addressId: string) => api.patch(`/api/addresses/${addressId}/default`),
};

// Export the api instance for custom requests
export { api };
export default api;
