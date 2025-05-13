#!/usr/bin/env python
"""
Script para crear un superusuario para la aplicación AthCyl.
"""
import os
import django
import sys
from getpass import getpass

# Configurar entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'athcyl.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError

User = get_user_model()

def create_superuser():
    """
    Crea un superusuario para la aplicación AthCyl.
    Verifica si ya existe un superusuario y, si no, crea uno nuevo.
    """
    # Verificar si ya existe un superusuario
    if User.objects.filter(is_superuser=True).exists():
        print("Ya existe un superusuario en la base de datos.")
        print("Superusuarios existentes:")
        for user in User.objects.filter(is_superuser=True):
            print(f"- {user.username} ({user.email})")
        
        create_another = input("¿Deseas crear otro superusuario? (s/n): ").lower()
        if create_another != 's':
            return
    
    # Solicitar datos para el nuevo superusuario
    print("\nCreando un nuevo superusuario...")
    username = input("Nombre de usuario: ")
    email = input("Correo electrónico: ")
    
    # Solicitar contraseña de forma segura (no se muestra al escribir)
    while True:
        password = getpass("Contraseña: ")
        password_confirm = getpass("Confirmar contraseña: ")
        
        if password == password_confirm:
            break
        print("Las contraseñas no coinciden. Inténtalo de nuevo.")
    
    # Crear el superusuario
    try:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"\n¡Superusuario '{username}' creado exitosamente!")
        print(f"Puedes usar estas credenciales para acceder a la API y al panel de administración en /admin/")
    except IntegrityError:
        print(f"\nError: Ya existe un usuario con el nombre '{username}' o el correo '{email}'.")
    except Exception as e:
        print(f"\nError al crear el superusuario: {str(e)}")

if __name__ == "__main__":
    create_superuser()
