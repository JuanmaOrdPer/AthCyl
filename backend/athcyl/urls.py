"""
URL configuration for athcyl project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import api_home

urlpatterns = [
    path('', api_home, name='api_home'),  # Ruta raíz para la página de inicio
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/trainings/', include('trainings.urls')),
    path('api/stats/', include('stats.urls')),
]

# Servir archivos estáticos y de medios durante el desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
