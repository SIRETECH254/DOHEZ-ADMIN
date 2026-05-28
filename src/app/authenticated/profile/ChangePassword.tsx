import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md';
import { useAuth } from '../../../contexts/AuthContext';

// Main component for changing the user password
export default function ChangePassword() {
  const navigate = useNavigate();
  const { changePassword } = useAuth();

  // Local form state
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password visibility state
  const [visibility, setVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Feedback message state
  const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle visibility of password fields
  const toggleVisibility = useCallback((field: keyof typeof visibility) => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  // Update form fields
  const handleInputChange = useCallback((name: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setInlineMessage(null);
  }, []);

  // Submit form and call API
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setInlineMessage(null);

    // Basic validation
    if (form.newPassword !== form.confirmPassword) {
      setInlineMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      if (result.success) {
        setInlineMessage({ type: 'success', text: 'Password updated successfully!' });
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setInlineMessage({ type: 'error', text: result.error ?? 'Failed to update password.' });
      }
    } catch (err) {
      setInlineMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, changePassword]);

  // Memoized submit button availability
  const canSubmit = useMemo(
    () => form.currentPassword && form.newPassword && form.confirmPassword && !isSubmitting,
    [form, isSubmitting]
  );

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="">
          <button onClick={() => navigate('/profile')} className="flex items-center text-slate-500 mb-6 hover:text-brand-primary">
            <MdArrowBack className="mr-2" /> Back to Profile
          </button>
          
          <div className="auth-header">
            <h1 className="auth-title">Change Password</h1>
            <p className="auth-subtitle">Secure your account with a new password.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Inline message banner */}
            {inlineMessage && (
              <div className={`p-4 rounded-xl text-sm ${
                inlineMessage.type === 'success' ? 'auth-inline-message-success' : 'auth-inline-message-error'
              }`}>
                {inlineMessage.text}
              </div>
            )}

            {/* Current Password */}
            <div className="auth-field">
              <label className="label">Current Password</label>
              <div className="relative">
                <input
                  type={visibility.current ? 'text' : 'password'}
                  value={form.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className="input-password"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => toggleVisibility('current')} className="input-toggle-icon">
                  {visibility.current ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="auth-field">
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  type={visibility.new ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="input-password"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => toggleVisibility('new')} className="input-toggle-icon">
                  {visibility.new ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <input
                  type={visibility.confirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="input-password"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => toggleVisibility('confirm')} className="input-toggle-icon">
                  {visibility.confirm ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="auth-button"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
