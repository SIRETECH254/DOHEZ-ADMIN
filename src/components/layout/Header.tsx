import { useMemo, useState } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import {
  MdArrowDropDown,
  MdClose,
  MdMenu,
  MdPerson,
  MdLogout,
} from 'react-icons/md'
import { FiShoppingCart } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { NAV_ITEMS } from '../../constants/navigation'
import { useInitials } from '../../utils'
import { useGetCart } from '../../tanstack/useCart'


type NavbarProps = {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

const Header = ({ isSidebarOpen, onToggleSidebar }: NavbarProps) => {
  const { user, vendor, branch, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const userInitials = useInitials(user ?? undefined)
  const { data: cartData } = useGetCart()
  const totalItems = cartData?.cart?.totalItems ?? 0


  // Resolve the active page label from the current route.
  const activeLabel = useMemo(() => {
    const match = NAV_ITEMS.find((item) =>
      matchPath({ path: item.path, end: item.end ?? true }, location.pathname),
    )
    return match?.label ?? 'Dashboard'
  }, [location.pathname])

  // Navigate to the profile screen from the dropdown.
  const handleProfile = () => {
    setIsMenuOpen(false)
    navigate('/profile')
  }

  // Trigger logout and close the dropdown.
  const handleLogout = async () => {
    setIsMenuOpen(false)
    await logout()
  }

  return (
    // Sticky header wrapper.
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left section: hamburger + logo */}
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 lg:hidden"
            aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
          >
            {isSidebarOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
          </button>
          {/* Logo + app name */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white">
              <span className="text-sm font-semibold">AA</span>
            </div>
            {(vendor || branch) && (
              <span className="text-sm font-semibold text-gray-800 hidden lg:block whitespace-nowrap">
                {branch ? branch.name : vendor?.name}
              </span>
            )}
          </div>
        </div>

        {/* Center section: active page title (desktop) */}
        <div className="hidden flex-1 justify-center lg:flex">
          <span className="text-sm font-medium text-gray-600">{activeLabel}</span>
        </div>

        {/* Right section: profile menu */}
        <div className="flex items-center gap-5">
          {/* Cart Icon */}
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="View cart"
          >
            <FiShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white ring-2 ring-white">
                {totalItems}
              </span>
            )}
          </button>

          {/* Profile dropdown trigger + menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1.5"
              aria-label="Account menu"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">
                {userInitials}
              </span>
              <div className="hidden flex-col text-left lg:flex">
                <span className="text-sm font-semibold text-gray-800">
                  {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                </span>
                <span className="text-xs text-gray-500">
                  {user?.email ?? 'admin@appointment.com'}
                </span>
              </div>
              <MdArrowDropDown size={20} className="text-gray-600" />
            </button>

            {/* Dropdown actions */}
            {isMenuOpen && (
              <div className="absolute right-0 z-40 mt-3 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                <button
                  type="button"
                  onClick={handleProfile}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <MdPerson size={18} />
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <MdLogout size={18} />
                  Logout
                </button>
              </div>
            )}

            {/* Click-away overlay to close the menu */}
            {isMenuOpen && (
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 z-30 cursor-default"
                aria-label="Close menu"
              />
            )}
          </div>

        </div>
      </div>
    </header>
  )
}

export default Header
