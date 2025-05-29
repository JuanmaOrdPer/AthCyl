"""
Vistas para la gestión de usuarios - VERSIÓN CORREGIDA.

Este módulo define las vistas API para:
- Registro de usuarios
- Gestión del perfil de usuario
- Información del usuario actual
- Autenticación JWT personalizada

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
import logging

from .models import User
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    UserProfileSerializer,
    UserBasicSerializer
)

logger = logging.getLogger(__name__)

# ===== VISTAS DE AUTENTICACIÓN PERSONALIZADAS CORREGIDAS =====

class CustomLoginView(APIView):
    """
    Vista de login personalizada que acepta username o email
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        username_or_email = request.data.get('username')  # El frontend envía 'username'
        password = request.data.get('password')
        
        if not username_or_email or not password:
            return Response({
                'error': 'Usuario y contraseña son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Intentar autenticación con username primero
        user = authenticate(username=username_or_email, password=password)
        
        # Si no funciona, intentar con email
        if not user:
            try:
                User = get_user_model()
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if user and user.is_active:
            # Generar tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Serializar datos del usuario
            user_serializer = UserProfileSerializer(user)
            
            # Formato que espera el frontend
            return Response({
                'token': str(access_token),  # Access token
                'refresh': str(refresh),     # Refresh token  
                'user': user_serializer.data,
                'message': 'Login exitoso'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Credenciales inválidas'
            }, status=status.HTTP_401_UNAUTHORIZED)


class CustomRegisterView(APIView):
    """
    Vista de registro personalizada
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            logger.info(f"Datos de registro recibidos: {request.data}")
            
            # Validar datos de registro
            serializer = UserRegistrationSerializer(data=request.data)
            
            if not serializer.is_valid():
                logger.warning(f"Errores de validación: {serializer.errors}")
                return Response({
                    'error': 'Datos de registro inválidos',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear usuario
            user = serializer.save()
            logger.info(f"Usuario creado exitosamente: {user.email}")
            
            # Generar tokens JWT automáticamente
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Serializar datos del usuario
            user_serializer = UserProfileSerializer(user)
            
            # Formato que espera el frontend
            return Response({
                'token': str(access_token),  # El frontend espera 'token'
                'refresh': str(refresh),
                'user': user_serializer.data,
                'message': 'Registro exitoso',
                'autoLogin': True
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error durante el registro: {str(e)}", exc_info=True)
            return Response({
                'error': 'Error interno del servidor durante el registro',
                'details': str(e)  # Para debugging
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CustomLogoutView(APIView):
    """
    Vista de logout personalizada
    """
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            
            if refresh_token:
                # Invalidar el refresh token
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'message': 'Logout exitoso'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Aunque falle, devolvemos éxito porque el logout del frontend funciona
            logger.warning(f"Error en logout: {e}")
            return Response({
                'message': 'Logout exitoso'
            }, status=status.HTTP_200_OK)


# ===== VIEWSET PRINCIPAL DE USUARIOS =====

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
            return User.objects.filter(is_active=True)
        return User.objects.all()
    
    def get_object(self):
        """
        Obtiene el objeto usuario para operaciones que lo requieren.
        """
        if self.action in ['me', 'update_profile']:
            return self.request.user
        return super().get_object()
    
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
    
    @action(detail=False, methods=['patch', 'put', 'post'])
    def update_profile(self, request):
        """
        Actualiza el perfil del usuario actual.
        """
        try:
            # Obtener el usuario actual
            user = request.user
            
            # Determinar si es actualización parcial o completa
            partial = request.method in ['PATCH', 'POST']
            
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
        if not request.user.is_staff:
            return Response(
                {'error': 'No tienes permisos para realizar esta acción'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)