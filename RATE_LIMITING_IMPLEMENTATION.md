# 🛡️ API Rate Limiting Implementation

## Overview

Successfully implemented rate limiting for the CRM API to prevent abuse and protect against brute force attacks. The login endpoint is now protected with a **5 requests per minute** limit per IP address.

---

## Implementation Details

### 1. Package Installation

**Package**: `django-ratelimit==4.1.0`

```bash
pip install django-ratelimit
```

### 2. Files Modified/Created

#### A. Custom Login View (`crm_app/views.py`)

Created a rate-limited login view that wraps Django Simple JWT's `TokenObtainPairView`:

```python
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.views import TokenObtainPairView
from django_ratelimit.exceptions import Ratelimited

@method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True), name='dispatch')
class RateLimitedLoginView(TokenObtainPairView):
    """
    Custom login view with rate limiting
    - Limits to 5 login attempts per minute per IP address
    - Returns 429 Too Many Requests when limit is exceeded
    - Prevents brute force attacks
    """
    permission_classes = (AllowAny,)
    
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except Ratelimited:
            return Response(
                {
                    'error': 'Too many login attempts. Please try again later.',
                    'detail': 'Rate limit exceeded. Maximum 5 attempts per minute allowed.'
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
```

**Key Features**:
- `key='ip'`: Limits based on client IP address
- `rate='5/m'`: Allows 5 requests per minute
- `method='POST'`: Only applies to POST requests
- `block=True`: Raises `Ratelimited` exception when limit is exceeded

#### B. Custom Middleware (`crm_app/middleware.py`)

Created middleware to catch `Ratelimited` exceptions globally and return proper JSON responses:

```python
from django.http import JsonResponse
from django_ratelimit.exceptions import Ratelimited


class RateLimitMiddleware:
    """
    Middleware to catch Ratelimited exceptions and return proper JSON responses
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        """
        Catch Ratelimited exceptions and return 429 Too Many Requests
        """
        if isinstance(exception, Ratelimited):
            return JsonResponse(
                {
                    'error': 'Too many requests. Please try again later.',
                    'detail': 'Rate limit exceeded. You have made too many requests in a short period.',
                    'status': 429
                },
                status=429
            )
        return None
```

#### C. Settings Configuration (`crm_project/settings.py`)

Added the rate limit middleware:

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'crm_app.middleware.RateLimitMiddleware',  # Rate limiting middleware
]

ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'testserver']
```

#### D. URL Configuration (`crm_app/urls.py`)

Updated the login endpoint to use the rate-limited view:

```python
from .views import RateLimitedLoginView

urlpatterns = [
    path('login/', RateLimitedLoginView.as_view(), name='token_obtain_pair'),
    # ... other URLs
]
```

---

## Testing

### Automated Test

Created a Django management command to test rate limiting:

```bash
python manage.py test_rate_limit
```

**Test Results**:
```
================================================================================
TESTING RATE LIMITING ON LOGIN ENDPOINT
================================================================================

Endpoint: /api/login/
Rate limit: 5 requests per minute
Making 6 rapid login attempts...

Request 1: Authentication failed (401) - Expected with test credentials
Request 2: Authentication failed (401) - Expected with test credentials
Request 3: Authentication failed (401) - Expected with test credentials
Request 4: Authentication failed (401) - Expected with test credentials
Request 5: Authentication failed (401) - Expected with test credentials
Request 6: ✓ RATE LIMITED (429) - Working correctly!
  Response: {
    'error': 'Too many requests. Please try again later.',
    'detail': 'Rate limit exceeded. You have made too many requests in a short period.',
    'status': 429
  }

================================================================================
✓ SUCCESS: Rate limiting is working correctly!
  The 6th request was blocked with a 429 status code.
================================================================================
```

### Manual Testing with curl

You can also test manually using curl or a REST client:

```bash
# Make 6 rapid requests
for i in {1..6}; do
  curl -X POST http://localhost:8000/api/login/ \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

**Expected Results**:
- Requests 1-5: Either 200 (success) or 401 (unauthorized) depending on credentials
- Request 6: **429 Too Many Requests** ✓

### Testing with Postman/Insomnia

1. Create a POST request to `http://localhost:8000/api/login/`
2. Set body to JSON:
   ```json
   {
     "username": "testuser",
     "password": "testpass"
   }
   ```
3. Send the request 6 times rapidly
4. The 6th request should return:
   ```json
   {
     "error": "Too many requests. Please try again later.",
     "detail": "Rate limit exceeded. You have made too many requests in a short period.",
     "status": 429
   }
   ```

---

## Rate Limit Configuration

### Current Settings

| Endpoint | Rate Limit | Key | Block |
|----------|------------|-----|-------|
| `/api/login/` | 5 requests/minute | IP address | Yes |

### Adjusting Rate Limits

To modify the rate limit, edit `crm_app/views.py`:

```python
# Change from 5 per minute to 10 per minute
@method_decorator(ratelimit(key='ip', rate='10/m', method='POST', block=True), name='dispatch')

# Change to 3 per hour
@method_decorator(ratelimit(key='ip', rate='3/h', method='POST', block=True), name='dispatch')

# Change to 100 per day
@method_decorator(ratelimit(key='ip', rate='100/d', method='POST', block=True), name='dispatch')
```

**Rate Format**: `<count>/<period>`
- Periods: `s` (second), `m` (minute), `h` (hour), `d` (day)
- Examples: `5/m`, `100/h`, `1000/d`, `10/s`

### Different Rate Limit Keys

