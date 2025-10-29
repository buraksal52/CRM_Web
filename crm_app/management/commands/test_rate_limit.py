"""
Django management command to test rate limiting
Usage: python manage.py test_rate_limit
"""
from django.core.management.base import BaseCommand
from django.test import Client
import json


class Command(BaseCommand):
    help = 'Test rate limiting on the login endpoint'

    def handle(self, *args, **kwargs):
        client = Client()
        login_url = '/api/login/'
        
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.WARNING('TESTING RATE LIMITING ON LOGIN ENDPOINT'))
        self.stdout.write("=" * 80)
        self.stdout.write(f"\nEndpoint: {login_url}")
        self.stdout.write("Rate limit: 5 requests per minute\n")
        
        credentials = {
            "username": "testuser",
            "password": "testpass123"
        }
        
        self.stdout.write("Making 6 rapid login attempts...\n")
        
        rate_limited = False
        
        for i in range(1, 7):
            response = client.post(
                login_url,
                data=json.dumps(credentials),
                content_type='application/json'
            )
            
            status_code = response.status_code
            
            if status_code == 429:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Request {i}: ✓ RATE LIMITED (429) - Working correctly!"
                    )
                )
                try:
                    response_data = response.json()
                    self.stdout.write(f"  Response: {response_data}")
                except:
                    self.stdout.write(f"  Response: {response.content.decode()}")
                rate_limited = True
                break
            elif status_code == 401:
                self.stdout.write(
                    f"Request {i}: Authentication failed (401) - Expected with test credentials"
                )
            elif status_code == 400:
                self.stdout.write(
                    f"Request {i}: Bad request (400)"
                )
            else:
                self.stdout.write(f"Request {i}: Status {status_code}")
        
        self.stdout.write("\n" + "=" * 80)
        
        if rate_limited:
            self.stdout.write(
                self.style.SUCCESS(
                    "✓ SUCCESS: Rate limiting is working correctly!\n"
                    "  The 6th request was blocked with a 429 status code."
                )
            )
        else:
            self.stdout.write(
                self.style.ERROR(
                    "✗ FAILED: Rate limiting did not trigger!\n"
                    "  Expected a 429 response after 5 requests."
                )
            )
        
        self.stdout.write("=" * 80)
