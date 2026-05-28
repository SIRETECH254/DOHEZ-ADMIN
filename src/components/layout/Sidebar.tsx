import { NavLink } from 'react-router-dom'
import { MdClose, MdLogout } from 'react-icons/md'
import { NAV_ITEMS } from '../../constants/navigation'
import { useAuth } from '../../contexts/AuthContext'

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { logout } = useAuth()

  // Shared sidebar content for desktop + mobile drawer.
  const content = (
    <div className="relative flex h-full flex-col bg-white px-4 pb-6 pt-6">


      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        aria-label="Close sidebar"
      >
        <MdClose size={24} />
      </button>


      {/* Primary navigation links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
        {NAV_ITEMS.filter((item) => item.path !== '/profile' && item.path !== '/store').map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  isActive
                    ? 'bg-brand-tint text-brand-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={onClose}
              end={item.end ?? true}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer section: Store, Profile, and Logout */}
      <div className="mt-auto bg-brand-tint px-4 py-4 -mx-4 -mb-6 ">
        {/* Store and Profile links */}
        <div className="space-y-1 mb-3">
          {NAV_ITEMS.filter((item) => item.path === '/profile' || item.path === '/store').map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                    isActive
                      ? 'text-brand-primary font-semibold'
                      : 'text-gray-700 hover:text-brand-primary'
                  }`
                }
                onClick={onClose}
                end={item.end ?? true}
              >
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            )
          })}
        </div>
        {/* Logout button */}
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center justify-start gap-2 rounded-xl px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition"
        >
          <MdLogout size={18} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-full w-1/4 border-r border-gray-200 bg-white lg:block">
        {content}
      </aside>
      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          aria-label="Close sidebar"
        />
      )}
      {/* Mobile drawer */}
      {isOpen && (
        <aside className="fixed left-0 top-0 z-40 h-full w-72 border-r border-gray-200 bg-white shadow-xl lg:hidden">
          {content}
        </aside>
      )}
    </>
  )
}

export default Sidebar
