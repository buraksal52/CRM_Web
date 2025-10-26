# Role-Based Access Control Implementation Summary

## Changes Overview
This document summarizes all changes made to implement role-based access control (RBAC) in the CRM system with Admin and Regular User roles.

---

## Backend Changes

### 1. New Files Created

#### `crm_app/permissions.py`
Custom permission classes for role-based access control:
- **IsAdminOrReadOnly**: Allows read access to all authenticated users, write access only to admins
- **TaskPermission**: Custom permission for tasks - admins get full access, regular users can only manage their own tasks

### 2. Modified Backend Files

#### `crm_app/serializers.py`
**UserSerializer Updates:**
- Added `is_admin` field (write-only) for registration
- Added `id` and `is_staff` fields to meta
- Modified `create()` method to set `is_staff` based on `is_admin` flag
- Added `to_representation()` method to include role ('admin' or 'user') in API responses

#### `crm_app/views.py`
**Imports Added:**
- `from .permissions import IsAdminOrReadOnly, TaskPermission`
- `from rest_framework.exceptions import PermissionDenied`

**New View:**
- `CurrentUserView`: Retrieves current user's information including role

**CustomerViewSet Updates:**
- Changed `permission_classes` to `[IsAuthenticated, IsAdminOrReadOnly]`
- Fixed duplicate `filter_backends` declarations
- Corrected `filterset_fields` to `['status']`

**LeadViewSet Updates:**
- Changed `permission_classes` to `[IsAuthenticated, IsAdminOrReadOnly]`
- Fixed duplicate `filter_backends` declarations
- Corrected `filterset_fields` to `['status']`
- Added `search_fields = ['title']`

**TaskViewSet Updates:**
- Changed `permission_classes` to `[IsAuthenticated, TaskPermission]`
- Fixed duplicate `filter_backends` declarations
- Corrected `filterset_fields` to `['completed']`
- Added `search_fields = ['title']`
- Added `perform_create()` method: Enforces that regular users can only create tasks assigned to themselves
- Added `perform_update()` method: Enforces that regular users can only update their own tasks

#### `crm_app/urls.py`
**Updates:**
- Imported `CurrentUserView`
- Added new endpoint: `path('user/me/', CurrentUserView.as_view(), name='current_user')`

---

## Frontend Changes

### 1. New Files Created

#### `src/utils/auth.js`
Utility functions for role-based access control:
- `isAdmin()`: Check if current user is admin
- `isRegularUser()`: Check if current user is regular user
- `getUserRole()`: Get current user's role
- `getUserId()`: Get current user's ID
- `getUsername()`: Get current username
- `canModifyResource(resourceType, resource)`: Check if user can edit/delete a resource
- `canCreateResource(resourceType)`: Check if user can create a resource type

### 2. Modified Frontend Files

#### `src/pages/Register.jsx`
**State Updates:**
- Added `is_admin: false` to formData state

**Form Updates:**
- Added checkbox for "Register as Admin" role selection
- Added descriptive text explaining admin privileges
- Updated API call to include `is_admin` field

#### `src/pages/Login.jsx`
**Login Flow Enhancement:**
- After successful login, fetches user info from `/api/user/me/`
- Stores `user_role`, `user_id`, and `username` in localStorage
- Enhanced error handling for user info fetch

#### `src/pages/Dashboard.jsx`
**Imports Added:**
- `import { getUserRole, getUsername } from '../utils/auth'`

**State Updates:**
- Added `userRole` and `username` variables

**UI Updates:**
- Enhanced header to display username and role badge
- Role badge shows "Admin" (purple) or "User" (blue)

#### `src/pages/Customers.jsx`
**Imports Added:**
- `import { isAdmin, canCreateResource } from '../utils/auth'`

**State Updates:**
- Added `userIsAdmin` constant

**UI Updates:**
- "Create Customer" button only visible to admins
- "Actions" table header only visible to admins
- Edit/Delete buttons in table rows only visible to admins

#### `src/pages/Leads.jsx`
**Imports Added:**
- `import { isAdmin } from '../utils/auth'`

**State Updates:**
- Added `userIsAdmin` constant

**UI Updates:**
- "Create Lead" button only visible to admins
- "Actions" table header only visible to admins
- Edit/Delete buttons in table rows only visible to admins

#### `src/pages/Tasks.jsx`
**Imports Added:**
- `import { isAdmin, canModifyResource, getUserId } from '../utils/auth'`

**State Updates:**
- Added `userIsAdmin` constant
- Added `currentUserId` constant

**Logic Updates:**
- `handleOpenModal()`: Pre-fills `assigned_to` with current user ID for regular users in create mode
- Conditional Edit/Delete buttons based on `canModifyResource()`
- Shows "No actions available" for tasks user cannot modify

