"""
Comando para procesar archivos de entrenamientos que no se procesaron automáticamente.

Uso:
python manage.py process_training_files
python manage.py process_training_files --training-id 4
python manage.py process_training_files --all
python manage.py process_training_files --all --force
"""

from django.core.management.base import BaseCommand, CommandError
from trainings.models import Training, TrackPoint
from trainings.serializers import TrainingSerializer
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('trainings')

class Command(BaseCommand):
    help = 'Procesa archivos de entrenamientos que no se procesaron automáticamente'

    def add_arguments(self, parser):
        parser.add_argument(
            '--training-id',
            type=int,
            help='Procesar solo un entrenamiento específico por ID',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Procesar todos los entrenamientos con archivos sin procesar',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Forzar reprocesamiento incluso si ya está marcado como procesado',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Mostrar información detallada del procesamiento',
        )

    def handle(self, *args, **options):
        self.verbose = options['verbose']
        
        self.stdout.write(
            self.style.SUCCESS('🚀 Iniciando procesamiento de archivos de entrenamientos...')
        )

        # Determinar qué entrenamientos procesar
        if options['training_id']:
            # Procesar un entrenamiento específico
            try:
                training = Training.objects.get(id=options['training_id'])
                entrenamientos = [training]
                self.stdout.write(f"📋 Procesando entrenamiento específico ID: {training.id}")
            except Training.DoesNotExist:
                raise CommandError(f'El entrenamiento con ID {options["training_id"]} no existe')
                
        elif options['all']:
            # Procesar todos los entrenamientos con archivos
            if options['force']:
                entrenamientos = Training.objects.filter(gpx_file__isnull=False).order_by('id')
                self.stdout.write("📋 Procesando TODOS los entrenamientos con archivos (forzado)")
            else:
                entrenamientos = Training.objects.filter(
                    gpx_file__isnull=False,
                    file_processed=False
                ).order_by('id')
                self.stdout.write("📋 Procesando entrenamientos con archivos sin procesar")
        else:
            # Por defecto: entrenamientos con archivos sin procesar
            entrenamientos = Training.objects.filter(
                gpx_file__isnull=False,
                file_processed=False
            ).order_by('id')
            self.stdout.write("📋 Procesando entrenamientos con archivos sin procesar (por defecto)")

        if not entrenamientos:
            self.stdout.write(
                self.style.WARNING('⚠️ No se encontraron entrenamientos para procesar')
            )
            self._show_status()
            return

        self.stdout.write(f"📊 Total de entrenamientos a procesar: {len(entrenamientos)}")
        
        # Mostrar lista de entrenamientos a procesar
        if self.verbose:
            self.stdout.write("\n📄 Lista de entrenamientos:")
            for t in entrenamientos:
                self.stdout.write(f"   • ID {t.id}: {t.title} ({t.gpx_file.name if t.gpx_file else 'Sin archivo'})")
        
        # Procesar cada entrenamiento
        exitosos = 0
        con_errores = 0
        
        for training in entrenamientos:
            self.stdout.write(f"\n🔄 Procesando: ID {training.id} - {training.title}")
            
            try:
                # Verificar que el archivo existe
                if not training.gpx_file:
                    self.stdout.write(
                        self.style.WARNING(f"   ⚠️ No hay archivo asociado")
                    )
                    continue

                # Verificar que el archivo es accesible
                try:
                    training.gpx_file.size
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"   ❌ No se puede acceder al archivo: {e}")
                    )
                    training.processing_error = f"Archivo no accesible: {e}"
                    training.file_processed = True
                    training.save()
                    con_errores += 1
                    continue
                
                # Determinar el tipo de archivo
                filename = training.gpx_file.name.lower()
                file_size = training.gpx_file.size
                
                self.stdout.write(f"   📁 Archivo: {training.gpx_file.name} ({file_size} bytes)")
                
                if filename.endswith('.gpx'):
                    self.stdout.write(f"   📄 Procesando archivo GPX")
                    self._process_gpx(training)
                elif filename.endswith('.tcx'):
                    self.stdout.write(f"   📄 Procesando archivo TCX")
                    self._process_tcx(training)
                elif filename.endswith('.fit'):
                    self.stdout.write(f"   📄 Procesando archivo FIT")
                    self._process_fit(training)
                else:
                    self.stdout.write(
                        self.style.WARNING(f"   ⚠️ Formato no soportado: {filename}")
                    )
                    training.processing_error = f"Formato no soportado: {filename}"
                    training.file_processed = True
                    training.save()
                    con_errores += 1
                    continue
                
                # Marcar como procesado exitosamente
                training.file_processed = True
                training.processing_error = None  # Limpiar errores previos
                training.save()
                
                # Contar puntos creados
                puntos_count = TrackPoint.objects.filter(training=training).count()
                
                # Mostrar datos extraídos
                data_info = []
                if training.distance:
                    data_info.append(f"Distancia: {training.distance:.2f} km")
                if training.duration:
                    data_info.append(f"Duración: {training.duration}")
                if training.avg_heart_rate:
                    data_info.append(f"FC promedio: {training.avg_heart_rate:.0f} bpm")
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f"   ✅ Procesado exitosamente. Puntos de ruta: {puntos_count}"
                    )
                )
                
                if data_info and self.verbose:
                    self.stdout.write(f"      📊 Datos extraídos: {', '.join(data_info)}")
                
                exitosos += 1
                
            except Exception as e:
                # Manejar errores
                error_msg = str(e)
                training.processing_error = error_msg
                training.file_processed = True  # Marcar como procesado (con error)
                training.save()
                
                self.stdout.write(
                    self.style.ERROR(f"   ❌ Error: {error_msg}")
                )
                
                if self.verbose:
                    import traceback
                    self.stdout.write(f"      🔍 Traceback: {traceback.format_exc()}")
                
                con_errores += 1

        # Resumen final
        self.stdout.write(f"\n📊 Resumen del procesamiento:")
        self.stdout.write(
            self.style.SUCCESS(f"   ✅ Exitosos: {exitosos}")
        )
        self.stdout.write(
            self.style.ERROR(f"   ❌ Con errores: {con_errores}")
        )
        
        # Mostrar estadísticas finales
        total_puntos = TrackPoint.objects.count()
        total_procesados = Training.objects.filter(file_processed=True).count()
        
        self.stdout.write(f"\n📈 Estadísticas globales:")
        self.stdout.write(f"   📍 Total puntos de ruta en BD: {total_puntos}")
        self.stdout.write(f"   ✅ Total entrenamientos procesados: {total_procesados}")
        
        if exitosos > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n🎉 ¡Procesamiento completado! {exitosos} archivos procesados correctamente"
                )
            )
        
        if con_errores > 0:
            self.stdout.write(
                self.style.WARNING(
                    f"\n⚠️ {con_errores} archivos tuvieron errores. "
                    "Revisa el campo 'processing_error' en el admin"
                )
            )

    def _show_status(self):
        """Muestra el estado actual de los entrenamientos"""
        total = Training.objects.count()
        con_archivos = Training.objects.filter(gpx_file__isnull=False).count()
        procesados = Training.objects.filter(file_processed=True).count()
        sin_procesar = Training.objects.filter(gpx_file__isnull=False, file_processed=False).count()
        con_errores = Training.objects.filter(processing_error__isnull=False).count()
        
        self.stdout.write(f"\n📊 Estado actual:")
        self.stdout.write(f"   📁 Total entrenamientos: {total}")
        self.stdout.write(f"   📎 Con archivos: {con_archivos}")
        self.stdout.write(f"   ✅ Procesados: {procesados}")
        self.stdout.write(f"   ⏳ Sin procesar: {sin_procesar}")
        self.stdout.write(f"   ❌ Con errores: {con_errores}")

    def _process_gpx(self, training):
        """Procesa un archivo GPX"""
        serializer = TrainingSerializer()
        
        with training.gpx_file.open('rb') as file:
            serializer.process_gpx_file_improved(training, file)

    def _process_tcx(self, training):
        """Procesa un archivo TCX"""
        serializer = TrainingSerializer()
        
        with training.gpx_file.open('rb') as file:
            serializer.process_tcx_file_improved(training, file)

    def _process_fit(self, training):
        """Procesa un archivo FIT"""
        serializer = TrainingSerializer()
        
        with training.gpx_file.open('rb') as file:
            serializer.process_fit_file_improved(training, file)