```python
# By IP address (current)
@ratelimit(key='ip', rate='5/m')

# By user (for authenticated endpoints)
@ratelimit(key='user', rate='10/m')

# By username from POST data
@ratelimit(key='post:username', rate='5/m')

# By custom header
@ratelimit(key='header:x-api-key', rate='100/m')

# Multiple keys (any limit triggers)
@ratelimit(key='ip', rate='10/m')
@ratelimit(key='user', rate='50/m')
```

---

## Adding Rate Limiting to Other Endpoints

### Example: Protecting Registration Endpoint

```python
@method_decorator(ratelimit(key='ip', rate='3/h', method='POST', block=True), name='dispatch')
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
```

### Example: Protecting Customer Creation

```python
class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    
    @method_decorator(ratelimit(key='user', rate='20/m', method='POST', block=True))
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
```

### Example: Function-Based View

```python
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='10/m', method='POST', block=True)
def my_view(request):
    # Your view logic here
    pass
```

---

## Response Format

### Rate Limit Exceeded (429)

```json
{
  "error": "Too many requests. Please try again later.",
  "detail": "Rate limit exceeded. You have made too many requests in a short period.",
  "status": 429
}
```

**HTTP Status Code**: `429 Too Many Requests`

### Normal Responses

Rate limiting is transparent when limits are not exceeded. Users receive normal responses:

```json
// Success (200)
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

// Authentication failed (401)
{
  "detail": "No active account found with the given credentials"
}
```

---

## Production Considerations

### 1. Caching Backend

django-ratelimit uses Django's cache framework. For production, use Redis or Memcached:

```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

**Install Redis support**:
```bash
pip install redis django-redis
```

### 2. IP Detection Behind Proxy

If running behind a proxy/load balancer, configure IP detection:

```python
# settings.py
RATELIMIT_USE_CACHE = 'default'

# Get real IP from proxy headers
def get_real_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')
```

Then use in views:

```python
@ratelimit(key=get_real_ip, rate='5/m')
```

### 3. Monitoring

Log rate limit violations:

```python
# middleware.py
import logging

logger = logging.getLogger(__name__)

def process_exception(self, request, exception):
    if isinstance(exception, Ratelimited):
        logger.warning(
            f"Rate limit exceeded for IP {request.META.get('REMOTE_ADDR')} "
            f"on {request.path}"
        )
        return JsonResponse(...)
```

### 4. Different Limits for Different User Types

```python
def custom_rate(group, request):
    if request.user.is_staff:
        return '100/m'  # Admins get more requests
    return '5/m'  # Regular users

@ratelimit(key='user', rate=custom_rate)
def my_view(request):
    pass
```

---

## Security Benefits

### 1. Brute Force Protection
- Limits password guessing attempts
- Makes credential stuffing attacks impractical
- 5 attempts per minute = maximum 7,200 attempts per day per IP

### 2. DDoS Mitigation
- Prevents overwhelming the server with login requests
- Reduces server load from malicious actors
- Protects database from excessive queries

### 3. Resource Protection
- Prevents abuse of expensive API operations
- Ensures fair usage across all users
- Maintains service availability

---

## Troubleshooting

### Issue: Rate limiting not working

**Check**:
1. Middleware is added to `MIDDLEWARE` in settings.py
2. Cache backend is configured (Django uses in-memory cache by default)
3. `block=True` is set in the decorator

### Issue: Getting 429 too quickly

**Solution**:
- Increase the rate limit: `rate='10/m'` instead of `rate='5/m'`
- Wait for the time window to expire (1 minute for '5/m')
- Clear the cache: `python manage.py clear_cache` (if configured)

### Issue: Rate limit not resetting

**Solution**:
- Check cache backend configuration
- Restart cache service (Redis/Memcached)
- For development, restart Django server

---

## Future Enhancements

### 1. Rate Limit by User Type
```python
def get_rate_for_user(group, request):
    if request.user.is_superuser:
        return '1000/m'
    elif request.user.is_staff:
        return '100/m'
    return '10/m'
```

### 2. Exponential Backoff
Increase ban time with repeated violations:
```python
# Track violations and increase penalty
# 1st violation: 1 minute
# 2nd violation: 5 minutes
# 3rd violation: 15 minutes
```

### 3. CAPTCHA After Failed Attempts
Require CAPTCHA verification after hitting rate limit.

### 4. API Key-Based Limits
Different limits for different API keys:
```python
@ratelimit(key='header:X-API-Key', rate='1000/h')
```

---

## Testing Checklist

- [x] Rate limit triggers after 5 requests
- [x] Returns 429 status code
- [x] Returns proper JSON error response
- [x] Rate limit resets after 1 minute
- [x] Middleware catches exceptions
- [x] Works with authentication
- [x] No impact on other endpoints

---

## Files Changed

| File | Change | Purpose |
|------|--------|---------|
| `crm_app/views.py` | Added `RateLimitedLoginView` | Rate-limited login endpoint |
| `crm_app/urls.py` | Updated login URL | Use rate-limited view |
| `crm_app/middleware.py` | Created new file | Handle rate limit exceptions |
| `crm_project/settings.py` | Added middleware | Enable rate limiting |
| `crm_project/settings.py` | Updated ALLOWED_HOSTS | Allow testing |
| `crm_app/management/commands/test_rate_limit.py` | Created new file | Automated testing |

---

## Conclusion

✅ Rate limiting successfully implemented and tested
✅ Login endpoint protected from brute force attacks
✅ Proper 429 responses returned
✅ Automated testing in place
✅ Ready for production with Redis cache backend

**Next Steps**:
1. Consider adding rate limiting to registration endpoint
2. Implement Redis cache for production
3. Add monitoring and alerting for rate limit violations
4. Consider IP whitelisting for internal services
