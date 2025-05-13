import os
import sys
import subprocess
import django
from django.core.management import call_command

# Configurar entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'athcyl.settings')
django.setup()

# Definir el comando para ejecutar el servidor
def run_https_server():
    # Crear directorio para certificados si no existe
    cert_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'certs')
    cert_file = os.path.join(cert_dir, 'server.crt')
    key_file = os.path.join(cert_dir, 'server.key')
    
    if not os.path.exists(cert_dir):
        os.makedirs(cert_dir)
    
    # Generar certificados autofirmados si no existen
    if not os.path.exists(cert_file) or not os.path.exists(key_file):
        print("Generando certificados SSL autofirmados...")
        try:
            from OpenSSL import crypto
            
            # Crear una clave privada
            k = crypto.PKey()
            k.generate_key(crypto.TYPE_RSA, 2048)
            
            # Crear un certificado autofirmado
            cert = crypto.X509()
            cert.get_subject().C = "ES"
            cert.get_subject().ST = "Barcelona"
            cert.get_subject().L = "Barcelona"
            cert.get_subject().O = "AthCyl"
            cert.get_subject().OU = "Development"
            cert.get_subject().CN = "localhost"
            cert.set_serial_number(1000)
            cert.gmtime_adj_notBefore(0)
            cert.gmtime_adj_notAfter(365*24*60*60)  # Válido por un año
            cert.set_issuer(cert.get_subject())
            cert.set_pubkey(k)
            cert.sign(k, 'sha256')
            
            # Guardar la clave privada y el certificado
            with open(key_file, "wb") as f:
                f.write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))
            
            with open(cert_file, "wb") as f:
                f.write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))
            
            print(f"Certificados generados en {cert_dir}")
        except Exception as e:
            print(f"Error al generar certificados: {e}")
            return False
    
    # Ejecutar el servidor con HTTPS
    try:
        print("Iniciando servidor HTTPS en https://127.0.0.1:8000/")
        # Usar runserver_plus de Django Extensions si está disponible
        try:
            import django_extensions
            print("Usando django_extensions para servidor HTTPS")
            call_command('runserver_plus', '--cert-file', cert_file, '--key-file', key_file, '0.0.0.0:8000')
        except ImportError:
            # Si no está disponible, usar el servidor SSL personalizado
            print("Usando servidor SSL personalizado")
            import ssl
            from django.core.management.commands.runserver import Command
            
            # Modificar la clase Command para usar SSL
            original_inner_run = Command.inner_run
            
            def inner_run_ssl(self, *args, **options):
                # Configurar SSL
                import socket
                from django.core.servers.basehttp import WSGIServer
                
                # Guardar la clase original
                original_socket = WSGIServer.get_request
                
                # Crear contexto SSL
                context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
                context.load_cert_chain(certfile=cert_file, keyfile=key_file)
                
                # Sobreescribir el método get_request
                def get_request_ssl(self):
                    socket, addr = original_socket(self)
                    return context.wrap_socket(socket, server_side=True), addr
                
                # Aplicar el método sobreescrito
                WSGIServer.get_request = get_request_ssl
                
                # Ejecutar el servidor
                original_inner_run(self, *args, **options)
                
                # Restaurar el método original
                WSGIServer.get_request = original_socket
            
            # Reemplazar el método inner_run
            Command.inner_run = inner_run_ssl
            
            # Ejecutar el servidor
            call_command('runserver', '0.0.0.0:8000')
            
    except Exception as e:
        print(f"Error al iniciar el servidor HTTPS: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == '__main__':
    # Verificar dependencias
    try:
        from OpenSSL import crypto
    except ImportError:
        print("Instalando dependencias necesarias...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyOpenSSL"])
    
    # Intentar instalar django-extensions si no está disponible
    try:
        import django_extensions
    except ImportError:
        print("Instalando django-extensions...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "django-extensions"])
        # Actualizar settings.py para incluir django_extensions
        from django.conf import settings
        if 'django_extensions' not in settings.INSTALLED_APPS:
            print("Agregando django_extensions a INSTALLED_APPS...")
            # No podemos modificar settings directamente, así que instruimos al usuario
            print("Por favor, agrega 'django_extensions' a INSTALLED_APPS en settings.py")
    
    # Ejecutar el servidor HTTPS
    run_https_server()
