"""
Vistas para la gestión de usuarios.

Este módulo define las vistas API para:
- Registro de usuarios
- Gestión del perfil de usuario
- Información del usuario actual

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import logging

from .models import User
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    UserProfileSerializer,
    UserBasicSerializer
)

logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar usuarios.
    
    Proporciona endpoints para todas las operaciones CRUD relacionadas
    con usuarios, además de acciones personalizadas como registro y perfil.
    """
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """
        Define los permisos basados en la acción.
        
        Para el registro permite acceso público, para el resto requiere autenticación.
        """
        if self.action in ['create', 'register']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        """
        Selecciona el serializador apropiado según la acción.
        """
        if self.action == 'register':
            return UserRegistrationSerializer
        elif self.action in ['me', 'update_profile']:
            return UserProfileSerializer
        elif self.action == 'list':
            return UserBasicSerializer
        return UserSerializer
    
    def get_queryset(self):
        """
        Limita el queryset según los permisos del usuario.
        """
        if self.action == 'list':
            # Para listar usuarios, solo mostrar usuarios activos
            return User.objects.filter(is_active=True)
        return User.objects.all()
    
    def get_object(self):
        """
        Obtiene el objeto usuario para operaciones que lo requieren.
        """
        if self.action in ['me', 'update_profile']:
            return self.request.user
        return super().get_object()
    
    def create(self, request, *args, **kwargs):
        """
        Crea un nuevo usuario (registro).
        
        Este método redirige al método register para mantener consistencia.
        """
        return self.register(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """
        Registra un nuevo usuario y devuelve tokens JWT.
        """
        logger.info(f"Intento de registro con datos: {request.data}")
        
        try:
            # Validar datos de registro
            serializer = UserRegistrationSerializer(data=request.data)
            if not serializer.is_valid():
                logger.warning(f"Datos de registro inválidos: {serializer.errors}")
                return Response(
                    {
                        'error': 'Datos de registro inválidos',
                        'details': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Crear usuario
            user = serializer.save()
            logger.info(f"Usuario creado exitosamente: {user.email}")
            
            # Generar tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Serializar datos del usuario
            user_serializer = UserProfileSerializer(user)
            
            return Response(
                {
                    'message': 'Usuario registrado exitosamente',
                    'user': user_serializer.data,
                    'tokens': {
                        'access': str(access_token),
                        'refresh': str(refresh),
                    }
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error durante el registro: {str(e)}", exc_info=True)
            return Response(
                {
                    'error': 'Error interno del servidor durante el registro',
                    'message': 'Por favor, inténtalo de nuevo más tarde.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Devuelve información completa del usuario actual.
        """
        try:
            serializer = UserProfileSerializer(request.user)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error obteniendo perfil de usuario: {e}")
            return Response(
                {'error': 'Error obteniendo información del usuario'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['patch', 'put'])
    def update_profile(self, request):
        """
        Actualiza el perfil del usuario actual.
        """
        try:
            # Obtener el usuario actual
            user = request.user
            
            # Determinar si es actualización parcial o completa
            partial = request.method == 'PATCH'
            
            # Crear serializador
            serializer = UserProfileSerializer(
                user, 
                data=request.data, 
                partial=partial
            )
            
            if not serializer.is_valid():
                return Response(
                    {
                        'error': 'Datos de perfil inválidos',
                        'details': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Guardar cambios
            updated_user = serializer.save()
            logger.info(f"Perfil actualizado para usuario: {updated_user.email}")
            
            # Devolver datos actualizados
            response_serializer = UserProfileSerializer(updated_user)
            return Response(
                {
                    'message': 'Perfil actualizado exitosamente',
                    'user': response_serializer.data
                }
            )
            
        except Exception as e:
            logger.error(f"Error actualizando perfil: {e}", exc_info=True)
            return Response(
                {'error': 'Error actualizando el perfil'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """
        Cambia la contraseña del usuario actual.
        """
        try:
            user = request.user
            old_password = request.data.get('old_password')
            new_password = request.data.get('new_password')
            confirm_password = request.data.get('confirm_password')
            
            # Validaciones
            if not all([old_password, new_password, confirm_password]):
                return Response(
                    {'error': 'Todos los campos son requeridos'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not user.check_password(old_password):
                return Response(
                    {'error': 'La contraseña actual es incorrecta'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if new_password != confirm_password:
                return Response(
                    {'error': 'Las contraseñas nuevas no coinciden'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar nueva contraseña
            from django.contrib.auth.password_validation import validate_password
            try:
                validate_password(new_password, user)
            except Exception as e:
                return Response(
                    {'error': f'La nueva contraseña no es válida: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Cambiar contraseña
            user.set_password(new_password)
            user.save()
            
            logger.info(f"Contraseña cambiada para usuario: {user.email}")
            
            return Response(
                {'message': 'Contraseña cambiada exitosamente'}
            )
            
        except Exception as e:
            logger.error(f"Error cambiando contraseña: {e}")
            return Response(
                {'error': 'Error cambiando la contraseña'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['delete'])
    def delete_account(self, request):
        """
        Desactiva la cuenta del usuario actual.
        
        No elimina físicamente la cuenta, solo la desactiva por seguridad.
        """
        try:
            user = request.user
            password = request.data.get('password')
            
            if not password:
                return Response(
                    {'error': 'Se requiere la contraseña para eliminar la cuenta'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not user.check_password(password):
                return Response(
                    {'error': 'Contraseña incorrecta'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Desactivar cuenta en lugar de eliminarla
            user.is_active = False
            user.save()
            
            logger.warning(f"Cuenta desactivada para usuario: {user.email}")
            
            return Response(
                {'message': 'Cuenta desactivada exitosamente'}
            )
            
        except Exception as e:
            logger.error(f"Error desactivando cuenta: {e}")
            return Response(
                {'error': 'Error desactivando la cuenta'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        """
        Actualiza un usuario específico (solo administradores).
        """
        # Solo permitir a administradores actualizar otros usuarios
        if not request.user.is_staff:
            return Response(
                {'error': 'No tienes permisos para realizar esta acción'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Elimina un usuario específico (solo administradores).
        """
        # Solo permitir a administradores eliminar usuarios
        if not request.user.is_staff:
            return Response(
                {'error': 'No tienes permisos para realizar esta acción'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)