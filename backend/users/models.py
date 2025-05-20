"""
Módulo para gestionar los modelos de usuarios de la aplicación.

Este módulo define el modelo personalizado de Usuario que utilizamos en la aplicación,
con campos adicionales específicos para nuestra app deportiva como altura y peso.

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
Proyecto: AthCyl - Gestión de entrenamientos deportivos
"""

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import bcrypt

class GestorUsuarios(BaseUserManager):
    """
    Gestor personalizado para nuestro modelo de Usuario.
    
    Este gestor se encarga de crear usuarios normales y superusuarios,
    proporcionando métodos seguros para el manejo de contraseñas con bcrypt.
    """
    
    def create_user(self, email, password=None, **campos_extra):
        """
        Crea y guarda un usuario con el email y contraseña proporcionados.
        
        Args:
            email: Email del usuario (obligatorio)
            password: Contraseña del usuario (opcional)
            campos_extra: Campos adicionales para el usuario
            
        Returns:
            Objeto Usuario creado
            
        Raises:
            ValueError: Si no se proporciona un email
        """
        if not email:
            raise ValueError('El Email es obligatorio para crear un usuario')
            
        email = self.normalize_email(email)
        usuario = self.model(email=email, **campos_extra)
        
        # Cifrar la contraseña con bcrypt si se proporciona
        if password:
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
            usuario.password = hashed.decode('utf-8')
            
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, email, password=None, **campos_extra):
        """
        Crea y guarda un superusuario con privilegios administrativos.
        
        Args:
            email: Email del superusuario
            password: Contraseña del superusuario
            campos_extra: Campos adicionales
            
        Returns:
            Objeto Usuario (superusuario) creado
            
        Raises:
            ValueError: Si no se establecen los permisos correctamente
        """
        # Establecer los permisos administrativos
        campos_extra.setdefault('is_staff', True)
        campos_extra.setdefault('is_superuser', True)
        campos_extra.setdefault('is_active', True)

        # Validar que los permisos están correctamente establecidos
        if campos_extra.get('is_staff') is not True:
            raise ValueError('Un superusuario debe tener is_staff=True')
        if campos_extra.get('is_superuser') is not True:
            raise ValueError('Un superusuario debe tener is_superuser=True')
        
        # Crear el superusuario llamando al método create_user
        return self.create_user(email, password, **campos_extra)

class User(AbstractUser):
    """
    Modelo personalizado de Usuario para la aplicación AthCyl.
    
    Extiende el modelo de usuario estándar de Django añadiendo campos
    específicos para nuestra aplicación deportiva, como altura y peso.
    """
    
    # Campos básicos (sobreescritos del modelo AbstractUser)
    email = models.EmailField(unique=True, verbose_name="Correo electrónico")
    username = models.CharField(max_length=150, unique=True, verbose_name="Nombre de usuario")
    first_name = models.CharField(max_length=30, blank=True, verbose_name="Nombre")
    last_name = models.CharField(max_length=150, blank=True, verbose_name="Apellidos")
    date_joined = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de registro")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    is_staff = models.BooleanField(default=False, verbose_name="Administrador")
    
    # Resolver conflicto de accesorios inversos para relaciones many-to-many
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='Los grupos a los que pertenece este usuario.',
        verbose_name='groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Permisos específicos para este usuario.',
        verbose_name='user permissions'
    )
    
    # Campos adicionales para información del usuario (específicos de nuestra app)
    height = models.FloatField(null=True, blank=True, help_text="Altura en cm", verbose_name="Altura")
    weight = models.FloatField(null=True, blank=True, help_text="Peso en kg", verbose_name="Peso")
    birth_date = models.DateField(null=True, blank=True, verbose_name="Fecha de nacimiento")
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True, verbose_name="Foto de perfil")
    
    # Establecer el gestor personalizado
    objects = GestorUsuarios()
    
    # Configuración de autenticación
    USERNAME_FIELD = 'email'  # Usar email como campo principal de inicio de sesión
    REQUIRED_FIELDS = ['username']  # Campos adicionales requeridos al crear superusuario
    
    def __str__(self):
        """Devuelve una representación legible del usuario"""
        return f"{self.email} ({self.username})"
    
    def check_password(self, contrasena_plana):
        """
        Verifica si la contraseña sin cifrar coincide con la contraseña cifrada del usuario.
        
        Args:
            contrasena_plana: Contraseña sin cifrar para verificar
            
        Returns:
            Boolean: True si la contraseña coincide, False en caso contrario
        """
        if not self.password:
            return False
        return bcrypt.checkpw(contrasena_plana.encode('utf-8'), self.password.encode('utf-8'))
    
    def set_password(self, contrasena_plana):
        """
        Establece la contraseña del usuario, cifrándola con bcrypt.
        
        Args:
            contrasena_plana: Nueva contraseña sin cifrar
        """
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(contrasena_plana.encode('utf-8'), salt)
        self.password = hashed.decode('utf-8')
        self._password = contrasena_plana  # Guardar temporalmente para Django
        
    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"