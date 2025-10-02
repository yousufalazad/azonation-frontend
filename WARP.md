# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Vite (runs on http://localhost:5173)
- `npm run build` - Build production bundle with Vite
- `npm run preview` - Preview production build locally
- `npm test:unit` - Run unit tests with Vitest

### Single Test Execution
- `npm test:unit -- --run <test-file-path>` - Run specific test file
- `npm test:unit -- --watch` - Run tests in watch mode

## Architecture Overview

### Tech Stack
- **Frontend Framework**: Vue 3 with Composition API
- **Build Tool**: Vite
- **Testing**: Vitest + Vue Test Utils
- **Styling**: Tailwind CSS with custom styles
- **HTTP Client**: Axios
- **State Management**: Reactive store pattern (not Vuex/Pinia)
- **Icons**: Lucide Vue Next (globally registered)
- **Data Tables**: vue3-easy-data-table
- **Alerts**: SweetAlert2

### Project Structure

#### Main Directories
- `src/views/` - Main application views organized by user type
  - `Auth/` - Authentication pages (Login, Signup, Password Reset)
  - `Common/` - Shared pages (About, Contact, Pricing, etc.)
  - `Individual/` - Individual user dashboard and features
  - `Org/` - Organization dashboard and management features
  - `SuperAdmin/` - Super admin management interface

- `src/router/` - Vue Router configuration
  - `router.js` - Main router with authentication guards
  - `individualRouter.js` - Routes for individual users
  - `orgRouter.js` - Routes for organization users
  - `superadminRouter.js` - Routes for super admin users

- `src/store/` - Application state management
  - `authStore.js` - Authentication state and API methods

- `src/global/` - Global utilities and helpers
  - `cookie.js` - Cookie management utilities
  - `custom.js` - Custom utility functions
  - `exportUtils.js` - Export/download utilities

### User Type System

The application supports three distinct user types with separate routing and dashboards:

1. **Individual** - Personal users connecting to organizations
2. **Organisation** - Organization administrators and managers  
3. **SuperAdmin** - System administrators

### Authentication & API Architecture

#### Authentication Store (`authStore.js`)
- Reactive authentication state management
- Cookie-based session persistence
- Three API methods:
  - `fetchPublicApi()` - For unauthenticated requests
  - `fetchProtectedApi()` - For authenticated requests with Bearer token
  - `uploadProtectedApi()` - For file uploads with authentication

#### API Configuration
- Development: `http://localhost:8000` (Laravel backend)
- Production: `https://app.azonation.com` (commented out)
- Proxy configured in Vite for `/api` routes to Laravel backend

### Key Components & Features

#### Dashboard Layouts
Each user type has dedicated dashboard layouts in `src/views/{UserType}/Layouts/Dashboard/Index.vue`:
- Individual dashboard: Connection status, organization summary, meetings/events
- Org dashboard: Member management, financial reports, meeting scheduling
- SuperAdmin dashboard: System-wide analytics and management

#### Feature Modules by User Type

**Individual Features:**
- Asset management
- Attendance tracking
- Committee participation
- Event participation
- Meeting participation
- Organization connections
- Personal profile
- Project involvement
- Notifications

**Organization Features:**
- Member management and accounts
- Committee management
- Event planning and management
- Meeting scheduling and minutes
- Financial management (invoices, receipts, billing)
- Asset tracking
- Project management
- Office document management
- Recognition programs
- Success stories
- Strategic planning
- Reports and analytics

**SuperAdmin Features:**
- Financial management (billing, pricing, discounts)
- E-commerce functionality
- Master settings
- User management
- System analytics

### Development Patterns

#### Vue 3 Composition API
- All components use `<script setup>` syntax
- Reactive references with `ref()` and `reactive()`
- Computed properties and lifecycle hooks from Vue 3

#### Authentication Guards
- Route-level authentication with `meta.requiresAuth`
- User type validation with `meta.type`
- Automatic redirects based on authentication status

#### API Error Handling
- Consistent error handling across all API calls
- SweetAlert2 for user notifications
- Console logging for debugging

#### Styling Approach
- Tailwind CSS for utility-first styling
- Custom CSS in `src/assets/style.css`
- Responsive design with mobile-first approach
- Consistent design patterns across user types

### Backend Integration

The frontend is designed to work with a Laravel backend API:
- RESTful API endpoints with `/api` prefix
- JWT/Bearer token authentication
- CORS-enabled for development proxy
- File upload support with FormData

### Development Environment Setup

- Vite development server with hot module replacement
- Proxy configuration for API requests to Laravel backend
- Path alias `@` points to `src/` directory
- Vue template compiler enabled for runtime template compilation
