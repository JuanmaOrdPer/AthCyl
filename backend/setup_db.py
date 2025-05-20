"""
Script para configurar la base de datos PostgreSQL y ejecutar migraciones.

Este script automatiza la configuración inicial del proyecto:
1. Crea la base de datos PostgreSQL si no existe
2. Ejecuta las migraciones de Django
3. Crea un superusuario de prueba por defecto

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

import os
import sys
import django
import subprocess
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def ejecutar_comando_django(comando):
    """
    Ejecuta un comando de Django y devuelve si fue exitoso o no.
    
    Args:
        comando: Comando a ejecutar (string)
        
    Returns:
        bool: True si el comando fue exitoso, False en caso contrario
    """
    print(f"Ejecutando: {comando}")
    resultado = os.system(comando)
    return resultado == 0

def main():
    """
    Función principal que configura la base de datos y ejecuta migraciones.
    
    Returns:
        bool: True si la configuración fue exitosa, False en caso contrario
    """
    print("=== Configuración de AthCyl ===")
    
    # Cambiar al directorio del backend y añadirlo al path
    ruta_backend = os.path.dirname(os.path.abspath(__file__))
    os.chdir(ruta_backend)
    sys.path.insert(0, ruta_backend)
    
    # Configurar Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'athcyl.settings')
    try:
        django.setup()
        print("✓ Django configurado correctamente")
    except Exception as e:
        print(f"✗ Error al configurar Django: {e}")
        return False
        
    # Intentar crear la base de datos directamente
    try:
        # Obtener configuración de la base de datos desde settings
        from django.conf import settings
        config_db = settings.DATABASES['default']
        nombre_db = config_db['NAME']
        usuario_db = config_db['USER']
        password_db = config_db['PASSWORD']
        host_db = config_db['HOST']
        puerto_db = config_db['PORT']
        
        print(f"Configuración de base de datos:")
        print(f"  Nombre: {nombre_db}")
        print(f"  Usuario: {usuario_db}")
        print(f"  Host: {host_db}")
        print(f"  Puerto: {puerto_db}")
        
        # Conectar a la base de datos 'postgres' para crear la nueva base de datos
        import psycopg2
        try:
            # Intentar conectar a postgres para crear la base de datos
            cadena_conexion = f"dbname=postgres user={usuario_db} password={password_db} host={host_db} port={puerto_db}"
            print("Conectando a PostgreSQL para crear la base de datos...")
            
            with psycopg2.connect(cadena_conexion) as conexion:
                conexion.autocommit = True
                with conexion.cursor() as cursor:
                    # Verificar si la base de datos ya existe
                    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (nombre_db,))
                    if cursor.fetchone() is None:
                        # Crear la base de datos si no existe
                        cursor.execute(f"CREATE DATABASE {nombre_db} OWNER {usuario_db}")
                        print(f"✓ Base de datos '{nombre_db}' creada correctamente")
                    else:
                        print(f"✓ La base de datos '{nombre_db}' ya existe")
            print("✓ Conexión a PostgreSQL establecida correctamente")
        except Exception as e:
            print(f"! Error al crear la base de datos: {e}")
            print("! Intentando conectar directamente a la base de datos especificada...")
            
        # Verificar la conexión a la base de datos de la aplicación
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✓ Conexión a la base de datos de la aplicación establecida correctamente")
    except Exception as e:
        print(f"✗ ADVERTENCIA: No se pudo conectar a la base de datos: {e}")
        print("  NOTA: Es necesario crear manualmente la base de datos usando pgAdmin")
        print("  u otra herramienta de PostgreSQL antes de continuar.")
        print("  Ejecuta estos comandos en pgAdmin o en la consola de PostgreSQL:")
        print(f"  1. CREATE DATABASE {nombre_db};")
        print(f"  2. GRANT ALL PRIVILEGES ON DATABASE {nombre_db} TO {usuario_db};")
        return False

    
    # Crear migraciones
    print("\n=== Creando migraciones ===")
    if not ejecutar_comando_django("python manage.py makemigrations users"):
        print("✗ Error al crear migraciones para users")
        return False
        
    if not ejecutar_comando_django("python manage.py makemigrations trainings"):
        print("✗ Error al crear migraciones para trainings")
        return False
        
    if not ejecutar_comando_django("python manage.py makemigrations stats"):
        print("✗ Error al crear migraciones para stats")
        return False
    
    # Aplicar migraciones
    print("\n=== Aplicando migraciones ===")
    if not ejecutar_comando_django("python manage.py migrate"):
        print("✗ Error al aplicar migraciones")
        return False
    
    # Crear superusuario
    print("\n=== Verificando superusuario ===")
    try:
        from django.contrib.auth import get_user_model
        Usuario = get_user_model()
        
        if not Usuario.objects.filter(is_superuser=True).exists():
            print("Creando superusuario administrador...")
            Usuario.objects.create_superuser(
                email="admin@athcyl.com",
                username="admin",
                password="admin123"
            )
            print("✓ Superusuario creado correctamente.")
        else:
            print("✓ Ya existe un superusuario.")
    except Exception as e:
        print(f"✗ Error al crear el superusuario: {e}")
        return False
    
    print("\n=== Configuración completada con éxito ===")
    print("Puedes iniciar el servidor Django con: python manage.py runserver")
    print("Puedes iniciar la aplicación React Native con: cd frontend && npm start")
    return True

if __name__ == "__main__":
    exito = main()
    sys.exit(0 if exito else 1)