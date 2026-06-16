import type { IconType } from 'react-icons'
import { MdDashboard, MdPeople, MdSecurity, MdAssignment, MdMiscellaneousServices, MdStore, MdCategory, MdLocationOn, MdLayers, MdTune, MdCallSplit, MdInventory, MdListAlt, MdReceipt, MdReceiptLong, MdEvent, MdConfirmationNumber, MdLocalLaundryService } from 'react-icons/md'

export type NavItem = {
  label: string
  path: string
  icon: IconType
  minRole?: string
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: MdDashboard, end: true, minRole: 'staff' },
  { label: 'Users', path: '/users', icon: MdPeople, end: false, minRole: 'admin' },
  { label: 'Roles', path: '/roles', icon: MdSecurity, end: false, minRole: 'super_admin' },
  { label: 'Tasks', path: '/tasks', icon: MdAssignment, end: false, minRole: 'super_admin' },
  { label: 'Services', path: '/services', icon: MdMiscellaneousServices, end: false, minRole: 'super_admin' },
  { label: 'Vendor Types', path: '/vendor-types', icon: MdStore, end: false, minRole: 'admin' },
  { label: 'Vendor Categories', path: '/vendor-categories', icon: MdCategory, end: false, minRole: 'admin' },
  { label: 'Vendors', path: '/vendors', icon: MdStore, end: false, minRole: 'admin' },
  { label: 'Branches', path: '/branches', icon: MdLocationOn, end: false, minRole: 'vendor_admin' },
  { label: 'Product Types', path: '/product-types', icon: MdLayers, end: false, minRole: 'admin' },
  { label: 'Product Categories', path: '/product-categories', icon: MdCategory, end: false, minRole: 'admin' },
  { label: 'Product Modifiers', path: '/product-modifiers', icon: MdTune, end: false, minRole: 'branch_admin' },
  { label: 'Product Variants', path: '/product-variants', icon: MdCallSplit, end: false, minRole: 'branch_admin' },
  { label: 'Products', path: '/products', icon: MdCategory, end: false, minRole: 'staff' },
  { label: 'Inventory', path: '/inventory', icon: MdInventory, end: false, minRole: 'staff' },
  { label: 'Packaging', path: '/packaging', icon: MdLayers, end: false, minRole: 'branch_admin' },
  { label: 'Coupons', path: '/coupons', icon: MdLocalLaundryService, end: false, minRole: 'branch_admin' },
  { label: 'Appointments', path: '/appointments', icon: MdListAlt, end: false, minRole: 'staff' },
  { label: 'Events', path: '/events', icon: MdEvent, end: false, minRole: 'staff' },
  { label: 'Orders', path: '/orders', icon: MdListAlt, end: false, minRole: 'staff' },
  { label: 'Tickets', path: '/tickets', icon: MdConfirmationNumber, end: false, minRole: 'staff' },
  { label: 'Laundries', path: '/laundries', icon: MdLocalLaundryService, end: false, minRole: 'staff' },
  { label: 'Invoices', path: '/invoices', icon: MdReceipt, end: false, minRole: 'staff' },
  { label: 'Receipts', path: '/receipts', icon: MdReceiptLong, end: false, minRole: 'staff' },
  { label: 'Profile', path: '/profile', icon: MdPeople, end: false, minRole: 'staff' }
]
