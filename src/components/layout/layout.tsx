import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Sidebar from '../../components/layout/Sidebar'
import { useAuth } from '../../contexts/AuthContext'

const Layout = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-600">
        Loading dashboard...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen h-screen flex flex-col bg-white text-slate-900">
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 h-full overflow-y-auto bg-white page-container">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
