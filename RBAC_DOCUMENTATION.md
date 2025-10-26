# Role-Based Access Control (RBAC) Documentation

## Overview
The CRM system now implements role-based access control with two user roles:
- **Admin**: Full access to create, read, update, and delete all resources
- **Regular User**: Read-only access to customers and leads, limited task management

## User Roles

### Admin Role
Admins have unrestricted access to all features:
- ✅ Create, edit, and delete customers
- ✅ Create, edit, and delete leads
- ✅ Create, edit, and delete all tasks (assigned to anyone)
- ✅ View all data in the system

### Regular User Role
Regular users have restricted access:
- ✅ View all customers (read-only)
- ✅ View all leads (read-only)
- ✅ View all tasks
- ✅ Create tasks assigned to themselves only
- ✅ Edit/delete only tasks assigned to them
- ❌ Cannot create, edit, or delete customers
- ❌ Cannot create, edit, or delete leads
- ❌ Cannot modify tasks assigned to other users

## Backend Implementation

### Custom Permissions (`crm_app/permissions.py`)

#### `IsAdminOrReadOnly`
- Used for Customer and Lead ViewSets
- Allows GET requests for all authenticated users
- Requires admin role (is_staff=True) for POST, PUT, PATCH, DELETE

#### `TaskPermission`
- Used for Task ViewSet
- Admins have full access to all tasks
- Regular users can:
  - View all tasks (GET)
  - Create tasks (POST) - enforced to assign to themselves
  - Update/delete only their own tasks

### ViewSet Updates

#### `CustomerViewSet` & `LeadViewSet`
```python
permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
```

#### `TaskViewSet`
```python
permission_classes = [IsAuthenticated, TaskPermission]

def perform_create(self, serializer):
    # Regular users can only create tasks assigned to themselves
    
def perform_update(self, serializer):
    # Regular users can only update their own tasks
```

### User Registration
Users can register with either role:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password",
  "is_admin": false  // true for admin, false for regular user
}
```

### API Endpoints

#### Get Current User Info
```
GET /api/user/me/
```
Returns user details including role:
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "admin",  // or "user"
  "is_staff": true  // or false
}
```

## Frontend Implementation

### Utility Functions (`src/utils/auth.js`)

```javascript
// Check if current user is admin
isAdmin()

// Check if user can modify a specific resource
canModifyResource(resourceType, resource)

// Check if user can create a resource type
canCreateResource(resourceType)

// Get user's role, ID, and username
getUserRole()
getUserId()
getUsername()
```

### UI Changes by Role

#### Dashboard
- Displays user's name and role badge (Admin/User)
- Shows full statistics for both roles

#### Customers Page
- **Admin**: Can see "Create Customer" button and Edit/Delete actions
- **Regular User**: No create button, no Actions column visible

#### Leads Page
- **Admin**: Can see "Create Lead" button and Edit/Delete actions
- **Regular User**: No create button, no Actions column visible

#### Tasks Page
- **Admin**: Full CRUD access to all tasks, can assign to any user
- **Regular User**: 
  - Can create tasks (auto-assigned to themselves)
  - Can only edit/delete their own tasks
  - "Assigned To" field is disabled and pre-filled with their ID
  - See "No actions available" for tasks assigned to others

### Login Flow
1. User logs in with credentials
2. System fetches JWT tokens
3. Fetches user information (`/api/user/me/`)
4. Stores user role, ID, and username in localStorage
5. UI adapts based on stored role

### Storage
The following items are stored in localStorage:
- `access_token`: JWT access token
- `refresh_token`: JWT refresh token
- `user_role`: "admin" or "user"
- `user_id`: User's database ID
- `username`: User's username

## Testing the RBAC System

### Creating Test Users

1. **Create an Admin user:**
```bash
# Via API
POST /api/register/
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "Admin@123",
  "is_admin": true
}
```

2. **Create a Regular user:**
```bash
POST /api/register/
{
  "username": "regular_user",
  "email": "user@example.com",
  "password": "User@123",
  "is_admin": false
}
```

### Test Scenarios

#### Admin User Tests
1. ✅ Login as admin
2. ✅ Verify "Admin" badge appears on dashboard
3. ✅ Create a customer
4. ✅ Edit/delete a customer
5. ✅ Create a lead
6. ✅ Edit/delete a lead
7. ✅ Create a task assigned to any user
8. ✅ Edit/delete any task

#### Regular User Tests
1. ✅ Login as regular user
2. ✅ Verify "User" badge appears on dashboard
3. ✅ View customers list (no Create button or Actions column)
4. ✅ View leads list (no Create button or Actions column)
5. ✅ Create a task (auto-assigned to self)
6. ✅ Edit own task
7. ✅ Delete own task
8. ✅ Verify cannot edit/delete tasks assigned to others
9. ❌ Try to modify customer via API (should get 403 Forbidden)
10. ❌ Try to modify lead via API (should get 403 Forbidden)

### Expected API Responses

#### Regular User tries to create a customer:
```
POST /api/customers/
Response: 403 Forbidden
{
  "detail": "You do not have permission to perform this action."
}
```

#### Regular User tries to create a task assigned to another user:
```
POST /api/tasks/
{
  "title": "Task",
  "assigned_to": 5  // Different user ID
}
Response: 403 Forbidden
{
  "detail": "Regular users can only create tasks assigned to themselves."
}
```

## Security Considerations

1. **Backend Enforcement**: All permissions are enforced at the backend level. Frontend UI changes are for UX only.

2. **Token-Based Auth**: JWT tokens are used for authentication. Tokens expire and can be refreshed.

3. **Permission Classes**: Django REST Framework's permission system ensures unauthorized actions are blocked.

4. **Object-Level Permissions**: Tasks use object-level permissions to ensure users can only modify their own tasks.

## Migration Notes

### Existing Users
If you have existing users in the database:
- By default, they will have `is_staff=False` (regular user role)
- To make them admins, update via Django admin or shell:
  ```python
  from django.contrib.auth.models import User
  user = User.objects.get(username='username')
  user.is_staff = True
  user.save()
  ```

### Frontend Updates Required
After pulling RBAC changes, users must:
1. Log out and log back in to fetch role information
2. Clear browser cache if experiencing issues with localStorage

## Troubleshooting

### User sees admin features but gets 403 errors
- Check localStorage for `user_role` value
- Re-login to refresh user information
- Verify backend `is_staff` status in Django admin

### Changes not saving for regular users
- Check browser console for 403 errors
- Verify the user is only modifying their own tasks
- Ensure task is actually assigned to the logged-in user

### Role badge not showing
- Verify user logged in after RBAC implementation
- Check localStorage for `username` and `user_role`
- Try clearing cache and re-logging in
