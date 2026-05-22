# 🚀 Dohez-Admin - Frontend Documentation

## 📋 Table of Contents
- [Technology Stack](#technology-stack)
- [Required Packages](#required-packages)
- [Architecture Overview](#architecture-overview)
- [Pages & Screens](#pages--screens)
- [Components](#components)
- [Hooks](#hooks)
- [Constants](#constants)
- [Routing Structure](#routing-structure)
- [Styling Approach](#styling-approach)
- [UI Design System](#ui-design-system)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Getting Started](#getting-started)

---

## 🛠️ Technology Stack

- **Framework:** React 19 (Vite)
- **Language:** TypeScript
- **Routing:** React Router
- **Styling:** 
  - Tailwind CSS
  - Custom Themed Components
- **Platform Support:** Web
- **Build System:** Vite

---

## 📦 Required Packages

### Core Dependencies
```json
{
  "react": "^19.2.5",
  "react-dom": "^19.2.5",
  "react-router-dom": "^7.1.0",
  "typescript": "~6.0.2"
}
```

### Styling & UI
```json
{
  "tailwindcss": "^4.0.0",
  "@tailwindcss/vite": "^4.0.0",
  "lucide-react": "^0.474.0",
  "react-icons": "^5.4.0",
  "@mui/material": "^6.4.1",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.0"
}
```

### State Management & Data Fetching
```json
{
  "@reduxjs/toolkit": "^2.5.0",
  "react-redux": "^9.2.0",
  "redux-persist": "^6.0.0",
  "@tanstack/react-query": "^5.64.0",
  "axios": "^1.7.9",
  "socket.io-client": "^4.8.1"
}
```

### Utilities & Visuals
```json
{
  "date-fns": "^4.1.0",
  "recharts": "^2.15.0"
}
```

### Dev Dependencies
```json
{
  "vite": "^8.0.9",
  "@vitejs/plugin-react": "^6.0.1",
  "eslint": "^9.39.4"
}
```

---

## 🏗️ Architecture Overview

### Folder Structure
```
dohez-admin/
├── src/                          # Source code
│   ├── pages/                   # Application pages (Route components)
│   │   ├── authenticated/       # Authenticated routes group
│   │   │   ├── Dashboard.tsx
│   │   │   ├── profile/
│   │   │   │   ├── detail.tsx
│   │   │   │   ├── change-password.tsx
│   │   │   │   ├── update.tsx
│   │   │   │   └── privacy.tsx
│   │   │   ├── user/
│   │   │   │   ├── list.tsx
│   │   │   │   ├── detail.tsx
│   │   │   │   ├── update.tsx
│   │   │   │   └── create.tsx
│   │   │   ├── role/
│   │   │   │   ├── list.tsx
│   │   │   │   ├── detail.tsx
│   │   │   │   ├── update.tsx
│   │   │   │   └── create.tsx
│   │   │   ├── task/             # Same flow (list, detail, update, create)
│   │   │   ├── service/          # Same flow (list, detail, update, create)
│   │   │   ├── vendor-type/      # Same flow (list, detail, update, create)
│   │   │   ├── vendor-category/  # Same flow (list, detail, update, create)
│   │   │   ├── vendor/           # Same flow (list, detail, update, create)
│   │   │   ├── branch/           # Same flow (list, detail, update, create)
│   │   │   ├── product-type/     # Same flow (list, detail, update, create)
│   │   │   ├── product-category/ # Same flow (list, detail, update, create)
│   │   │   ├── product/          # Same flow (list, detail, update, create)
│   │   │   └── notification/     # Same flow (list, detail, update, create)
│   │   │
│   │   └── public/              # Public routes group
│   │       ├── Login.tsx
│   │       ├── Register.tsx
│   │       ├── ForgotPassword.tsx
│   │       ├── ResetPassword.tsx
│   │       └── VerifyOTP.tsx
│   │
│   ├── components/               # Reusable components
│   │   ├── ui/                  # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── ...
│   │   └── layout/              # Layout components
│   │       ├── Sidebar.tsx
│   │       └── Header.tsx
│   │
│   ├── api/                     # API & external services
│   │   ├── config.ts            # Axios configuration
│   │   └── index.ts             # API endpoints
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAddress.ts
│   │   ├── useUser.ts
│   │   ├── useRoles.ts
│   │   └── ...
│   │
│   ├── store/                   # Redux state management
│   │   ├── slices/              # State slices
│   │   │   └── authSlice.ts
│   │   ├── hooks.ts             # Typed hooks
│   │   ├── index.ts             # Store configuration
│   │   └── types.ts             # State types
│   │
│   ├── types/                   # Global TypeScript types
│   ├── styles/                  # Global styles
│   │   ├── base.css
│   │   ├── component.css
│   │   ├── token.css
│   │   └── utilities.css
│   │
│   ├── constants/               # App constants
│   ├── assets/                  # Static assets
│   ├── App.tsx                  # Root component & Routing
│   └── main.tsx                 # Entry point
│
├── public/                       # Static public assets
├── index.html                    # HTML entry point
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
└── .env                         # Environment variables
```

---

## 📱 Pages & Screens

### 1. Root App (`src/App.tsx`)
**Purpose:** Root navigation structure and app-wide configuration

**Features:**
- Router setup (React Router)
- Theme provider
- Providers composition:
  - `QueryClientProvider` (TanStack Query)
  - Redux `Provider` with persisted store
  - `AuthProvider` for auth context

---

### 2. Authenticated Layout (`src/components/layout/Layout.tsx`)
**Purpose:** Layout wrapper for authenticated routes with sidebar and navbar

**Features:**
- Sidebar navigation
- Top navbar with user profile
- Content area with breadcrumbs
- Auth guard (redirects if not logged in)

---

### 3. Login Screen (`src/pages/public/Login.tsx`)
**Purpose:** User authentication

**Features:**
- Email/password login form
- Form validation
- Error handling
- Redirect to dashboard on success

---

### 4. Admin Dashboard (`src/pages/authenticated/Dashboard.tsx`)
**Purpose:** Main overview screen

**Features:**
- Statistics widgets (Cards)
- Recent activity tables
- Quick action buttons
- Performance charts

---

### 5. Client Management
- **Client List:** Table view with search/filters
- **Client Detail:** Profile information and history
- **Client Create/Edit:** Forms for client data

---

## 🧩 Components

### 1. UI Components
Base components in `src/components/ui/` designed for reusability and consistency.

#### `Button`
Variants: Primary, Secondary, Danger, Ghost.

#### `Input`
Standard text inputs with labels and error states.

#### `Card`
Container with standard padding and optional accent strip.

---

### 2. Layout Components
- **Navbar:** Top bar with search and profile.
- **Sidebar:** Vertical navigation menu with brand logo.
- **Container:** Standardized page padding and max-width.

---

## 🪝 Hooks

### 1. `useAuth`
Manages authentication state, login/logout, and user session.

### 2. `useTheme`
Handles light/dark mode switching and system preference detection.

---

## 📐 Constants

### Theme Constants
**Location:** `src/constants/theme.ts`

#### Brand Palette
```typescript
export const BrandColors = {
  primary: '#7b1c1c',      // Primary Red
  accent: '#a33c3c',       // Accent Red
  soft: '#d86a6a',         // Soft Red
  lightTint: '#faeaea',    // Light Tint
  text: '#000000',         // Main Text
  background: '#ffffff',   // Background
  border: '#e5e5e5',       // Border
};
```

---

## 🛣️ Routing Structure

### React Router Configuration

```typescript
<Routes>
  <Route element={<PublicLayout />}>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Route>
  
  <Route element={<ProtectedRoute />}>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/clients" element={<ClientList />} />
      {/* ... other routes */}
    </Route>
  </Route>
  
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## 🎨 Styling Approach

### Tailwind CSS
Utility-first CSS framework for rapid UI development.

**Configuration:**
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#7b1c1c',
          accent: '#a33c3c',
          soft: '#d86a6a',
          tint: '#faeaea',
        },
      },
    },
  },
}
```

---

## 🎨 UI Design System

### Design Philosophy
- **Corporate • Minimal • Efficient • Redefined**
- Neutralized reds for professional admin aesthetic.
- Focus on data density and readability.

---

## 🔄 State Management

### Redux Toolkit
Global state for authentication, user preferences, and shared UI state.

### TanStack Query
Server state management for data fetching, caching, and synchronization.

---

## 🔌 API Integration

### Axios Client
Centralized instance with interceptors for auth tokens and error handling.

---

## 🚀 Getting Started

### Installation
1. `npm install`
2. `npm run dev`

### Build
1. `npm run build`

---

**Last Updated:** May 2026
**Version:** 1.0.0
