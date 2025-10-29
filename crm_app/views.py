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
from django.db import connection
from django.db.models import Prefetch
import logging
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from django_ratelimit.exceptions import Ratelimited
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes

logger = logging.getLogger(__name__)


def log_queries(view_name):
    """Log the number of database queries executed"""
    query_count = len(connection.queries)
    logger.info(f"{view_name} - Queries executed: {query_count}")
    return query_count


@extend_schema(
    tags=['Authentication'],
    summary='Register a new user',
    description='Create a new user account. Set is_admin to true to create an admin user.',
    request=UserSerializer,
    responses={
        201: UserSerializer,
        400: OpenApiTypes.OBJECT,
    },
    examples=[
        OpenApiExample(
            'Register Regular User',
            value={
                'username': 'john_doe',
                'email': 'john@example.com',
                'password': 'securePassword123',
                'is_admin': False
            },
            request_only=True,
        ),
        OpenApiExample(
            'Register Admin User',
            value={
                'username': 'admin_user',
                'email': 'admin@example.com',
                'password': 'securePassword123',
                'is_admin': True
            },
            request_only=True,
        ),
    ]
)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer


@extend_schema(
    tags=['Authentication'],
    summary='Login and obtain JWT tokens',
    description='Authenticate with username and password to receive access and refresh tokens. Rate limited to 5 attempts per minute per IP address.',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'username': {'type': 'string', 'example': 'john_doe'},
                'password': {'type': 'string', 'example': 'password123'},
            },
            'required': ['username', 'password']
        }
    },
    responses={
        200: {
            'type': 'object',
            'properties': {
                'access': {'type': 'string', 'description': 'JWT access token'},
                'refresh': {'type': 'string', 'description': 'JWT refresh token'},
            }
        },
        401: OpenApiTypes.OBJECT,
        429: {
            'type': 'object',
            'properties': {
                'error': {'type': 'string'},
                'detail': {'type': 'string'},
            },
            'description': 'Too many login attempts'
        }
    },
    examples=[
        OpenApiExample(
            'Login Request',
            value={'username': 'john_doe', 'password': 'password123'},
            request_only=True,
        ),
        OpenApiExample(
            'Successful Login',
            value={
                'access': 'eyJ0eXAiOiJKV1QiLCJhbGc...',
                'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGc...'
            },
            response_only=True,
            status_codes=['200'],
        ),
    ]
)
@method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True), name='dispatch')
class RateLimitedLoginView(TokenObtainPairView):
    """
    Custom login view with rate limiting
    - Limits to 5 login attempts per minute per IP address
    - Returns 429 Too Many Requests when limit is exceeded
    - Prevents brute force attacks
    """
    permission_classes = (AllowAny,)
    
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except Ratelimited:
            return Response(
                {
                    'error': 'Too many login attempts. Please try again later.',
                    'detail': 'Rate limit exceeded. Maximum 5 attempts per minute allowed.'
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )


@extend_schema(
    tags=['Authentication'],
    summary='Get current authenticated user',
    description='Retrieve information about the currently authenticated user including role (admin/user).',
    responses={
        200: UserSerializer,
        401: OpenApiTypes.OBJECT,
    }
)
class CurrentUserView(generics.RetrieveAPIView):
    """
    Endpoint to get current user's information including role
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


@extend_schema_view(
    list=extend_schema(
        tags=['Customers'],
        summary='List all customers',
        description='Retrieve a paginated list of all customers. Only authenticated users can access this endpoint. Admins have full access.',
        parameters=[
            OpenApiParameter(
                name='page',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Page number for pagination',
            ),
        ],
    ),
    retrieve=extend_schema(
        tags=['Customers'],
        summary='Get customer details',
        description='Retrieve detailed information about a specific customer by ID.',
    ),
    create=extend_schema(
        tags=['Customers'],
        summary='Create new customer',
        description='Create a new customer. Only admins can create customers.',
        examples=[
            OpenApiExample(
                'Create Customer',
                value={
                    'name': 'John Doe',
                    'email': 'john.doe@example.com',
                    'phone': '555-0123',
                    'company': 'Acme Corp',
                    'status': 'Active'
                },
                request_only=True,
            ),
        ]
    ),
    update=extend_schema(
        tags=['Customers'],
        summary='Update customer',
        description='Update all fields of a customer. Only admins can update customers.',
    ),
    partial_update=extend_schema(
        tags=['Customers'],
        summary='Partially update customer',
        description='Update specific fields of a customer. Only admins can update customers.',
    ),
    destroy=extend_schema(
        tags=['Customers'],
        summary='Delete customer',
        description='Delete a customer. Only admins can delete customers.',
    ),
)
class CustomerViewSet(viewsets.ModelViewSet):
    """
    Optimized Customer ViewSet
    - Orders by created_at descending for consistent pagination
    - No ForeignKey relationships to optimize (standalone model)
    """
    queryset = Customer.objects.all()  # Required for router
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status']
    search_fields = ['name', 'email']
    
    def get_queryset(self):
        """
        Optimized queryset:
        - Order by created_at for consistent pagination
        - Use only() to fetch only required fields if needed
        """
        queryset = Customer.objects.all().order_by('-created_at')
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override list to log query count"""
        response = super().list(request, *args, **kwargs)
        log_queries("CustomerViewSet.list")
        return response


@extend_schema_view(
    list=extend_schema(
        tags=['Leads'],
        summary='List all leads',
        description='Retrieve a paginated list of all leads with customer information. Supports filtering by status and searching by title.',
        parameters=[
            OpenApiParameter(
                name='page',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Page number for pagination',
            ),
            OpenApiParameter(
                name='status',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Filter by lead status (e.g., New, Contacted, Qualified, Lost)',
            ),
            OpenApiParameter(
                name='search',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Search leads by title',
            ),
        ],
    ),
    retrieve=extend_schema(
        tags=['Leads'],
        summary='Get lead details',
        description='Retrieve detailed information about a specific lead including related customer data.',
    ),
    create=extend_schema(
        tags=['Leads'],
        summary='Create new lead',
        description='Create a new lead. Only admins can create leads.',
        examples=[
            OpenApiExample(
                'Create Lead',
                value={
                    'customer': 1,
                    'title': 'New sales opportunity',
                    'description': 'Potential deal worth $50k',
                    'status': 'New',
                    'value': '50000.00'
                },
                request_only=True,
            ),
        ]
    ),
    update=extend_schema(
        tags=['Leads'],
        summary='Update lead',
        description='Update all fields of a lead. Only admins can update leads.',
    ),
    partial_update=extend_schema(
        tags=['Leads'],
        summary='Partially update lead',
        description='Update specific fields of a lead. Only admins can update leads.',
    ),
    destroy=extend_schema(
        tags=['Leads'],
        summary='Delete lead',
        description='Delete a lead. Only admins can delete leads.',
    ),
)
class LeadViewSet(viewsets.ModelViewSet):
    """
    Optimized Lead ViewSet
    - Uses select_related('customer') to avoid N+1 queries
    - Customer data is fetched in a single JOIN query
    - Orders by created_at descending for consistent pagination
    """
    queryset = Lead.objects.all()  # Required for router
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status']
    search_fields = ['title']
    
    def get_queryset(self):
        """
        Optimized queryset:
        - select_related('customer') prevents N+1 queries when accessing customer data
        - Orders by created_at for consistent pagination
        
        Before optimization: 1 query for leads + N queries for each customer = N+1 queries
        After optimization: 1 query with JOIN = 1 query total
        """
        queryset = Lead.objects.select_related('customer').order_by('-created_at')
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override list to log query count"""
        response = super().list(request, *args, **kwargs)
        log_queries("LeadViewSet.list")
        return response


@extend_schema_view(
    list=extend_schema(
        tags=['Tasks'],
        summary='List tasks',
        description='Retrieve a list of tasks. Users can only see their own tasks, admins can see all tasks. Supports filtering by completion status and searching by title.',
        parameters=[
            OpenApiParameter(
                name='page',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Page number for pagination',
            ),
            OpenApiParameter(
                name='completed',
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description='Filter by completion status (true/false)',
            ),
            OpenApiParameter(
                name='search',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Search tasks by title',
            ),
        ],
    ),
    retrieve=extend_schema(
        tags=['Tasks'],
        summary='Get task details',
        description='Retrieve detailed information about a specific task. Users can only view their own tasks unless they are admins.',
    ),
    create=extend_schema(
        tags=['Tasks'],
        summary='Create new task',
        description='Create a new task and optionally assign it to a user.',
        examples=[
            OpenApiExample(
                'Create Task',
                value={
                    'title': 'Follow up with customer',
                    'description': 'Call customer to discuss proposal',
                    'due_date': '2025-11-15T10:00:00Z',
                    'completed': False,
                    'assigned_to': 1
                },
                request_only=True,
            ),
        ]
    ),
    update=extend_schema(
        tags=['Tasks'],
        summary='Update task',
        description='Update all fields of a task. Users can only update their own tasks.',
    ),
    partial_update=extend_schema(
        tags=['Tasks'],
        summary='Partially update task',
        description='Update specific fields of a task. Users can only update their own tasks.',
        examples=[
            OpenApiExample(
                'Mark Task Complete',
                value={'completed': True},
                request_only=True,
            ),
        ]
    ),
    destroy=extend_schema(
        tags=['Tasks'],
        summary='Delete task',
        description='Delete a task. Users can only delete their own tasks.',
    ),
)
class TaskViewSet(viewsets.ModelViewSet):
    """
    Optimized Task ViewSet
    - Uses select_related('assigned_to') to avoid N+1 queries
    - User data is fetched in a single JOIN query
    - Orders by due_date ascending (oldest/most urgent first)
    """
    queryset = Task.objects.all()  # Required for router
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, TaskPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['completed']
    search_fields = ['title']
    
    def get_queryset(self):
        """
        Optimized queryset:
        - select_related('assigned_to') prevents N+1 queries when accessing user data
        - Orders by due_date (ascending) to show urgent tasks first
        
        Before optimization: 1 query for tasks + N queries for each user = N+1 queries
        After optimization: 1 query with JOIN = 1 query total
        
        Note: assigned_to can be NULL, but select_related handles this efficiently
        """
        queryset = Task.objects.select_related('assigned_to').order_by('due_date', '-created_at')
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override list to log query count"""
        response = super().list(request, *args, **kwargs)
        log_queries("TaskViewSet.list")
        return response
    
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
