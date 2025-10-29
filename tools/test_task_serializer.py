import os
import sys
import django
import json

# Ensure project root is on sys.path when script is run from tools/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_project.settings')
django.setup()

from crm_app.models import Task
from crm_app.serializers import TaskSerializer

# Get the first task
task = Task.objects.first()

if task is None:
    print("No tasks found in database. The verification script already created one.")
    print("Please check using the API or Django admin.")
else:
    # Serialize the task
    serializer = TaskSerializer(task)
    data = serializer.data
    
    print("=" * 60)
    print("Task Serializer Output Test")
    print("=" * 60)
    print(f"Task ID: {data.get('id')}")
    print(f"Title: {data.get('title')}")
    print(f"Assigned To (ID): {data.get('assigned_to')}")
    print(f"Assigned To (Name): {data.get('assigned_to_name')}")
    print("=" * 60)
    print("\nFull serialized data:")
    print(json.dumps(data, indent=2, default=str))
    print("=" * 60)
    
    if data.get('assigned_to_name'):
        print("\n✅ SUCCESS: assigned_to_name field is working correctly!")
        print(f"   Username: {data.get('assigned_to_name')}")
    elif data.get('assigned_to') is None:
        print("\n⚠️  NOTE: Task is unassigned, so assigned_to_name is None (expected)")
    else:
        print("\n❌ ERROR: assigned_to_name field not found in serializer output!")
