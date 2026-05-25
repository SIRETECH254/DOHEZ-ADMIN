# Dohez Admin API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints available in the Dohez Admin application. The API follows RESTful conventions and uses JWT-based authentication with role-based access control.

**Base URL:** `http://localhost:4500` (configurable via `VITE_API_URL` environment variable)

All API endpoints are prefixed with `/api`, so the full URL format is: `http://localhost:4500/api/{endpoint}`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

### Authentication Flow

1. **Login/Register** - Obtain access token and refresh token
2. **OTP Verification** - Verify account via OTP sent to email/phone
3. **Token Storage** - Tokens are stored in localStorage
4. **Automatic Refresh** - Access tokens are automatically refreshed when expired (401 response)
5. **Token Refresh** - Use refresh token to get a new access token

### Role-Based Access Control

The system uses a unified user model with roles:
- `customer` - Regular users of the application
- `staff` - Staff members with elevated permissions
- `admin` - Administrators managing the system

---

## API Endpoints

### Auth Endpoints

**Base:** `/api/auth`

#### Register
- **Endpoint:** `POST /auth/register`
- **Description:** User registration with OTP verification
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "password": "string",
    "role": "string" (optional, defaults to "customer")
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully. Please verify your account with the OTP sent.",
    "data": {
      "userId": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "roles": [
        {
          "_id": "string",
          "name": "string",
          "displayName": "string"
        }
      ],
      "isVerified": false
    }
  }
  ```

#### Verify OTP
- **Endpoint:** `POST /auth/verify-otp`
- **Description:** Verify OTP and activate account
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "string" (or phone),
    "phone": "string" (or email),
    "otp": "string"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Account verified successfully",
    "data": {
      "user": {
        "id": "string",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string",
        "roles": [...],
        "isVerified": true
      },
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
  ```

#### Resend OTP
- **Endpoint:** `POST /auth/resend-otp`
- **Description:** Resend OTP for verification
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "string" (or phone),
    "phone": "string" (or email)
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "OTP has been resent to your email and phone",
    "data": {
      "userId": "string",
      "email": "string",
      "phone": "string",
      "otpExpiry": "ISO Date String"
    }
  }
  ```

#### Login
- **Endpoint:** `POST /auth/login`
- **Description:** User login (email/phone + password)
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "string" (or phone),
    "phone": "string" (or email),
    "password": "string"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "string",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string",
        "avatar": "string",
        "roles": [...],
        "isVerified": true
      },
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
  ```

#### Logout
- **Endpoint:** `POST /auth/logout`
- **Description:** Logout user
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

#### Forgot Password
- **Endpoint:** `POST /auth/forgot-password`
- **Description:** Send password reset instructions
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "string"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Password reset instructions sent to your email and phone"
  }
  ```

#### Reset Password
- **Endpoint:** `POST /auth/reset-password/:token`
- **Description:** Reset password with token
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "newPassword": "string"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Password reset successfully"
  }
  ```

#### Refresh Token
- **Endpoint:** `POST /auth/refresh-token`
- **Description:** Refresh JWT access token
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
  ```

#### Get Current User
- **Endpoint:** `GET /auth/me`
- **Description:** Get current authenticated user profile
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "string",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string",
        "avatar": "string",
        "roles": [...],
        "isActive": true,
        "isVerified": true,
        "lastLoginAt": "ISO Date String",
        "createdAt": "ISO Date String"
      }
    }
  }
  ```

---

### User Endpoints

**Base:** `/api/users`

#### Get Own Profile
- **Endpoint:** `GET /users/profile`
- **Description:** Get current user profile
- **Auth Required:** Yes
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "650af1234567890abcdef123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      }
    }
  }
  ```

#### Update Own Profile
- **Endpoint:** `PUT /users/profile`
- **Description:** Update own profile
- **Auth Required:** Yes
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body:** `multipart/form-data` (firstName, lastName, phone, avatar)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "user": {
        "id": "650af1234567890abcdef123",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890",
        "avatar": "https://cloudinary.com/..."
      }
    }
  }
  ```

#### Change Password
- **Endpoint:** `PUT /users/change-password`
- **Description:** Change user password
- **Auth Required:** Yes
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newSecurePassword123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```

#### Get Notification Preferences
- **Endpoint:** `GET /users/notifications`
- **Description:** Get notification preferences
- **Auth Required:** Yes
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "notificationPreferences": {
        "email": true,
        "sms": true,
        "inApp": true
      }
    }
  }
  ```

#### Update Notification Preferences
- **Endpoint:** `PUT /users/notifications`
- **Description:** Update notification preferences
- **Auth Required:** Yes
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "email": true,
    "sms": true,
    "inApp": true
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Preferences updated",
    "data": {
      "notificationPreferences": {
        "email": true,
        "sms": true,
        "inApp": true
      }
    }
  }
  ```

#### Admin Create User
- **Endpoint:** `POST /users/admin-create`
- **Description:** Admin create customer
- **Auth Required:** Yes (Admin/Staff)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
  ```json
  {
    "firstName": "Jane",
    "lastName": "Customer",
    "email": "jane@customer.com",
    "phone": "+1987654321"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "650af1234567890abcdef124",
        "email": "jane@customer.com"
      }
    }
  }
  ```

#### Get Customers
- **Endpoint:** `GET /users/customers`
- **Description:** Get all customers (admin)
- **Auth Required:** Yes (Admin/Staff)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "users": [
        {
          "id": "650af1234567890abcdef123",
          "firstName": "John",
          "lastName": "Doe"
        }
      ]
    }
  }
  ```

#### Get Staff
- **Endpoint:** `GET /users/staff`
- **Description:** Get staff (any authenticated user)
- **Auth Required:** Yes
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "users": [
        {
          "id": "650af1234567890abcdef123",
          "firstName": "John",
          "lastName": "Doe"
        }
      ]
    }
  }
  ```

#### Get All Users
- **Endpoint:** `GET /users`
- **Description:** Get all users (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Query:** `page=1`, `limit=10`, `search=John`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "users": [
        {
          "id": "650af1234567890abcdef123",
          "firstName": "John",
          "lastName": "Doe"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalUsers": 1
      }
    }
  }
  ```

#### Get User by ID
- **Endpoint:** `GET /users/:userId`
- **Description:** Get single user (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "650af1234567890abcdef123",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  }
  ```

#### Update User
- **Endpoint:** `PUT /users/:userId`
- **Description:** Update user (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: multipart/form-data`
- **Body:** `multipart/form-data` (firstName, lastName, email, phone, isActive, avatar)
- **Response:**
  ```json
  {
    "success": true,
    "message": "User updated successfully",
    "data": {
      "user": {
        "id": "650af1234567890abcdef123",
        "firstName": "John",
        "avatar": "https://cloudinary.com/..."
      }
    }
  }
  ```

#### Update User Status
- **Endpoint:** `PUT /users/:userId/status`
- **Description:** Update user status (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
  ```json
  {
    "isActive": false
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Status updated"
  }
  ```

#### Set User Admin Role
- **Endpoint:** `PUT /users/:userId/admin`
- **Description:** Set user admin role (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "User is now admin"
  }
  ```

#### Get User Roles
- **Endpoint:** `GET /users/:userId/roles`
- **Description:** Get user roles (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "roles": [
        {
          "name": "admin",
          "displayName": "Admin"
        }
      ]
    }
  }
  ```

#### Delete User
- **Endpoint:** `DELETE /users/:userId`
- **Description:** Delete user (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "User deleted"
  }
  ```

#### Assign Role to User
- **Endpoint:** `POST /users/:userId/roles`
- **Description:** Assign role to user (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
  ```json
  {
    "roleName": "staff"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Role assigned"
  }
  ```

#### Remove Role from User
- **Endpoint:** `DELETE /users/:userId/roles/:roleId`
- **Description:** Remove role from user (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Role removed"
  }
  ```

---

### Role Endpoints

**Base:** `/api/roles`

#### Get All Roles
- **Endpoint:** `GET /roles`
- **Description:** Get all roles (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Query:** `isActive=true`, `search=admin`, `page=1`, `limit=10`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "roles": [
        {
          "_id": "650af1234567890abcdef001",
          "name": "admin",
          "displayName": "Admin",
          "description": "Full system access for administrators",
          "permissions": ["*"],
          "isActive": true,
          "isSystemRole": true,
          "createdAt": "2026-05-20T08:00:00.000Z",
          "updatedAt": "2026-05-20T08:00:00.000Z",
          "__v": 0
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalRoles": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

#### Get Single Role
- **Endpoint:** `GET /roles/:roleId`
- **Description:** Get single role (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "650af1234567890abcdef001",
      "name": "admin",
      "displayName": "Admin",
      "description": "Full system access for administrators",
      "permissions": ["*"],
      "isActive": true,
      "isSystemRole": true,
      "createdAt": "2026-05-20T08:00:00.000Z",
      "updatedAt": "2026-05-20T08:00:00.000Z",
      "__v": 0
    }
  }
  ```

#### Create Role
- **Endpoint:** `POST /roles`
- **Description:** Create role (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
  ```json
  {
    "name": "support_agent",
    "displayName": "Support Agent",
    "description": "Role for customer support agents",
    "permissions": ["view_customers", "reply_tickets"],
    "isActive": true
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "650af1234567890abcdef005",
      "name": "support_agent",
      "displayName": "Support Agent",
      "description": "Role for customer support agents",
      "permissions": ["view_customers", "reply_tickets"],
      "isActive": true,
      "isSystemRole": false,
      "createdAt": "2026-05-22T10:00:00.000Z",
      "updatedAt": "2026-05-22T10:00:00.000Z",
      "__v": 0
    }
  }
  ```

#### Update Role
- **Endpoint:** `PUT /roles/:roleId`
- **Description:** Update role (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
  ```json
  {
    "displayName": "Senior Support Agent",
    "permissions": ["view_customers", "reply_tickets", "manage_tickets"]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "650af1234567890abcdef005",
      "name": "support_agent",
      "displayName": "Senior Support Agent",
      "description": "Role for customer support agents",
      "permissions": ["view_customers", "reply_tickets", "manage_tickets"],
      "isActive": true,
      "isSystemRole": false,
      "createdAt": "2026-05-22T10:00:00.000Z",
      "updatedAt": "2026-05-22T10:05:00.000Z",
      "__v": 0
    }
  }
  ```

#### Delete Role
- **Endpoint:** `DELETE /roles/:roleId`
- **Description:** Delete role (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Role deleted successfully"
  }
  ```

#### Get Users by Role
- **Endpoint:** `GET /roles/:roleId/users`
- **Description:** Get users by role (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "650af1234567890abcdef888",
        "firstName": "Super",
        "lastName": "Admin",
        "email": "admin@dohez.com"
      }
    ]
  }
  ```

#### Get Customers
- **Endpoint:** `GET /roles/customer/users`
- **Description:** Get customers (admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "_id": "650af1234567890abcdef123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      },
      {
        "_id": "650af1234567890abcdef124",
        "firstName": "Jane",
        "lastName": "Customer",
        "email": "jane@customer.com"
      }
    ]
  }
  ```

