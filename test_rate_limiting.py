"""
Test script for verifying rate limiting on the login endpoint
Run this script to test that the login endpoint properly enforces rate limits
"""
import requests
import time
import json

BASE_URL = "http://localhost:8000/api"
LOGIN_URL = f"{BASE_URL}/login/"

def test_rate_limiting():
    """
    Test rate limiting by making multiple login requests
    Expected behavior:
    - First 5 requests should succeed or fail based on credentials
    - 6th request within 1 minute should return 429 Too Many Requests
    """
    print("=" * 80)
    print("RATE LIMITING TEST - Login Endpoint")
    print("=" * 80)
    print(f"\nTarget: {LOGIN_URL}")
    print("Rate Limit: 5 requests per minute\n")
    
    # Test credentials (use existing user or it will fail authentication)
    credentials = {
        "username": "test_user",
        "password": "wrong_password"  # Intentionally wrong to avoid actual login
    }
    
    print("Making 7 login attempts in rapid succession...\n")
    
    for i in range(1, 8):
        print(f"Request {i}:")
        
        try:
            response = requests.post(LOGIN_URL, json=credentials)
            
            print(f"  Status Code: {response.status_code}")
            
            if response.status_code == 429:
                print(f"  ✓ RATE LIMITED! (Expected after 5 requests)")
                print(f"  Response: {response.json()}")
                print("\n" + "=" * 80)
                print("✓ RATE LIMITING IS WORKING CORRECTLY!")
                print("=" * 80)
                return True
            elif response.status_code == 401:
                print(f"  Authentication failed (expected with test credentials)")
            elif response.status_code == 200:
                print(f"  ✓ Login successful")
            else:
                print(f"  Response: {response.text[:200]}")
            
        except requests.exceptions.ConnectionError:
            print(f"  ✗ ERROR: Could not connect to {LOGIN_URL}")
            print(f"  Make sure Django server is running: python manage.py runserver")
            return False
        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            return False
        
        # Small delay between requests
        time.sleep(0.2)
    
    print("\n" + "=" * 80)
    print("⚠️  WARNING: Rate limiting did NOT trigger after 7 requests!")
    print("Expected 429 response after 5 requests within 1 minute")
    print("=" * 80)
    return False


def test_rate_limit_reset():
    """
    Test that rate limit resets after the time window
    """
    print("\n" + "=" * 80)
    print("TESTING RATE LIMIT RESET")
    print("=" * 80)
    print("\nWaiting 61 seconds for rate limit to reset...")
    
    credentials = {
        "username": "test_user",
        "password": "test_password"
    }
    
    # Wait for rate limit window to expire
    for remaining in range(61, 0, -1):
        print(f"\rTime remaining: {remaining} seconds...", end="", flush=True)
        time.sleep(1)
    
    print("\n\nMaking request after rate limit reset...")
    
    try:
        response = requests.post(LOGIN_URL, json=credentials)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 429:
            print("✓ Rate limit has been reset! Request succeeded.")
            return True
        else:
            print("⚠️  Rate limit still active (unexpected)")
            return False
            
    except Exception as e:
        print(f"✗ ERROR: {e}")
        return False


if __name__ == "__main__":
    print("\n" + "╔" + "=" * 78 + "╗")
    print("║" + " " * 20 + "DJANGO RATE LIMITING TEST SUITE" + " " * 27 + "║")
    print("╚" + "=" * 78 + "╝\n")
    
    # Test 1: Verify rate limiting triggers
    result = test_rate_limiting()
    
    if result:
        # Test 2: Verify rate limit resets (optional, takes 61 seconds)
        print("\n\nWould you like to test rate limit reset? (takes 61 seconds)")
        user_input = input("Type 'yes' to continue: ").strip().lower()
        
        if user_input == 'yes':
            test_rate_limit_reset()
    
    print("\n✓ Test script completed\n")
