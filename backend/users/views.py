"""
Vistas para la gestión de usuarios.

Este módulo define las vistas API para:
- Registro de usuarios
- Inicio y cierre de sesión
- Gestión del perfil de usuario

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404

from .models import User
from .serializers import UserSerializer, LoginSerializer, RegistroSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar usuarios.
    
    Proporciona endpoints para todas las operaciones CRUD relacionadas
    con usuarios, además de acciones personalizadas como login y registro.
    """
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """
        Define los permisos basados en la acción.
        
        Para acciones públicas como crear, login o registro, permite acceso
        a cualquier usuario (incluso no autenticados). Para el resto de acciones,
        requiere autenticación.
        """
        if self.action in ['create', 'login', 'register']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        """
        Selecciona el serializador apropiado según la acción.
        
        Diferentes acciones pueden requerir diferentes serializadores.
        """
        if self.action == 'login':
            return LoginSerializer
        elif self.action == 'register':
            return RegistroSerializer
        return UserSerializer
        
    def get_object(self):
        """
        Obtiene el objeto usuario para operaciones que lo requieren.
        
        Para la acción 'me' o para actualizaciones, devuelve el usuario actual.
        Para otras acciones, comportamiento normal.
        """
        if self.action == 'me' or self.request.method in ['PATCH', 'PUT']:
            return self.request.user
        return super().get_object()
        
    def retrieve(self, request, *args, **kwargs):
        """
        Recupera un usuario específico.
        
        La implementación estándar de recuperación de un usuario.
        """
        instancia = self.get_object()
        serializer = self.get_serializer(instancia)
        return Response(serializer.data)
        
    def update(self, request, *args, **kwargs):
        """
        Actualiza un usuario.
        
        Solo permite actualizar el propio perfil del usuario, no otros perfiles.
        """
        # Solo permitir actualizar el propio perfil
        if int(kwargs.get('pk')) != request.user.id:
            return Response(
                {'error': 'No tienes permiso para actualizar este perfil'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        respuesta = super().update(request, *args, **kwargs)
        return Response(respuesta.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """
        Acción personalizada para iniciar sesión.
        
        Valida las credenciales y devuelve un token de autenticación si son correctas.
        """
        # Validar los datos de entrada
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Datos de inicio de sesión inválidos', 'detalles': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Extraer credenciales
        email = serializer.validated_data.get('email')
        contrasena = serializer.validated_data.get('password')
        
        # Autenticar usuario
        usuario = authenticate(request, email=email, password=contrasena)
        
        # Verificar si la autenticación fue exitosa
        if usuario is None:
            return Response(
                {'error': 'Las credenciales proporcionadas no son válidas'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        # Iniciar sesión en Django
        login(request, usuario)
        
        # Obtener o crear token de autenticación
        token, _ = Token.objects.get_or_create(user=usuario)
        
        # Devolver información del usuario y token
        return Response({
            'usuario': UserSerializer(usuario).data,
            'token': token.key,
            'mensaje': 'Has iniciado sesión correctamente'
        })
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """
        Acción personalizada para registrar un nuevo usuario.
        
        Valida los datos de registro y crea un nuevo usuario si son correctos.
        """
        # Validar datos de registro
        serializer = RegistroSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Datos de registro inválidos', 'detalles': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Crear usuario
        usuario = serializer.save()
        
        # Verificar si se creó correctamente
        if usuario:
            # Generar token para inicio de sesión automático
            token, created = Token.objects.get_or_create(user=usuario)
            return Response(
                {
                    'usuario': UserSerializer(usuario).data,
                    'token': token.key,
                    'mensaje': 'Usuario registrado correctamente'
                },
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            {'error': 'No se pudo crear el usuario'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """
        Cierra la sesión del usuario actual.
        
        Elimina la sesión de Django y opcionalmente el token de autenticación.
        """
        try:
            # Eliminar token de autenticación (opcional)
            Token.objects.filter(user=request.user).delete()
            
            # Cerrar sesión en Django
            logout(request)
            
            return Response({'mensaje': 'Sesión cerrada correctamente'})
        except Exception as e:
            print(f"Error al cerrar sesión: {e}")
            return Response(
                {'error': 'Hubo un problema al cerrar la sesión'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Devuelve información del usuario actual.
        
        Útil para obtener los datos del perfil del usuario autenticado.
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)