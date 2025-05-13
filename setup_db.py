import os
import sys
import django
import subprocess
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def run_django_command(command):
    """Ejecuta un comando de Django"""
    print(f"Ejecutando: {command}")
    result = os.system(command)
    return result == 0

def main():
    """Configuracion principal de la base de datos y migraciones"""
    print("=== Configuracion de AthCyl ===")
    
    # Cambiar al directorio del backend y añadirlo al path
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
    os.chdir(backend_dir)
    sys.path.insert(0, backend_dir)
    
    # Configurar Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'athcyl.settings')
    try:
        django.setup()
        print("Django configurado correctamente")
    except Exception as e:
        print(f"Error al configurar Django: {e}")
        return False
        
    # Intentar crear la base de datos directamente
    try:
        # Obtener configuración de la base de datos desde settings
        from django.conf import settings
        db_settings = settings.DATABASES['default']
        db_name = db_settings['NAME']
        db_user = db_settings['USER']
        db_password = db_settings['PASSWORD']
        db_host = db_settings['HOST']
        db_port = db_settings['PORT']
        
        # Conectar a la base de datos 'postgres' para crear la nueva base de datos
        import psycopg
        try:
            # Intentar conectar a postgres para crear la base de datos
            conn_string = f"dbname=postgres user={db_user} password={db_password} host={db_host} port={db_port}"
            with psycopg.connect(conn_string) as conn:
                conn.autocommit = True
                with conn.cursor() as cursor:
                    # Verificar si la base de datos ya existe
                    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
                    if cursor.fetchone() is None:
                        # Crear la base de datos si no existe
                        cursor.execute(f"CREATE DATABASE {db_name} OWNER {db_user}")
                        print(f"Base de datos '{db_name}' creada correctamente")
                    else:
                        print(f"La base de datos '{db_name}' ya existe")
            print("Conexión a la base de datos establecida correctamente")
        except Exception as e:
            print(f"Error al crear la base de datos: {e}")
            print("Intentando conectar directamente a la base de datos especificada...")
            
        # Verificar la conexión a la base de datos de la aplicación
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("Conexión a la base de datos de la aplicación establecida correctamente")
    except Exception as e:
        print(f"Advertencia: No se pudo conectar a la base de datos: {e}")
        print("NOTA: Es necesario crear manualmente la base de datos 'athcyl_db' usando pgAdmin")
        print("u otra herramienta de administración de PostgreSQL antes de continuar.")
        print("Ejecuta los siguientes comandos en pgAdmin o en la consola de PostgreSQL:")
        print(f"1. CREATE DATABASE {db_name};")
        print(f"2. GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user};")
        return False

    
    # Crear migraciones
    print("\n=== Creando migraciones ===")
    if not run_django_command("python manage.py makemigrations users"):
        print("Error al crear migraciones para users")
        return False
        
    if not run_django_command("python manage.py makemigrations trainings"):
        print("Error al crear migraciones para trainings")
        return False
        
    if not run_django_command("python manage.py makemigrations stats"):
        print("Error al crear migraciones para stats")
        return False
    
    # Aplicar migraciones
    print("\n=== Aplicando migraciones ===")
    if not run_django_command("python manage.py migrate"):
        print("Error al aplicar migraciones")
        return False
    
    # Crear superusuario
    print("\n=== Verificando superusuario ===")
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if not User.objects.filter(is_superuser=True).exists():
            print("Creando superusuario...")
            User.objects.create_superuser(
                email="admin@athcyl.com",
                username="admin",
                password="admin123"
            )
            print("Superusuario creado correctamente.")
        else:
            print("Ya existe un superusuario.")
    except Exception as e:
        print(f"Error al crear el superusuario: {e}")
        return False
    
    print("\n=== Configuracion completada con exito ===")
    print("Puedes iniciar el servidor Django con: python backend/manage.py runserver")
    print("Puedes iniciar la aplicacion React Native con: cd frontend && npm start")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
