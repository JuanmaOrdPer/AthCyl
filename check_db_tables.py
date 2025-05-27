import os
import sys
import django

# Configurar el entorno de Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'athcyl.settings')
django.setup()

from django.db import connection

def check_database():
    print("🔍 Verificando conexión a la base de datos...")
    
    try:
        # Verificar si la conexión es utilizable
        if connection.is_usable():
            print("✅ Conexión a la base de datos establecida correctamente")
        else:
            print("❌ No se pudo establecer conexión con la base de datos")
            return
        
        # Obtener información de la base de datos
        with connection.cursor() as cursor:
            # Obtener el nombre de la base de datos actual
            cursor.execute("SELECT current_database()")
            db_name = cursor.fetchone()[0]
            print(f"📊 Base de datos actual: {db_name}")
            
            # Listar todas las tablas en la base de datos
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            
            if tables:
                print("\n📋 Tablas en la base de datos:")
                for table in tables:
                    print(f"- {table[0]}")
            else:
                print("\nℹ️ No se encontraron tablas en la base de datos")
                
            # Verificar si hay datos en la tabla de entrenamientos
            try:
                cursor.execute("SELECT COUNT(*) FROM trainings_training")
                count = cursor.fetchone()[0]
                print(f"\n🔢 Número de entrenamientos en la base de datos: {count}")
            except Exception as e:
                print(f"\n⚠️ No se pudo acceder a la tabla de entrenamientos: {e}")
        
    except Exception as e:
        print(f"\n❌ Error al verificar la base de datos: {e}")
        print("\nPosibles soluciones:")
        print("1. Asegúrate de que PostgreSQL esté instalado y en ejecución")
        print("2. Verifica las credenciales en el archivo .env")
        print("3. Ejecuta las migraciones: python manage.py migrate")
        print("4. Si usas Docker, verifica que el contenedor esté en ejecución")

if __name__ == "__main__":
    check_database()
