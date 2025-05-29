"""
Configuración de URLs principales para el proyecto AthCyl.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Panel de administración de Django
    path('admin/', admin.site.urls),
    
    # URLs de autenticación JWT
    path('api/auth/', include('users.auth_urls')),
    
    # URLs de gestión de usuarios
    path('api/usuarios/', include('users.urls')),
    
    #URLs de otras aplicaciones
    path('api/entrenamientos/', include('trainings.urls')),
    path('api/estadisticas/', include('stats.urls')),
]

# Servir archivos estáticos y media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Handler personalizado para errores 404 y 500 (opcional)
handler404 = 'django.views.defaults.page_not_found'
handler500 = 'django.views.defaults.server_error'