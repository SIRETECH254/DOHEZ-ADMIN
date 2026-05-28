import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { useAuth } from '../../../contexts/AuthContext';

// Main component for editing user profile information
export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateProfile } = useAuth();

  // Local state for the form fields
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '' as string | null,
  });

  // Track the actual file object for multipart upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  // Track a preview URL for the selected image
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // State for handling submission feedback and loading status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize the form with existing user data from AuthContext
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || null,
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  // Handle navigation back to the profile detail page
  const handleBack = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  // Handle changes to text input fields
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear message when user starts typing
    setMessage(null);
  }, []);

  // Handle avatar file selection and preview creation
  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create a local URL for the image preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setMessage(null);
    }
  }, []);

  // Trigger the hidden file input
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle form submission to update the profile via AuthContext
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // If an avatar file is present, we must use FormData for a multipart/form-data request
    let payload: any;
    
    if (avatarFile) {
      // Create FormData for multipart submission
      const formData = new FormData();
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('phone', form.phone);
      formData.append('avatar', avatarFile);
      payload = formData;
    } else {
      // Use standard JSON payload if no file is being uploaded
      payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      };
    }

    try {
      const result = await updateProfile(payload);
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Clear the file state after successful upload
        setAvatarFile(null);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, avatarFile, updateProfile]);

  return (
    <div className=" p-6">
      {/* Header section with back button and title */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <MdArrowBack size={24} className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Avatar picker section */}
          <div className="flex flex-col items-center mb-8">
            <div 
              onClick={triggerFileInput}
              className="relative group cursor-pointer"
            >
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Profile" 
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md group-hover:opacity-75 transition-opacity"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-4xl font-bold border-4 border-white shadow-md group-hover:opacity-75 transition-opacity">
                  {form.firstName?.charAt(0)}{form.lastName?.charAt(0)}
                </div>
              )}
              {/* Overlay camera icon for avatar editing */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/40 rounded-full p-2">
                  <MdCameraAlt className="text-white text-2xl" />
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 font-medium">Click to change photo</p>
          </div>

          {/* Feedback message banner */}
          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          {/* Form fields grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="label ml-1" htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="input"
                value={form.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="label ml-1" htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="input"
                value={form.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="label ml-1" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-disabled"
              value={form.email}
              readOnly // Email is usually managed through auth flows, so we mark it as read-only here
            />
            <p className="text-xs text-gray-400 ml-1">Email address cannot be changed from this profile page.</p>
          </div>

          <div className="space-y-2">
            <label className="label ml-1" htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input"
              value={form.phone}
              onChange={handleInputChange}
              placeholder="+254 700 000 000"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="btn-ghost w-full"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
