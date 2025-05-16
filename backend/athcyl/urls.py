"""
URL configuration for athcyl project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from users.jwt_custom import EmailOrUsernameTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', EmailOrUsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/users/', include('users.urls')),
    path('api/trainings/', include('trainings.urls')),
    path('api/stats/', include('stats.urls')),
]