---

### Task Endpoints

**Base:** `/api/tasks`

#### Get All Tasks
- **Endpoint:** `GET /tasks`
- **Description:** Get all tasks (Public)
- **Auth Required:** No (Optional Bearer token for admin view)
- **Query:** `search=Laundry`, `all=true`, `page=1`, `limit=10`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "tasks": [
        {
          "_id": "650af1234567890abcdef123",
          "name": "Laundry",
          "description": "Professional washing services",
          "isActive": true,
          "image": "https://res.cloudinary.com/demo/image/upload/v123/task.jpg",
          "imagePublicId": "tasks/task_image_123",
          "createdAt": "2023-09-20T12:00:00.000Z",
          "updatedAt": "2023-09-20T12:00:00.000Z",
          "__v": 0
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalTasks": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

#### Get Task Details
- **Endpoint:** `GET /tasks/:taskId`
- **Description:** Get task details (Public)
- **Auth Required:** No
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "task": {
        "_id": "650af1234567890abcdef123",
        "name": "Laundry",
        "description": "Professional washing and ironing services",
        "isActive": true,
        "image": "https://res.cloudinary.com/demo/image/upload/v123/task.jpg",
        "imagePublicId": "tasks/task_image_123",
        "createdAt": "2023-09-20T12:00:00.000Z",
        "updatedAt": "2023-09-21T10:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Create Task
- **Endpoint:** `POST /tasks`
- **Description:** Create task (Super Admin)
- **Auth Required:** Yes (Super Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body:** `multipart/form-data` (name, description, isActive, image)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Task created successfully",
    "data": {
      "task": {
        "_id": "650af1234567890abcdef124",
        "name": "Cleaning",
        "description": "Full house cleaning",
        "isActive": true,
        "image": null,
        "imagePublicId": null,
        "createdAt": "2026-05-22T10:00:00.000Z",
        "updatedAt": "2026-05-22T10:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Update Task
- **Endpoint:** `PUT /tasks/:taskId`
- **Description:** Update task (Super Admin)
- **Auth Required:** Yes (Super Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body:** `multipart/form-data` (name, description, isActive, image)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Task updated successfully",
    "data": {
      "task": {
        "_id": "650af1234567890abcdef123",
        "name": "Laundry Premium",
        "description": "Express washing services",
        "isActive": true,
        "image": "https://res.cloudinary.com/demo/image/upload/v123/task.jpg",
        "imagePublicId": "tasks/task_image_123",
        "createdAt": "2023-09-20T12:00:00.000Z",
        "updatedAt": "2026-05-22T11:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Delete Task
- **Endpoint:** `DELETE /tasks/:taskId`
- **Description:** Delete task (Super Admin)
- **Auth Required:** Yes (Super Admin)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```

---

### Service Endpoints

**Base:** `/api/services`

#### Get All Services
- **Endpoint:** `GET /services`
- **Description:** Get all services (Public)
- **Auth Required:** No (Optional Bearer token for admin view)
- **Query:** `task=650af1234567890abcdef000`, `search=Suit`, `all=true`, `page=1`, `limit=10`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "services": [
        {
          "_id": "650af1234567890abcdef123",
          "task": {
            "_id": "650af1234567890abcdef000",
            "name": "Laundry"
          },
          "name": "Suit Wash",
          "description": "Dry cleaning and steam press for premium suits",
          "isActive": true,
          "image": "https://res.cloudinary.com/demo/image/upload/v123/service.jpg",
          "imagePublicId": "dohez/services/suit_123",
          "createdAt": "2026-04-24T12:00:00.000Z",
          "updatedAt": "2026-04-24T12:00:00.000Z",
          "__v": 0
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalServices": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

#### Get Service Details
- **Endpoint:** `GET /services/:serviceId`
- **Description:** Get service details (Public)
- **Auth Required:** No
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "service": {
        "_id": "650af1234567890abcdef123",
        "task": {
          "_id": "650af1234567890abcdef000",
          "name": "Laundry",
          "description": "Professional cleaning services",
          "image": "https://res.cloudinary.com/dohez/image/upload/task.jpg"
        },
        "name": "Suit Wash",
        "description": "Dry cleaning and steam press for premium suits",
        "isActive": true,
        "image": "https://res.cloudinary.com/demo/image/upload/v123/service.jpg",
        "imagePublicId": "dohez/services/suit_123",
        "createdAt": "2026-04-24T12:00:00.000Z",
        "updatedAt": "2026-04-24T12:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Create Service
- **Endpoint:** `POST /services`
- **Description:** Create service (Super Admin)
- **Auth Required:** Yes (Super Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body:** `multipart/form-data` (task, name, description, isActive, image)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Service created successfully",
    "data": {
      "service": {
        "_id": "650af1234567890abcdef125",
        "task": "650af1234567890abcdef000",
        "name": "Deluxe Wash",
        "description": "Deep clean with premium detergents",
        "isActive": true,
        "image": null,
        "imagePublicId": null,
        "createdAt": "2026-05-22T10:00:00.000Z",
        "updatedAt": "2026-05-22T10:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Update Service
- **Endpoint:** `PUT /services/:serviceId`
- **Description:** Update service (Super Admin)
- **Auth Required:** Yes (Super Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body:** `multipart/form-data` (task, name, description, isActive, image)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Service updated successfully",
    "data": {
      "service": {
        "_id": "650af1234567890abcdef123",
        "task": "650af1234567890abcdef000",
        "name": "Premium Suit Wash",
        "description": "Express dry cleaning",
        "isActive": true,
        "image": "https://res.cloudinary.com/demo/image/upload/v123/service.jpg",
        "imagePublicId": "dohez/services/suit_123",
        "createdAt": "2026-04-24T12:00:00.000Z",
        "updatedAt": "2026-05-22T11:30:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Delete Service
- **Endpoint:** `DELETE /services/:serviceId`
- **Description:** Delete service (Super Admin)
- **Auth Required:** Yes (Super Admin)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Service deleted successfully"
  }
  ```

---

### Vendor Type Endpoints

**Base:** `/api/vendor-types`

#### Get All Vendor Types
- **Endpoint:** `GET /vendor-types`
- **Description:** Get all vendor types (Public)
- **Auth Required:** No (Optional Bearer token for admin view)
- **Query:** `search=Product`, `all=true`, `page=1`, `limit=10`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "vendorTypes": [
        {
          "_id": "650af1234567890abcdef123",
          "name": "Product Vendor",
          "description": "Vendors selling physical products",
          "slug": "product-vendor",
          "image": "https://res.cloudinary.com/dohez/image/upload/v1/types/product.jpg",
          "imagePublicId": "dohez/vendor-types/product_img_123",
          "isActive": true,
          "createdAt": "2026-05-20T10:30:00.000Z",
          "updatedAt": "2026-05-20T10:30:00.000Z",
          "__v": 0
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalTypes": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

#### Get Vendor Type Details
- **Endpoint:** `GET /vendor-types/:idOrSlug`
- **Description:** Get vendor type details (Public)
- **Auth Required:** No
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "vendorType": {
        "_id": "650af1234567890abcdef123",
        "name": "Product Vendor",
        "description": "Vendors selling physical products",
        "slug": "product-vendor",
        "image": "https://res.cloudinary.com/dohez/image/upload/v1/types/product.jpg",
        "imagePublicId": "dohez/vendor-types/product_img_123",
        "isActive": true,
        "createdAt": "2026-05-20T10:30:00.000Z",
        "updatedAt": "2026-05-20T10:30:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Create Vendor Type
- **Endpoint:** `POST /vendor-types`
- **Description:** Create vendor type (Super Admin)
- **Auth Required:** Yes (Super Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body:** `multipart/form-data` (name, description, isActive, image)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Vendor type created successfully",
    "data": {
      "vendorType": {
        "_id": "650af1234567890abcdef124",
        "name": "Service Vendor",
        "description": "Vendors providing specialized services",
        "slug": "service-vendor",
        "image": "https://res.cloudinary.com/dohez/image/upload/v1/types/service.jpg",
        "imagePublicId": "dohez/vendor-types/service_img_456",
        "isActive": true,
        "createdAt": "2026-05-25T14:15:00.000Z",
        "updatedAt": "2026-05-25T14:15:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Update Vendor Type
- **Endpoint:** `PUT /vendor-types/:vendorTypeId`
- **Description:** Update vendor type (Super Admin)
- **Auth Required:** Yes (Super Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body:** `multipart/form-data` (name, description, isActive, image)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Vendor type updated successfully",
    "data": {
      "vendorType": {
        "_id": "650af1234567890abcdef123",
        "name": "Physical Product Vendor",
        "description": "Updated description for physical product vendors",
        "slug": "physical-product-vendor",
        "image": "https://res.cloudinary.com/dohez/image/upload/v1/types/updated_product.jpg",
        "imagePublicId": "dohez/vendor-types/updated_product_img_789",
        "isActive": true,
        "createdAt": "2026-05-20T10:30:00.000Z",
        "updatedAt": "2026-05-25T15:20:00.000Z",
        "__v": 1
      }
    }
  }
  ```

#### Delete Vendor Type
- **Endpoint:** `DELETE /vendor-types/:vendorTypeId`
- **Description:** Delete vendor type (Super Admin)
- **Auth Required:** Yes (Super Admin)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Vendor type deleted successfully"
  }
  ```

---

### Vendor Category Endpoints

**Base:** `/api/vendor-categories`

#### Get All Vendor Categories
- **Endpoint:** `GET /vendor-categories`
- **Description:** Get all vendor categories (Public)
- **Auth Required:** No (Optional Bearer token for admin view)
- **Query:** `search=Food`, `all=true`, `page=1`, `limit=10`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "categories": [
        {
          "_id": "650af1234567890abcdef123",
          "vendorType": null,
          "name": "Food & Drinks",
          "description": "Restaurants, cafes and beverage providers",
          "slug": "food-drinks",
          "image": "https://res.cloudinary.com/dohez/image/upload/v1/categories/food.jpg",
          "imagePublicId": "dohez/vendor-categories/food_img_123",
          "isActive": true,
          "createdAt": "2026-05-25T10:00:00.000Z",
          "updatedAt": "2026-05-25T10:00:00.000Z",
          "__v": 0
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalCategories": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

#### Get Vendor Category Details
- **Endpoint:** `GET /vendor-categories/:idOrSlug`
- **Description:** Get vendor category details (Public)
- **Auth Required:** No
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "category": {
        "_id": "650af1234567890abcdef123",
        "vendorType": null,
        "name": "Food & Drinks",
        "description": "Restaurants, cafes and beverage providers",
        "slug": "food-drinks",
        "image": "https://res.cloudinary.com/dohez/image/upload/v1/categories/food.jpg",
        "imagePublicId": "dohez/vendor-categories/food_img_123",
        "isActive": true,
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T10:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Create Vendor Category
- **Endpoint:** `POST /vendor-categories`
- **Description:** Create vendor category (Super Admin)
- **Auth Required:** Yes (Super Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body:** `multipart/form-data` (name, description, isActive, vendorType, image)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Vendor category created successfully",
    "data": {
      "category": {
        "_id": "650af1234567890abcdef123",
        "vendorType": null,
        "name": "Food & Drinks",
        "description": "Restaurants, cafes and beverage providers",
        "slug": "food-drinks",
        "image": "https://res.cloudinary.com/dohez/image/upload/v1/categories/food.jpg",
        "imagePublicId": "dohez/vendor-categories/food_img_123",
        "isActive": true,
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T10:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Update Vendor Category
- **Endpoint:** `PUT /vendor-categories/:categoryId`
- **Description:** Update vendor category (Super Admin)
- **Auth Required:** Yes (Super Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body:** `multipart/form-data` (name, description, isActive, vendorType, image)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Vendor category updated successfully",
    "data": {
      "category": {
        "_id": "650af1234567890abcdef123",
        "vendorType": null,
        "name": "Food & Beverages",
        "description": "Restaurants, cafes and beverage providers",
        "slug": "food-beverages",
        "image": "https://res.cloudinary.com/dohez/image/upload/v1/categories/food.jpg",
        "imagePublicId": "dohez/vendor-categories/food_img_123",
        "isActive": true,
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T15:00:00.000Z",
        "__v": 1
      }
    }
  }
  ```

#### Delete Vendor Category
- **Endpoint:** `DELETE /vendor-categories/:categoryId`
- **Description:** Delete vendor category (Super Admin)
- **Auth Required:** Yes (Super Admin)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Vendor category deleted successfully"
  }
  ```

---

### Vendor Endpoints

**Base:** `/api/vendors`

#### Register Vendor
- **Endpoint:** `POST /vendors/register`
- **Description:** Register a new vendor profile (Super Admin)
- **Auth Required:** Yes (Super Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Request Body (Multipart):**
  - `userId`: string (Required)
  - `name`: string (Required)
  - `description`: string (Optional)
  - `categoryId`: string (Required)
  - `phone`: string (Required)
  - `email`: string (Required)
  - `location`: string (JSON stringified VendorLocation)
  - `workingHours`: string (JSON stringified WorkingHours)
  - `logo`: file (Optional)
  - `banner`: file (Optional)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Vendor registered successfully",
    "data": {
      "vendor": {
        "_id": "650af1234567890abcdef999",
        "userId": "65e26b1c09b068c201383801",
        "name": "Quick Laundry",
        "details": "Professional laundry services",
        "vendorCategory": "650af1234567890abcdef123",
        "phone": "+254700000000",
        "email": "contact@quick.com",
        "location": {
          "address": "Street 123",
          "regions": { "country": "Kenya" },
          "coordinates": { "lat": -1.2921, "lng": 36.8219 },
          "place_id": "chIJsx123"
        },
        "branches": ["650af1234567890abcdef888"],
        "slug": "quick-laundry",
        "isActive": true,
        "isFeatured": false,
        "createdAt": "2026-05-07T10:00:00.000Z",
        "updatedAt": "2026-05-07T10:00:00.000Z"
      },
      "branch": {
        "_id": "650af1234567890abcdef888",
        "vendorId": "650af1234567890abcdef999",
        "name": "Quick Laundry - Main Branch",
        "isMainBranch": true,
        "isActive": true
      }
    }
  }
  ```

#### Get All Vendors
- **Endpoint:** `GET /vendors`
- **Description:** Get all active vendors (Public)
- **Auth Required:** No
- **Query Parameters:**
  - `search`: string (Optional)
  - `page`: number (Default: 1)
  - `limit`: number (Default: 10)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "vendors": [
        {
          "_id": "650af1234567890abcdef999",
          "name": "Quick Laundry",
          "phone": "+254700000000",
          "email": "contact@quick.com",
          "logo": "https://res.cloudinary.com/...",
          "location": { "address": "Street 123" },
          "vendorCategory": { "name": "Laundry", "slug": "laundry" },
          "isActive": true,
          "isFeatured": false
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalVendors": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

#### Get Vendor Details
- **Endpoint:** `GET /vendors/:vendorId`
- **Description:** Get single vendor details (Public)
- **Auth Required:** No
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "vendor": {
        "_id": "650af1234567890abcdef999",
        "name": "Quick Laundry",
        "details": "Professional laundry services",
        "branches": [
          {
            "_id": "650af1234567890abcdef888",
            "name": "Quick Laundry - Main Branch",
            "location": { "address": "Street 123" },
            "workingHours": { "monday": "08:00-18:00" }
          }
        ],
        "vendorCategory": { "name": "Laundry", "slug": "laundry" }
      }
    }
  }
  ```

#### Update Vendor Profile
- **Endpoint:** `PUT /vendors/:vendorId`
- **Description:** Update vendor profile (Admin/Super Admin)
- **Auth Required:** Yes (Admin/Super Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Request Body (Multipart):**
  - `name`: string (Optional)
  - `description`: string (Optional)
  - `categoryId`: string (Optional)
  - `logo`: file (Optional)
  - `banner`: file (Optional)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Vendor profile updated successfully",
    "data": {
      "vendor": {
        "_id": "650af1234567890abcdef999",
        "name": "Quick Laundry Pro",
        "details": "Best laundry in town",
        "updatedAt": "2026-05-07T11:00:00.000Z"
      }
    }
  }
  ```

#### Delete Vendor
- **Endpoint:** `DELETE /vendors/:vendorId`
- **Description:** Delete vendor and its branches (Super Admin)
- **Auth Required:** Yes (Super Admin)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Vendor profile and associated branches deleted successfully"
  }
  ```

---

### Branch Endpoints

**Base:** `/api/branches`

#### Create Branch
- **Endpoint:** `POST /branches`
- **Description:** Create a new branch for a vendor
- **Auth Required:** Yes (Vendor Owner/Admin)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "vendorId": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "object or JSON string",
    "workingHours": "object or JSON string",
    "managerId": "string (optional)"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "branch": {
        "_id": "string",
        "vendorId": "string",
        "name": "string",
        "email": "string",
        "phone": "string",
        "location": {
          "address": "string",
          "coordinates": { "lat": 0, "lng": 0 }
        },
        "workingHours": { ... },
        "gallery": [],
        "createdAt": "ISO Date String"
      }
    }
  }
  ```

#### Get All Branches
- **Endpoint:** `GET /branches`
- **Description:** Get all branches, optionally filtered by vendor
- **Auth Required:** No
- **Query Parameters:**
  - `vendorId`: string (Optional)
  - `page`: number (Default: 1)
  - `limit`: number (Default: 10)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "branches": [...],
      "pagination": {
        "currentPage": 1,
        "totalBranches": 1
      }
    }
  }
  ```

#### Get Branch Details
- **Endpoint:** `GET /branches/:branchId`
- **Description:** Get single branch details
- **Auth Required:** No
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "branch": {
        "_id": "string",
        "name": "string",
        "location": { ... },
        "workingHours": { ... }
      }
    }
  }
  ```

#### Update Branch
- **Endpoint:** `PUT /branches/:branchId`
- **Description:** Update branch details and media
- **Auth Required:** Yes (Vendor Owner/Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Request Body (Multipart):**
  - `name`: string (Optional)
  - `email`: string (Optional)
  - `phone`: string (Optional)
  - `location`: object or JSON string (Optional)
  - `workingHours`: object or JSON string (Optional)
  - `cover`: file (Optional)
  - `gallery`: file(s) (Optional)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Branch updated successfully",
    "data": {
      "branch": {
        "_id": "string",
        "name": "string",
        "updatedAt": "ISO Date String"
      }
    }
  }
  ```

#### Delete Branch
- **Endpoint:** `DELETE /branches/:branchId`
- **Description:** Delete a branch
- **Auth Required:** Yes (Vendor Owner/Admin)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Branch deleted"
  }
  ```

---

### Product Type Endpoints

**Base:** `/api/product-types`

#### Create Product Type
- **Endpoint:** `POST /product-types`
- **Description:** Create a new product type (Admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Request Body (Multipart):**
  - `service`: string (Required)
  - `name`: string (Required)
  - `details`: string (Optional)
  - `order`: number (Optional)
  - `icon`: file (Optional)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "productType": {
        "_id": "650af1234567890abcdef123",
        "service": "650af987654321fedcba0987",
        "name": "Electronics",
        "details": "Electronic devices and accessories",
        "order": 1,
        "slug": "electronics",
        "icon": "https://res.cloudinary.com/...",
        "createdAt": "2026-05-25T10:00:00.000Z"
      }
    }
  }
  ```

#### Get All Product Types
- **Endpoint:** `GET /product-types`
- **Description:** Get all product types (Public)
- **Auth Required:** No
- **Query Parameters:**
  - `page`: number (Default: 1)
  - `limit`: number (Default: 10)
  - `search`: string (Optional)
  - `service`: string (Optional)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "productTypes": [...],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalProductTypes": 1
      }
    }
  }
  ```

#### Get Product Type Details
- **Endpoint:** `GET /product-types/:id`
- **Description:** Get single product type details (Public)
- **Auth Required:** No
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "productType": {
        "_id": "650af1234567890abcdef123",
        "service": { "name": "General Delivery" },
        "name": "Electronics",
        "details": "Electronic devices and accessories",
        "order": 1,
        "slug": "electronics"
      }
    }
  }
  ```

#### Update Product Type
- **Endpoint:** `PUT /product-types/:id`
- **Description:** Update product type details and icon (Admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Request Body (Multipart):**
  - `service`: string (Optional)
  - `name`: string (Optional)
  - `details`: string (Optional)
  - `order`: number (Optional)
  - `icon`: file (Optional)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "productType": {
        "_id": "650af1234567890abcdef123",
        "name": "Home Appliances",
        "updatedAt": "2026-05-25T11:00:00.000Z"
      }
    }
  }
  ```

#### Delete Product Type
- **Endpoint:** `DELETE /product-types/:id`
- **Description:** Delete product type (Admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Product Type deleted"
  }
  ```

---

### Product Category Endpoints

**Base:** `/api/product-categories`

#### Create Product Category
- **Endpoint:** `POST /product-categories`
- **Description:** Create a new product category (Admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body (multipart/form-data):**
  - `name`: "Mobile Phones"
  - `details`: "Smartphones and mobile devices"
  - `sort`: 1
  - `productType`: "650af1234567890abcdef123"
  - `icon`: [file]
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "category": {
        "_id": "650af1234567890abcdef456",
        "vendorType": null,
        "name": "Mobile Phones",
        "details": "Smartphones and mobile devices",
        "icon": "https://res.cloudinary.com/dohez/image/upload/v1/product-categories/mobile-phones.png",
        "iconPublicId": "product-categories/mobile-phones",
        "sort": 1,
        "slug": "mobile-phones",
        "productType": "650af1234567890abcdef123",
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T10:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Get All Product Categories
- **Endpoint:** `GET /product-categories`
- **Description:** Get all product categories (Public)
- **Auth Required:** No
- **Query:** `page=1`, `limit=10`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "categories": [
        {
          "_id": "650af1234567890abcdef456",
          "vendorType": null,
          "name": "Mobile Phones",
          "details": "Smartphones and mobile devices",
          "icon": "https://res.cloudinary.com/dohez/image/upload/v1/product-categories/mobile-phones.png",
          "iconPublicId": "product-categories/mobile-phones",
          "sort": 1,
          "slug": "mobile-phones",
          "productType": {
            "_id": "650af1234567890abcdef123",
            "name": "Electronics",
            "details": "Electronic devices and accessories",
            "order": 1,
            "slug": "electronics",
            "icon": "https://res.cloudinary.com/dohez/image/upload/v1/product-types/electronics.png",
            "iconPublicId": "product-types/electronics",
            "createdAt": "2026-05-25T09:00:00.000Z",
            "updatedAt": "2026-05-25T09:00:00.000Z",
            "__v": 0
          },
          "createdAt": "2026-05-25T10:00:00.000Z",
          "updatedAt": "2026-05-25T10:00:00.000Z",
          "__v": 0
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalCategories": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

#### Get Product Category Details
- **Endpoint:** `GET /product-categories/:id`
- **Description:** Get product category by ID (Public)
- **Auth Required:** No
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "category": {
        "_id": "650af1234567890abcdef456",
        "name": "Mobile Phones",
        "details": "Smartphones and mobile devices",
        "icon": "https://res.cloudinary.com/dohez/image/upload/v1/product-categories/mobile-phones.png",
        "iconPublicId": "product-categories/mobile-phones",
        "sort": 1,
        "slug": "mobile-phones",
        "productType": {
          "_id": "650af1234567890abcdef123",
          "name": "Electronics",
          "details": "Electronic devices and accessories",
          "order": 1,
          "slug": "electronics",
          "icon": "https://res.cloudinary.com/dohez/image/upload/v1/product-types/electronics.png",
          "iconPublicId": "product-types/electronics",
          "createdAt": "2026-05-25T09:00:00.000Z",
          "updatedAt": "2026-05-25T09:00:00.000Z",
          "__v": 0
        },
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T10:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Update Product Category
- **Endpoint:** `PUT /product-categories/:id`
- **Description:** Update product category (Admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body (multipart/form-data):**
  - `name`: "Smartphones"
  - `details`: "Latest smartphones"
  - `sort`: 2
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "category": {
        "_id": "650af1234567890abcdef456",
        "name": "Smartphones",
        "details": "Latest smartphones",
        "icon": "https://res.cloudinary.com/dohez/image/upload/v1/product-categories/smartphones.png",
        "iconPublicId": "product-categories/smartphones",
        "sort": 2,
        "slug": "smartphones",
        "productType": "650af1234567890abcdef123",
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T11:00:00.000Z",
        "__v": 1
      }
    }
  }
  ```

#### Delete Product Category
- **Endpoint:** `DELETE /product-categories/:id`
- **Description:** Delete product category (Admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Category deleted"
  }
  ```


---

### Laundry Endpoints

**Base:** `/api/laundries`

#### Get All Laundries
- **Endpoint:** `GET /api/laundries`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `page`: 1
  - `limit`: 10
  - `search`: "LND-2026-0001"
  - `branch`: "650af1234567890abcdef123"
  - `vendor`: "650af1234567890abcdef124"
  - `status`: "PENDING"
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "laundries": [
      {
        "_id": "650af1234567890abcdef125",
        "laundryNumber": "LND-2026-0001",
        "status": "PENDING",
        "remainingAmount": 2500,
        "createdAt": "2026-05-22T10:00:00.000Z",
        "updatedAt": "2026-05-22T10:00:00.000Z",
        "__v": 0
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalLaundries": 48,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### Get Laundry Details
- **Endpoint:** `GET /api/laundries/:laundryId`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "laundry": {
      "_id": "650af1234567890abcdef128",
      "laundryNumber": "LND-2026-0002",
      "pickUpDate": {
        "day": "2026-05-25T00:00:00.000Z",
        "hour": "10:30"
      },
      "status": "PENDING",
      "customer": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      },
      "vendor": {
        "name": "Sparkle Cleaners"
      },
      "services": [
        {
          "name": "Dry Cleaning",
          "price": 1200
        }
      ],
      "createdAt": "2026-05-25T09:00:00.000Z",
      "updatedAt": "2026-05-25T09:00:00.000Z",
      "__v": 0
    }
  }
}
```

#### Update Laundry
- **Endpoint:** `PUT /api/laundries/:laundryId`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "status": "CONFIRMED",
  "pickUpDate": {
    "day": "2026-05-26",
    "hour": "14:00"
  },
  "dropDate": "2026-05-28T16:00:00.000Z",
  "location": {
    "address": "456 Westlands Road, Nairobi"
  }
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Laundry updated successfully",
  "data": {
    "laundry": {
      "_id": "650af1234567890abcdef128",
      "status": "CONFIRMED",
      "dropDate": "2026-05-28T16:00:00.000Z",
      "createdAt": "2026-05-25T09:00:00.000Z",
      "updatedAt": "2026-05-26T10:00:00.000Z",
      "__v": 1
    }
  }
}
```

#### Delete Laundry
- **Endpoint:** `DELETE /api/laundries/:laundryId`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Laundry request deleted successfully"
}
```


**Base:** `/api/locations`

#### Search Location
- **Endpoint:** `GET /api/locations/search`
- **Description:** Search for locations and places
- **Query Parameters:** `query` (required)
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "business_status": "OPERATIONAL",
        "formatted_address": "Nairobi, Kenya",
        "geometry": {
          "location": {
            "lat": -1.2920659,
            "lng": 36.8219462
          },
          "viewport": {
            "northeast": {
              "lat": -1.155428,
              "lng": 37.065423
            },
            "southwest": {
              "lat": -1.450254,
              "lng": 36.650938
            }
          }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png",
        "icon_background_color": "#7B9EB0",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pin_let_71",
        "name": "Nairobi",
        "photos": [
          {
            "height": 4032,
            "html_attributions": [
              "<a href=\"https://maps.google.com/maps/contrib/114620023475143301016\">John Doe</a>"
            ],
            "photo_reference": "Aap_uEDR_456789ABCDEF1234567890",
            "width": 3024
          }
        ],
        "place_id": "ChIJ77p_JpE_LxARtIuN-k9sR5I",
        "reference": "ChIJ77p_JpE_LxARtIuN-k9sR5I",
        "types": [
          "locality",
          "political"
        ]
      }
    ]
  }
  ```

---







### Receipt Endpoints

**Base:** `/api/receipts`

#### Get All Receipts
- **Endpoint:** `GET /api/receipts`
- **Description:** List all receipts
- **Auth Required:** Yes
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `page`, `limit`, `search`, `vendor`, `branch`, `paymentMethod`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "receipts": [
        {
          "_id": "650af1234567890abcdef123",
          "receiptNumber": "RCP-2026-0001",
          "amountPaid": 1500,
          "paymentMethod": "mpesa",
          "issuedAt": "2026-05-20T10:00:00.000Z",
          "invoice": "650af1234567890abcdef001",
          "customer": "650af1234567890abcdef002",
          "branch": "650af1234567890abcdef003",
          "vendor": "650af1234567890abcdef004",
          "createdAt": "2026-05-20T10:00:00.000Z",
          "updatedAt": "2026-05-20T10:00:00.000Z",
          "__v": 0
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalReceipts": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

#### Get Receipt Details
- **Endpoint:** `GET /api/receipts/:id`
- **Description:** Get receipt details
- **Auth Required:** Yes
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "receipt": {
        "_id": "650af1234567890abcdef123",
        "receiptNumber": "RCP-2026-0001",
        "invoice": {
          "_id": "650af1234567890abcdef001",
          "invoiceNumber": "INV-2026-001",
          "total": 1500
        },
        "customer": {
          "_id": "650af1234567890abcdef002",
          "firstName": "John",
          "lastName": "Doe"
        },
        "branch": {
          "_id": "650af1234567890abcdef003",
          "name": "Main Branch"
        },
        "vendor": {
          "_id": "650af1234567890abcdef004",
          "name": "TEO KICKS"
        },
        "amountPaid": 1500,
        "paymentMethod": "mpesa",
        "issuedAt": "2026-05-20T10:00:00.000Z",
        "pdfUrl": "https://res.cloudinary.com/dohez/raw/upload/v1/receipts/receipt-RCP-2026-0001.pdf",
        "metadata": {},
        "createdAt": "2026-05-20T10:00:00.000Z",
        "updatedAt": "2026-05-20T10:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```







### Break Endpoints

**Base:** `/api/breaks`

#### `POST /api/breaks`
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "staff": "650af1234567890abcdef123",
  "startTime": "12:00",
  "endTime": "13:00",
  "reason": "Lunch break"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Break created successfully",
  "data": {
    "break": {
      "_id": "6648a123b567890abcdef101",
      "staff": "650af1234567890abcdef123",
      "startTime": "12:00",
      "endTime": "13:00",
      "reason": "Lunch break",
      "createdAt": "2026-05-12T09:00:00.000Z",
      "__v": 0
    }
  }
}
```

#### `GET /api/breaks`
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:** `page=1`, `limit=10`
**Response:**
```json
{
  "success": true,
  "data": {
    "breaks": [
      {
        "_id": "6648a123b567890abcdef101",
        "staff": {
          "_id": "650af1234567890abcdef123",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "startTime": "12:00",
        "endTime": "13:00",
        "reason": "Lunch break",
        "createdAt": "2026-05-12T09:00:00.000Z",
        "__v": 0
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalBreaks": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### `GET /api/breaks/:id`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "data": {
    "break": {
      "_id": "6648a123b567890abcdef101",
      "staff": {
        "_id": "650af1234567890abcdef123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "startTime": "12:00",
      "endTime": "13:00",
      "reason": "Lunch break",
      "createdAt": "2026-05-12T09:00:00.000Z",
      "__v": 0
    }
  }
}
```

#### `PUT /api/breaks/:id`
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "startTime": "12:30",
  "endTime": "13:30",
  "reason": "Updated reason"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Break record updated successfully",
  "data": {
    "break": {
      "_id": "6648a123b567890abcdef101",
      "staff": "650af1234567890abcdef123",
      "startTime": "12:30",
      "endTime": "13:30",
      "reason": "Updated reason",
      "createdAt": "2026-05-12T09:00:00.000Z",
      "__v": 0
    }
  }
}
```

#### `DELETE /api/breaks/:id`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "message": "Break record deleted successfully"
}
```

---

### Invoice Endpoints

**Base:** `/api/invoices`

#### `POST /api/invoices`
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Body:**
```json
{
  "orderId": "65e26b1c09b068c201383812"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "invoiceId": "6638b2c3d4e5f6g7h8i9j0k5"
  }
}
```

#### `GET /api/invoices`
**Headers:** `Authorization: Bearer <admin_token>`
**Query Parameters:** `page`, `limit`, `paymentStatus`
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "_id": "6638b2c3d4e5f6g7h8i9j0k5",
        "order": "65e26b1c09b068c201383812",
        "appointment": null,
        "branch": "65e26b1c09b068c201383810",
        "vendor": "65e26b1c09b068c201383805",
        "invoiceNumber": "INV-2026-0001",
        "lineItems": [
          { "label": "Items subtotal", "amount": 1500 },
          { "label": "Tax", "amount": 50 }
        ],
        "subtotal": 1500,
        "discounts": 0,
        "fees": 0,
        "tax": 50,
        "total": 1550,
        "balanceDue": 1550,
        "paymentStatus": "PENDING",
        "metadata": {},
        "createdAt": "2026-05-06T12:00:00.000Z",
        "updatedAt": "2026-05-06T12:00:00.000Z",
        "__v": 0
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "total": 1
    }
  }
}
```

#### `GET /api/invoices/:id`
**Headers:** `Authorization: Bearer <admin_token>`
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "invoice": {
      "_id": "6638b2c3d4e5f6g7h8i9j0k5",
      "order": {
        "_id": "65e26b1c09b068c201383812",
        "orderNumber": "ORD-2026-001"
      },
      "appointment": null,
      "branch": {
        "_id": "65e26b1c09b068c201383810",
        "name": "Main Distribution Center"
      },
      "vendor": {
        "_id": "65e26b1c09b068c201383805",
        "name": "Organic Supplies Co."
      },
      "invoiceNumber": "INV-2026-0001",
      "lineItems": [
        { "label": "Items subtotal", "amount": 1500 },
        { "label": "Tax", "amount": 50 }
      ],
      "subtotal": 1500,
      "discounts": 0,
      "fees": 0,
      "tax": 50,
      "total": 1550,
      "balanceDue": 1550,
      "paymentStatus": "PENDING",
      "metadata": {},
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z",
      "__v": 0
    }
  }
}
```


**Base:** `/api/availability`

#### Fetch Availability
- **Endpoint:** `POST /api/availability`
- **Description:** Fetch available schedule options based on services and preferences
- **Auth Required:** Yes
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:**
  ```json
  {
    "date": "2026-05-20",
    "branch": "650af1234567890abcdef123",
    "vendor": "650af1234567890abcdef456",
    "items": [
      "service_hair_knotless_medium",
      "service_gel_manicure"
    ],
    "page": 1,
    "limit": 10
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Available schedules fetched successfully",
    "data": {
      "vendorId": "vendor_001",
      "branchId": "branch_001",
      "date": "2026-05-20",
      "services": [
        {
          "serviceId": "650af1234567890abcdef001",
          "serviceName": "Medium Knotless Braids"
        },
        {
          "serviceId": "650af1234567890abcdef002",
          "serviceName": "Gel Manicure"
        }
      ],
      "scheduleOptions": [
        {
          "overallStartTime": "2026-05-20T09:00:00.000Z",
          "overallEndTime": "2026-05-20T12:45:00.000Z",
          "totalDurationMinutes": 225,
          "bookingFeeAmount": 50,
          "totalAmount": 3200,
          "remainingAmount": 3150,
          "items": [
            {
              "serviceId": "650af1234567890abcdef001",
              "serviceName": "Medium Knotless Braids",
              "staffId": "staff_001",
              "staffName": "Jane",
              "startTime": "2026-05-20T09:00:00.000Z",
              "endTime": "2026-05-20T12:00:00.000Z",
              "durationMinutes": 180,
              "amount": 2500
            },
            {
              "serviceId": "650af1234567890abcdef002",
              "serviceName": "Gel Manicure",
              "staffId": "staff_002",
              "staffName": "Mary",
              "startTime": "2026-05-20T12:00:00.000Z",
              "endTime": "2026-05-20T12:45:00.000Z",
              "durationMinutes": 45,
              "amount": 700
            }
          ]
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalOptions": 48,
        "hasNextPage": true,
        "hasPrevPage": false
      }
    }
  }
  ```

---

### Payment Endpoints

**Base:** `/api/payments`

#### Book Laundry
- **Endpoint:** `POST /api/payments/laundries/book`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:**
```json
{
  "vendorId": "65e26b1c09b068c201383805",
  "branchId": "65e26b1c09b068c201383810",
  "location": {
    "address": "123 Ngong Road, Nairobi",
    "coordinates": {
      "lat": -1.3005,
      "lng": 36.7846
    }
  },
  "services": ["65e26b1c09b068c201383815"],
  "pickUpDate": { "day": "2026-05-25", "hour": "10:30" },
  "paymentMethod": "mpesa",
  "phoneNumber": "254712345678",
  "bookingFee": 50
}
```
- **Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Laundry booked and M-Pesa STK Push initiated",
  "data": {
    "laundryId": "66389f4b52e2a1b4e8d1a2d1",
    "paymentId": "66389f4b52e2a1b4e8d1a2d2",
    "status": "INITIATED",
    "daraja": {
      "merchantRequestId": "29115-1234567-2",
      "checkoutRequestId": "ws_CO_06052026123456790"
    }
  }
}
```

#### Pay Laundry Invoice
- **Endpoint:** `POST /api/payments/laundries/pay`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:**
```json
{
  "invoiceId": "66389f4b52e2a1b4e8d1a2c1",
  "method": "mpesa",
  "payerPhone": "254712345678"
}
```
- **Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Payment initiated for laundry",
  "data": {
    "paymentId": "66389f4b52e2a1b4e8d1a2d3",
    "status": "INITIATED",
    "daraja": {
      "merchantRequestId": "29115-1234567-3",
      "checkoutRequestId": "ws_CO_06052026123456791"
    }
  }
}
```

#### Confirm Appointment
- **Endpoint:** `POST /api/payments/appointments/confirm/:appointmentId`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:**
```json
{
  "method": "mpesa",
  "payerPhone": "254712345678"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking fee initiated",
  "data": {
    "appointment": {
      "_id": "65e26b1c09b068c201383812",
      "status": "PENDING",
      "bookingFeeAmount": 500
    }
  }
}
```

#### Pay Appointment Invoice
- **Endpoint:** `POST /api/payments/appointments/pay`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:**
```json
{
  "appointmentId": "65e26b1c09b068c201383812",
  "method": "mpesa",
  "payerPhone": "254712345678"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "appointment paidfully",
  "data": {
    "appointment": {
      "_id": "65e26b1c09b068c201383812",
      "status": "CONFIRMED"
    },
    "invoice": {
      "_id": "66389f4b52e2a1b4e8d1a2c3",
      "invoiceNumber": "INV-2026-001",
      "paymentStatus": "PENDING"
    }
  }
}
```

#### Initiate Payment
- **Endpoint:** `POST /api/payments/pay`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:**
```json
{
  "invoiceId": "65e26b1c09b068c201383812",
  "method": "mpesa_stk",
  "amount": 1550,
  "payerPhone": "254712345678"
}
```
- **Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "paymentId": "66389f4b52e2a1b4e8d1a2c3",
    "status": "PENDING",
    "daraja": {
      "merchantRequestId": "29115-1234567-1",
      "checkoutRequestId": "ws_CO_06052026123456789"
    }
  }
}
```

#### M-Pesa Webhook
- **Endpoint:** `POST /api/payments/webhooks/mpesa`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-1234567-1",
      "CheckoutRequestID": "ws_CO_06052026123456789",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 1550.00 },
          { "Name": "MpesaReceiptNumber", "Value": "NLJ7RT61AS" },
          { "Name": "Balance", "Value": 0 },
          { "Name": "TransactionDate", "Value": 20260506123456 },
          { "Name": "PhoneNumber", "Value": 254712345678 }
        ]
      }
    }
  }
}
```
- **Response (200 OK):**
```json
{
  "success": true
}
```

#### Query M-Pesa Status
- **Endpoint:** `GET /api/payments/mpesa/:checkoutId`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "SUCCESS",
    "resultCode": 0,
    "resultDesc": "The service request is processed successfully.",
    "paymentId": "66389f4b52e2a1b4e8d1a2c3",
    "invoiceId": "65e26b1c09b068c201383812",
    "raw": {
      "MerchantRequestID": "29115-1234567-1",
      "CheckoutRequestID": "ws_CO_06052026123456789",
      "ResponseCode": "0",
      "ResponseDescription": "The service request has been accepted successsfully",
      "ResultCode": "0",
      "ResultDesc": "The service request is processed successfully."
    }
  }
}
```

#### List All Payments
- **Endpoint:** `GET /api/payments`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Query Parameters:** `page`, `limit`, `search`, `branch`, `vendor`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "_id": "66389f4b52e2a1b4e8d1a2c3",
        "paymentNumber": "PAY-2026-0001",
        "invoice": "65e26b1c09b068c201383812",
        "branch": "65e26b1c09b068c201383810",
        "vendor": "65e26b1c09b068c201383805",
        "method": "mpesa",
        "amount": 1550,
        "status": "SUCCESS",
        "createdAt": "2026-05-06T12:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalPayments": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### Get Payment Details
- **Endpoint:** `GET /api/payments/:id`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "payment": {
      "_id": "66389f4b52e2a1b4e8d1a2c3",
      "paymentNumber": "PAY-2026-0001",
      "invoice": {
        "_id": "65e26b1c09b068c201383812",
        "invoiceNumber": "INV-2026-001",
        "total": 1550,
        "paymentStatus": "PAID"
      },
      "branch": "65e26b1c09b068c201383810",
      "vendor": "65e26b1c09b068c201383805",
      "method": "mpesa",
      "amount": 1550,
      "status": "SUCCESS",
      "createdAt": "2026-05-06T12:00:00.000Z"
    }
  }
}
```


**Base:** `/api/appointments`

#### Create Appointment (Customer)
- **Endpoint:** `POST /api/appointments`
- **Description:** Create appointment (Customer)
- **Auth Required:** Yes (Customer)
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "branch": "650af1230000000000000001",
    "vendor": "650af4560000000000000001",
    "items": [
      {
        "serviceId": "650af7890000000000000001",
        "staffId": "650af0120000000000000001",
        "startTime": "2026-05-20T10:00:00Z",
        "endTime": "2026-05-20T11:00:00Z"
      }
    ]
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Appointment created successfully",
    "data": {
      "_id": "650af3210000000000000001",
      "appointmentNumber": "APT-2026-0001",
      "customer": "650af9870000000000000001",
      "branch": "650af1230000000000000001",
      "vendor": "650af4560000000000000001",
      "staff": ["650af0120000000000000001"],
      "items": [
        {
          "service": "650af7890000000000000001",
          "staff": "650af0120000000000000001",
          "startTime": "2026-05-20T10:00:00.000Z",
          "endTime": "2026-05-20T11:00:00.000Z",
          "durationMinutes": 60,
          "amount": 2000
        }
      ],
      "status": "PENDING",
      "bookingFeeAmount": 50,
      "remainingAmount": 1950,
      "createdAt": "2026-05-20T09:00:00.000Z",
      "updatedAt": "2026-05-20T09:00:00.000Z",
      "__v": 0
    }
  }
  ```

#### Create Appointment (Admin)
- **Endpoint:** `POST /api/appointments/admin`
- **Description:** Create appointment (Admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
  ```json
  {
    "customerId": "650af9870000000000000001",
    "branch": "650af1230000000000000001",
    "vendor": "650af4560000000000000001",
    "status": "CONFIRMED",
    "items": [
      {
        "serviceId": "650af7890000000000000001",
        "staffId": "650af0120000000000000001",
        "startTime": "2026-05-20T10:00:00Z",
        "endTime": "2026-05-20T11:00:00Z",
        "amount": 2000,
        "durationMinutes": 60
      }
    ]
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Appointment created by admin successfully",
    "data": {
      "_id": "650af3210000000000000002",
      "appointmentNumber": "APT-2026-0002",
      "customer": "650af9870000000000000001",
      "branch": "650af1230000000000000001",
      "vendor": "650af4560000000000000001",
      "staff": ["650af0120000000000000001"],
      "items": [
        {
          "service": "650af7890000000000000001",
          "staff": "650af0120000000000000001",
          "startTime": "2026-05-20T10:00:00.000Z",
          "endTime": "2026-05-20T11:00:00.000Z",
          "durationMinutes": 60,
          "amount": 2000
        }
      ],
      "status": "CONFIRMED",
      "bookingFeeAmount": 0,
      "remainingAmount": 2000,
      "createdAt": "2026-05-20T09:10:00.000Z",
      "updatedAt": "2026-05-20T09:10:00.000Z",
      "__v": 0
    }
  }
  ```

#### Get All Appointments
- **Endpoint:** `GET /api/appointments`
- **Description:** Get all appointments (Admin/Staff)
- **Auth Required:** Yes (Admin/Staff)
- **Query Params:** `branch=650af123...`, `vendor=650af456...`, `staff=650af012...`, `status=PENDING`, `search=APT-2026`, `page=1`, `limit=10`
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "appointments": [
        {
          "_id": "650af3210000000000000001",
          "appointmentNumber": "APT-2026-0001",
          "status": "PENDING",
          "createdAt": "2026-05-20T09:00:00.000Z",
          "updatedAt": "2026-05-20T09:00:00.000Z",
          "__v": 0
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalAppointments": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

#### Get Appointment Details
- **Endpoint:** `GET /api/appointments/:id`
- **Description:** Get appointment details
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "650af3210000000000000001",
      "appointmentNumber": "APT-2026-0001",
      "customer": {
        "_id": "650af9870000000000000001",
        "firstName": "John",
        "lastName": "Doe"
      },
      "status": "PENDING",
      "createdAt": "2026-05-20T09:00:00.000Z",
      "updatedAt": "2026-05-20T09:00:00.000Z",
      "__v": 0
    }
  }
  ```

#### Reschedule Appointment
- **Endpoint:** `PUT /api/appointments/:id/reschedule`
- **Description:** Reschedule appointment
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "items": [
      {
        "serviceId": "650af7890000000000000001",
        "staffId": "650af0120000000000000001",
        "startTime": "2026-05-21T10:00:00Z",
        "endTime": "2026-05-21T11:00:00Z",
        "amount": 2000
      }
    ]
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Appointment rescheduled successfully",
    "data": {
      "_id": "650af3210000000000000001",
      "appointmentNumber": "APT-2026-0001",
      "status": "PENDING",
      "updatedAt": "2026-05-21T09:00:00.000Z",
      "__v": 0
    }
  }
  ```

#### Cancel Appointment
- **Endpoint:** `PUT /api/appointments/:id/cancel`
- **Description:** Cancel appointment
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Appointment cancelled successfully"
  }
  ```

#### Check-in Appointment
- **Endpoint:** `PUT /api/appointments/:id/check-in`
- **Description:** Record check-in
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Checked in successfully",
    "checkedInAt": "2026-05-20T09:55:00.000Z"
  }
  ```

#### Complete Appointment
- **Endpoint:** `PUT /api/appointments/:id/complete`
- **Description:** Record completion
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Appointment completed successfully",
    "actualEndTime": "2026-05-20T11:05:00.000Z"
  }
  ```

#### Mark No-Show
- **Endpoint:** `PUT /api/appointments/:id/no-show`
- **Description:** Record no-show
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Appointment marked as No-Show"
  }
  ```

---

### Packaging Endpoints

**Base:** `/api/packaging`

#### Create Packaging
- **Endpoint:** `POST /api/packaging`
- **Description:** Create packaging (Admin/Vendor)
- **Auth Required:** Yes (Admin/Vendor)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:**
  ```json
  {
    "name": "Eco Box",
    "price": 50,
    "vendor": "65e26b1c09b068c201383805",
    "branch": "65e26b1c09b068c201383810",
    "isDefault": true
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "packaging": {
        "_id": "6638b2c3d4e5f6g7h8i9j0k1",
        "name": "Eco Box",
        "price": 50,
        "isActive": true,
        "isDefault": true,
        "vendor": "65e26b1c09b068c201383805",
        "branch": "65e26b1c09b068c201383810",
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T10:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Get All Packaging
- **Endpoint:** `GET /api/packaging`
- **Description:** List packaging (Public)
- **Query Parameters:** `page`, `limit`, `search`, `active`, `isDefault`, `vendor`, `branch`, `sort`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "packaging": [
        {
          "_id": "6638b2c3d4e5f6g7h8i9j0k1",
          "name": "Eco Box",
          "price": 50,
          "isActive": true,
          "isDefault": true,
          "vendor": "65e26b1c09b068c201383805",
          "branch": "65e26b1c09b068c201383810",
          "createdAt": "2026-05-25T10:00:00.000Z",
          "updatedAt": "2026-05-25T10:00:00.000Z",
          "__v": 0
        },
        {
          "_id": "6638b2c3d4e5f6g7h8i9j0k2",
          "name": "Standard Carton",
          "price": 30,
          "isActive": true,
          "isDefault": false,
          "vendor": "65e26b1c09b068c201383805",
          "branch": "65e26b1c09b068c201383810",
          "createdAt": "2026-05-25T10:05:00.000Z",
          "updatedAt": "2026-05-25T10:05:00.000Z",
          "__v": 0
        }
      ],
      "pagination": {
        "currentPage": 1,
        "pageSize": 10,
        "totalItems": 2,
        "totalPages": 1
      }
    }
  }
  ```

#### Get Packaging Details
- **Endpoint:** `GET /api/packaging/:id`
- **Description:** Get single packaging details
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "packaging": {
        "_id": "6638b2c3d4e5f6g7h8i9j0k1",
        "name": "Eco Box",
        "price": 50,
        "isActive": true,
        "isDefault": true,
        "vendor": {
          "_id": "65e26b1c09b068c201383805",
          "name": "Organic Supplies Co."
        },
        "branch": {
          "_id": "65e26b1c09b068c201383810",
          "name": "Main Distribution Center"
        },
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T10:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Update Packaging
- **Endpoint:** `PUT /api/packaging/:id`
- **Description:** Update packaging (Admin/Vendor)
- **Auth Required:** Yes (Admin/Vendor)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:**
  ```json
  {
    "name": "Premium Box",
    "price": 100
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "packaging": {
        "_id": "6638b2c3d4e5f6g7h8i9j0k1",
        "name": "Premium Box",
        "price": 100,
        "isActive": true,
        "isDefault": true,
        "vendor": "65e26b1c09b068c201383805",
        "branch": "65e26b1c09b068c201383810",
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T11:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Delete Packaging
- **Endpoint:** `DELETE /api/packaging/:id`
- **Description:** Delete packaging (Admin/Vendor)
- **Auth Required:** Yes (Admin/Vendor)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true
  }
  ```

#### Set Default Packaging
- **Endpoint:** `PATCH /api/packaging/:id/default`
- **Description:** Set as default (Admin/Vendor)
- **Auth Required:** Yes (Admin/Vendor)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "packaging": {
        "_id": "6638b2c3d4e5f6g7h8i9j0k1",
        "name": "Premium Box",
        "price": 100,
        "isActive": true,
        "isDefault": true,
        "vendor": "65e26b1c09b068c201383805",
        "branch": "65e26b1c09b068c201383810",
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T11:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

---

### Product Modifier Endpoints

**Base:** `/api/product-modifiers`

#### Create Product Modifier
- **Endpoint:** `POST /product-modifiers`
- **Description:** Create a new product modifier (Admin/Vendor)
- **Auth Required:** Yes (Admin/Vendor)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "string",
    "required": boolean,
    "minSelection": number,
    "maxSelection": number,
    "options": [
      {
        "name": "string",
        "price": number
      }
    ]
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "modifier": {
        "_id": "650af1234567890abcdef123",
        "name": "Size",
        "required": true,
        "minSelection": 1,
        "maxSelection": 1,
        "options": [
          {
            "name": "Small",
            "price": 0,
            "_id": "650af1234567890abcdef001"
          }
        ],
        "createdAt": "2026-05-25T15:00:00.000Z"
      }
    }
  }
  ```

#### Get All Product Modifiers
- **Endpoint:** `GET /product-modifiers`
- **Description:** Get all product modifiers
- **Auth Required:** No
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "modifiers": [...]
    }
  }
  ```

#### Get Product Modifier Details
- **Endpoint:** `GET /product-modifiers/:modifierId`
- **Description:** Get single product modifier details
- **Auth Required:** No
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "modifier": {
        "_id": "650af1234567890abcdef123",
        "name": "Size",
        ...
      }
    }
  }
  ```

#### Update Product Modifier
- **Endpoint:** `PUT /product-modifiers/:modifierId`
- **Description:** Update product modifier (Admin/Vendor)
- **Auth Required:** Yes (Admin/Vendor)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "string",
    "required": boolean,
    "minSelection": number,
    "maxSelection": number
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Modifier updated successfully"
  }
  ```

#### Delete Product Modifier
- **Endpoint:** `DELETE /product-modifiers/:modifierId`
- **Description:** Delete product modifier (Admin/Vendor)
- **Auth Required:** Yes (Admin/Vendor)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Modifier deleted successfully"
  }
  ```

---

### Product Endpoints

**Base:** `/api/products`

#### Create Product
- **Endpoint:** `POST /products`
- **Description:** Create new product
- **Auth Required:** Yes (Admin/Super Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body:** (name, details, price, images, category, vendor, branch, service, variants, selectedVariantOptions, status, trackInventory)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "product": {
        "_id": "650af9994444444444444444",
        "name": "Luxury Pizza",
        "slug": "luxury-pizza",
        "details": "Delicious wood-fired pizza",
        "price": 1500,
        "offerPrice": 1200,
        "images": [
          {
            "url": "https://cloudinary.com/dohez/products/pizza.jpg",
            "publicId": "dohez/products/pizza123",
            "_id": "650af9995555555555555555"
          }
        ],
        "category": "650af1238888888888888888",
        "vendor": "650af4569999999999999999",
        "branch": "650af7890000000000000000",
        "service": "650af0001111111111111111",
        "variants": ["650af1112222222222222222"],
        "selectedVariantOptions": [
          {
            "variantId": "650af1112222222222222222",
            "optionIds": ["650af2223333333333333333"],
            "_id": "650af3334444444444444444"
          }
        ],
        "skus": [],
        "status": true,
        "trackInventory": true,
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T10:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Get All Products
- **Endpoint:** `GET /products`
- **Description:** Get all products
- **Auth Required:** No
- **Query:** `page=1`, `limit=10`, `search=Luxury`, `category=...`, `vendor=...`, `branch=...`, `service=...`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "products": [
        {
          "_id": "650af9994444444444444444",
          "name": "Luxury Pizza",
          "slug": "luxury-pizza",
          "details": "Delicious wood-fired pizza",
          "price": 1500,
          "offerPrice": 1200,
          "images": [
            {
              "url": "https://cloudinary.com/dohez/products/pizza.jpg",
              "publicId": "dohez/products/pizza123",
              "_id": "650af9995555555555555555"
            }
          ],
          "category": "650af1238888888888888888",
          "vendor": "650af4569999999999999999",
          "branch": "650af7890000000000000000",
          "service": "650af0001111111111111111",
          "status": true,
          "trackInventory": true,
          "createdAt": "2026-05-25T10:00:00.000Z",
          "updatedAt": "2026-05-25T10:00:00.000Z",
          "__v": 0
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalProducts": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

#### Get Product Details
- **Endpoint:** `GET /products/:id`
- **Description:** Get single product details
- **Auth Required:** No
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "product": {
        "_id": "650af9994444444444444444",
        "name": "Luxury Pizza",
        "slug": "luxury-pizza",
        "details": "Delicious wood-fired pizza",
        "price": 1500,
        "offerPrice": 1200,
        "images": [
          {
            "url": "https://cloudinary.com/dohez/products/pizza.jpg",
            "publicId": "dohez/products/pizza123",
            "_id": "650af9995555555555555555"
          }
        ],
        "category": {
          "_id": "650af1238888888888888888",
          "name": "Fast Food",
          "slug": "fast-food"
        },
        "vendor": {
          "_id": "650af4569999999999999999",
          "name": "Pizza Hut"
        },
        "branch": {
          "_id": "650af7890000000000000000",
          "name": "CBD Branch"
        },
        "service": {
          "_id": "650af0001111111111111111",
          "name": "Food Delivery"
        },
        "status": true,
        "trackInventory": true,
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T10:00:00.000Z",
        "__v": 0
      }
    }
  }
  ```

#### Update Product
- **Endpoint:** `PUT /products/:id`
- **Description:** Update product details and regenerate SKUs
- **Auth Required:** Yes (Admin/Super Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Product updated successfully",
    "data": {
      "product": {
        "_id": "650af9994444444444444444",
        "name": "Luxury Pizza V2",
        "slug": "luxury-pizza-v2",
        "price": 1600,
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T11:00:00.000Z",
        "__v": 1
      }
    }
  }
  ```

#### Delete Product
- **Endpoint:** `DELETE /products/:id`
- **Description:** Delete product
- **Auth Required:** Yes (Admin/Super Admin)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Product deleted successfully"
  }
  ```

#### Update Product SKU
- **Endpoint:** `PUT /products/:id/skus/:skuId`
- **Description:** Update specific product SKU
- **Auth Required:** Yes (Admin/Super Admin)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:** `{"price": 1400, "stock": 50}`
- **Response:**
  ```json
  {
    "success": true,
    "message": "SKU updated successfully",
    "data": {
      "product": {
        "_id": "650af9994444444444444444",
        "name": "Luxury Pizza V2",
        "updatedAt": "2026-05-25T12:00:00.000Z",
        "__v": 2
      }
    }
  }
  ```

---

### Cart Endpoints

**Base:** `/api/cart`

#### 1. Get Cart
- **Route:** `GET /api/cart`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "_id": "660af9994444444444444444",
      "userId": "660af1238888888888888888",
      "cartGroups": [
        {
          "_id": "660af9994444444444444445",
          "vendorId": {
            "_id": "660af4569999999999999999",
            "name": "Vendor Name"
          },
          "branchId": {
            "_id": "660af7890000000000000000",
            "name": "Branch Name"
          },
          "items": [
            {
              "_id": "660af8881111111111111222",
              "productId": {
                "_id": "660af9995555555555555555",
                "name": "Luxury Pizza"
              },
              "skuId": "660af8881111111111111111",
              "quantity": 2,
              "priceAtAddition": 1500,
              "variants": [],
              "modifiers": []
            }
          ],
          "groupSubtotal": 3000
        }
      ],
      "totalCartValue": 3000,
      "totalItems": 2,
      "createdAt": "2026-05-25T10:00:00.000Z",
      "updatedAt": "2026-05-25T10:00:00.000Z",
      "__v": 0
    }
  }
}
```

#### 2. Add Item to Cart
- **Route:** `POST /api/cart/add`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "vendorId": "660af4569999999999999999",
  "branchId": "660af7890000000000000000",
  "productId": "660af9995555555555555555",
  "skuId": "660af8881111111111111111",
  "quantity": 1,
  "priceAtAddition": 1500
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "_id": "660af9994444444444444444",
      "userId": "660af1238888888888888888",
      "cartGroups": [
        {
          "_id": "660af9994444444444444445",
          "vendorId": "660af4569999999999999999",
          "branchId": "660af7890000000000000000",
          "items": [
            {
              "_id": "660af8881111111111111222",
              "productId": "660af9995555555555555555",
              "skuId": "660af8881111111111111111",
              "quantity": 1,
              "priceAtAddition": 1500,
              "variants": [],
              "modifiers": []
            }
          ],
          "groupSubtotal": 1500
        }
      ],
      "totalCartValue": 1500,
      "totalItems": 1,
      "createdAt": "2026-05-25T10:00:00.000Z",
      "updatedAt": "2026-05-25T10:05:00.000Z",
      "__v": 1
    }
  }
}
```

#### 3. Update Quantity
- **Route:** `PUT /api/cart/update`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "branchId": "660af7890000000000000000",
  "cartItemId": "660af8881111111111111222",
  "quantity": 5
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "_id": "660af9994444444444444444",
      "userId": "660af1238888888888888888",
      "cartGroups": [
        {
          "_id": "660af9994444444444444445",
          "vendorId": "660af4569999999999999999",
          "branchId": "660af7890000000000000000",
          "items": [
            {
              "_id": "660af8881111111111111222",
              "productId": "660af9995555555555555555",
              "skuId": "660af8881111111111111111",
              "quantity": 5,
              "priceAtAddition": 1500,
              "variants": [],
              "modifiers": []
            }
          ],
          "groupSubtotal": 7500
        }
      ],
      "totalCartValue": 7500,
      "totalItems": 5,
      "createdAt": "2026-05-25T10:00:00.000Z",
      "updatedAt": "2026-05-25T10:10:00.000Z",
      "__v": 2
    }
  }
}
```

#### 4. Remove Item
- **Route:** `DELETE /api/cart/remove`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "branchId": "660af7890000000000000000",
  "cartItemId": "660af8881111111111111222"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Item removed"
}
```

