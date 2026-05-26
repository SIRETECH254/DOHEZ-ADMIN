

import {Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './app/public/Login';
import ForgotPassword from './app/public/ForgotPassword';
import VerifyOtp from './app/public/VerifyOtp';
import ResetPassword from './app/public/ResetPassword';
import Dashboard from './app/authenticated/Dashboard';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Redirects */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Authenticated Route Placeholder */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}