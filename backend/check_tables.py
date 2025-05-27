import psycopg2

def check_tables():
    try:
        # Conectar a la base de datos
        conn = psycopg2.connect(
            host="localhost",
            user="athcyl_user",
            password="athcyl_user",
            dbname="athcyl_db"
        )
        
        # Crear un cursor
        cursor = conn.cursor()
        
        # Obtener la lista de tablas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        # Imprimir las tablas
        print("📋 Tablas en la base de datos:")
        for table in cursor.fetchall():
            print(f"- {table[0]}")
        
        # Cerrar el cursor y la conexión
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error al conectar a la base de datos: {e}")
        print("\nPosibles soluciones:")
        print("1. Verifica que el servicio de PostgreSQL esté en ejecución")
        print("2. Verifica el nombre de usuario y contraseña")
        print("3. Verifica que la base de datos 'athcyl_db' exista")
        print("4. Verifica que el usuario 'athcyl_user' tenga los permisos necesarios")

if __name__ == "__main__":
    check_tables()