#### 5. Clear Cart
- **Route:** `DELETE /api/cart/clear`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

### Order Endpoints

**Base:** `/api/orders`

#### `POST /api/orders`
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "vendorId": "65e26b1c09b068c201383810",
  "branchId": "65e26b1c09b068c201383811",
  "location": "in_shop",
  "type": "pickup",
  "paymentPreference": {
    "mode": "cash"
  },
  "packagingOptionId": "65e26b1c09b068c201383815"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "650af123890abcdef1234567",
    "invoiceId": "650af456890abcdef1234568"
  }
}
```

#### `GET /api/orders/my-orders`
**Headers:** `Authorization: Bearer <token>`
**Query:** `page=1`, `limit=10`
**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "650af123890abcdef1234567",
        "createdAt": "2026-05-25T10:00:00.000Z",
        "status": "PLACED",
        "paymentStatus": "UNPAID",
        "pricing": {
          "subtotal": 1500,
          "discounts": 0,
          "packagingFee": 50,
          "schedulingFee": 0,
          "deliveryFee": 0,
          "tax": 0,
          "total": 1550
        },
        "invoice": {
          "_id": "650af456890abcdef1234568",
          "number": "INV-2026-123456"
        },
        "updatedAt": "2026-05-25T10:00:00.000Z",
        "__v": 0
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```

