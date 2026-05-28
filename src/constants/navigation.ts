import type { IconType } from 'react-icons'
import {MdDashboard} from 'react-icons/md'

export type NavItem = {
  label: string
  path: string
  icon: IconType
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
    
  { label: 'Dashboard', path: '/dashboard', icon: MdDashboard, end: true },
  
]
