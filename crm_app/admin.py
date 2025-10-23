from django.contrib import admin
from .models import Customer, Lead, Task

# Register your models here.
admin.site.register(Customer)
admin.site.register(Lead)
admin.site.register(Task)
