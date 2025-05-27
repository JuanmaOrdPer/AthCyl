#!/usr/bin/env python
"""
Script de instalación completo para AthCyl Backend - Versión Windows Mejorada con soporte Python 3.13.

Este script:
1. Verifica los requisitos del sistema
2. Maneja mejor la instalación en Windows
3. Detecta y soluciona problemas con Python 3.13
4. Ofrece alternativas si PostgreSQL no está instalado
5. Configura todo automáticamente

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

import os
import sys
import subprocess
import shutil
import platform
import time
from pathlib import Path
import tempfile

def print_header(title):
    """Imprime un encabezado estilizado"""
    print("\n" + "=" * 60)
    print(f"🚀 {title}")
    print("=" * 60)

def print_step(step_number, title):
    """Imprime el paso actual"""
    print(f"\n📋 Paso {step_number}: {title}")
    print("-" * 50)

def run_command(command, cwd=None, shell=True, capture_output=True):
    """Ejecuta un comando y devuelve si fue exitoso"""
    try:
        print(f"Ejecutando: {' '.join(command) if isinstance(command, list) else command}")
        result = subprocess.run(
            command, 
            cwd=cwd, 
            shell=shell, 
            check=True,
            capture_output=capture_output,
            text=True
        )
        if result.stdout and capture_output:
            print(result.stdout)
        return True, result.stdout if capture_output else ""
    except subprocess.CalledProcessError as e:
        print(f"❌ Error ejecutando comando: {e}")
        if hasattr(e, 'stderr') and e.stderr:
            print(f"Error: {e.stderr}")
        return False, e.stderr if hasattr(e, 'stderr') else str(e)

def check_python_version():
    """Verifica que la versión de Python sea compatible"""
    print("🐍 Verificando versión de Python...")
    
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Se requiere Python 3.8 o superior")
        print(f"   Versión actual: {version.major}.{version.minor}.{version.micro}")
        return False
    
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} - Compatible")
    
    # Advertencia para Python 3.13
    if version.major == 3 and version.minor >= 13:
        print("⚠️ Usando Python 3.13+ - Se aplicarán optimizaciones para dependencias")
        return "python313"
    
    return True

def check_compiler_available():
    """Verifica si hay un compilador C/C++ disponible"""
    print("🔧 Verificando compilador C/C++...")
    
    compilers = [
        ("cl", "Microsoft Visual C++"),
        ("gcc", "GCC"),
        ("clang", "Clang")
    ]
    
    for compiler, name in compilers:
        try:
            result = subprocess.run([compiler, "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ {name} encontrado")
                return True
        except FileNotFoundError:
            continue
    
    print("⚠️ No se encontró compilador C/C++")
    return False

def check_postgresql_windows():
    """Verifica PostgreSQL en Windows con múltiples métodos"""
    print("🐘 Verificando PostgreSQL en Windows...")
    
    # Lista de posibles ubicaciones de PostgreSQL en Windows
    possible_paths = [
        r"C:\Program Files\PostgreSQL\17\bin",
        r"C:\Program Files\PostgreSQL\16\bin",
        r"C:\Program Files\PostgreSQL\15\bin",
        r"C:\Program Files\PostgreSQL\14\bin",
        r"C:\Program Files\PostgreSQL\13\bin",
        r"C:\Program Files\PostgreSQL\12\bin",
        r"C:\Program Files (x86)\PostgreSQL\17\bin",
        r"C:\Program Files (x86)\PostgreSQL\16\bin",
        r"C:\Program Files (x86)\PostgreSQL\15\bin",
        r"C:\Program Files (x86)\PostgreSQL\14\bin",
        r"C:\PostgreSQL\17\bin",
        r"C:\PostgreSQL\16\bin",
        r"C:\PostgreSQL\15\bin",
        r"C:\PostgreSQL\14\bin",
    ]
    
    psql_path = None
    
    # Método 1: Verificar si psql está en el PATH
    try:
        result = subprocess.run(
            ["psql", "--version"], 
            capture_output=True, 
            text=True, 
            check=True
        )
        print(f"✅ {result.stdout.strip()}")
        psql_path = "psql"  # Está en el PATH
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️ psql no encontrado en el PATH del sistema")
    
    # Método 2: Buscar en ubicaciones comunes
    if not psql_path:
        print("🔍 Buscando PostgreSQL en ubicaciones comunes...")
        for path in possible_paths:
            psql_exe = os.path.join(path, "psql.exe")
            if os.path.exists(psql_exe):
                try:
                    result = subprocess.run(
                        [psql_exe, "--version"], 
                        capture_output=True, 
                        text=True, 
                        check=True
                    )
                    print(f"✅ PostgreSQL encontrado en: {path}")
                    print(f"   {result.stdout.strip()}")
                    psql_path = psql_exe
                    break
                except subprocess.CalledProcessError:
                    continue
    
    # Método 3: Verificar servicios de Windows
    if not psql_path:
        print("🔍 Verificando servicios de PostgreSQL...")
        try:
            # Buscar servicios que contengan "postgresql"
            result = subprocess.run(
                ["sc", "query", "type=", "service", "state=", "all"], 
                capture_output=True, 
                text=True,
                shell=True
            )
            if "postgresql" in result.stdout.lower():
                print("✅ Servicio PostgreSQL encontrado en el sistema")
                print("⚠️ Pero psql no está en el PATH")
                return "service_only"
        except:
            pass
    
    if psql_path:
        return psql_path
    else:
        return False

def create_python313_requirements():
    """Crea un requirements.txt optimizado para Python 3.13"""
    print("📝 Creando requirements.txt optimizado para Python 3.13...")
    
    optimized_requirements = """# ======== Dependencias principales de Django ========
