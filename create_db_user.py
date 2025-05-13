import os
import sys
import subprocess
import getpass

def run_psql_command(command, user="postgres"):
    """Ejecuta un comando SQL en PostgreSQL"""
    try:
        # Intenta ejecutar el comando con psql
        result = subprocess.run(
            ["psql", "-U", user, "-c", command],
            capture_output=True,
            text=True,
            check=True
        )
        print(f"Comando ejecutado correctamente: {command}")
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error al ejecutar comando: {e}")
        print(e.stderr)
        return False
    except FileNotFoundError:
        print("No se encontró el comando psql. Asegúrate de que PostgreSQL esté instalado y en el PATH.")
        print("Alternativamente, puedes usar pgAdmin para crear el usuario y la base de datos.")
        return False

def main():
    print("=== Creación de usuario y base de datos para AthCyl ===")
    
    # Solicitar información del nuevo usuario
    db_user = input("Nombre del nuevo usuario (por defecto 'athcyl_user'): ") or "athcyl_user"
    db_password = getpass.getpass("Contraseña para el nuevo usuario: ")
    db_name = input("Nombre de la base de datos (por defecto 'athcyl_db'): ") or "athcyl_db"
    
    # Crear el usuario
    print(f"\nCreando usuario {db_user}...")
    create_user_cmd = f"CREATE USER {db_user} WITH PASSWORD '{db_password}';"
    if not run_psql_command(create_user_cmd):
        print("No se pudo crear el usuario. Verifica que PostgreSQL esté instalado y configurado correctamente.")
        return False
    
    # Crear la base de datos
    print(f"\nCreando base de datos {db_name}...")
    create_db_cmd = f"CREATE DATABASE {db_name} OWNER {db_user};"
    if not run_psql_command(create_db_cmd):
        print("No se pudo crear la base de datos.")
        return False
    
    # Otorgar privilegios
    print("\nOtorgando privilegios...")
    grant_cmd = f"GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user};"
    if not run_psql_command(grant_cmd):
        print("No se pudieron otorgar privilegios.")
        return False
    
    # Actualizar el archivo .env
    print("\nActualizando archivo .env...")
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    
    try:
        with open(env_path, 'r', encoding='utf-8') as file:
            env_content = file.read()
        
        # Reemplazar las configuraciones de la base de datos
        env_lines = env_content.split('\n')
        updated_lines = []
        
        for line in env_lines:
            if line.startswith('DB_NAME='):
                updated_lines.append(f'DB_NAME={db_name}')
            elif line.startswith('DB_USER='):
                updated_lines.append(f'DB_USER={db_user}')
            elif line.startswith('DB_PASSWORD='):
                updated_lines.append(f'DB_PASSWORD={db_password}')
            else:
                updated_lines.append(line)
        
        updated_content = '\n'.join(updated_lines)
        
        with open(env_path, 'w', encoding='utf-8') as file:
            file.write(updated_content)
        
        print("Archivo .env actualizado correctamente.")
    except Exception as e:
        print(f"Error al actualizar el archivo .env: {e}")
        return False
    
    print("\n=== Configuración completada ===")
    print(f"Usuario: {db_user}")
    print(f"Base de datos: {db_name}")
    print("\nAhora puedes ejecutar el script setup_db.py para aplicar las migraciones.")
    
    return True

if __name__ == "__main__":
    main()
