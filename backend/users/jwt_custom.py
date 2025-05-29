from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import exceptions
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializador personalizado que permite iniciar sesión con email o username.
    """
    def validate(self, attrs):
        credentials = {
            'username': '',
            'password': attrs.get("password")
        }

        # El usuario puede iniciar sesión con email o username
        user_obj = User.objects.filter(email=attrs.get("username")).first() or User.objects.filter(username=attrs.get("username")).first()
        
        if user_obj:
            credentials['username'] = user_obj.username

        user = authenticate(**credentials)

        if not user:
            raise exceptions.AuthenticationFailed('Credenciales inválidas. Por favor, inténtalo de nuevo.')

        if not user.is_active:
            raise exceptions.AuthenticationFailed('Esta cuenta está desactivada')

        data = super().validate(attrs)
        refresh = self.get_token(user)
        
        data.update({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        })
        
        return data

class EmailTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada que usa el serializador de autenticación por email
    """
    serializer_class = EmailTokenObtainPairSerializer