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

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['name', 'email']
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['name', 'email']
    search_fields = ['name', 'email']

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['name', 'email']
    search_fields = ['name', 'email']

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['completed']
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['name', 'email']
    search_fields = ['name', 'email']
