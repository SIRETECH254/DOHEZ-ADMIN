import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'

type InlineMessage = {
  type: 'success' | 'error'
  text: string
}

// Forgot password page: requests reset link by email.
const ForgotPassword = () => {
  const { forgotPassword, error, clearError } = useAuth()
  // Single form object to send as payload.
  const [form, setForm] = useState({ email: '' })
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(
    null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Shared input handler for all fields.
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      // Update form and clear any errors.
      setForm((previous) => ({ ...previous, [name]: value }))
      if (error) {
        clearError()
      }
      setInlineMessage(null)
    },
    [error, clearError],
  )

  // Derived flag for button disabled state.
  const canSubmit = useMemo(
    () => Boolean(form.email.trim()) && !isSubmitting,
    [form.email, isSubmitting],
  )

  // Submit handler: validate email and call forgotPassword.
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmedEmail = form.email.trim()

      if (!trimmedEmail) {
        setInlineMessage({
          type: 'error',
          text: 'Please enter your email address.',
        })
        return
      }

      setInlineMessage(null)
      setIsSubmitting(true)

      try {
        // Send the form object as the payload source.
        const result = await forgotPassword(trimmedEmail)
        if (!result.success) {
          setInlineMessage({
            type: 'error',
            text: result.error ?? 'Unable to send reset link.',
          })
          return
        }

        setInlineMessage({
          type: 'success',
          text: 'Check your inbox for password reset instructions.',
        })
      } catch {
        setInlineMessage({
          type: 'error',
          text: 'Unexpected error. Please try again.',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [form.email, forgotPassword],
  )

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="">
          {/* Header */}
          <div className="auth-header">
            <p className="auth-kicker">
              Dohez Admin
            </p>
            <h1 className="auth-title">
              Forgot password?
            </h1>
            <p className="auth-subtitle">
              Enter your email address and we will send reset instructions.
            </p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
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

            {/* Inline feedback */}
            {inlineMessage ? (
              <div
                className={
                  inlineMessage.type === 'success'
                    ? 'auth-inline-message-success'
                    : 'auth-inline-message-error'
                }
              >
                {inlineMessage.text}
              </div>
            ) : null}

            {/* Submit button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="auth-button"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          {/* Footer */}
          <p className="auth-footer">
            Remembered your password?{' '}
            <Link
              to="/login"
              className="auth-link"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
