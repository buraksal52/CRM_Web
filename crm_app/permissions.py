from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to perform actions.
    """
    def has_permission(self, request, view):
        # Check if user is authenticated and is staff (admin)
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow:
    - Admin users: full CRUD access
    - Regular users: read-only access (GET, HEAD, OPTIONS)
    """
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Read permissions are allowed for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed for admin users
        return request.user.is_staff


class TaskPermission(permissions.BasePermission):
    """
    Custom permission for Task model:
    - Admin users: full CRUD access to all tasks
    - Regular users: can view all tasks, create tasks assigned to themselves,
                     update/delete only their own tasks
    """
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin users have full access
        if request.user.is_staff:
            return True
        
        # Regular users can view (GET, HEAD, OPTIONS) all tasks
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Regular users can create tasks (POST)
        if request.method == 'POST':
            return True
        
        # For UPDATE and DELETE, check object-level permission
        return True

    def has_object_permission(self, request, view, obj):
        # Admin users have full access
        if request.user.is_staff:
            return True
        
        # Regular users can view any task
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Regular users can only update/delete tasks assigned to them
        return obj.assigned_to == request.user
