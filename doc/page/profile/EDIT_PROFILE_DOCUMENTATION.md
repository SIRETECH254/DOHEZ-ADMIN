# Edit Profile Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [Form State](#form-state)
- [Functions Involved](#functions-involved)
- [API Integration](#api-integration)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Inputs](#form-inputs)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';
import { useAuth } from '../../../contexts/AuthContext';
```

## Context and State Management

### Context

#### `Auth`
- **Hook usage on edit profile screen:** `const { user, updateProfile } = useAuth();`

**`updateProfile` function (from `AuthContext.tsx`):**
```tsx
const updateProfile = async (
  profileData: UpdateProfilePayload | FormData,
): Promise<AuthResult> => {
  try {
    const response = await userAPI.updateProfile(profileData);
    const updatedUser = response.data.data?.user ?? response.data.data;

    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch(updateUser(updatedUser));
      dispatch(setAuthSuccess(updatedUser));
    }

    return { success: true, user: updatedUser };
  } catch (updateError: any) {
    const errorMessage =
      updateError?.response?.data?.message || updateError?.message || 'Failed to update profile';
    return { success: false, error: errorMessage };
  }
};
```

### Form State

#### `form`
- **Form state:** managed with `useState`, initialized from the `user` object in an `useEffect`.
```tsx
const [form, setForm] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  avatar: null as string | null
})
```

#### `avatarFile`
- **File state:** tracks the actual `File` object for multipart upload.
```tsx
const [avatarFile, setAvatarFile] = useState<File | null>(null);
```

#### `avatarPreview`
- **Preview state:** stores the local blob URL for immediate UI feedback.
```tsx
const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
```

#### `message`
- **Feedback state:** stores success or error messages after a submission attempt.
```tsx
const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
```

#### `isSubmitting`
- **Loading state:** boolean to disable buttons while the update request is in progress.
```tsx
const [isSubmitting, setIsSubmitting] = useState(false)
```

## Functions Involved

### `handleSubmit()`
**purpose:** Validates and submits the updated profile data to the authentication context. Automatically switches between JSON and Multipart payloads based on whether an avatar file is selected.

**process:**
1. Prevents default browser form submission.
2. Resets any previous `message` and sets `isSubmitting` to `true`.
3. **Payload Determination:**
    - **Multipart:** If a new `avatarFile` is selected, constructs a `FormData` object and appends all profile fields plus the image file.
    - **JSON:** If no new image is selected, constructs a standard object with text fields.
4. Calls the `updateProfile` function from the auth context.
5. If successful, displays a success message and clears the local file reference.
6. If it fails, displays the error message provided by the API or a fallback.
7. Sets `isSubmitting` to `false` in the `finally` block.

**function implementation:**
```tsx
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    let payload: any;
    
    if (avatarFile) {
      const formData = new FormData();
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('phone', form.phone);
      formData.append('avatar', avatarFile);
      payload = formData;
    } else {
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
```

### `handleInputChange()`
**purpose:** Updates the local form state and clears previous feedback messages.

**process:**
1. Extracts the field name and new value from the event.
2. Updates the `form` state.
3. Clears the `message` state to ensure the user doesn't see stale feedback while editing.

**function implementation:**
```tsx
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  }, []);
```

### `handleBack()`
**purpose:** Navigates the user back to the profile detail page.

**process:**
1. Triggers the `navigate` function with the path `/profile`.

**function implementation:**
```tsx
  const handleBack = useCallback(() => {
    navigate('/profile');
  }, [navigate]);
```

### `handleAvatarChange()`
**purpose:** Handles image file selection from the user's device.

**process:**
1. Extracts the first file from the input event.
2. Updates `avatarFile` state with the raw file.
3. Generates a local URL using `URL.createObjectURL` and updates `avatarPreview`.

**function implementation:**
```tsx
  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setMessage(null);
    }
  }, []);
```

### `triggerFileInput()`
**purpose:** Programmically triggers the hidden file input.

**function implementation:**
```tsx
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
```

## API Integration

### `PUT /api/users/profile`

#### Interface
```tsx
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string | null;
}
```

#### Payload
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string"
}
```

#### API
```typescript
export const userAPI = {
  // Update own profile
  updateProfile: (profileData: UpdateProfilePayload | FormData) =>
    profileData instanceof FormData
      ? api.put('/api/users/profile', profileData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put('/api/users/profile', profileData),
}
```

