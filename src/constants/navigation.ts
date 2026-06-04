import type { IconType } from 'react-icons'
import {MdDashboard, MdPeople, MdSecurity, MdAssignment, MdMiscellaneousServices, MdStore, MdCategory, MdLocationOn} from 'react-icons/md'

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
  { label: 'Product Types', path: '/product-types', icon: MdCategory, end: false },
  
]
