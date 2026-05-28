

import {Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './app/public/auth/Login';
import ForgotPassword from './app/public/auth/ForgotPassword';
import VerifyOtp from './app/public/auth/VerifyOtp';
import ResetPassword from './app/public/auth/ResetPassword';
import Dashboard from './app/authenticated/Dashboard';
import Layout from './components/layout/layout'

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>

        {/* Redirects */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
          }
        />

        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* authenticated Routes */}
        <Route element={<Layout/>}>

          <Route path="/dashboard" element={ <Dashboard />} />
          
        </Route>

        
       
      </Routes>
    </>
  );
}