Django==4.2.7                     # Framework web principal para el backend
djangorestframework==3.14.0       # Biblioteca para crear APIs RESTful en Django
django-cors-headers==4.3.1        # Maneja los encabezados CORS para permitir solicitudes desde el frontend
djangorestframework-simplejwt==5.3.0  # Implementación de autenticación JWT para Django REST Framework

# ======== Soporte para desarrollo seguro ========
django-extensions==3.2.3          # Extensiones útiles para Django (shell_plus, runserver_plus, etc.)
Werkzeug==2.3.7                   # Utilidades web usadas por django-extensions

# ======== Base de datos ========
psycopg2-binary==2.9.9           # Adaptador PostgreSQL para Django (versión precompilada)

# ======== Procesamiento de datos (optimizado para Python 3.13) ========
gpxpy==1.5.0                     # Biblioteca para leer y analizar archivos GPX de rutas
numpy>=1.26.0                    # Dependencia base para pandas (optimizado para Python 3.13)
pandas>=2.2.0                    # Análisis de datos y manipulación para estadísticas (optimizado para Python 3.13)
python-dateutil==2.8.2           # Funciones avanzadas para trabajar con fechas
pytz==2023.3                     # Soporte para zonas horarias

# ======== Procesamiento de archivos XML ========
beautifulsoup4==4.12.2           # Analizador HTML/XML para procesar archivos TCX
lxml>=4.9.3                      # Analizador XML rápido usado con BeautifulSoup (optimizado)

# ======== Configuración y utilidades ========
python-dotenv==1.0.0             # Carga variables de entorno desde archivos .env
Pillow>=10.1.0                   # Procesamiento de imágenes (para fotos de perfil, optimizado)

# ======== Exportación de datos ========
reportlab>=4.0.6                 # Generación de archivos PDF para informes de entrenamiento (optimizado)

# ======== Desarrollo y testing ========
ipython>=8.17.2                  # Shell interactivo mejorado (optimizado)
django-debug-toolbar==4.2.0      # Herramientas de debug para desarrollo