#### Auth Function
```tsx
const updateProfile = async (
  profileData: UpdateProfilePayload | FormData,
): Promise<AuthResult> => {
  try {
    const response = await userAPI.updateProfile(profileData);
    const updatedUser = response.data.data?.user ?? response.data.data;

    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch(updateUser(updatedUser));
      dispatch(setAuthSuccess(updatedUser));
    }

    return { success: true, user: updatedUser };
  } catch (updateError: any) {
    const errorMessage =
      updateError?.response?.data?.message || updateError?.message || 'Failed to update profile';
    return { success: false, error: errorMessage };
  }
};
```

#### Contract
`data.data` contains the updated `user` object.

#### Response
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "avatar": "string"
    }
  }
}
```

#### Payload Behavior
- **JSON:** Sent when only text fields are updated.
- **Multipart:** Sent when an avatar file is selected. The component automatically wraps fields in `FormData`.

## UI Structure
- **Header:** Contains a back button (`MdArrowBack`) and the page title.
- **Avatar Section:** Circular preview with an overlay icon (`MdCameraAlt`) indicating it can be changed.
- **Form Card:** A white background card containing the input fields.
- **Inputs:** Uses project-standard classes (`input`, `input-disabled`).
- **Feedback:** A color-coded banner for success (green) or error (red) messages.

## Planned Layout
```
┌─────────────────────────────────┐
│ [<-] Edit Profile               │
├─────────────────────────────────┤
│        [ Avatar Preview ]       │
│           Change photo          │
├─────────────────────────────────┤
│  [ First Name ] [ Last Name ]   │
├─────────────────────────────────┤
│        [ Email (Locked) ]       │
├─────────────────────────────────┤
│         [ Phone Number ]        │
├─────────────────────────────────┤
│        [ Save Changes ]         │
│           [ Cancel ]            │
└─────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│  <- Edit Profile                              │
│                                               │
│             [   ( JD )   ]                    │
│             Change photo                      │
│                                               │
│  [ Banner: Profile updated! (Green) ]         │
│                                               │
│  First Name            Last Name              │
│  [ John___________ ]  [ Doe______________ ]   │
│                                               │
│  Email Address (Read-only)                    │
│  [ john.doe@example.com_________________ ]    │
│                                               │
│  Phone Number                                 │
│  [ +254 700 000 000_____________________ ]    │
│                                               │
│        [    Save Changes (gold)    ]          │
│               Cancel                          │
└───────────────────────────────────────────────┘
```

## Form Inputs

### `First Name Field`
**Purpose**: Collects the user's first name.
**Applicable**: Uses `autoComplete="given-name"` for better UX.

**Input implementation**:
```tsx
<input
  id="firstName"
  name="firstName"
  type="text"
  className="input"
  value={form.firstName}
  onChange={handleInputChange}
  autoComplete="given-name"
  required
/>
```

### `Last Name Field`
**Purpose**: Collects the user's last name.
**Applicable**: Uses `autoComplete="family-name"` for better UX.

**Input implementation**:
```tsx
<input
  id="lastName"
  name="lastName"
  type="text"
  className="input"
  value={form.lastName}
  onChange={handleInputChange}
  autoComplete="family-name"
  required
/>
```

### `Email Field`
**Purpose**: Displays the user's email address.
**Applicable**: Read-only, as email cannot be changed from this profile page.

**Input implementation**:
```tsx
<input
  id="email"
  name="email"
  type="email"
  className="input-disabled"
  value={form.email}
  readOnly
/>
```

### `Phone Field`
**Purpose**: Collects the user's phone number.
**Applicable**: Uses `autoComplete="tel"` for better UX.

**Input implementation**:
```tsx
<input
  id="phone"
  name="phone"
  type="tel"
  className="input"
  value={form.phone}
  onChange={handleInputChange}
  autoComplete="tel"
  placeholder="+254 700 000 000"
/>
```

### `Submit Button`
**Purpose**: Triggers the profile update process.
**Applicable**: Disables when submission is in progress.

**Input implementation**:
```tsx
<button
  type="submit"
  disabled={isSubmitting}
  className="btn-primary w-full"
>
  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
</button>
```

## Error Handling
- Validation is handled by the `required` attribute on inputs.
- API errors are caught in the `handleSubmit` try-catch block and displayed in the feedback banner.
- The "Save Changes" button is disabled during submission to prevent duplicate requests.

## Navigation Flow
- Route: `/profile/edit`.
- Header Back Button / Cancel Button ➞ `/profile`.
- Successful Update ➞ Success message displayed (stays on page).

## Future Enhancements
- Implement real-time avatar upload with Cloudinary integration.
- Add phone number validation using a specialized library.
- Implement "Dirty Check" to warn users if they navigate away with unsaved changes.
