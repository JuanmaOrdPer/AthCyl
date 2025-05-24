import time
from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError

class Command(BaseCommand):
    """Comando de Django que espera a que la base de datos esté disponible."""
    
    def handle(self, *args, **options):
        """Espera a que la base de datos esté disponible."""
        self.stdout.write('Esperando por la base de datos...')
        db_conn = None
        max_retries = 30
        retry_delay = 2  # segundos
        
        for i in range(max_retries):
            try:
                # Intentar establecer conexión con la base de datos
                db_conn = connections['default']
                db_conn.ensure_connection()
                self.stdout.write(self.style.SUCCESS('Base de datos disponible!'))
                return
            except OperationalError as e:
                if i < max_retries - 1:  # No mostrar el mensaje en el último intento
                    self.stdout.write(f'Intento {i + 1}/{max_retries} - La base de datos no está disponible, esperando {retry_delay} segundos...')
                    time.sleep(retry_delay)
                else:
                    self.stdout.write(self.style.ERROR('No se pudo conectar a la base de datos después de varios intentos.'))
                    self.stdout.write(self.style.ERROR(f'Error: {e}'))
                    raise
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error inesperado: {e}'))
                raise