# ======== Compatibilidad y seguridad ========
cryptography>=41.0.7             # Biblioteca de criptografía para JWT (optimizado)
urllib3==2.0.7                   # Cliente HTTP usado por varias dependencias
"""
    
    backend_path = Path("backend")
    requirements_path = backend_path / "requirements.txt"
    
    # Hacer backup del requirements original
    if requirements_path.exists():
        backup_path = backend_path / "requirements_original.txt"
        shutil.copy2(requirements_path, backup_path)
        print(f"✅ Backup del requirements original guardado en: {backup_path}")
    
    # Escribir nuevo requirements
    with open(requirements_path, 'w', encoding='utf-8') as f:
        f.write(optimized_requirements)
    
    print(f"✅ Requirements.txt optimizado creado en: {requirements_path}")
    return True

def install_build_tools_guide():
    """Muestra guía para instalar Microsoft Build Tools"""
    print("\n" + "="*60)
    print("🔧 INSTALACIÓN DE MICROSOFT BUILD TOOLS")
    print("="*60)
    print("\n📋 OPCIÓN 1: Build Tools (Recomendado)")
    print("1. Ve a: https://visualstudio.microsoft.com/visual-cpp-build-tools/")
    print("2. Descarga 'Build Tools para Visual Studio 2022'")
    print("3. Durante la instalación selecciona:")
    print("   ✅ C++ build tools")
    print("   ✅ Windows 10/11 SDK")
    print("   ✅ MSVC v143 - VS 2022 C++ x64/x86 build tools")
    
    print("\n📋 OPCIÓN 2: Visual Studio Community (Completo)")
    print("1. Ve a: https://visualstudio.microsoft.com/vs/community/")
    print("2. Durante la instalación selecciona:")
    print("   ✅ Desarrollo de escritorio con C++")
    
    print("\n⚠️ IMPORTANTE: Reinicia tu computadora después de la instalación")
    print("="*60)

def ask_build_tools_installation():
    """Pregunta sobre la instalación de Build Tools"""
    print("\n🤔 OPCIONES PARA COMPILAR DEPENDENCIAS:")
    print("1. Instalar Microsoft Build Tools (recomendado)")
    print("2. Usar solo paquetes precompilados (más rápido, puede faltar alguna funcionalidad)")
    print("3. Salir e instalar Build Tools manualmente")
    
    while True:
        choice = input("\n¿Qué quieres hacer? (1/2/3): ").strip()
        if choice in ['1', '2', '3']:
            return choice
        print("❌ Opción inválida. Elige 1, 2 o 3.")

def install_dependencies_python313(pip_cmd):
    """Instala dependencias optimizadas para Python 3.13"""
    print("📚 Instalando dependencias optimizadas para Python 3.13...")
    
    # Actualizar pip primero
    print("🔄 Actualizando pip...")
    success, _ = run_command([pip_cmd, "install", "--upgrade", "pip"])
    if not success:
        print("⚠️ Error actualizando pip, continuando...")
    
    # Lista de dependencias críticas que necesitan instalación especial
    critical_deps = [
        "numpy>=1.26.0",
        "pandas>=2.2.0"
    ]
    
    # Intentar instalar dependencias críticas con binarios precompilados
    print("🎯 Instalando dependencias críticas con binarios precompilados...")
    for dep in critical_deps:
        print(f"   Instalando {dep}...")
        success, error = run_command([pip_cmd, "install", dep, "--only-binary=all"])
        if not success:
            print(f"⚠️ Error instalando {dep} con binarios precompilados")
            
            # Verificar si es problema de compilador
            if "compiler" in error.lower() or "cl.exe" in error.lower():
                print("🔧 Se detectó problema de compilador")
                
                has_compiler = check_compiler_available()
                if not has_compiler:
                    install_build_tools_guide()
                    choice = ask_build_tools_installation()
                    
                    if choice == '1':
                        print("\n✅ Ve e instala Microsoft Build Tools, luego ejecuta este script de nuevo.")
                        return False
                    elif choice == '3':
                        print("\n✅ Instalación cancelada. Instala Build Tools primero.")
                        return False
                    else:  # choice == '2'
                        print(f"\n⚠️ Saltando instalación de {dep}")
                        continue
                
                # Intentar instalación normal
                print(f"   Reintentando instalación normal de {dep}...")
                success, _ = run_command([pip_cmd, "install", dep])
                if not success:
                    print(f"❌ No se pudo instalar {dep}")
                    return False
    
    # Instalar el resto de dependencias desde requirements.txt
    print("📦 Instalando resto de dependencias...")
    backend_path = Path("backend")
    requirements_path = backend_path / "requirements.txt"
    
    success, error = run_command([pip_cmd, "install", "-r", str(requirements_path)])
    if not success:
        print("⚠️ Error con algunas dependencias, intentando instalación alternativa...")
        
        # Intentar instalación línea por línea
        with open(requirements_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        failed_packages = []
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#'):
                package = line.split('==')[0].split('>=')[0].split('<=')[0]
                print(f"   Instalando {package}...")
                success, _ = run_command([pip_cmd, "install", line])
                if not success:
                    failed_packages.append(line)
                    print(f"⚠️ Error instalando {package}")
        
        if failed_packages:
            print(f"\n⚠️ Paquetes que fallaron: {', '.join(failed_packages)}")
            print("💡 Puedes intentar instalarlos manualmente después")
        else:
            print("✅ Todas las dependencias se instalaron exitosamente")
    else:
        print("✅ Dependencias instaladas correctamente")
    
    return True

def install_dependencies_standard(pip_cmd):
    """Instala dependencias de manera estándar"""
    print("📚 Instalando dependencias de Python...")
    
    backend_path = Path("backend")
    requirements_path = backend_path / "requirements.txt"
    
    if not requirements_path.exists():
        print(f"❌ No se encontró requirements.txt en {requirements_path}")
        return False
    
    # Actualizar pip
    success, _ = run_command([pip_cmd, "install", "--upgrade", "pip"])
    if not success:
        print("⚠️ Error actualizando pip, continuando...")
    
    # Instalar dependencias
    success, error = run_command([pip_cmd, "install", "-r", str(requirements_path)])
    if not success:
        print("❌ Error instalando dependencias")
        print(f"Error: {error}")
        return False
    
    print("✅ Dependencias instaladas correctamente")
    return True

def kill_python_processes():
    """Intenta terminar procesos de Python que puedan estar bloqueando archivos"""
    if platform.system() != "Windows":
        return
    
    try:
        print("🔍 Verificando procesos de Python activos...")
        result = subprocess.run(["tasklist", "/FI", "IMAGENAME eq python.exe"], 
                              capture_output=True, text=True)
        
        if "python.exe" in result.stdout:
            print("⚠️ Se encontraron procesos de Python ejecutándose")
            print("💡 RECOMENDACIÓN: Cierra todos los programas de Python antes de continuar")
            
            choice = input("¿Quieres intentar terminar los procesos automáticamente? (y/N): ").lower()
            if choice == 'y':
                subprocess.run(["taskkill", "/F", "/IM", "python.exe"], 
                             capture_output=True)
                print("🔄 Procesos de Python terminados")
                time.sleep(2)  # Esperar un poco para que se liberen los archivos
    except Exception as e:
        print(f"⚠️ No se pudieron verificar procesos: {e}")

def setup_virtual_environment():
    """Configura el entorno virtual de Python con manejo robusto de permisos"""
    print("💻 Configurando entorno virtual...")
    
    venv_path = Path("venv")
    
    if venv_path.exists():
        print("⚠️ El entorno virtual ya existe.")
        print("🔄 OPCIONES:")
        print("1. Recrear entorno virtual (eliminar y crear nuevo)")
        print("2. Usar entorno virtual existente")
        print("3. Renombrar el actual y crear uno nuevo")
        
        while True:
            choice = input("¿Qué quieres hacer? (1/2/3): ").strip()
            if choice in ['1', '2', '3']:
                break
            print("❌ Opción inválida. Elige 1, 2 o 3.")
        
        if choice == '2':
            print("✅ Usando entorno virtual existente")
            return True
        elif choice == '3':
            # Renombrar el entorno actual
            backup_path = Path(f"venv_backup_{int(time.time())}")
            try:
                venv_path.rename(backup_path)
                print(f"✅ Entorno virtual anterior renombrado a: {backup_path}")
            except Exception as e:
                print(f"❌ Error renombrando entorno virtual: {e}")
                return False
        else:  # choice == '1'
            # Intentar eliminar con múltiples estrategias
            max_attempts = 3
            
            for attempt in range(max_attempts):
                print(f"🔄 Intento {attempt + 1} de {max_attempts} eliminando entorno virtual...")
                
                try:
                    # Estrategia 1: Terminar procesos de Python
                    if attempt == 0:
                        kill_python_processes()
                    
                    # Estrategia 2: Cambiar permisos en Windows
                    if platform.system() == "Windows":
                        try:
                            # Cambiar atributos de archivos
                            for root, dirs, files in os.walk(venv_path):
                                for file in files:
                                    file_path = os.path.join(root, file)
                                    try:
                                        os.chmod(file_path, 0o777)
                                    except:
                                        pass
                        except Exception:
                            pass
                    
                    # Estrategia 3: Eliminar con manejo de errores mejorado
                    def robust_error_handler(func, path, exc_info):
                        """Manejo robusto de errores al eliminar archivos"""
                        import stat
                        
                        try:
                            # Cambiar permisos
                            os.chmod(path, stat.S_IWRITE)
                            time.sleep(0.1)  # Pequeña pausa
                            func(path)
                        except Exception:
                            try:
                                # Método alternativo para Windows
                                if platform.system() == "Windows":
                                    subprocess.run(["attrib", "-R", path], 
                                                 capture_output=True)
                                    func(path)
                            except Exception:
                                pass  # Si todo falla, continuar
                    
                    # Intentar eliminación
                    shutil.rmtree(venv_path, onerror=robust_error_handler)
                    
                    # Verificar si se eliminó completamente
                    if not venv_path.exists():
                        print("✅ Entorno virtual anterior eliminado exitosamente")
                        break
                    else:
                        raise Exception("Directorio aún existe después de eliminación")
                
                except Exception as e:
                    print(f"⚠️ Error en intento {attempt + 1}: {e}")
                    
                    if attempt < max_attempts - 1:
                        print("🔄 Reintentando en 3 segundos...")
                        time.sleep(3)
                    else:
                        # Último intento fallido
                        print("\n❌ No se pudo eliminar el entorno virtual automáticamente")
                        print("💡 SOLUCIONES MANUALES:")
                        print("1. Reinicia tu computadora y vuelve a ejecutar el script")
                        print("2. Cierra todas las aplicaciones y terminales, luego:")
                        print(f"   - Elimina manualmente la carpeta: {venv_path.absolute()}")
                        print("   - Vuelve a ejecutar este script")
                        print("3. Renombra la carpeta 'venv' y ejecuta el script")
                        
                        choice = input("\n¿Quieres continuar usando el entorno existente? (y/N): ").lower()
                        if choice == 'y':
                            print("✅ Continuando con entorno virtual existente")
                            return True
                        else:
                            return False
    
    # Crear entorno virtual
    print("🔨 Creando nuevo entorno virtual...")
    success, _ = run_command([sys.executable, "-m", "venv", "venv"])
    if not success:
        print("❌ Error creando entorno virtual")
        return False
    
    print("✅ Entorno virtual creado exitosamente")
    return True

def handle_remove_readonly(func, path, _):
    """Manejador para eliminar archivos de solo lectura"""
    import stat
    os.chmod(path, stat.S_IWRITE)
    func(path)

def activate_virtual_environment():
    """Activa el entorno virtual y devuelve el comando python"""
    if platform.system() == "Windows":
        python_cmd = os.path.join("venv", "Scripts", "python.exe")
        pip_cmd = os.path.join("venv", "Scripts", "pip.exe")
    else:
        python_cmd = os.path.join("venv", "bin", "python")
        pip_cmd = os.path.join("venv", "bin", "pip")
    
    # Verificar que los comandos existen
    if not os.path.exists(python_cmd):
        print(f"❌ No se encontró Python en el entorno virtual: {python_cmd}")
        return None, None
    
    print("✅ Entorno virtual activado")
    return python_cmd, pip_cmd

def install_dependencies(pip_cmd, python_version_check):
    """Instala las dependencias según la versión de Python"""
    if python_version_check == "python313":
        # Crear requirements optimizado para Python 3.13
        create_python313_requirements()
        return install_dependencies_python313(pip_cmd)
    else:
        return install_dependencies_standard(pip_cmd)

def install_postgresql_guide():
    """Muestra guía para instalar PostgreSQL"""
    print("\n" + "="*60)
    print("📖 GUÍA DE INSTALACIÓN DE POSTGRESQL")
    print("="*60)
    print("\n🔽 OPCIÓN 1: Instalación Oficial (Recomendada)")
    print("1. Ve a: https://www.postgresql.org/download/windows/")
    print("2. Descarga PostgreSQL 14, 15, 16 o 17 (recomendado)")
    print("3. Durante la instalación:")
    print("   - Usuario: postgres")
    print("   - Contraseña: postgres (o la que prefieras)")
    print("   - Puerto: 5432")
    print("   - ✅ Marca 'Add PostgreSQL to PATH'")
    
    print("\n🔽 OPCIÓN 2: Con pgAdmin (Más fácil)")
    print("1. Descarga pgAdmin desde: https://www.pgadmin.org/download/")
    print("2. Incluye PostgreSQL server automáticamente")
    
    print("\n🔽 OPCIÓN 3: Con Chocolatey (Rápido)")
    print("1. Instala Chocolatey: https://chocolatey.org/install")
    print("2. Ejecuta: choco install postgresql")
    
    print("\n📝 DESPUÉS DE LA INSTALACIÓN:")
    print("1. Reinicia tu terminal/PowerShell")
    print("2. Ejecuta: psql --version")
    print("3. Si funciona, vuelve a ejecutar este script")
    
    print("\n" + "="*60)

def ask_continue_without_postgresql():
    """Pregunta si continuar sin PostgreSQL"""
    print("\n🤔 OPCIONES DISPONIBLES:")
    print("1. Instalar PostgreSQL ahora (recomendado)")
    print("2. Continuar y configurar base de datos manualmente después")
    print("3. Usar SQLite para pruebas (no recomendado para producción)")
    print("4. Salir y instalar PostgreSQL primero")
    
    while True:
        choice = input("\n¿Qué quieres hacer? (1/2/3/4): ").strip()
        if choice in ['1', '2', '3', '4']:
            return choice
        print("❌ Opción inválida. Elige 1, 2, 3 o 4.")

def setup_database_with_psql(psql_path):
    """Configura la base de datos usando psql"""
    print("🗄️ Configurando base de datos PostgreSQL...")
    
    try:
        import psycopg2
        from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
        
        # Parámetros de conexión
        print("🔑 Intentando conectar a PostgreSQL...")
        print("   Usuario por defecto: postgres")
        
        # Pedir contraseña al usuario
        print("\n📝 Introduce la contraseña de PostgreSQL:")
        print("   (Si acabas de instalar PostgreSQL, probablemente sea 'postgres')")
        password = input("Contraseña de PostgreSQL: ").strip()
        
        if not password:
            password = "postgres"  # Valor por defecto
            print("   Usando contraseña por defecto: postgres")
        
        # Intentar conectar
        conn = psycopg2.connect(
            host="localhost",
            user="postgres",
            password=password,
            dbname="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Crear usuario si no existe
        cursor.execute("SELECT 1 FROM pg_roles WHERE rolname = 'athcyl_user'")
        if not cursor.fetchone():
            cursor.execute("CREATE USER athcyl_user WITH PASSWORD 'athcyl_user'")
            print("✅ Usuario 'athcyl_user' creado")
        else:
            print("✅ Usuario 'athcyl_user' ya existe")
        
        # Crear base de datos si no existe
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'athcyl_db'")
        if not cursor.fetchone():
            cursor.execute("CREATE DATABASE athcyl_db OWNER athcyl_user")
            print("✅ Base de datos 'athcyl_db' creada")
        else:
            print("✅ Base de datos 'athcyl_db' ya existe")
        
        # Otorgar privilegios
        cursor.execute("GRANT ALL PRIVILEGES ON DATABASE athcyl_db TO athcyl_user")
        print("✅ Privilegios otorgados")
        
        cursor.close()
        conn.close()
        
        return True
        
    except ImportError:
        print("❌ psycopg2 no está instalado. Las dependencias deben instalarse primero.")
        return False
    except Exception as e:
        print(f"❌ Error configurando base de datos: {e}")
        print("\n💡 SOLUCIONES POSIBLES:")
        print("1. Verifica que PostgreSQL esté ejecutándose")
        print("2. Verifica la contraseña del usuario 'postgres'")
        print("3. Verifica que el puerto 5432 esté libre")
        return False

def create_env_file():
    """Crea archivo .env con configuración"""
    print("📝 Creando archivo de configuración .env...")
    
    env_content = """# Django settings
