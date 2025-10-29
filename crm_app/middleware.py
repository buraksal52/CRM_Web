"""
Custom middleware for handling rate limiting
"""
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
