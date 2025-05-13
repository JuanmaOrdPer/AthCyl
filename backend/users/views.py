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
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'login', 'register']:
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'login':
            return UserLoginSerializer
        elif self.action == 'register':
            return UserRegisterSerializer
        return UserSerializer
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = get_object_or_404(User, email=email)
        
        if user.check_password(password):
            login(request, user)
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Inicio de sesión exitoso'
            })
        else:
            return Response({
                'error': 'Credenciales incorrectas'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Usuario registrado exitosamente'
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({'message': 'Sesión cerrada exitosamente'})
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