#### `GET /api/orders/:id`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "650af123890abcdef1234567",
      "customer": {
        "_id": "65e26b1c09b068c201383801",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+254700000000"
      },
      "vendor": {
        "_id": "65e26b1c09b068c201383810",
        "name": "Quick Mart"
      },
      "branch": {
        "_id": "65e26b1c09b068c201383811",
        "name": "Main Branch"
      },
      "items": [
        {
          "sku": "650af123890abcdef1234569",
          "product": {
            "_id": "650af123890abcdef1234569",
            "name": "Milk 500ml",
            "images": [{"url": "...", "publicId": "..."}]
          },
          "title": "Milk 500ml",
          "quantity": 2,
          "unitPrice": 60
        }
      ],
      "status": "PLACED",
      "paymentStatus": "UNPAID",
      "pricing": {
        "subtotal": 120,
        "discounts": 0,
        "packagingFee": 0,
        "schedulingFee": 0,
        "deliveryFee": 0,
        "tax": 0,
        "total": 120
      },
      "invoice": {
        "_id": "650af456890abcdef1234568",
        "number": "INV-2026-123456"
      },
      "createdAt": "2026-05-25T10:00:00.000Z",
      "updatedAt": "2026-05-25T10:00:00.000Z",
      "__v": 0
    }
  }
}
```

#### `POST /api/orders/admin/create`
**Headers:** `Authorization: Bearer <admin_token>`
**Body:**
```json
{
  "customerId": "650af123890abcdef1234567",
  "vendorId": "65e26b1c09b068c201383810",
  "branchId": "65e26b1c09b068c201383811",
  "items": [
    {
      "productId": "650af123890abcdef1234569",
      "skuId": "650af123890abcdef1234570",
      "quantity": 3
    }
  ],
  "location": "in_shop",
  "type": "pickup",
  "paymentPreference": {
    "mode": "pay_now"
  }
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "650af987890abcdef1234567",
    "invoiceId": "650af987890abcdef1234568"
  }
}
```

#### `GET /api/orders`
**Headers:** `Authorization: Bearer <admin_token>`
**Query:** `page=1`, `limit=10`
**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "650af123890abcdef1234567",
        "customer": {
          "_id": "650af123890abcdef1234567",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        },
        "status": "PLACED",
        "paymentStatus": "UNPAID",
        "pricing": {
          "subtotal": 120,
          "discounts": 0,
          "packagingFee": 0,
          "schedulingFee": 0,
          "deliveryFee": 0,
          "tax": 0,
          "total": 120
        },
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T10:00:00.000Z",
        "__v": 0
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```

