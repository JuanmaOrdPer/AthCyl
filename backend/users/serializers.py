"""
Serializadores para el modelo de Usuario.

Este módulo define los serializadores necesarios para:
- Gestión general de usuarios (creación, actualización, etc.)
- Registro de nuevos usuarios
- Perfil de usuario

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializador principal para el modelo de Usuario.
    
    Permite operaciones CRUD sobre usuarios, con manejo seguro
    de contraseñas (solo escritura, nunca lectura).
    """
    
    password = serializers.CharField(
        write_only=True, 
        required=False, 
        style={'input_type': 'password'},
        help_text="Dejar vacío para mantener la contraseña actual"
    )
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'password', 'first_name', 'last_name', 
            'height', 'weight', 'birth_date', 'profile_picture', 'date_joined',
            'is_active'
        ]
        read_only_fields = ['id', 'date_joined']
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True},
            'height': {'required': False, 'allow_null': True},
            'weight': {'required': False, 'allow_null': True},
            'birth_date': {'required': False, 'allow_null': True},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
        }
    
    def validate_password(self, value):
        """
        Valida la contraseña usando los validadores de Django
        """
        if value:
            validate_password(value)
        return value
    
    def create(self, validated_data):
        """
        Crea un nuevo usuario con contraseña cifrada usando el sistema de Django.
        """
        password = validated_data.pop('password', None)
        
        # Crear usuario usando el manager de Django
        user = User.objects.create_user(**validated_data)
        
        # Establecer contraseña si se proporcionó
        if password:
            user.set_password(password)
            user.save()
            
        return user
    
    def update(self, instance, validated_data):
        """
        Actualiza un usuario existente.
        
        Args:
            instance: Usuario a actualizar
            validated_data: Nuevos datos validados
            
        Returns:
            Usuario actualizado
        """
        password = validated_data.pop('password', None)
        
        # Actualizar campos normales
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Manejar la contraseña por separado
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializador para el registro de nuevos usuarios.
    
    Incluye validación de coincidencia de contraseñas y validaciones adicionales.
    """
    
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'},
        help_text="Mínimo 8 caracteres"
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'},
        help_text="Debe coincidir con la contraseña"
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm', 
            'first_name', 'last_name'
        ]
        extra_kwargs = {
            'email': {
                'required': True,
                'help_text': 'Dirección de correo electrónico válida'
            },
            'username': {
                'required': True,
                'help_text': 'Nombre de usuario único'
            },
            'first_name': {
                'required': False, 
                'allow_blank': True,
                'help_text': 'Nombre (opcional)'
            },
            'last_name': {
                'required': False, 
                'allow_blank': True,
                'help_text': 'Apellidos (opcional)'
            },
        }
    
    def validate_email(self, value):
        """
        Valida que el email no esté ya en uso
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Ya existe un usuario con este correo electrónico."
            )
        return value
    
    def validate_username(self, value):
        """
        Valida que el username no esté ya en uso
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Ya existe un usuario con este nombre de usuario."
            )
        return value
    
    def validate_password(self, value):
        """
        Valida la contraseña usando los validadores de Django
        """
        validate_password(value)
        return value
    
    def validate(self, attrs):
        """
        Valida que las contraseñas coincidan
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Las contraseñas no coinciden."
            })
        return attrs
    
    def create(self, validated_data):
        """
        Crea un nuevo usuario a partir de los datos de registro
        """
        # Eliminar la confirmación de contraseña
        validated_data.pop('password_confirm')
        
        # Crear el usuario usando el manager de Django
        user = User.objects.create_user(**validated_data)
        
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializador para el perfil completo del usuario.
    
    Incluye todos los campos del usuario incluyendo los específicos
    de la aplicación deportiva como altura y peso.
    """
    
    password = serializers.CharField(
        write_only=True, 
        required=False, 
        style={'input_type': 'password'},
        help_text="Nueva contraseña (opcional)"
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'password', 'first_name', 'last_name', 
            'height', 'weight', 'birth_date', 'profile_picture', 'date_joined',
            'is_active'
        ]
        read_only_fields = ['id', 'email', 'username', 'date_joined']
        extra_kwargs = {
            'height': {
                'help_text': 'Altura en centímetros',
                'min_value': 100,
                'max_value': 250
            },
            'weight': {
                'help_text': 'Peso en kilogramos',
                'min_value': 30,
                'max_value': 200
            },
            'birth_date': {
                'help_text': 'Fecha de nacimiento (YYYY-MM-DD)'
            },
        }
    
    def validate_height(self, value):
        """Valida que la altura esté en un rango razonable"""
        if value is not None and (value < 100 or value > 250):
            raise serializers.ValidationError(
                "La altura debe estar entre 100 y 250 centímetros."
            )
        return value
    
    def validate_weight(self, value):
        """Valida que el peso esté en un rango razonable"""
        if value is not None and (value < 30 or value > 200):
            raise serializers.ValidationError(
                "El peso debe estar entre 30 y 200 kilogramos."
            )
        return value
    
    def validate_password(self, value):
        """Valida la nueva contraseña si se proporciona"""
        if value:
            validate_password(value)
        return value
    
    def update(self, instance, validated_data):
        """
        Actualiza el perfil del usuario
        """
        password = validated_data.pop('password', None)
        
        # Actualizar campos normales
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Actualizar contraseña si se proporcionó
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance

class UserBasicSerializer(serializers.ModelSerializer):
    """
    Serializador básico para mostrar información pública del usuario.
    
    Usado para mostrar información de usuarios en listas o referencias
    sin exponer datos sensibles.
    """
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_picture']
        read_only_fields = fields