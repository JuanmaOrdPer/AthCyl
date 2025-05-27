from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import exceptions
from django.contrib.auth import authenticate
from users.models import User

class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializador personalizado que permite iniciar sesión tanto con email como con nombre de usuario.
    
    Django REST Framework JWT por defecto solo permite iniciar sesión con username,
    pero queremos que los usuarios puedan usar también su email.
    """
    
    username_field = 'username_or_email'  # Campo personalizado
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Cambiar la etiqueta del campo para que sea más claro
        self.fields[self.username_field] = self.fields.pop('username')
        self.fields[self.username_field].help_text = 'Introduce tu email o nombre de usuario'
    
    def validate(self, attrs):
        """
        Valida las credenciales permitiendo tanto email como username
        """
        username_or_email = attrs.get('username_or_email')
        password = attrs.get('password')
        
        if not username_or_email or not password:
            raise exceptions.ValidationError(
                'Debes proporcionar email/usuario y contraseña'
            )
        
        # Intentar autenticar primero con el valor tal como viene
        user = authenticate(username=username_or_email, password=password)
        
        # Si no funciona y parece ser un email, buscar el usuario por email
        if not user and '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                # Intentar autenticar con el username del usuario encontrado
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if not user:
            raise exceptions.AuthenticationFailed(
                'No existe ninguna cuenta activa con las credenciales proporcionadas'
            )
        
        if not user.is_active:
            raise exceptions.AuthenticationFailed(
                'Esta cuenta está desactivada'
            )
        
        # Actualizar los attrs para que el serializador padre funcione correctamente
        attrs['username'] = user.username
        
        # Llamar al método padre para generar los tokens
        data = super().validate(attrs)
        
        # Añadir información adicional del usuario si es necesario
        data['user_id'] = user.id
        data['email'] = user.email
        data['username'] = user.username
        
        return data

class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada que usa nuestro serializador modificado
    """
    serializer_class = EmailOrUsernameTokenObtainPairSerializer