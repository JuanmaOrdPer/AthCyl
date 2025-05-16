from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404

from .models import User
from .serializers import UserSerializer, UserLoginSerializer, UserRegisterSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'login', 'register']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'login':
            return UserLoginSerializer
        elif self.action == 'register':
            return UserRegisterSerializer
        return UserSerializer
        
    def get_object(self):
        if self.action == 'me' or self.request.method in ['PATCH', 'PUT']:
            return self.request.user
        return super().get_object()
        
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return SuccessResponse(data=serializer.data)
        
    def update(self, request, *args, **kwargs):
        # Solo permitir actualizar el propio perfil
        if int(kwargs.get('pk')) != request.user.id:
            return ErrorResponse(
                message='No tienes permiso para actualizar este perfil',
                status_code=status.HTTP_403_FORBIDDEN
            )
            
        response = super().update(request, *args, **kwargs)
        return Response(response.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Datos de inicio de sesión inválidos', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        email = serializer.validated_data.get('email')
        password = serializer.validated_data.get('password')
        
        user = authenticate(request, email=email, password=password)
        
        if user is None:
            return Response(
                {'error': 'Credenciales inválidas'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Inicio de sesión exitoso'
        })
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Datos de registro inválidos', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user = serializer.save()
        
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response(
                {
                    'user': UserSerializer(user).data,
                    'token': token.key,
                    'message': 'Usuario registrado exitosamente'
                },
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            {'error': 'No se pudo crear el usuario'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({'message': 'Sesión cerrada exitosamente'})
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