#### `PATCH /api/orders/:id/status`
**Headers:** `Authorization: Bearer <admin_token>`
**Body:**
```json
{
  "status": "CONFIRMED"
}
```
**Response:**
```json
{
  "success": true
}
```

#### `PATCH /api/orders/:id/assign-rider`
**Headers:** `Authorization: Bearer <admin_token>`
**Response:**
```json
{
  "success": true,
  "message": "Rider assigned successfully (placeholder)"
}
```

#### `DELETE /api/orders/:id`
**Headers:** `Authorization: Bearer <admin_token>`
**Response:**
```json
{
  "success": true
}
```

---


### Coupon Endpoints

**Base:** `/api/coupons`

#### 1. Create Coupon
- **Endpoint:** `POST /api/coupons`
- **Description:** Create a new coupon (Admin/Vendor)
- **Auth Required:** Yes (Admin/Vendor)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "name": "Welcome Discount",
  "description": "10% off for first-time orders",
  "discountType": "percentage",
  "discountValue": 10,
  "minimumOrderAmount": 500,
  "isFirstTimeOnly": true,
  "vendor": "65e26b1c09b068c201383805",
  "branch": "65e26b1c09b068c201383810"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "coupon": {
      "_id": "6638a1b2c3d4e5f6g7h8i9j0",
      "code": "XYZ12345",
      "name": "Welcome Discount",
      "description": "10% off for first-time orders",
      "discountType": "percentage",
      "discountValue": 10,
      "minimumOrderAmount": 500,
      "isActive": true,
      "hasExpiry": false,
      "hasUsageLimit": false,
      "usedCount": 0,
      "isFirstTimeOnly": true,
      "applicableProducts": [],
      "applicableCategories": [],
      "excludedProducts": [],
      "excludedCategories": [],
      "vendor": "65e26b1c09b068c201383805",
      "branch": "65e26b1c09b068c201383810",
      "createdBy": "65e26b1c09b068c201383801",
      "lastUsedBy": [],
      "createdAt": "2026-05-25T10:00:00.000Z",
      "updatedAt": "2026-05-25T10:00:00.000Z",
      "__v": 0
    }
  }
}
```

#### 2. Get All Coupons
- **Endpoint:** `GET /api/coupons`
- **Description:** List coupons (Admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `page`: 1
  - `limit`: 10
  - `search`: "WELCOME"
  - `isActive`: true
- **Response:**
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "_id": "6638a1b2c3d4e5f6g7h8i9j0",
        "code": "XYZ12345",
        "name": "Welcome Discount",
        "discountType": "percentage",
        "discountValue": 10,
        "isActive": true,
        "createdAt": "2026-05-25T10:00:00.000Z",
        "updatedAt": "2026-05-25T10:00:00.000Z",
        "__v": 0
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCoupons": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### 3. Get Coupon Details
- **Endpoint:** `GET /api/coupons/:couponId`
- **Description:** Get coupon details (Admin/Vendor)
- **Auth Required:** Yes (Admin/Vendor)
- **Headers:** `Authorization: Bearer <token>`
- **URL Parameters:**
  - `couponId`: "6638a1b2c3d4e5f6g7h8i9j0"
- **Response:**
```json
{
  "success": true,
  "data": {
    "coupon": {
      "_id": "6638a1b2c3d4e5f6g7h8i9j0",
      "code": "XYZ12345",
      "name": "Welcome Discount",
      "discountType": "percentage",
      "discountValue": 10,
      "vendor": {
        "_id": "65e26b1c09b068c201383805",
        "name": "Sample Vendor"
      },
      "branch": {
        "_id": "65e26b1c09b068c201383810",
        "name": "Main Branch"
      },
      "createdAt": "2026-05-25T10:00:00.000Z",
      "updatedAt": "2026-05-25T10:00:00.000Z",
      "__v": 0
    }
  }
}
```

#### 4. Update Coupon
- **Endpoint:** `PUT /api/coupons/:couponId`
- **Description:** Update coupon (Admin/Vendor)
- **Auth Required:** Yes (Admin/Vendor)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **URL Parameters:**
  - `couponId`: "6638a1b2c3d4e5f6g7h8i9j0"
- **Request Body (JSON):**
```json
{
  "name": "Holiday Special",
  "discountValue": 15,
  "isActive": false
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Coupon updated successfully",
  "data": {
    "coupon": {
      "_id": "6638a1b2c3d4e5f6g7h8i9j0",
      "code": "XYZ12345",
      "name": "Holiday Special",
      "discountType": "percentage",
      "discountValue": 15,
      "isActive": false,
      "createdAt": "2026-05-25T10:00:00.000Z",
      "updatedAt": "2026-05-25T11:00:00.000Z",
      "__v": 1
    }
  }
}
```

#### 5. Delete Coupon
- **Endpoint:** `DELETE /api/coupons/:couponId`
- **Description:** Delete coupon (Admin)
- **Auth Required:** Yes (Admin)
- **Headers:** `Authorization: Bearer <token>`
- **URL Parameters:**
  - `couponId`: "6638a1b2c3d4e5f6g7h8i9j0"
- **Response:**
```json
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