SECRET_KEY=d5x34p!8a2_7^gy%%m+@68_!fk&0-xz3*#o3@+!va!3w3=#j4
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Configuración de base de datos PostgreSQL
DB_NAME=athcyl_db
DB_USER=athcyl_user
DB_PASSWORD=athcyl_user
DB_HOST=localhost
DB_PORT=5432

# Configuración de CORS
CORS_ALLOW_ALL_ORIGINS=True
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://10.0.2.2:8081,exp://localhost:19000

# Configuración de JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_LIFETIME=3600
JWT_REFRESH_TOKEN_LIFETIME=604800
"""
    
    env_path = Path("backend") / ".env"
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print(f"✅ Archivo .env creado en: {env_path}")

def run_migrations(python_cmd):
    """Ejecuta las migraciones de Django"""
    print("🔄 Ejecutando migraciones...")
    
    backend_path = Path("backend")
    
    # Crear migraciones
    apps = ['users', 'trainings', 'stats']
    for app in apps:
        print(f"   Creando migraciones para {app}...")
        success, _ = run_command([python_cmd, "manage.py", "makemigrations", app], cwd=backend_path)
        if not success:
            print(f"⚠️ Error creando migraciones para {app}, continuando...")
    
    # Aplicar migraciones
    print("   Aplicando migraciones...")
    success, _ = run_command([python_cmd, "manage.py", "migrate"], cwd=backend_path)
    if not success:
        print("❌ Error aplicando migraciones")
        return False
    
    print("✅ Migraciones completadas")
    return True

def create_superuser(python_cmd):
    """Crea un superusuario"""
    print("👤 Creando superusuario...")
    
    backend_path = Path("backend")
    
    # Script para crear superusuario programáticamente
    create_user_script = '''
import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "athcyl.settings")
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser(
        email="admin@athcyl.com",
        username="admin",
        password="admin123",
        first_name="Administrador",
        last_name="AthCyl"
    )
    print("✅ Superusuario creado exitosamente")
else:
    print("✅ Ya existe un superusuario")
'''
    
    # Crear archivo temporal
    script_path = backend_path / "create_superuser.py"
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(create_user_script)
    
    try:
        # Ejecutar script
        success, _ = run_command([python_cmd, "create_superuser.py"], cwd=backend_path)
        
        # Eliminar archivo temporal
        script_path.unlink()
        
        if success:
            print("🔑 Credenciales del administrador:")
            print("   Email: admin@athcyl.com")
            print("   Usuario: admin")
            print("   Contraseña: admin123")
            return True
        else:
            print("❌ Error creando superusuario")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        if script_path.exists():
            script_path.unlink()
        return False

def create_start_script():
    """Crea un script para iniciar el servidor fácilmente"""
    print("📝 Creando script de inicio...")
    
    script_content = '''@echo off
echo.
echo ========================================
echo   INICIANDO ATHCYL BACKEND
echo ========================================
echo.
cd backend
echo Activando entorno virtual...
call ..\\venv\\Scripts\\activate.bat
echo.
echo Iniciando servidor Django...
echo Abre tu navegador en: http://localhost:8000/admin/
echo.
python manage.py runserver 0.0.0.0:8000
echo.
pause
'''
    
    script_name = "start_server.bat"
    
    with open(script_name, 'w') as f:
        f.write(script_content)
    
    print(f"✅ Script de inicio creado: {script_name}")

def show_postgresql_manual_setup():
    """Muestra instrucciones para configurar PostgreSQL manualmente"""
    print("\n" + "="*60)
    print("📖 CONFIGURACIÓN MANUAL DE BASE DE DATOS")
    print("="*60)
    print("\n📝 Después de instalar PostgreSQL, ejecuta estos comandos:")
    print("\n1. Abre pgAdmin o la consola de PostgreSQL")
    print("2. Conéctate como usuario 'postgres'")
    print("3. Ejecuta estos comandos SQL:")
    print("""
    CREATE USER athcyl_user WITH PASSWORD 'athcyl_user';
    CREATE DATABASE athcyl_db OWNER athcyl_user;
    GRANT ALL PRIVILEGES ON DATABASE athcyl_db TO athcyl_user;
    """)
    print("\n4. Luego ejecuta las migraciones:")
    print("   cd backend")
    print("   python manage.py makemigrations")
    print("   python manage.py migrate")
    print("   python manage.py createsuperuser")

def main():
    """Función principal de instalación"""
    print_header("INSTALACIÓN DE ATHCYL BACKEND - WINDOWS (Python 3.13 Optimizado)")
    print("Este script configurará automáticamente el backend de AthCyl")
    print("Detectará problemas con Python 3.13 y aplicará soluciones automáticamente")
    print("Detectará y configurará PostgreSQL automáticamente")
    
    input("\nPresiona Enter para continuar...")
    
    # Verificar directorio
    if not Path("backend").exists():
        print("❌ Error: Directorio 'backend' no encontrado")
        print("   Ejecuta este script desde el directorio raíz del proyecto")
        return False
    
    # Paso 1: Verificar Python
    print_step(1, "Verificando requisitos del sistema")
    python_version_check = check_python_version()
    if not python_version_check:
        return False
    
    # Paso 2: Verificar PostgreSQL
    psql_result = check_postgresql_windows()
    
    if not psql_result:
        install_postgresql_guide()
        choice = ask_continue_without_postgresql()
        
        if choice == '1':
            print("\n✅ Ve e instala PostgreSQL, luego ejecuta este script de nuevo.")
            return False
        elif choice == '4':
            print("\n✅ Instalación cancelada. Instala PostgreSQL primero.")
            return False
        elif choice == '3':
            print("\n⚠️ Usando SQLite (solo para pruebas)")
            psql_result = "sqlite"
        else:  # choice == '2'
            print("\n⚠️ Continuando sin configurar PostgreSQL")
            psql_result = "manual"
    
    # Paso 3: Configurar entorno virtual
    print_step(3, "Configurando entorno virtual")
    if not setup_virtual_environment():
        return False
    
    python_cmd, pip_cmd = activate_virtual_environment()
    if not python_cmd:
        return False
    
    # Paso 4: Instalar dependencias
    print_step(4, "Instalando dependencias")
    if not install_dependencies(pip_cmd, python_version_check):
        return False
    
    # Paso 5: Crear archivo .env
    print_step(5, "Creando configuración")
    create_env_file()
    
    # Paso 6: Configurar base de datos
    if psql_result not in ["manual", "sqlite"]:
        print_step(6, "Configurando base de datos")
        if not setup_database_with_psql(psql_result):
            print("\n⚠️ Error configurando base de datos, pero continuando...")
            show_postgresql_manual_setup()
    else:
        if psql_result == "manual":
            show_postgresql_manual_setup()
    
    # Paso 7: Ejecutar migraciones
    print_step(7, "Ejecutando migraciones")
    if not run_migrations(python_cmd):
        print("⚠️ Error en migraciones, revisa la configuración de PostgreSQL")
    
    # Paso 8: Crear superusuario
    print_step(8, "Creando superusuario")
    if not create_superuser(python_cmd):
        print("⚠️ Error creando superusuario, puedes crearlo manualmente después")
    
    # Paso 9: Crear scripts de utilidad
    print_step(9, "Creando scripts de utilidad")
    create_start_script()
    
    # Instalación completada
    print_header("INSTALACIÓN COMPLETADA")
    print("🎉 ¡AthCyl Backend ha sido configurado!")
    
    if python_version_check == "python313":
        print("\n✅ Se aplicaron optimizaciones especiales para Python 3.13")
    
    if psql_result in ["manual", "sqlite"]:
        print("\n⚠️ IMPORTANTE: Debes configurar PostgreSQL manualmente")
        print("   Revisa las instrucciones mostradas anteriormente")
    
    print("\n📋 Próximos pasos:")
    print("1. Si PostgreSQL está configurado, inicia el servidor:")
    print("   start_server.bat")
    print("2. Abre tu navegador en: http://localhost:8000/admin/")
    print("3. Inicia sesión con:")
    print("   Email: admin@athcyl.com")
    print("   Usuario: admin")
    print("   Contraseña: admin123")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("\n✅ Instalación completada!")
        else:
            print("\n❌ La instalación fue cancelada o falló.")
        input("\nPresiona Enter para salir...")
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️ Instalación cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Error inesperado durante la instalación: {e}")
        import traceback
        traceback.print_exc()
        input("\nPresiona Enter para salir...")
        sys.exit(1)