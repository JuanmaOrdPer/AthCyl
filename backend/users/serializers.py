"""
Serializadores para el modelo de Usuario.

Este módulo define los serializadores necesarios para:
- Gestión general de usuarios (creación, actualización, etc.)
- Inicio de sesión
- Registro de nuevos usuarios

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializador principal para el modelo de Usuario.
    
    Permite operaciones CRUD sobre usuarios, con manejo seguro
    de contraseñas (solo escritura, nunca lectura).
    """
    
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'first_name', 'last_name', 
                 'height', 'weight', 'birth_date', 'profile_picture', 'date_joined']
        read_only_fields = ['id', 'email', 'username', 'date_joined']
        extra_kwargs = {
            'height': {'required': False, 'allow_null': True},
            'weight': {'required': False, 'allow_null': True},
            'birth_date': {'required': False, 'allow_null': True},
        }
    
    def create(self, datos_validados):
        """
        Crea un nuevo usuario con contraseña cifrada.
        
        Args:
            datos_validados: Datos del usuario validados por el serializador
            
        Returns:
            Objeto Usuario creado
        """
        contrasena = datos_validados.pop('password', None)
        usuario = User.objects.create_user(**datos_validados)
        
        if contrasena:
            usuario.set_password(contrasena)
            usuario.save()
            
        return usuario
    
    def update(self, instancia, datos_validados):
        """
        Actualiza un usuario existente.
        
        Args:
            instancia: Usuario a actualizar
            datos_validados: Nuevos datos validados
            
        Returns:
            Usuario actualizado
        """
        # Manejar la imagen de perfil por separado
        foto_perfil = datos_validados.pop('profile_picture', None)
        if foto_perfil is not None:  # None significa mantener el valor actual
            instancia.profile_picture = foto_perfil
            
        # Actualizar los demás campos
        for atributo, valor in datos_validados.items():
            if hasattr(instancia, atributo):
                setattr(instancia, atributo, valor)
        
        # Manejar la contraseña (si se proporciona)
        contrasena = datos_validados.get('password')
        if contrasena:
            instancia.set_password(contrasena)
        
        instancia.save()
        return instancia

class LoginSerializer(serializers.Serializer):
    """
    Serializador para el inicio de sesión.
    
    Recoge email y contraseña para autenticar al usuario.
    """
    
    email = serializers.EmailField(label="Correo electrónico")
    password = serializers.CharField(
        label="Contraseña",
        style={'input_type': 'password'},
        trim_whitespace=False
    )

class RegistroSerializer(serializers.ModelSerializer):
    """
    Serializador para el registro de nuevos usuarios.
    
    Incluye validación de coincidencia de contraseñas.
    """
    
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'},
        label="Contraseña"
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'},
        label="Confirmar contraseña"
    )
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'label': 'Correo electrónico'},
            'username': {'label': 'Nombre de usuario'},
            'first_name': {'label': 'Nombre', 'required': False},
            'last_name': {'label': 'Apellidos', 'required': False},
        }
    
    def validate(self, datos):
        """
        Valida que las contraseñas coincidan.
        
        Args:
            datos: Datos a validar
            
        Returns:
            Datos validados
            
        Raises:
            ValidationError: Si las contraseñas no coinciden
        """
        if datos['password'] != datos['password_confirm']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return datos
    
    def create(self, datos_validados):
        """
        Crea un nuevo usuario a partir de los datos de registro.
        
        Args:
            datos_validados: Datos validados del formulario de registro
            
        Returns:
            Usuario creado
        """
        # Eliminar la confirmación de contraseña, ya que no es un campo del modelo
        datos_validados.pop('password_confirm')
        # Crear el usuario utilizando el método del gestor personalizado
        return User.objects.create_user(**datos_validados)