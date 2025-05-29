"""
URLs para la gestión de usuarios.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    # URLs del router (incluye todas las acciones del ViewSet)
    path('', include(router.urls)),
    
    # Alias específicos para que funcione con tu frontend
    path('me/', UserViewSet.as_view({'get': 'me'}), name='user-profile'),
    path('update_profile/', UserViewSet.as_view({
        'post': 'update_profile', 
        'patch': 'update_profile',
        'put': 'update_profile'
    }), name='user-update-profile'),
    path('change_password/', UserViewSet.as_view({'post': 'change_password'}), name='user-change-password'),
    path('delete_account/', UserViewSet.as_view({'delete': 'delete_account'}), name='user-delete-account'),
]