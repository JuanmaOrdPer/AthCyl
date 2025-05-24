import os
import sys
import time
import psycopg2
from psycopg2 import OperationalError

def wait_for_postgres(host, port, user, password, dbname, max_retries=30, delay_seconds=2):
    """Espera a que la base de datos PostgreSQL esté disponible."""
    retries = 0
    while retries < max_retries:
        try:
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                dbname=dbname
            )
            conn.close()
            print("¡Conexión a la base de datos exitosa!")
            return True
        except OperationalError as e:
            retries += 1
            print(f"Intento {retries}/{max_retries} - No se pudo conectar a la base de datos: {e}")
            if retries < max_retries:
                print(f"Reintentando en {delay_seconds} segundos...")
                time.sleep(delay_seconds)
    
    print(f"Error: No se pudo conectar a la base de datos después de {max_retries} intentos.")
    return False

if __name__ == "__main__":
    # Obtener las variables de entorno
    db_config = {
        'host': os.getenv('DB_HOST', 'db'),
        'port': os.getenv('DB_PORT', '5432'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', 'postgres'),
        'dbname': os.getenv('DB_NAME', 'postgres')
    }
    
    # Esperar a que la base de datos esté disponible
    if not wait_for_postgres(**db_config):
        sys.exit(1)
