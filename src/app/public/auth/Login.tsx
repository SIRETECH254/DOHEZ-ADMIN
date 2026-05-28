import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useAuth } from '../../../contexts/AuthContext'

// Login page: handles credentials input and sign-in flow.
const Login = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuth()

  // Single form object to send as the login payload.
  const [form, setForm] = useState({ email: '', password: '' })
  const [rememberMe, setRememberMe] = useState(true)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)

  // Shared input handler for all fields.
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      // Update the form and clear any visible errors.
      setForm((previous) => ({ ...previous, [name]: value }))
      if (error) {
        clearError()
      }
      setInlineError(null)
    },
    [error, clearError],
  )

  // Derived flag for button state and validation.
  const canSubmit = useMemo(
    () =>
      Boolean(form.email.trim() && form.password) &&
      !isSubmitting &&
      !isLoading,
    [form.email, form.password, isSubmitting, isLoading],
  )

  // Form submission handler (validates + calls login).
  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      // Trim email before sending to the API.
      const trimmedEmail = form.email.trim()
      if (!trimmedEmail || !form.password) {
        setInlineError('Please enter both email and password.')
        return
      }

      // Clear old errors and start the button loader.
      setInlineError(null)
      setIsSubmitting(true)

      try {
        // Send the form object as the login payload.
        const result = await login({ ...form, email: trimmedEmail })
        if (!result.success) {
          setInlineError(result.error ?? 'Unable to sign in.')
          return
        }

        // If remember me is unchecked, drop the refresh token.
        if (!rememberMe) {
          localStorage.removeItem('refreshToken')
        }

        // Redirect to the authenticated landing page.
        navigate('/dashboard', { replace: true })
      } finally {
        // Always stop the loader.
        setIsSubmitting(false)
      }
    },
    [form, rememberMe, login, navigate],
  )

  // Prefer inline error over global auth error for display.
  const bannerMessage = inlineError || error

  return (
    <div className="auth-page">
   
      <div className="auth-container">
        <div className="">
          {/* Header */}
          <div className="auth-header">
            <p className="auth-kicker">
              DOHEZ ADMIN
            </p>
            <h1 className="auth-title">
              Welcome back
            </h1>
            <p className="auth-subtitle">
              Sign in to manage appointments and staff schedules.
            </p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={onSubmit}>
            {/* Email field */}
            <div className="auth-field">
              <label className="label">
                Email
              </label>
              <input
                value={form.email}
                onChange={(event) =>
                  handleInputChange('email', event.target.value)
                }
                autoCapitalize="none"
                autoComplete="email"
                type="email"
                placeholder="admin@example.com"
                className="input"
              />
            </div>

            {/* Password field */}
            <div className="auth-field">
              <label className="label">
                Password
              </label>
              <div className="relative">
                <input
                  value={form.password}
                  onChange={(event) =>
                    handleInputChange('password', event.target.value)
                  }
                  autoComplete="current-password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-password"
                />
                {/* Toggle password visibility */}
                <button
                  type="button"
                  onClick={() =>
                    setIsPasswordVisible((previous) => !previous)
                  }
                  aria-label={
                    isPasswordVisible ? 'Hide password' : 'Show password'
                  }
                  className="input-toggle-icon"
                >
                  {isPasswordVisible ? (
                    <MdVisibilityOff size={20} />
                  ) : (
                    <MdVisibility size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me + forgot password */}
            <div className="auth-actions">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => {
                    // Checkbox is separate from the form object but still clears errors.
                    setRememberMe((previous) => !previous)
                    setInlineError(null)
                    if (error) {
                      clearError()
                    }
                  }}
                  className="auth-checkbox"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="auth-link"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error banner */}
            {bannerMessage ? (
              <div className="auth-inline-message-error">
                {bannerMessage}
              </div>
            ) : null}

            {/* Button-only loading state */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="auth-button"
            >
              {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Footer copy */}
          <p className="auth-footer">
            Need access?{' '}
            <span className="auth-footer-strong">
              Contact your administrator
            </span>
            .
          </p>
        </div>
      </div>
    
    </div>
  )
}

export default Login
