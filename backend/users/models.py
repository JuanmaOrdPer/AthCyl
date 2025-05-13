from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import bcrypt

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El Email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        
        # Cifrar la contraseña con bcrypt
        if password:
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
            user.password = hashed.decode('utf-8')
            
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Resolver conflicto de accesorios inversos
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
    
    # Campos adicionales para información del usuario
    height = models.FloatField(null=True, blank=True, help_text="Altura en cm")
    weight = models.FloatField(null=True, blank=True, help_text="Peso en kg")
    birth_date = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
    
    def check_password(self, raw_password):
        """
        Verifica si la contraseña sin cifrar coincide con la contraseña cifrada.
        """
        if not self.password:
            return False
        return bcrypt.checkpw(raw_password.encode('utf-8'), self.password.encode('utf-8'))
    
    def set_password(self, raw_password):
        """
        Establece la contraseña del usuario, cifrándola con bcrypt.
        """
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(raw_password.encode('utf-8'), salt)
        self.password = hashed.decode('utf-8')
        self._password = raw_password
