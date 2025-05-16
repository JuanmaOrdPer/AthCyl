from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        print(f"\n=== Inicio de Validación ===")
        print(f"Credenciales recibidas: {attrs}")
        
        try:
            # Primero intentamos usar el serializer base
            data = super().validate(attrs)
            print("✅ Validación base exitosa")
            
            # Obtener el usuario
            user = self.user
            if not user:
                print("🔍 Buscando usuario por email/username...")
                try:
                    user = User.objects.get(
                        models.Q(email=attrs.get('email')) | 
                        models.Q(username=attrs.get('email'))
                    )
                    print(f"✅ Usuario encontrado: {user.username}")
                except User.DoesNotExist:
                    print("❌ Usuario no encontrado")
                    raise exceptions.AuthenticationFailed('No active account found with the given credentials')
            
            # Verificar contraseña
            print("🔍 Verificando contraseña...")
            if not user.check_password(attrs.get('password')):
                print("❌ Contraseña incorrecta")
                raise exceptions.AuthenticationFailed('No active account found with the given credentials')
            
            print("✅ Contraseña correcta")
            
            # Actualizar data con información del usuario
            data['user_id'] = user.id
            data['email'] = user.email
            data['username'] = user.username
            
            print(f"=== Fin de Validación ===\n")
            return data
            
        except Exception as e:
            print(f"❌ Error en validación: {str(e)}")
            raise

class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer
