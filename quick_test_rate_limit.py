"""
Quick test for rate limiting - makes 6 rapid login attempts
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/login/"

print("Testing rate limiting with 6 rapid requests...\n")

credentials = {"username": "testuser", "password": "testpass"}

for i in range(1, 7):
    try:
        response = requests.post(BASE_URL, json=credentials, timeout=5)
        status = response.status_code
        
        if status == 429:
            print(f"Request {i}: ✓ RATE LIMITED (429) - Rate limiting is working!")
            print(f"Response: {response.json()}\n")
            break
        else:
            print(f"Request {i}: Status {status}")
    except requests.exceptions.ConnectionError:
        print(f"ERROR: Server not running. Start with: python manage.py runserver")
        break
    except Exception as e:
        print(f"Request {i}: Error - {e}")
