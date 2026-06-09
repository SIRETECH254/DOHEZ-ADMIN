import type { IconType } from 'react-icons'
import { MdDashboard, MdPeople, MdSecurity, MdAssignment, MdMiscellaneousServices, MdStore, MdCategory, MdLocationOn, MdLayers, MdTune, MdCallSplit, MdInventory, MdListAlt, MdReceipt, MdReceiptLong } from 'react-icons/md'

export type NavItem = {
  label: string
  path: string
  icon: IconType
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
    
  { label: 'Dashboard', path: '/dashboard', icon: MdDashboard, end: true },
  { label: 'Users', path: '/users', icon: MdPeople, end: false },
  { label: 'Roles', path: '/roles', icon: MdSecurity, end: false },
  { label: 'Tasks', path: '/tasks', icon: MdAssignment, end: false },
  { label: 'Services', path: '/services', icon: MdMiscellaneousServices, end: false },
  { label: 'Vendor Types', path: '/vendor-types', icon: MdStore, end: false },
  { label: 'Vendor Categories', path: '/vendor-categories', icon: MdCategory, end: false },
  { label: 'Vendors', path: '/vendors', icon: MdStore, end: false },
  { label: 'Branches', path: '/branches', icon: MdLocationOn, end: false },
  { label: 'Product Types', path: '/product-types', icon: MdLayers, end: false },
  { label: 'Product Categories', path: '/product-categories', icon: MdCategory, end: false },
  { label: 'Product Modifiers', path: '/product-modifiers', icon: MdTune, end: false },
  { label: 'Product Variants', path: '/product-variants', icon: MdCallSplit, end: false },
  { label: 'Products', path: '/products', icon: MdCategory, end: false },
  { label: 'Inventory', path: '/inventory', icon: MdInventory, end: false },
  { label: 'Appointments', path: '/appointments', icon: MdListAlt, end: false },
  { label: 'Orders', path: '/orders', icon: MdListAlt, end: false },
  { label: 'Invoices', path: '/invoices', icon: MdReceipt, end: false },
  { label: 'Receipts', path: '/receipts', icon: MdReceiptLong, end: false }
]
