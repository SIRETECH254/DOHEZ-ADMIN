import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-slate-900">
      <div className="w-full text-center ">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
          Appointment Admin
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you are looking for does not exist yet.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound
