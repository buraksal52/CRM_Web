from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Customer, Lead, Task
from .serializers import CustomerSerializer, LeadSerializer, TaskSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from .permissions import IsAdminOrReadOnly, TaskPermission
from rest_framework.exceptions import PermissionDenied

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer


class CurrentUserView(generics.RetrieveAPIView):
    """
    Endpoint to get current user's information including role
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status']
    search_fields = ['name', 'email']

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status']
    search_fields = ['title']

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, TaskPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['completed']
    search_fields = ['title']
    
    def perform_create(self, serializer):
        """
        When creating a task:
        - Admin users can assign to anyone
        - Regular users can only create tasks assigned to themselves
        """
        user = self.request.user
        assigned_to = serializer.validated_data.get('assigned_to')
        
        # If regular user (not admin), ensure they can only assign to themselves
        if not user.is_staff and assigned_to != user:
            raise PermissionDenied("Regular users can only create tasks assigned to themselves.")
        
        serializer.save()
    
    def perform_update(self, serializer):
        """
        When updating a task:
        - Admin users can update any task
        - Regular users can only update tasks assigned to themselves
        """
        user = self.request.user
        task = self.get_object()
        
        # If regular user, check if task is assigned to them
        if not user.is_staff and task.assigned_to != user:
            raise PermissionDenied("You can only update tasks assigned to you.")
        
        serializer.save()
