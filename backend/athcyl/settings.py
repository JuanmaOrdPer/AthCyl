"""
Configuración de Django para el proyecto AthCyl.

Este archivo contiene la configuración general de la aplicación:
- Base de datos
- Aplicaciones instaladas
- Middleware
- Seguridad
- Internacionalización
- Archivos estáticos
- Otras configuraciones globales

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

import os
from dotenv import load_dotenv
from datetime import timedelta
from pathlib import Path

# Cargar variables de entorno desde .env
load_dotenv()

# Ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# ADVERTENCIA: Mantenga la clave secreta usada en producción en secreto
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-your-secret-key-here')

# ADVERTENCIA: No ejecutar con debug activado en producción
DEBUG = os.getenv('DEBUG', 'True') == 'True'

# Hosts permitidos
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '192.168.0.7']

# Aplicaciones
INSTALLED_APPS = [
    # Aplicaciones de Django
    'django.contrib.admin',          # Sitio de administración
    'django.contrib.auth',           # Sistema de autenticación
    'django.contrib.contenttypes',   # Framework de tipos de contenido
    'django.contrib.sessions',       # Framework de sesiones
    'django.contrib.messages',       # Framework de mensajes
    'django.contrib.staticfiles',    # Gestión de archivos estáticos
    
    # Aplicaciones de terceros
    'rest_framework',                # Framework REST API
    'rest_framework.authtoken',      # Autenticación por token
    'django_extensions',             # Utilidades extra para desarrollo
    'corsheaders',                   # Soporte para CORS
    'sslserver',                     # Servidor de desarrollo con SSL
    
    # Aplicaciones propias
    'users',                         # Gestión de usuarios
    'trainings',                     # Gestión de entrenamientos
    'stats',                         # Estadísticas y análisis
]

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware', 
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'athcyl.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'athcyl.wsgi.application'

# Base de datos
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'athcyl_db'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'client_encoding': 'UTF8',
        },
    }
}

AUTH_USER_MODEL = 'users.User'

# Validadores de contraseña
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internacionalización
# https://docs.djangoproject.com/en/4.2/topics/i18n/
LANGUAGE_CODE = 'es-es'         # Idioma español
TIME_ZONE = 'Europe/Madrid'     # Zona horaria de España
USE_I18N = True                 # Usar internacionalización
USE_TZ = True                   # Usar zonas horarias

# Archivos estáticos (CSS, JavaScript, imágenes)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Archivos multimedia (subidos por usuarios)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Tipo de clave primaria por defecto
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configuración de REST Framework y SimpleJWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# Configuración de JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),      # 1 día para desarrollo
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),     # 1 semana para desarrollo
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti'
}

# Configuración de CORS (para desarrollo)
CORS_ALLOW_ALL_ORIGINS = True  # Solo para desarrollo
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:19006",  # Expo Web
    "http://localhost:19000",  # Expo DevTools
    "http://localhost:3000",   # React en desarrollo
    "exp://localhost:19000",   # Expo Go
    "http://10.0.2.2:19006",   # Android Emulator
    "http://192.168.0.7:19006", # Tu IP local
    "http://192.168.0.7:19000", # Para Expo Web
]

# Configuración de logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',  # Cambiado de INFO a DEBUG
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'debug.log'),
            'formatter': 'verbose'
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'error.log'),
            'formatter': 'verbose'
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'trainings': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'stats': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'users': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}