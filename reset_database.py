#!/usr/bin/env python
"""
Script para resetear completamente la base de datos con las mejoras implementadas.

Este script:
1. Elimina todas las migraciones existentes
2. Resetea la base de datos
3. Crea nuevas migraciones con nombres de tabla en español
4. Aplica las migraciones
5. Crea un superusuario

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

import os
import sys
import shutil
import django
from django.core.management import execute_from_command_line
from django.contrib.auth import get_user_model
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

# Cargar variables de entorno desde la carpeta backend
env_path = os.path.join('backend', '.env')
load_dotenv(env_path)

# Configurar encoding del sistema
if sys.platform.startswith('win'):
    os.environ['PYTHONIOENCODING'] = 'utf-8'

def get_db_config():
    """Obtiene la configuración de la base de datos desde el archivo .env"""
    return {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432'),
        'user': os.getenv('DB_USER', 'athcyl_user'),
        'password': os.getenv('DB_PASSWORD', 'athcyl_user'),
        'dbname': os.getenv('DB_NAME', 'athcyl_db')
    }

def ejecutar_comando(comando):
    """Ejecuta un comando del sistema y devuelve si fue exitoso"""
    print(f"Ejecutando: {comando}")
    resultado = os.system(comando)
    return resultado == 0

def resetear_migraciones():
    """Elimina todos los archivos de migración excepto __init__.py"""
    print("\n=== Eliminando migraciones existentes ===")
    
    apps = ['users', 'trainings', 'stats']
    
    for app in apps:
        migrations_dir = os.path.join('backend', app, 'migrations')
        if os.path.exists(migrations_dir):
            for file in os.listdir(migrations_dir):
                if file.endswith('.py') and file != '__init__.py':
                    file_path = os.path.join(migrations_dir, file)
                    os.remove(file_path)
                    print(f"✓ Eliminado: {file_path}")

def resetear_base_datos():
    """Elimina y recrea la base de datos"""
    print("\n=== Reseteando base de datos ===")
    
    try:
        # Obtener configuración desde .env
        config = get_db_config()
        
        # Pedir contraseña de PostgreSQL manualmente
        import getpass
        postgres_password = getpass.getpass("Ingresa la contraseña del usuario postgres: ")
        
        # Conexión directa sin parámetros de codificación primero
        try:
            conn = psycopg2.connect(
                host='localhost',
                user='postgres',
                password=postgres_password,  # Usar la contraseña ingresada
                dbname='postgres'
            )
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cursor = conn.cursor()
            print("  ✓ Conexión establecida con PostgreSQL (sin parámetros de codificación)")
            
            # Intentar establecer la codificación después de la conexión
            try:
                cursor.execute("SET client_encoding TO 'UTF8';")
                print("  ✓ Codificación UTF-8 establecida después de la conexión")
            except Exception as e:
                print(f"  ⚠️ No se pudo establecer la codificación UTF-8: {e}")
                
        except Exception as e:
            print(f"✗ Error al conectar a PostgreSQL: {e}")
            print("💡 Verifica que:")
            print("   1. PostgreSQL esté ejecutándose")
            print("   2. El usuario 'postgres' existe y la contraseña es correcta")
            print("   3. No hay problemas de permisos")
            return False
        
        # Usar la conexión ya establecida
        if not conn or conn.closed != 0:
            print("✗ No se pudo establecer una conexión válida")
            return False
            
        print("  ✓ Usando conexión establecida con PostgreSQL")
        
        # Terminar conexiones activas a la base de datos
        try:
            cursor.execute(f"""
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = %s AND pid <> pg_backend_pid()
            """, (config['dbname'],))
            print("  ✓ Conexiones activas terminadas")
        except Exception as e:
            print(f"  ⚠️ Advertencia al terminar conexiones: {e}")
        
        # Eliminar base de datos si existe
        try:
            cursor.execute(f"DROP DATABASE IF EXISTS {config['dbname']}")
            print("  ✓ Base de datos eliminada")
        except Exception as e:
            print(f"  ⚠️ Advertencia al eliminar la base de datos: {e}")
        
        # Recrear base de datos con codificación UTF-8
        try:
            cursor.execute(f"""
                CREATE DATABASE {config['dbname']} 
                WITH OWNER = {config['user']} 
                ENCODING = 'UTF8' 
                TEMPLATE template0
            """)
            print("  ✓ Base de datos recreada con codificación UTF-8")
        except Exception as e:
            print(f"  ⚠️ Error al crear la base de datos: {e}")
            # Intentar con una configuración más simple
            try:
                cursor.execute(f"CREATE DATABASE {config['dbname']} OWNER {config['user']}")
                print("  ✓ Base de datos recreada (configuración mínima)")
            except Exception as e2:
                print(f"  ✗ Error crítico al crear la base de datos: {e2}")
                raise
        
        cursor.close()
        conn.close()
        print("  ✓ Conexión cerrada")
        
        return True
        
    except UnicodeDecodeError as e:
        print(f"✗ Error de codificación UTF-8: {e}")
        print("💡 Posibles soluciones:")
        print("   1. Cambia la contraseña de PostgreSQL por una sin caracteres especiales")
        print("   2. Configura las variables de entorno de encoding")
        print("   3. Reinstala PostgreSQL con configuración UTF-8")
        return False
        
    except psycopg2.OperationalError as e:
        print(f"✗ Error de conexión a PostgreSQL: {e}")
        print("💡 Verifica que:")
        print("   1. PostgreSQL esté ejecutándose")
        print("   2. Las credenciales sean correctas")
        print("   3. El usuario tenga permisos suficientes")
        return False
        
    except Exception as e:
        print(f"✗ Error al resetear base de datos: {e}")
        import traceback
        traceback.print_exc()
        return False

def crear_migraciones():
    """Crea nuevas migraciones para todas las apps"""
    print("\n=== Creando nuevas migraciones ===")
    
    apps = ['users', 'trainings', 'stats']
    
    for app in apps:
        if not ejecutar_comando(f"cd backend && python manage.py makemigrations {app}"):
            print(f"✗ Error creando migraciones para {app}")
            return False
        print(f"✓ Migraciones creadas para {app}")
    
    return True

def aplicar_migraciones():
    """Aplica todas las migraciones"""
    print("\n=== Aplicando migraciones ===")
    
    if not ejecutar_comando("cd backend && python manage.py migrate"):
        print("✗ Error aplicando migraciones")
        return False
    
    print("✓ Migraciones aplicadas correctamente")
    return True

def crear_superusuario():
    """Crea un superusuario"""
    print("\n=== Creando superusuario ===")
    
    try:
        # Configurar Django
        sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'athcyl.settings')
        django.setup()
        
        User = get_user_model()
        
        # Verificar si ya existe un superusuario
        if User.objects.filter(is_superuser=True).exists():
            print("✓ Ya existe un superusuario")
            return True
        
        # Crear superusuario
        user = User.objects.create_superuser(
            email="admin@athcyl.com",
            username="admin",
            password="admin123",
            first_name="Administrador",
            last_name="AthCyl"
        )
        
        print("✓ Superusuario creado:")
        print(f"  Email: admin@athcyl.com")
        print(f"  Usuario: admin")
        print(f"  Contraseña: admin123")
        
        return True
        
    except Exception as e:
        print(f"✗ Error creando superusuario: {e}")
        return False

def verificar_tablas():
    """Verifica que las tablas se hayan creado correctamente"""
    print("\n=== Verificando tablas creadas ===")
    
    try:
        config = get_db_config()
        
        # Intentar conectar sin parámetros de codificación primero
        try:
            conn = psycopg2.connect(
                host=config['host'],
                user=config['user'],
                password=config['password'],
                dbname=config['dbname']
            )
            print("  ✓ Conexión establecida con la base de datos (sin parámetros de codificación)")
            
            # Intentar establecer la codificación después de la conexión
            cursor = conn.cursor()
            cursor.execute("SET client_encoding TO 'UTF8';")
            print("  ✓ Codificación UTF-8 establecida después de la conexión")
            
        except Exception as e:
            print(f"✗ Error al conectar a la base de datos: {e}")
            return False
        
        # Obtener lista de tablas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        
        tablas = cursor.fetchall()
        
        if tablas:
            print("✓ Tablas creadas:")
            for tabla in tablas:
                print(f"  - {tabla[0]}")
        else:
            print("✗ No se encontraron tablas")
            return False
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"✗ Error verificando tablas: {e}")
        return False

def main():
    """Función principal"""
    print("🔄 RESETEANDO BASE DE DATOS ATHCYL")
    print("=" * 50)
    
    # Cambiar al directorio del script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Verificar que estamos en el directorio correcto
    if not os.path.exists('backend'):
        print("✗ Error: No se encuentra el directorio 'backend'")
        print("  Asegúrate de ejecutar este script desde el directorio raíz del proyecto")
        return False
    
    # Verificar archivo .env
    env_path = os.path.join('backend', '.env')
    if not os.path.exists(env_path):
        print("✗ Error: No se encuentra el archivo .env en la carpeta backend")
        print("  Asegúrate de que el archivo backend/.env existe y contiene las credenciales")
        return False
    
    # Paso 1: Resetear migraciones
    resetear_migraciones()
    
    # Paso 2: Resetear base de datos
    if not resetear_base_datos():
        print("✗ No se pudo resetear la base de datos")
        return False
    
    # Paso 3: Crear nuevas migraciones
    if not crear_migraciones():
        print("✗ No se pudieron crear las migraciones")
        return False
    
    # Paso 4: Aplicar migraciones
    if not aplicar_migraciones():
        print("✗ No se pudieron aplicar las migraciones")
        return False
    
    # Paso 5: Verificar tablas
    if not verificar_tablas():
        print("✗ Error verificando las tablas")
        return False
    
    # Paso 6: Crear superusuario
    if not crear_superusuario():
        print("✗ No se pudo crear el superusuario")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 RESETEO COMPLETADO EXITOSAMENTE")
    print("=" * 50)
    print("\n📋 Resumen:")
    print("✓ Migraciones eliminadas y recreadas")
    print("✓ Base de datos reseteada")
    print("✓ Tablas creadas con nombres en español")
    print("✓ Superusuario creado")
    print("\n🚀 Puedes iniciar el servidor con:")
    print("   cd backend && python manage.py runserver")
    print("\n🔑 Credenciales de administrador:")
    print("   Email: admin@athcyl.com")
    print("   Usuario: admin")
    print("   Contraseña: admin123")
    
    return True

if __name__ == "__main__":
    try:
        exito = main()
        sys.exit(0 if exito else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Operación cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)