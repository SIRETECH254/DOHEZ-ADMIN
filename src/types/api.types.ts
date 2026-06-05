// ============================================
// Auth Types
// ============================================

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
}

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

export interface VerifyOTPPayload {
  email?: string;
  phone?: string;
  otp: string;
}

export interface ResendOTPPayload {
  email?: string;
  phone?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export interface TokenResponse {
  accessToken: string;
}

// ============================================
// User Types
// ============================================

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  roles: string[] | IRole[];
  phone: string;
  isActive: boolean;
  isVerified: boolean;
  avatar?: string | null;
  avatarPublicId?: string | null;
  otpCode?: string;
  otpExpiry?: string;
  resetPasswordToken?: string;
  resetPasswordExpiry?: string;
  lastLoginAt?: string;
  notificationPreferences?: NotificationPreferences;
  vendor?: string | IVendor;
  branch?: string | IBranch;
  services?: string[];
  workingHours?: WorkingHours;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id: string;
}

export interface IRole  {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  email?: boolean;
  sms?: boolean;
  inApp?: boolean;
}

export interface WorkingHours {
  monday?: { start: string; end: string };
  tuesday?: { start: string; end: string };
  wednesday?: { start: string; end: string };
  thursday?: { start: string; end: string };
  friday?: { start: string; end: string };
  saturday?: { start: string; end: string };
  sunday?: { start: string; end: string };
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateNotificationPreferencesPayload {
  email?: boolean;
  sms?: boolean;
  inApp?: boolean;
}

export interface AdminCreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  avatar?: string | null;
  workingHours?: WorkingHours;
  services?: string[];
}

export interface UpdateUserStatusPayload {
  isActive: boolean;
}

