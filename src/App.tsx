

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
import BranchesList from './app/authenticated/branches/BranchesList';
import CreateBranch from './app/authenticated/branches/CreateBranch';
import EditBranch from './app/authenticated/branches/EditBranch';
import BranchDetail from './app/authenticated/branches/BranchDetail';
import ProductTypeList from './app/authenticated/product-types/ProductTypeList';
import CreateProductType from './app/authenticated/product-types/CreateProductType';
import EditProductType from './app/authenticated/product-types/EditProductType';
import ProductTypeDetail from './app/authenticated/product-types/ProductTypeDetail';
import ProductCategoryList from './app/authenticated/product-categories/ProductCategoryList';
import CreateProductCategory from './app/authenticated/product-categories/CreateProductCategory';
import EditProductCategory from './app/authenticated/product-categories/EditProductCategory';
import ProductCategoryDetail from './app/authenticated/product-categories/ProductCategoryDetail';
import ProductModifierList from './app/authenticated/product-modifiers/ProductModifierList';
import CreateProductModifier from './app/authenticated/product-modifiers/CreateProductModifier';
import EditProductModifier from './app/authenticated/product-modifiers/EditProductModifier';
import ProductModifierDetail from './app/authenticated/product-modifiers/ProductModifierDetail';
import ProductVariantList from './app/authenticated/product-variants/ProductVariantList';
import CreateProductVariant from './app/authenticated/product-variants/CreateProductVariant';
import EditProductVariant from './app/authenticated/product-variants/EditProductVariant';
import ProductVariantDetail from './app/authenticated/product-variants/ProductVariantDetail';
import ProductList from './app/authenticated/products/ProductList';
import CreateProduct from './app/authenticated/products/CreateProduct';
import EditProduct from './app/authenticated/products/EditProduct';
import ProductDetail from './app/authenticated/products/ProductDetail';
import EventList from './app/authenticated/events/EventList';
import CreateEvent from './app/authenticated/events/CreateEvent';
import EditEvent from './app/authenticated/events/EditEvent';
import EventDetail from './app/authenticated/events/EventDetail';
import PayTickets from './app/authenticated/events/PayTickets';
import OrderList from './app/authenticated/orders/OrderList';
import OrderDetail from './app/authenticated/orders/OrderDetail';
import AppointmentList from './app/authenticated/appointments/AppointmentList';
import AppointmentDetail from './app/authenticated/appointments/AppointmentDetail';
import ConfirmAppointmentPayment from './app/authenticated/appointments/ConfirmAppointmentPayment';
import PayAppointment from './app/authenticated/appointments/PayAppointment';
import CreateAppointment from './app/authenticated/appointments/CreateAppointment';
import RescheduleAppointment from './app/authenticated/appointments/RescheduleAppointment';
import InvoiceList from './app/authenticated/invoices/InvoiceList';
import InvoiceDetail from './app/authenticated/invoices/InvoiceDetail';
import ReceiptList from './app/authenticated/receipts/ReceiptList';
import ReceiptDetail from './app/authenticated/receipts/ReceiptDetail';
import TicketList from './app/authenticated/tickets/TicketList';
import TicketDetail from './app/authenticated/tickets/TicketDetail';
import EditTicket from './app/authenticated/tickets/EditTicket';
import Cart from './app/authenticated/cart/Cart';
import Checkout from './app/authenticated/cart/Checkout';
import Payment from './app/authenticated/payment/Payment';
import InventoryList from './app/authenticated/inventory/InventoryList';
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

          {/* Branch Management Routes */}
          <Route path="/branches" element={<BranchesList />} />
          <Route path="/branches/new" element={<CreateBranch />} />
          <Route path="/branches/:id" element={<BranchDetail />} />
          <Route path="/branches/:id/edit" element={<EditBranch />} />

          {/* Product Type Management Routes */}
          <Route path="/product-types" element={<ProductTypeList />} />
          <Route path="/product-types/new" element={<CreateProductType />} />
          <Route path="/product-types/:id" element={<ProductTypeDetail />} />
          <Route path="/product-types/:id/edit" element={<EditProductType />} />

          {/* Product Category Management Routes */}
          <Route path="/product-categories" element={<ProductCategoryList />} />
          <Route path="/product-categories/new" element={<CreateProductCategory />} />
          <Route path="/product-categories/:id" element={<ProductCategoryDetail />} />
          <Route path="/product-categories/:id/edit" element={<EditProductCategory />} />

          {/* Product Modifier Management Routes */}
          <Route path="/product-modifiers" element={<ProductModifierList />} />
          <Route path="/product-modifiers/new" element={<CreateProductModifier />} />
          <Route path="/product-modifiers/:id" element={<ProductModifierDetail />} />
          <Route path="/product-modifiers/:id/edit" element={<EditProductModifier />} />

          {/* Product Variant Management Routes */}
          <Route path="/product-variants" element={<ProductVariantList />} />
          <Route path="/product-variants/new" element={<CreateProductVariant />} />
          <Route path="/product-variants/:id" element={<ProductVariantDetail />} />
          <Route path="/product-variants/:id/edit" element={<EditProductVariant />} />

          {/* Product Management Routes */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<CreateProduct />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />
          
          {/* Event Management Routes */}
          <Route path="/events" element={<EventList />} />
          <Route path="/events/new" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/pay-tickets" element={<PayTickets />} />
          <Route path="/events/:id/edit" element={<EditEvent />} />
          
          {/* Order Management Routes */}
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/:id" element={<OrderDetail />} />

          {/* Appointment Management Routes */}
          <Route path="/appointments" element={<AppointmentList />} />
          <Route path="/appointments/new" element={<CreateAppointment />} />
          <Route path="/appointments/:id" element={<AppointmentDetail />} />
          <Route path="/appointments/:id/reschedule" element={<RescheduleAppointment />} />
          <Route path="/appointments/:id/confirm" element={<ConfirmAppointmentPayment />} />
          <Route path="/appointments/:id/pay" element={<PayAppointment />} />

          {/* Invoice Management Routes */}
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />

          {/* Receipt Management Routes */}
          <Route path="/receipts" element={<ReceiptList />} />
          <Route path="/receipts/:id" element={<ReceiptDetail />} />

          {/* Ticket Management Routes */}
          <Route path="/tickets" element={<TicketList />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/tickets/:id/edit" element={<EditTicket />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />

          {/* Inventory Management Routes */}
          <Route path="/inventory" element={<InventoryList />} />

        </Route>

      </Routes>

      </>
  )
}