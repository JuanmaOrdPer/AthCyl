from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import exceptions
from django.db import models
from users.models import User

class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Este serializador personalizado permite iniciar sesión tanto con email como con nombre de usuario.
    Lo necesitamos porque el serializador original solo permite iniciar sesión con username.
    """
    def validate(self, datos):
        try:
            # Primero intentamos la validación normal (por si el usuario usa username directamente)
            return super().validate(datos)
        except:
            # Si falla, probamos buscando el usuario por email
            try:
                # Buscamos un usuario con ese email
                usuario = User.objects.get(email=datos.get('username'))
                
                # Cambiamos el username en los datos por el username real del usuario
                # para que el validador original funcione
                datos['username'] = usuario.username
                
                # Ahora intentamos validar otra vez
                return super().validate(datos)
            except User.DoesNotExist:
                # Si no encontramos al usuario, lanzamos error de autenticación
                raise exceptions.AuthenticationFailed(
                    'No existe ninguna cuenta activa con las credenciales proporcionadas'
                )
            except Exception as e:
                # Para cualquier otro error, mostramos un mensaje genérico
                # (por seguridad, no especificamos detalles del error)
                raise exceptions.AuthenticationFailed(
                    'Error al iniciar sesión. Comprueba tus credenciales.'
                )

class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    """Vista personalizada que usa nuestro serializador modificado"""
    serializer_class = EmailOrUsernameTokenObtainPairSerializer