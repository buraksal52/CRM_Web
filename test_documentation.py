"""
Test script to verify OpenAPI documentation endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_schema_endpoint():
    """Test the schema endpoint"""
    print("=" * 80)
    print("TESTING OPENAPI SCHEMA ENDPOINT")
    print("=" * 80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/schema/", timeout=5)
        
        if response.status_code == 200:
            schema = response.json()
            print(f"\n✓ Schema endpoint accessible")
            print(f"  OpenAPI Version: {schema.get('openapi', 'N/A')}")
            print(f"  API Title: {schema.get('info', {}).get('title', 'N/A')}")
            print(f"  API Version: {schema.get('info', {}).get('version', 'N/A')}")
            print(f"  Description: {schema.get('info', {}).get('description', 'N/A')[:100]}...")
            
            paths = schema.get('paths', {})
            print(f"\n  Total Endpoints: {len(paths)}")
            print(f"\n  Documented Endpoints:")
            for path in sorted(paths.keys()):
                methods = list(paths[path].keys())
                print(f"    {path}: {', '.join([m.upper() for m in methods if m != 'parameters'])}")
            
            # Check for JWT authentication
            components = schema.get('components', {})
            security_schemes = components.get('securitySchemes', {})
            if 'bearerAuth' in security_schemes:
                print(f"\n  ✓ JWT Authentication configured:")
                print(f"    Type: {security_schemes['bearerAuth'].get('type')}")
                print(f"    Scheme: {security_schemes['bearerAuth'].get('scheme')}")
                print(f"    Bearer Format: {security_schemes['bearerAuth'].get('bearerFormat')}")
            else:
                print(f"\n  ✗ JWT Authentication NOT configured in schema")
            
            # Check for models/schemas
            schemas = components.get('schemas', {})
            print(f"\n  Total Models/Schemas: {len(schemas)}")
            print(f"  Models: {', '.join(sorted(schemas.keys())[:10])}...")
            
            return True
        else:
            print(f"✗ Schema endpoint returned status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"✗ Could not connect to {BASE_URL}")
        print(f"  Make sure Django server is running: python manage.py runserver")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_swagger_ui():
    """Test Swagger UI endpoint"""
    print("\n" + "=" * 80)
    print("TESTING SWAGGER UI ENDPOINT")
    print("=" * 80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/docs/", timeout=5)
        
        if response.status_code == 200:
            print(f"\n✓ Swagger UI accessible at: {BASE_URL}/api/docs/")
            print(f"  Content-Type: {response.headers.get('Content-Type')}")
            print(f"  Response Length: {len(response.text)} bytes")
            
            if 'swagger' in response.text.lower() or 'openapi' in response.text.lower():
                print(f"  ✓ Swagger UI HTML content detected")
            
            return True
        else:
            print(f"✗ Swagger UI returned status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_redoc_ui():
    """Test ReDoc UI endpoint"""
    print("\n" + "=" * 80)
    print("TESTING REDOC UI ENDPOINT")
    print("=" * 80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/redoc/", timeout=5)
        
        if response.status_code == 200:
            print(f"\n✓ ReDoc UI accessible at: {BASE_URL}/api/redoc/")
            print(f"  Content-Type: {response.headers.get('Content-Type')}")
            print(f"  Response Length: {len(response.text)} bytes")
            
            if 'redoc' in response.text.lower():
                print(f"  ✓ ReDoc UI HTML content detected")
            
            return True
        else:
            print(f"✗ ReDoc UI returned status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


if __name__ == "__main__":
    print("\n" + "╔" + "=" * 78 + "╗")
    print("║" + " " * 20 + "OpenAPI DOCUMENTATION TEST SUITE" + " " * 25 + "║")
    print("╚" + "=" * 78 + "╝\n")
    
    results = []
    
    # Test 1: Schema endpoint
    results.append(test_schema_endpoint())
    
    # Test 2: Swagger UI
    results.append(test_swagger_ui())
    
    # Test 3: ReDoc UI
    results.append(test_redoc_ui())
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(results)
    total = len(results)
    
    print(f"\nTests Passed: {passed}/{total}")
    
    if passed == total:
        print("\n✓ ALL TESTS PASSED!")
        print("\nYour API documentation is ready:")
        print(f"  📄 OpenAPI Schema: {BASE_URL}/api/schema/")
        print(f"  📚 Swagger UI: {BASE_URL}/api/docs/")
        print(f"  📖 ReDoc UI: {BASE_URL}/api/redoc/")
        print("\nTo test with JWT authentication:")
        print("  1. Go to /api/docs/")
        print("  2. Click 'Authorize' button")
        print("  3. Enter: Bearer <your_jwt_token>")
        print("  4. Test protected endpoints")
    else:
        print(f"\n⚠️  Some tests failed. Check the output above for details.")
    
    print("\n" + "=" * 80 + "\n")
