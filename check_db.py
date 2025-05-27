import psycopg2
from psycopg2 import OperationalError

def check_postgres_connection():
    try:
        # Intentar conectar a la base de datos
        conn = psycopg2.connect(
            dbname="postgres",  # Conectarse a la base de datos por defecto
            user="postgres",
            password="postgres",
            host="localhost",
            port="5432"
        )
        
        # Crear un cursor
        cursor = conn.cursor()
        
        # Verificar si la base de datos existe
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'athcyl_db'")
        exists = cursor.fetchone()
        
        if exists:
            print("✅ La base de datos 'athcyl_db' existe")
        else:
            print("❌ La base de datos 'athcyl_db' NO existe")
        
        # Listar todas las bases de datos
        print("\n📋 Lista de bases de datos:")
        cursor.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
        for db in cursor.fetchall():
            print(f"- {db[0]}")
        
        cursor.close()
        conn.close()
        
    except OperationalError as e:
        print(f"❌ Error al conectar a PostgreSQL: {e}")
        print("\nPosibles soluciones:")
        print("1. Asegúrate de que el servicio de PostgreSQL esté en ejecución")
        print("2. Verifica el usuario y la contraseña")
        print("3. Verifica que el puerto 5432 esté abierto")
        print("4. Si usas Docker, verifica que el contenedor esté en ejecución")

if __name__ == "__main__":
    check_postgres_connection()
