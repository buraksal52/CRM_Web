from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Customer, Lead, Task
from drf_spectacular.utils import extend_schema_field


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        help_text='User password (min 8 characters, must include letters and numbers)'
    )
    email = serializers.EmailField(
        required=True,
        help_text='User email address'
    )
    is_admin = serializers.BooleanField(
        write_only=True,
        required=False,
        default=False,
        help_text='Set to true to create an admin user with full permissions'
    )
    role = serializers.SerializerMethodField(
        help_text='User role (admin or user)'
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'is_admin', 'is_staff', 'role')
        read_only_fields = ('id', 'is_staff', 'role')

    @extend_schema_field(serializers.CharField)
    def get_role(self, obj):
        """Return user role as 'admin' or 'user'"""
        return 'admin' if obj.is_staff else 'user'

    def create(self, validated_data):
        is_admin = validated_data.pop('is_admin', False)
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            is_staff=is_admin  # Set is_staff based on is_admin flag
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    
    def to_representation(self, instance):
        """Include role information in response"""
        representation = super().to_representation(instance)
        return representation


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        extra_kwargs = {
            'name': {'help_text': 'Full name of the customer'},
            'email': {'help_text': 'Customer email address'},
            'phone': {'help_text': 'Customer phone number'},
            'company': {'help_text': 'Company name (optional)'},
            'status': {'help_text': 'Customer status (e.g., Active, Inactive)'},
        }


class LeadSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source='customer.name',
        read_only=True,
        help_text='Name of the associated customer'
    )
    
    class Meta:
        model = Lead
        fields = '__all__'
        extra_kwargs = {
            'customer': {'help_text': 'ID of the customer associated with this lead'},
            'title': {'help_text': 'Brief title describing the lead'},
            'description': {'help_text': 'Detailed description of the lead opportunity'},
            'status': {'help_text': 'Current status of the lead (e.g., New, Contacted, Qualified, Lost)'},
            'value': {'help_text': 'Estimated monetary value of the lead'},
        }


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(
        source='assigned_to.username',
        read_only=True,
        help_text='Username of the user assigned to this task'
    )
    
    class Meta:
        model = Task
        fields = '__all__'
        extra_kwargs = {
            'title': {'help_text': 'Task title'},
            'description': {'help_text': 'Detailed description of the task'},
            'due_date': {'help_text': 'Task due date and time (ISO 8601 format)'},
            'completed': {'help_text': 'Whether the task is completed'},
            'assigned_to': {'help_text': 'ID of the user assigned to this task (optional)'},
        }