export interface AssignRolePayload {
  roleName: string;
  vendor?: string;
  branch?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface GetUsersParams extends PaginationParams {
  search?: string;
}

export interface GetCustomersParams extends PaginationParams {
  search?: string;
}

// ============================================
// Role Types
// ============================================

export interface CreateRolePayload {
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  isActive?: boolean;
}

export interface UpdateRolePayload {
  name?: string;
  displayName?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface GetRolesParams extends PaginationParams {
  isActive?: boolean | string;
  search?: string;
}

// ============================================
// Task Types
// ============================================

export interface ITask {
  _id: string;
  name: string;
  description?: string;
  image?: string | null;
  imagePublicId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTaskPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
  image?: string | null;
}

export interface GetTasksParams extends PaginationParams {
  search?: string;
  all?: boolean | string;
}

// ============================================
// Service Types
// ============================================

export interface IService {
  _id: string;
  task: string | ITask;
  name: string;
  description?: string;
  image?: string | null;
  imagePublicId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServicePayload {
  task: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateServicePayload {
  task?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  image?: string | null;
}

export interface GetServicesParams extends PaginationParams {
  task?: string;
  search?: string;
  all?: boolean | string;
}

// ============================================
// Vendor Type Types
// ============================================

export interface IVendorType {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  image?: string | null;
  imagePublicId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorTypePayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateVendorTypePayload {
  name?: string;
  description?: string;
  isActive?: boolean;
  image?: string | null;
}

export interface GetVendorTypesParams extends PaginationParams {
  search?: string;
  all?: boolean | string;
}

// ============================================
// Vendor Category Types
// ============================================

export interface IVendorCategory {
  _id: string;
  vendorType?: string | IVendorType | null;
  name: string;
  description?: string;
  slug: string;
  image?: string | null;
  imagePublicId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorCategoryPayload {
  vendorType?: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateVendorCategoryPayload {
  vendorType?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  image?: string | null;
}

export interface GetVendorCategoriesParams extends PaginationParams {
  search?: string;
  all?: boolean | string;
}

// ============================================
// Vendor Types
// ============================================

export interface IVendor {
  _id: string;
  userId: string | IUser;
  vendorCategory: string | IVendorCategory;
  service: string | IService;
  branches: string[] | IBranch[];
  name: string;
  details?: string;
  phone: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  logo?: string | null;
  logoPublicId?: string | null;
  cover?: string | null;
  coverPublicId?: string | null;
  location: any;
  slug: string;
  kraPin?: string | null;
  regNo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VendorLocation {
  name?: string;
  address?: string;
  regions?: {
    administrative_area_level_3?: string;
    administrative_area_level_1?: string;
    country?: string;
  };
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  place_id?: string;
}

export interface RegisterVendorPayload {
  userId: string;
  name: string;
  description?: string;
  categoryId: string;
  phone: string;
  email: string;
  location?: string | VendorLocation;
  workingHours?: string | any;
}

export interface UpdateVendorPayload {
  name?: string;
  description?: string;
  categoryId?: string;
  logo?: any;
  banner?: any;
}

export interface GetVendorsParams extends PaginationParams {
  search?: string;
}

// ============================================
// Branch Types
// ============================================

export interface IBranch {
  _id: string;
  vendorId: string | IVendor;
  name: string;
  email: string;
  phone: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
    place_id?: string;
  };
  cover?: string | null;
  coverPublicId?: string | null;
  workingHours: WorkingHours;
  gallery: { url: string; publicId: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchPayload {
  vendorId: string;
  name: string;
  email: string;
  phone: string;
  location: string | {
    address: string;
    coordinates: { lat: number; lng: number };
    place_id?: string;
  };
  workingHours?: string | WorkingHours;
  managerId?: string;
}

export interface UpdateBranchPayload {
  name?: string;
  email?: string;
  phone?: string;
  location?: string | {
    address: string;
    coordinates: { lat: number; lng: number };
    place_id?: string;
  };
  workingHours?: string | WorkingHours;
  cover?: any;
  gallery?: any;
}

export interface GetBranchesParams extends PaginationParams {
  vendorId?: string;
}

// ============================================
// Product Type Types
// ============================================

export interface IProductType {
  _id: string;
  service: string | IService;
  name: string;
  details?: string;
  order: number;
  slug: string;
  icon?: string | null;
  iconPublicId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductTypePayload {
  service: string;
  name: string;
  details?: string;
  order?: number;
}

export interface UpdateProductTypePayload {
  service?: string;
  name?: string;
  details?: string;
  order?: number;
  icon?: any;
}

export interface GetProductTypesParams extends PaginationParams {
  search?: string;
  service?: string;
}

// ============================================
// Product Category Types
// ============================================

export interface IProductCategory {
  _id: string;
  name: string;
  details?: string;
  icon?: string | null;
  iconPublicId?: string | null;
  sort: number;
  slug: string;
  productType: string | IProductType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductCategoryPayload {
  name: string;
  details?: string;
  sort?: number;
  productType: string;
  icon?: any;
}

export interface UpdateProductCategoryPayload {
  name?: string;
  details?: string;
  sort?: number;
  productType?: string;
  icon?: any;
}

export interface GetProductCategoriesParams extends PaginationParams {
  search?: string;
}

// ============================================
// Laundry Types
// ============================================

export interface ILaundry {
  _id: string;
  laundryNumber: string;
  pickUpDate: {
    day: string;
    hour: string;
  };
  dropDate?: string;
  services: string[];
  customer: string;
  vendor: string;
  branch: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    place_id?: string;
  };
  status: 'PENDING' | 'CONFIRMED' | 'PICKED_UP' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED';
  bookingFee: number;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookLaundryPayload {
  vendorId: string;
  branchId: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    place_id?: string;
  };
  services: string[];
  pickUpDate: {
    day: string;
    hour: string;
  };
  paymentMethod: 'mpesa';
  phoneNumber: string;
  bookingFee?: number;
}

export interface PayLaundryInvoicePayload {
  invoiceId: string;
  method: 'mpesa';
  payerPhone: string;
}

export interface UpdateLaundryPayload {
  status?: 'PENDING' | 'CONFIRMED' | 'PICKED_UP' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED';
  pickUpDate?: {
    day: string;
    hour: string;
  };
  dropDate?: string;
  location?: {
    address: string;
  };
}

// ============================================
// Receipt Types
// ============================================

export interface IReceipt {
  _id: string;
  order?: string;
  appointment?: string;
  ticket?: string;
  invoice: string;
  customer: string;
  branch: string;
  vendor: string;
  receiptNumber: string;
  amountPaid: number;
  paymentMethod: 'mpesa' | 'paystack' | 'cash';
  issuedAt: string;
  pdfUrl?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Invoice Types
// ============================================

export interface IInvoiceLineItem {
  label: string;
  amount: number;
}

export interface IInvoice {
  _id: string;
  order?: string;
  appointment?: string;
  branch: string;
  vendor: string;
  invoiceNumber: string;
  lineItems: IInvoiceLineItem[];
  subtotal: number;
  discounts: number;
  fees: number;
  tax: number;
  total: number;
  balanceDue: number;
  paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Payment Types
// ============================================

export interface IPayment {
  _id: string;
  paymentNumber: string;
  invoice: string[];
  customer: string;
  branch: string;
  vendor: string;
  method: 'mpesa' | 'paystack' | 'cash' | 'post_to_bill' | 'cod';
  amount: number;
  currency: string;
  processorRefs?: {
    daraja?: {
      merchantRequestId?: string;
      checkoutRequestId?: string;
    };
    paystack?: {
      reference?: string;
    };
  };
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  type?: 'BOOKING_FEE' | 'FULLPAYMENT';
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Ticket Types
// ============================================

export interface ITicket {
  _id: string;
  ticketNumber: string;
  event: string;
  vendor: string;
  branch: string;
  details: {
    name: string;
    email: string;
    phone: string;
  };
  type: string;
  qrCodeData?: string;
  pdfUrl?: string;
  status: 'PENDING' | 'BOOKED' | 'CANCELLED' | 'USED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTicketPayload {
  status?: 'PENDING' | 'BOOKED' | 'CANCELLED' | 'USED' | 'EXPIRED';
  details?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

// ============================================
// Break Types
// ============================================

export interface IBreak {
  _id: string;
  staff: string;
  startTime: string;
  endTime: string;
  reason?: string;
  createdAt: string;
}

export interface CreateBreakPayload {
  staff: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface UpdateBreakPayload {
  startTime?: string;
  endTime?: string;
  reason?: string;
}

// ============================================
// Availability Types
// ============================================

export interface GetAvailabilityPayload {
  date: string;
  branch: string;
  vendor: string;
  items: string[];
  preferredStaffs?: string[];
  page?: number;
  limit?: number;
}

export interface IScheduleOption {
  overallStartTime: string;
  overallEndTime: string;
  totalDurationMinutes: number;
  bookingFeeAmount: number;
  totalAmount: number;
  remainingAmount: number;
  items: {
    serviceId: string;
    serviceName: string;
    staffId: string;
    staffName: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    amount: number;
  }[];
}

// ============================================
// Appointment Types
// ============================================

export interface IAppointmentItem {
  service: string;
  staff: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  amount: number;
}

export interface IAppointment {
  _id: string;
  appointmentNumber: string;
  customer: string;
  branch: string;
  vendor: string;
  staff: string[];
  items: IAppointmentItem[];
  overallStartTime: string;
  overallEndTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  bookingFeeAmount: number;
  remainingAmount: number;
  checkedInAt?: string;
  actualEndTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentPayload {
  branch: string;
  vendor: string;
  items: {
    serviceId: string;
    staffId: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface AdminCreateAppointmentPayload {
  customerId: string;
  branch: string;
  vendor: string;
  status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  items: {
    serviceId: string;
    staffId: string;
    startTime: string;
    endTime: string;
    amount: number;
    durationMinutes: number;
  }[];
}

export interface RescheduleAppointmentPayload {
  items: {
    serviceId: string;
    staffId: string;
    startTime: string;
    endTime: string;
    amount: number;
    durationMinutes?: number;
  }[];
}

// ============================================
// Location Types
// ============================================

export interface ILocationResult {
  business_status?: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
    viewport: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  icon?: string;
  icon_background_color?: string;
  icon_mask_base_uri?: string;
  name: string;
  photos?: {
    height: number;
    html_attributions: string[];
    photo_reference: string;
    width: number;
  }[];
  place_id: string;
  reference: string;
  types: string[];
}

// ============================================
// Packaging Types
// ============================================

export interface IPackaging {
  _id: string;
  name: string;
  price: number;
  isActive: boolean;
  isDefault: boolean;
  vendor: string;
  branch: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackagingPayload {
  name: string;
  price: number;
  isActive?: boolean;
  isDefault?: boolean;
  vendor: string;
  branch: string;
}

export interface UpdatePackagingPayload {
  name?: string;
  price?: number;
  isActive?: boolean;
  isDefault?: boolean;
}

// ============================================
// Product Modifier Types
// ============================================

export interface IModifierOption {
  _id: string;
  name?: string;
  value?: string;
  price?: number;
}

export interface IProductModifier {
  _id: string;
  name: string;
  required: boolean;
  minSelection: number;
  maxSelection: number;
  options: IModifierOption[];
  createdAt: string;
}

export interface CreateProductModifierPayload {
  name: string;
  required: boolean;
  minSelection: number;
  maxSelection: number;
  options: { name: string; price: number }[];
}

export interface UpdateProductModifierPayload {
  name?: string;
  required?: boolean;
  minSelection?: number;
  maxSelection?: number;
}

export interface CreateProductVariantPayload {
  name: string;
  options: { name: string; price: number }[];
}

export interface UpdateProductVariantPayload {
  name?: string;
  options?: { _id?: string; name: string; price: number }[];
}

export interface GetProductVariantsParams extends PaginationParams {
  search?: string;
}

export interface ISelectedModifierOption {
  modifierId: string;
  optionId: string;
}

export interface ISelectedVariantOption {
  variantId: string;
  optionId: string;
}

export interface IVariant {
  _id: string;
  name: string;
  options: { _id: string; name?: string; value?: string; price?: number }[];
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  details?: string;
  price: number;
  offerPrice?: number;
  images: Array<{ url: string; publicId: string }>;
  category: string | IProductCategory;
  vendor: string | IVendor;
  branch: string | IBranch;
  service: string | IService;
  variants: string[] | IVariant[];
  selectedVariantOptions: ISelectedVariantOption[];
  modifiers: string[] | IProductModifier[];
  selectedModifierOptions: ISelectedModifierOption[];
  skus: ISKU[];
  status: boolean;
  trackInventory: boolean;
  duration?: string;
  buffertime?: string;
  venue?: string;
  location?: {
    address?: string;
    coordinates?: { lat?: number; lng?: number };
    place_id?: string;
  };
  startDate?: string;
  endDate?: string;
  openAt?: string;
  ageLimit?: number;
  dresscode?: string;
  maxTicket?: number;
  createdAt: string;
  updatedAt: string;
}


export interface ISKU {
  _id: string;
  attributes: ISKUAttribute[];
  price: number;
  comparePrice?: number;
  stock: number;
  skuCode: string;
  barcode?: string;
  weight?: number;
  isActive: boolean;
  allowPreOrder: boolean;
  preOrderStock: number;
  lowStockThreshold: number;
}

export interface ISKUAttribute {
  variantId: string;
  optionId: string;
}

export interface CreateProductPayload {
  name: string;
  details?: string;
  price: number;
  offerPrice?: number;
  category: string;
  vendor: string;
  branch: string;
  service: string;
  variants?: string[];
  selectedVariantOptions?: any[];
  modifiers?: string[];
  selectedModifierOptions?: any[];
  status?: boolean;
  trackInventory?: boolean;
  duration?: string;
  buffertime?: string;
}

export interface UpdateProductPayload {
  name?: string;
  details?: string;
  price?: number;
  offerPrice?: number;
  category?: string;
  vendor?: string;
  branch?: string;
  service?: string;
  variants?: string[];
  selectedVariantOptions?: any[];
  modifiers?: string[];
  selectedModifierOptions?: any[];
  status?: boolean;
  trackInventory?: boolean;
  images?: any[];
}

export interface GetProductsParams extends PaginationParams {
  search?: string;
  category?: string;
  vendor?: string;
  branch?: string;
  service?: string;
  status?: boolean | string;
}

// ============================================
// Cart Types
// ============================================

export interface ICart {
  _id: string;
  userId: string;
  cartGroups: ICartGroup[];
  totalCartValue: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICartGroup {
  _id: string;
  vendorId: string | { _id: string; name: string };
  branchId: string | { _id: string; name: string };
  items: ICartItem[];
  groupSubtotal: number;
}

export interface ICartItem {
  _id: string;
  productId: string | { _id: string; name: string };
  skuId: string;
  quantity: number;
  priceAtAddition: number;
  variants?: Array<{ variantId: string; optionId: string }>;
  modifiers?: Array<{ modifierId: string; optionId: string }>;
}

export interface AddToCartPayload {
  vendorId: string;
  branchId: string;
  productId: string;
  skuId: string;
  quantity: number;
  priceAtAddition: number;
  variants?: Array<{ variantId: string; optionId: string }>;
  modifiers?: Array<{ modifierId: string; optionId: string }>;
}

export interface UpdateCartQuantityPayload {
  branchId: string;
  cartItemId: string;
  quantity: number;
}

export interface RemoveCartItemPayload {
  branchId: string;
  cartItemId: string;
}

// ============================================
// Coupon Types
// ============================================

export interface ICouponUsage {
  user: string;
  usedAt: string;
}

export interface ICoupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount?: number;
  isActive: boolean;
  hasExpiry: boolean;
  expiryDate?: string | null;
  hasUsageLimit: boolean;
  usageLimit?: number | null;
  usedCount: number;
  isFirstTimeOnly: boolean;
  applicableProducts: string[];
  applicableCategories: string[];
  excludedProducts: string[];
  excludedCategories: string[];
  vendor?: string;
  branch?: string;
  createdBy: string;
  lastUsedBy: ICouponUsage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponPayload {
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  hasExpiry?: boolean;
  expiryDate?: string;
  hasUsageLimit?: boolean;
  usageLimit?: number;
  isFirstTimeOnly?: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludedProducts?: string[];
  excludedCategories?: string[];
  vendor?: string;
  branch?: string;
}

export interface UpdateCouponPayload {
  name?: string;
  description?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  isActive?: boolean;
  hasExpiry?: boolean;
  expiryDate?: string;
  hasUsageLimit?: boolean;
  usageLimit?: number;
  isFirstTimeOnly?: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludedProducts?: string[];
  excludedCategories?: string[];
  vendor?: string;
  branch?: string;
}

export interface GetCouponsParams extends PaginationParams {
  search?: string;
  isActive?: boolean | string;
  vendor?: string;
  branch?: string;
}

export interface ValidateCouponPayload {
  code: string;
  vendor?: string;
  branch?: string;
}

export interface ApplyCouponPayload extends ValidateCouponPayload {
  orderAmount: number;
}

// ============================================
// Order Types
// ============================================

export interface IOrder {
  _id: string;
  customer: string | IUser;
  vendor: string | IVendor;
  branch: string | IBranch;
  createdBy: string | IUser;
  location: 'in_shop' | 'away';
  type: 'pickup' | 'delivery';
  items: IOrderItem[];
  pricing: IPricing;
  timing: ITiming;
  address?: string | null;
  paymentPreference: {
    mode: 'post_to_bill' | 'pay_now' | 'cash' | 'cod';
    method?: 'mpesa_stk' | 'paystack_card' | null;
  };
  status: 'PLACED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'UNPAID' | 'PENDING' | 'PAID' | 'PARTIALLY_REFUNDED' | 'REFUNDED';
  invoice?: string | null;
  receipt?: string | null;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  sku: string;
  product: string | IProduct;
  title: string;
  quantity: number;
  unitPrice: number;
  variants?: Array<{ variantId: string; optionId: string }>;
  modifiers?: Array<{ modifierId: string; optionId: string }>;
  packagingChoice?: {
    id?: string;
    name?: string;
    fee?: number;
  };
}

export interface IPricing {
  subtotal: number;
  discounts: number;
  packagingFee: number;
  schedulingFee: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export interface ITiming {
  isScheduled: boolean;
  scheduledAt?: string | null;
}

export interface CreateOrderPayload {
  vendorId: string;
  branchId: string;
  location: 'in_shop' | 'away';
  type: 'pickup' | 'delivery';
  paymentPreference: {
    mode: 'post_to_bill' | 'pay_now' | 'cash' | 'cod';
    method?: 'mpesa_stk' | 'paystack_card' | null;
  };
  packagingOptionId?: string;
  couponCode?: string;
  addressId?: string;
  timing?: ITiming;
  metadata?: any;
}

export interface AdminCreateOrderPayload {
  customerId: string;
  vendorId: string;
  branchId: string;
  items: Array<{
    productId: string;
    skuId: string;
    quantity: number;
    variants?: Array<{ variantId: string; optionId: string }>;
    modifiers?: Array<{ modifierId: string; optionId: string }>;
  }>;
  location: 'in_shop' | 'away';
  type: 'pickup' | 'delivery';
  paymentPreference: {
    mode: 'post_to_bill' | 'pay_now' | 'cash' | 'cod';
    method?: 'mpesa_stk' | 'paystack_card' | null;
  };
  packagingOptionId?: string;
  couponCode?: string;
  addressId?: string;
  timing?: ITiming;
  metadata?: any;
}

export interface UpdateOrderStatusPayload {
  status: 'PLACED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
}

export interface GetOrdersParams extends PaginationParams {
  status?: string;
  paymentStatus?: string;
  type?: string;
  location?: string;
  q?: string;
}

// ============================================
// Address Types
// ============================================

export interface AddressRegion {
  country: string;
  locality?: string;
  sublocality?: string;
  sublocality_level_1?: string;
  administrative_area_level_1?: string;
  plus_code?: string;
  political?: string;
}

export interface IAddress {
  _id: string;
  userId: string;
  name: string;
  coordinates: { lat: number; lng: number };
  regions: AddressRegion;
  address: string;
  details?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  name: string;
  coordinates: { lat: number; lng: number };
  regions: AddressRegion;
  address: string;
  details?: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  name?: string;
  coordinates?: { lat: number; lng: number };
  regions?: AddressRegion;
  address?: string;
  details?: string;
  isDefault?: boolean;
}
