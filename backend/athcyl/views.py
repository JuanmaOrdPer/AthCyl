from django.http import JsonResponse
from django.conf import settings
import datetime

def api_home(request):
    """
    Vista para la página de inicio de la API de AthCyl.
    Muestra información sobre los endpoints disponibles.
    """
    api_info = {
        "name": "AthCyl API",
        "version": "1.0",
        "description": "API para la aplicación AthCyl de gestión y análisis de entrenamientos deportivos",
        "server_time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "endpoints": {
            "users": {
                "url": "/api/users/",
                "description": "Gestión de usuarios, autenticación y perfiles"
            },
            "trainings": {
                "url": "/api/trainings/",
                "description": "Gestión de sesiones de entrenamiento, incluyendo carga de archivos GPX/TCX"
            },
            "stats": {
                "url": "/api/stats/",
                "description": "Estadísticas y análisis de entrenamientos"
            }
        },
        "documentation": "Para más información, consulta la documentación completa de la API",
        "environment": "Development" if settings.DEBUG else "Production",
        "https_enabled": True
    }
    
    return JsonResponse(api_info)
