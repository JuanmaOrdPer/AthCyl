import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def setup_database():
    # Conexión al servidor PostgreSQL (usando el usuario postgres por defecto)
    conn = psycopg2.connect(
        host="localhost",
        user="postgres",
        password="postgres",
        dbname="postgres"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    try:
        # Verificar si el usuario existe
        cursor.execute("SELECT 1 FROM pg_roles WHERE rolname = 'athcyl_user'")
        if not cursor.fetchone():
            print("Creando usuario 'athcyl_user'...")
            cursor.execute(
                sql.SQL("CREATE USER {} WITH PASSWORD %s").format(
                    sql.Identifier('athcyl_user')
                ),
                ['athcyl_user']
            )
            print("✅ Usuario 'athcyl_user' creado exitosamente")
        else:
            print("✅ El usuario 'athcyl_user' ya existe")
        
        # Verificar si la base de datos existe
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'athcyl_db'")
        if not cursor.fetchone():
            print("Creando base de datos 'athcyl_db'...")
            cursor.execute(
                sql.SQL("CREATE DATABASE {}").format(
                    sql.Identifier('athcyl_db')
                )
            )
            print("✅ Base de datos 'athcyl_db' creada exitosamente")
            
            # Otorgar privilegios al usuario
            cursor.execute(
                sql.SQL("GRANT ALL PRIVILEGES ON DATABASE {} TO {}").format(
                    sql.Identifier('athcyl_db'),
                    sql.Identifier('athcyl_user')
                )
            )
            print("✅ Privilegios otorgados al usuario 'athcyl_user'")
        else:
            print("✅ La base de datos 'athcyl_db' ya existe")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("🔧 Configurando la base de datos...")
    setup_database()
    print("✅ Configuración completada")
