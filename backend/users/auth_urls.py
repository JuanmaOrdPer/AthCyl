"""
URLs para autenticación JWT.
Crear este archivo en: users/auth_urls.py
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomLoginView, CustomRegisterView, CustomLogoutView

urlpatterns = [
    # Endpoints que espera tu frontend
    path('login/', CustomLoginView.as_view(), name='auth_login'),
    path('register/', CustomRegisterView.as_view(), name='auth_register'),
    path('logout/', CustomLogoutView.as_view(), name='auth_logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]