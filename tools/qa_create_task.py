import os
import sys
import django
# Ensure project root is on sys.path when script is run from tools/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from crm_app.models import Task
from django.utils import timezone as tz

User = get_user_model()
user = User.objects.first()
if user is None:
    # Create a quick test user if none exists
    user = User.objects.create_user(username='qa_test_user', email='qa@example.com', password='testpass')
    print('Created test user:', user.username)

t = Task.objects.create(title='QA test task from script', assigned_to=user, due_date=tz.now())
print('Created task str():', str(t))
print('Task id:', t.id)
