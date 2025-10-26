from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Customer, Lead, Task

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    email = serializers.EmailField(required=True)
    is_admin = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'is_admin', 'is_staff')
        read_only_fields = ('id', 'is_staff')

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
        representation['role'] = 'admin' if instance.is_staff else 'user'
        return representation

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