#### 6. Validate Coupon
- **Endpoint:** `POST /api/coupons/validate`
- **Description:** Validate coupon code
- **Auth Required:** Yes
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Query Parameters:**
  - `orderAmount`: 1200.50
- **Request Body (JSON):**
```json
{
  "code": "XYZ12345",
  "vendor": "65e26b1c09b068c201383805",
  "branch": "65e26b1c09b068c201383810"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Coupon is valid",
  "data": {
    "coupon": {
      "_id": "6638a1b2c3d4e5f6g7h8i9j0",
      "code": "XYZ12345",
      "name": "Welcome Discount",
      "discountType": "percentage",
      "discountValue": 10
    },
    "discountAmount": 120.05,
    "orderAmount": 1200.50,
    "finalAmount": 1080.45
  }
}
```

#### 7. Apply Coupon
- **Endpoint:** `POST /api/coupons/apply`
- **Description:** Apply coupon to order
- **Auth Required:** Yes
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "code": "XYZ12345",
  "orderAmount": 1200.50,
  "vendor": "65e26b1c09b068c201383805",
  "branch": "65e26b1c09b068c201383810"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "coupon": {
      "_id": "6638a1b2c3d4e5f6g7h8i9j0",
      "code": "XYZ12345",
      "name": "Welcome Discount",
      "discountType": "percentage",
      "discountValue": 10
    },
    "discountAmount": 120.05,
    "orderAmount": 1200.50,
    "finalAmount": 1080.45
  }
}
```

#### 8. Get Coupon Stats
- **Endpoint:** `GET /api/coupons/:couponId/stats`
- **Description:** Get coupon statistics (Admin/Vendor)
- **Auth Required:** Yes (Admin/Vendor)
- **Headers:** `Authorization: Bearer <token>`
- **URL Parameters:**
  - `couponId`: "6638a1b2c3d4e5f6g7h8i9j0"
- **Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "usedCount": 15,
      "usageLimit": 100,
      "remainingUsage": 85,
      "lastUsedBy": [
        {
          "user": "65e26b1c09b068c201383801",
          "usedAt": "2026-05-25T14:30:00.000Z"
        }
      ]
    }
  }
}
```

