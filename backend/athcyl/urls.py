"""
Configuración de URLs para el proyecto AthCyl.

Este módulo define las rutas (URLs) principales de la aplicación,
mapeando las URL a las vistas que las gestionan.

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from users.jwt_custom import EmailTokenObtainPairView

urlpatterns = [
    # Administración de Django
    path('admin/', admin.site.urls),
    
    # Autenticación con JWT
    path('api/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Aplicaciones
    path('api/usuarios/', include('users.urls')),
    path('api/entrenamientos/', include('trainings.urls')),
    path('api/estadisticas/', include('stats.urls')),
]

# Servir archivos de medios en modo desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)