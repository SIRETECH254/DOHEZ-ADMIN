import type { IconType } from 'react-icons'
import {MdDashboard, MdPeople, MdSecurity, MdAssignment} from 'react-icons/md'

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
  
]
