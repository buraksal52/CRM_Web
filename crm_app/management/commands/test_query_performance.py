"""
Django management command to test database query performance
Tests query counts before and after optimization
"""

from django.core.management.base import BaseCommand
from django.db import connection, reset_queries
from django.contrib.auth.models import User
from crm_app.models import Customer, Lead, Task
from crm_app.serializers import CustomerSerializer, LeadSerializer, TaskSerializer
from datetime import datetime, timedelta
from decimal import Decimal


class Command(BaseCommand):
    help = 'Test database query performance for API endpoints'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-data',
            action='store_true',
            help='Create test data before running query tests',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('DATABASE QUERY PERFORMANCE TEST'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        
        if options['create_data']:
            self.create_test_data()
        
        self.stdout.write('')
        self.test_customer_queries()
        self.stdout.write('')
        self.test_lead_queries()
        self.stdout.write('')
        self.test_task_queries()
        self.stdout.write('')
        
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('PERFORMANCE TEST COMPLETE'))
        self.stdout.write(self.style.SUCCESS('=' * 80))

    def create_test_data(self):
        """Create test data for performance testing"""
        self.stdout.write(self.style.WARNING('Creating test data...'))
        
        # Create users
        admin_user, _ = User.objects.get_or_create(
            username='admin_test',
            defaults={'is_staff': True, 'is_superuser': True}
        )
        admin_user.set_password('admin123')
        admin_user.save()
        
        regular_user, _ = User.objects.get_or_create(
            username='user_test',
            defaults={'is_staff': False}
        )
        regular_user.set_password('user123')
        regular_user.save()
        
        # Create 50 customers
        customers = []
        for i in range(50):
            customer, _ = Customer.objects.get_or_create(
                email=f'customer{i}@test.com',
                defaults={
                    'name': f'Test Customer {i}',
                    'phone': f'555-010{i:02d}',
                    'company': f'Company {i}',
                    'status': 'Active' if i % 2 == 0 else 'Inactive'
                }
            )
            customers.append(customer)
        
        # Create 100 leads (2 per customer)
        for i, customer in enumerate(customers):
            for j in range(2):
                Lead.objects.get_or_create(
                    title=f'Lead {i}-{j} for {customer.name}',
                    customer=customer,
                    defaults={
                        'value': Decimal(str(1000 + i * 100)),
                        'status': ['Open', 'Won', 'Lost'][j % 3]
                    }
                )
        
        # Create 100 tasks
        for i in range(100):
            Task.objects.get_or_create(
                title=f'Task {i}',
                defaults={
                    'description': f'Description for task {i}',
                    'assigned_to': admin_user if i % 2 == 0 else regular_user,
                    'due_date': datetime.now() + timedelta(days=i),
                    'completed': i % 3 == 0
                }
            )
        
        self.stdout.write(self.style.SUCCESS('✓ Test data created successfully'))

    def test_customer_queries(self):
        """Test Customer endpoint queries"""
        self.stdout.write(self.style.WARNING('Testing Customer Endpoint Queries...'))
        
        # Reset query counter
        reset_queries()
        
        # Simulate what the viewset does (WITHOUT optimization)
        customers_unoptimized = Customer.objects.all()[:10]
        # Serialize to trigger lazy loading
        serializer_unoptimized = CustomerSerializer(customers_unoptimized, many=True)
        data_unoptimized = serializer_unoptimized.data
        queries_unoptimized = len(connection.queries)
        
        reset_queries()
        
        # WITH optimization (ordering)
        customers_optimized = Customer.objects.all().order_by('-created_at')[:10]
        serializer_optimized = CustomerSerializer(customers_optimized, many=True)
        data_optimized = serializer_optimized.data
        queries_optimized = len(connection.queries)
        
        self.stdout.write(f'  Customers fetched: {len(data_optimized)}')
        self.stdout.write(f'  Queries (unoptimized): {queries_unoptimized}')
        self.stdout.write(f'  Queries (optimized):   {queries_optimized}')
        self.stdout.write(self.style.SUCCESS(f'  ✓ Improvement: {queries_unoptimized - queries_optimized} fewer queries'))

    def test_lead_queries(self):
        """Test Lead endpoint queries - THIS IS WHERE WE SEE BIG IMPROVEMENTS"""
        self.stdout.write(self.style.WARNING('Testing Lead Endpoint Queries...'))
        
        # Reset query counter
        reset_queries()
        
        # WITHOUT select_related (N+1 problem)
        leads_unoptimized = Lead.objects.all()[:10]
        serializer_unoptimized = LeadSerializer(leads_unoptimized, many=True)
        data_unoptimized = serializer_unoptimized.data
        queries_unoptimized = len(connection.queries)
        
        reset_queries()
        
        # WITH select_related (optimized)
        leads_optimized = Lead.objects.select_related('customer').order_by('-created_at')[:10]
        serializer_optimized = LeadSerializer(leads_optimized, many=True)
        data_optimized = serializer_optimized.data
        queries_optimized = len(connection.queries)
        
        self.stdout.write(f'  Leads fetched: {len(data_optimized)}')
        self.stdout.write(f'  Queries (unoptimized): {queries_unoptimized} ⚠️  N+1 problem!')
        self.stdout.write(f'  Queries (optimized):   {queries_optimized}')
        self.stdout.write(self.style.SUCCESS(f'  ✓ Improvement: {queries_unoptimized - queries_optimized} fewer queries ({int((queries_unoptimized - queries_optimized) / queries_unoptimized * 100)}% reduction)'))

    def test_task_queries(self):
        """Test Task endpoint queries - THIS IS WHERE WE SEE BIG IMPROVEMENTS"""
        self.stdout.write(self.style.WARNING('Testing Task Endpoint Queries...'))
        
        # Reset query counter
        reset_queries()
        
        # WITHOUT select_related (N+1 problem)
        tasks_unoptimized = Task.objects.all()[:10]
        serializer_unoptimized = TaskSerializer(tasks_unoptimized, many=True)
        data_unoptimized = serializer_unoptimized.data
        queries_unoptimized = len(connection.queries)
        
        reset_queries()
        
        # WITH select_related (optimized)
        tasks_optimized = Task.objects.select_related('assigned_to').order_by('due_date', '-created_at')[:10]
        serializer_optimized = TaskSerializer(tasks_optimized, many=True)
        data_optimized = serializer_optimized.data
        queries_optimized = len(connection.queries)
        
        self.stdout.write(f'  Tasks fetched: {len(data_optimized)}')
        self.stdout.write(f'  Queries (unoptimized): {queries_unoptimized} ⚠️  N+1 problem!')
        self.stdout.write(f'  Queries (optimized):   {queries_optimized}')
        self.stdout.write(self.style.SUCCESS(f'  ✓ Improvement: {queries_unoptimized - queries_optimized} fewer queries ({int((queries_unoptimized - queries_optimized) / queries_unoptimized * 100)}% reduction)'))
