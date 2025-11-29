---
inclusion: always
---

# Product Domain: SitiNet ISP Portal

SitiNet is a dual-interface web application for an Internet Service Provider. It serves two distinct user groups with separate interfaces and permissions.

## User Interfaces

### Customer Portal (Public)
- **Purpose**: Browse and select internet plans
- **Access**: Public, no authentication required
- **Features**: View plans filtered by type, see pricing and features, identify popular plans
- **UI Theme**: Dark theme, responsive design for mobile and desktop

### Admin Control Center (Protected)
- **Purpose**: Manage plans and admin users
- **Access**: Session-based authentication required
- **Features**: Full CRUD on plans, admin user management, password changes
- **Security**: Cannot delete own account, must maintain at least one admin

## Core Domain Concepts

### Plan Entity
- **Types**: `recharge` (monthly recurring subscription) or `installation` (one-time setup fee)
- **Attributes**: name, price (INR), speed, data limit, validity, features list
- **Flags**: `is_popular` (boolean) - marks featured plans for customer visibility
- **Currency**: All prices in Indian Rupees (INR), format with ₹ symbol

### Admin User Entity
- **Authentication**: Username/password with Werkzeug password hashing
- **Session Management**: Flask session-based, no JWT or token auth
- **Default Credentials**: `admin` / `admin123` (auto-created on first run)

## Critical Business Rules

When modifying code, enforce these invariants:

1. **Plan Type Constraint**: Every plan MUST have `type` field set to either `"recharge"` or `"installation"` (no other values allowed)

2. **Admin Account Protection**: 
   - System MUST always have at least one admin user
   - Prevent deletion of the last remaining admin
   - Admins cannot delete their own account (prevents lockout)

3. **Popular Plan Logic**: `is_popular` flag is optional (defaults to false), used for UI highlighting only

4. **Price Display**: Always format prices as INR currency with proper locale formatting

5. **Authentication Boundaries**:
   - GET `/api/plans` is public (no auth required)
   - POST/PUT/DELETE `/api/plans` requires admin session
   - All `/admin` routes require authentication

## Data Validation Rules

### Plan Validation
- `name`: Required, non-empty string
- `price`: Required, positive number
- `type`: Required, must be `"recharge"` or `"installation"`
- `speed`, `data_limit`, `validity`: Optional strings for display
- `features`: Optional array of strings

### Admin User Validation
- `username`: Required, unique, non-empty
- `password`: Required for creation, hashed before storage (never store plaintext)

## User Experience Expectations

- **Customer Portal**: Fast loading, smooth tab switching between plan types, clear pricing
- **Admin Portal**: Immediate feedback via flash messages, confirmation for destructive actions
- **Error Handling**: User-friendly messages, no technical stack traces exposed to customers
