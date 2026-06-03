

import {Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './app/public/auth/Login';
import ForgotPassword from './app/public/auth/ForgotPassword';
import VerifyOtp from './app/public/auth/VerifyOtp';
import ResetPassword from './app/public/auth/ResetPassword';
import Dashboard from './app/authenticated/Dashboard/Dashboard';
import Profile from './app/authenticated/profile/Profile';
import EditProfile from './app/authenticated/profile/EditProfile';
import ChangePassword from './app/authenticated/profile/ChangePassword';
import UsersList from './app/authenticated/users/UsersList';
import UserDetail from './app/authenticated/users/UserDetail';
import EditUser from './app/authenticated/users/EditUser';
import RolesList from './app/authenticated/roles/RolesList';
import RoleDetail from './app/authenticated/roles/RoleDetail';
import EditRole from './app/authenticated/roles/EditRole';
import CreateRole from './app/authenticated/roles/CreateRole';
import TaskList from './app/authenticated/tasks/TaskList';
import TaskDetail from './app/authenticated/tasks/TaskDetail';
import EditTask from './app/authenticated/tasks/EditTask';
import CreateTask from './app/authenticated/tasks/CreateTask';
import ServiceList from './app/authenticated/services/ServiceList';
import CreateService from './app/authenticated/services/CreateService';
import EditService from './app/authenticated/services/EditService';
import ServiceDetail from './app/authenticated/services/ServiceDetail';
import VendorTypeList from './app/authenticated/vendor-types/VendorTypeList';
import CreateVendorType from './app/authenticated/vendor-types/CreateVendorType';
import EditVendorType from './app/authenticated/vendor-types/EditVendorType';
import VendorTypeDetail from './app/authenticated/vendor-types/VendorTypeDetail';
import VendorCategoryList from './app/authenticated/vendor-categories/VendorCategoryList';
import CreateVendorCategory from './app/authenticated/vendor-categories/CreateVendorCategory';
import EditVendorCategory from './app/authenticated/vendor-categories/EditVendorCategory';
import VendorCategoryDetail from './app/authenticated/vendor-categories/VendorCategoryDetail';
import VendorList from './app/authenticated/vendors/VendorList';
import CreateVendor from './app/authenticated/vendors/CreateVendor';
import EditVendor from './app/authenticated/vendors/EditVendor';
import VendorDetail from './app/authenticated/vendors/VendorDetail';
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
          {/* Profile Routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/change-password" element={<ChangePassword />} />
          
          {/* User Management Routes */}
          <Route path="/users" element={<UsersList />} />
          <Route path="/users/:userId" element={<UserDetail />} />
          <Route path="/users/:userId/edit" element={<EditUser />} />

          {/* Role Management Routes */}
          <Route path="/roles" element={<RolesList />} />
          <Route path="/roles/new" element={<CreateRole />} />
          <Route path="/roles/:roleId" element={<RoleDetail />} />
          <Route path="/roles/:roleId/edit" element={<EditRole />} />

          {/* Task Management Routes */}
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/new" element={<CreateTask />} />
          <Route path="/tasks/:taskId" element={<TaskDetail />} />
          <Route path="/tasks/:taskId/edit" element={<EditTask />} />

          {/* Service Management Routes */}
          <Route path="/services" element={<ServiceList />} />
          <Route path="/services/new" element={<CreateService />} />
          <Route path="/services/:serviceId" element={<ServiceDetail />} />
          <Route path="/services/:serviceId/edit" element={<EditService />} />

          {/* Vendor Type Management Routes */}
          <Route path="/vendor-types" element={<VendorTypeList />} />
          <Route path="/vendor-types/new" element={<CreateVendorType />} />
          <Route path="/vendor-types/:id" element={<VendorTypeDetail />} />
          <Route path="/vendor-types/:id/edit" element={<EditVendorType />} />

          {/* Vendor Category Management Routes */}
          <Route path="/vendor-categories" element={<VendorCategoryList />} />
          <Route path="/vendor-categories/new" element={<CreateVendorCategory />} />
          <Route path="/vendor-categories/:id" element={<VendorCategoryDetail />} />
          <Route path="/vendor-categories/:id/edit" element={<EditVendorCategory />} />

          {/* Vendor Management Routes */}
          <Route path="/vendors" element={<VendorList />} />
          <Route path="/vendors/new" element={<CreateVendor />} />
          <Route path="/vendors/:id" element={<VendorDetail />} />
          <Route path="/vendors/:id/edit" element={<EditVendor />} />

        </Route>

      </Routes>

      </>
  )
}