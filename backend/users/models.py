"""
Módulo para gestionar los modelos de usuarios de la aplicación.

Este módulo define el modelo personalizado de Usuario que utilizamos en la aplicación,
con campos adicionales específicos para nuestra app deportiva como altura y peso.

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
Proyecto: AthCyl - Gestión de entrenamientos deportivos
"""

from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Modelo personalizado de Usuario para la aplicación AthCyl.
    
    Extiende el modelo de usuario estándar de Django añadiendo campos
    específicos para nuestra aplicación deportiva, como altura y peso.
    """
    password = models.CharField(
        max_length=128, verbose_name="Contraseña", db_column="contraseña"
    )
    last_login = models.DateTimeField(
        blank=True, null=True, verbose_name="Último acceso", db_column="último_acceso"
    )
    is_superuser = models.BooleanField(
        default=False, verbose_name="Superusuario", db_column="superusuario"
    )
    
    # Campos básicos (sobreescritos del modelo AbstractUser)
    email = models.EmailField(unique=True, verbose_name="Correo electrónico", db_column="correo_electrónico")
    username = models.CharField(max_length=150, unique=True, verbose_name="Nombre de usuario", db_column="nombre_de_usuario")
    first_name = models.CharField(max_length=30, blank=True, verbose_name="Nombre", db_column="nombre")
    last_name = models.CharField(max_length=150, blank=True, verbose_name="Apellidos", db_column="apellidos")
    date_joined = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de registro", db_column="fecha_de_registro")
    is_active = models.BooleanField(default=True, verbose_name="Activo", db_column="activo")
    is_staff = models.BooleanField(default=False, verbose_name="Administrador", db_column="administrador")
    
    # Campos adicionales para información del usuario (específicos de nuestra app)
    height = models.FloatField(null=True, blank=True, help_text="Altura en cm", verbose_name="Altura", db_column="altura")
    weight = models.FloatField(null=True, blank=True, help_text="Peso en kg", verbose_name="Peso", db_column="peso")
    birth_date = models.DateField(null=True, blank=True, verbose_name="Fecha de nacimiento", db_column="fecha_de_nacimiento")
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True, verbose_name="Foto de perfil", db_column="foto_de_perfil")
    
    # Configuración de autenticación
    USERNAME_FIELD = 'email'  # Usar email como campo principal de inicio de sesión
    REQUIRED_FIELDS = ['username']  # Campos adicionales requeridos al crear superusuario
    
    def __str__(self):
        """Devuelve una representación legible del usuario"""
        return f"{self.email} ({self.username})"
    
    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        db_table = "usuarios"  # Nombre de tabla en español