#### 9. Generate New Code
- **Endpoint:** `POST /api/coupons/:couponId/generate-code`
- **Description:** Generate new unique code (Admin/Vendor)
- **Auth Required:** Yes (Admin/Vendor)
- **Headers:** `Authorization: Bearer <token>`
- **URL Parameters:**
  - `couponId`: "6638a1b2c3d4e5f6g7h8i9j0"
- **Response:**
```json
{
  "success": true,
  "message": "New coupon code generated successfully",
  "data": {
    "code": "NEWCODE99"
  }
}
```


## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., slot already booked)
- `500` - Internal Server Error

## Error Handling

The API client automatically handles:
- **401 Unauthorized** - Attempts to refresh the access token using the refresh token
- **Token Refresh** - Automatically retries the original request after token refresh
- **FormData** - Automatically handles file uploads with proper Content-Type headers

## Usage Example

```typescript
import { authAPI, userAPI } from '@/api';

// Login
const response = await authAPI.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get current user
const user = await authAPI.getCurrentUser();

// Update profile
await userAPI.updateProfile({
  firstName: 'John',
  lastName: 'Doe',
  phone: '254712345678'
});
```

## Notes

- All dates should be in ISO 8601 format
- File uploads use `FormData` and are automatically handled
- Pagination parameters: `page` (default: 1), `limit` (default: 10)
- All ObjectId references should be valid MongoDB ObjectIds
- Phone numbers should include country code (e.g., 254712345678 for Kenya)

---

**Last Updated:** May 2026  

---

