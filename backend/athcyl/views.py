from django.conf import settings
import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from core.common.response import SuccessResponse

class APIRootView(APIView):
    """
    Vista raíz de la API de AthCyl.
    Proporciona información sobre los endpoints disponibles y la documentación.
    """
    permission_classes = [AllowAny]
    
    def get(self, request, format=None):
        """
        Devuelve información sobre la API y sus endpoints.
        """
        api_info = {
            "name": "AthCyl API",
            "version": "1.0.0",
            "description": "API para la aplicación AthCyl de gestión y análisis de entrenamientos deportivos",
            "server_time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "environment": "Development" if settings.DEBUG else "Production",
            "endpoints": [
                {
                    "name": "Usuarios",
                    "url": "/api/users/",
                    "description": "Gestión de usuarios, autenticación y perfiles",
                    "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
                    "authentication_required": True,
                    "endpoints": [
                        {"path": "/api/users/register/", "method": "POST", "description": "Registrar un nuevo usuario"},
                        {"path": "/api/users/login/", "method": "POST", "description": "Iniciar sesión y obtener token JWT"},
                        {"path": "/api/users/me/", "method": "GET", "description": "Obtener información del usuario actual"},
                        {"path": "/api/users/me/", "method": "PUT", "description": "Actualizar información del usuario actual"},
                        {"path": "/api/users/me/", "method": "PATCH", "description": "Actualizar parcialmente el usuario actual"},
                        {"path": "/api/users/logout/", "method": "POST", "description": "Cerrar sesión"}
                    ]
                },
                {
                    "name": "Entrenamientos",
                    "url": "/api/trainings/",
                    "description": "Gestión de sesiones de entrenamiento",
                    "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
                    "authentication_required": True,
                    "endpoints": []
                },
                {
                    "name": "Estadísticas",
                    "url": "/api/stats/",
                    "description": "Estadísticas y análisis de entrenamientos",
                    "methods": ["GET"],
                    "authentication_required": True,
                    "endpoints": []
                }
            ],
            "documentation": {
                "swagger": "Visita /swagger/ para la documentación interactiva",
                "redoc": "Visita /redoc/ para la documentación alternativa"
            },
            "authentication": {
                "type": "JWT",
                "header": "Authorization: Bearer <token>",
                "token_url": "/api/users/login/"
            }
        }
        
        return SuccessResponse(
            data=api_info,
            message="Bienvenido a la API de AthCyl"
        )

# Alias para mantener la compatibilidad con el código existente
api_home = APIRootView.as_view()