**UI Updates:**
- "Assigned To" field is disabled for regular users
- Help text changes based on role
- Edit/Delete buttons only show for tasks user can modify

---

## API Endpoints

### New Endpoint
```
GET /api/user/me/
```
Returns current user's information including role.

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "admin",
  "is_staff": true
}
```

### Modified Endpoint
```
POST /api/register/
```
Now accepts `is_admin` field.

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password",
  "is_admin": false
}
```

---

## Permission Rules Summary

### Customers & Leads
| Action | Admin | Regular User |
|--------|-------|--------------|
| View   | ✅    | ✅           |
| Create | ✅    | ❌           |
| Update | ✅    | ❌           |
| Delete | ✅    | ❌           |

### Tasks
| Action | Admin | Regular User |
|--------|-------|--------------|
| View all | ✅  | ✅           |
| Create (any user) | ✅ | ❌      |
| Create (self) | ✅ | ✅         |
| Update own | ✅   | ✅           |
| Update others | ✅ | ❌         |
| Delete own | ✅   | ✅           |
| Delete others | ✅ | ❌         |

---

## Testing Instructions

### 1. Backend Testing
```bash
# Start Django server
cd c:\Users\user\Desktop\Proje\Web_Projects\CRM
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

### 2. Create Test Users

**Admin User:**
```bash
POST http://127.0.0.1:8000/api/register/
{
  "username": "admin",
  "email": "admin@test.com",
  "password": "Admin@123",
  "is_admin": true
}
```

**Regular User:**
```bash
POST http://127.0.0.1:8000/api/register/
{
  "username": "user",
  "email": "user@test.com",
  "password": "User@123",
  "is_admin": false
}
```

### 3. Frontend Testing
```bash
# Start React development server
cd crm_frontend
npm run dev
```

### 4. Test Scenarios

**As Admin:**
1. Login and verify "Admin" badge appears
2. Create, edit, delete customers
3. Create, edit, delete leads
4. Create, edit, delete tasks (any user assignment)

**As Regular User:**
1. Login and verify "User" badge appears
2. View customers (no create/edit/delete options)
3. View leads (no create/edit/delete options)
4. Create task (auto-assigned to self)
5. Edit/delete own tasks only
6. Verify API returns 403 for unauthorized actions

---

## Files Modified Summary

### Backend (Django)
- ✅ Created: `crm_app/permissions.py`
- ✅ Modified: `crm_app/serializers.py`
- ✅ Modified: `crm_app/views.py`
- ✅ Modified: `crm_app/urls.py`

### Frontend (React)
- ✅ Created: `src/utils/auth.js`
- ✅ Modified: `src/pages/Register.jsx`
- ✅ Modified: `src/pages/Login.jsx`
- ✅ Modified: `src/pages/Dashboard.jsx`
- ✅ Modified: `src/pages/Customers.jsx`
- ✅ Modified: `src/pages/Leads.jsx`
- ✅ Modified: `src/pages/Tasks.jsx`

### Documentation
- ✅ Created: `RBAC_DOCUMENTATION.md`
- ✅ Created: `RBAC_IMPLEMENTATION_SUMMARY.md` (this file)

---

## Security Notes

1. **Backend Enforcement**: All permissions are enforced at the Django REST Framework level. Frontend changes are for UX only.

2. **Token Storage**: User role and info stored in localStorage for UI decisions. Backend always validates permissions.

3. **Object-Level Permissions**: Tasks use both class-level and object-level permissions to ensure users can only modify their own tasks.

4. **Permission Classes Order**: Both `IsAuthenticated` and role-specific permissions are checked for all endpoints.

---

## Next Steps (Optional Enhancements)

1. **User Management Page**: Create an admin-only page to manage users and their roles
2. **Audit Logging**: Track who created/modified/deleted resources
3. **More Granular Permissions**: Add permissions for specific fields or actions
4. **Role Hierarchy**: Implement additional roles (e.g., Manager, Sales Rep)
5. **Team-Based Permissions**: Allow users to manage resources within their team
6. **API Rate Limiting**: Implement rate limiting based on user role
7. **Two-Factor Authentication**: Add 2FA for admin accounts

---

## Rollback Instructions

If you need to revert these changes:

### Backend
1. Remove `permissions.py`
2. Revert `views.py` to use only `IsAuthenticated` permission
3. Revert `serializers.py` UserSerializer changes
4. Remove `/user/me/` endpoint from `urls.py`

### Frontend
1. Remove `src/utils/auth.js`
2. Remove role checks from all page components
3. Remove `is_admin` field from Register.jsx
4. Remove user info fetch from Login.jsx
5. Restore original Dashboard header

---

## Support

For questions or issues with RBAC implementation:
1. Check `RBAC_DOCUMENTATION.md` for detailed usage
2. Review this summary for change locations
3. Test with both admin and regular user accounts
4. Check browser console and Django logs for errors
