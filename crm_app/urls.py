from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, CurrentUserView, CustomerViewSet, LeadViewSet, TaskViewSet, RateLimitedLoginView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'leads', LeadViewSet)
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', RateLimitedLoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/me/', CurrentUserView.as_view(), name='current_user'),
    path('', include(router.urls)),
]
