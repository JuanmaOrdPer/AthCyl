"""
Serializadores mejorados para el modelo de Training con procesamiento robusto de archivos.

Este módulo incluye procesamiento especializado para:
- Archivos GPX usando gpxpy
- Archivos TCX usando python-tcxparser
- Archivos FIT usando fitparse
- Mejor manejo de errores y logging

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

from rest_framework import serializers
from .models import Training, TrackPoint, Goal
import gpxpy
import datetime
import logging
from django.utils import timezone
import pytz

# Nuevas importaciones para mejor procesamiento
try:
    import tcxparser
    TCX_AVAILABLE = True
except ImportError:
    TCX_AVAILABLE = False
    
try:
    import fitparse
    FIT_AVAILABLE = True
except ImportError:
    FIT_AVAILABLE = False

# Configuración de logging
logger = logging.getLogger('trainings')

class TrackPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackPoint
        fields = ['id', 'latitude', 'longitude', 'elevation', 'time', 'heart_rate', 'speed', 'cadence', 'temperature']
        read_only_fields = ['id']

class TrainingSerializer(serializers.ModelSerializer):
    track_points = TrackPointSerializer(many=True, read_only=True)
    gpx_file = serializers.FileField(required=False, write_only=True)
    
    class Meta:
        model = Training
        fields = ['id', 'user', 'title', 'description', 'activity_type', 'gpx_file',
                'date', 'start_time', 'duration', 'distance', 'avg_speed', 'max_speed',
                'avg_heart_rate', 'max_heart_rate', 'elevation_gain', 'calories',
                'avg_cadence', 'max_cadence', 'avg_temperature', 'min_temperature', 'max_temperature',
                'file_processed', 'processing_error', 'created_at', 'updated_at', 'track_points']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user', 'file_processed', 'processing_error']
    
    def validate(self, data):
        """
        Valida que si no hay archivo, se proporcionen los campos requeridos
        """
        uploaded_file = data.get('gpx_file')
        
        # Si no hay archivo, validar que los campos requeridos estén presentes
        if not uploaded_file:
            required_fields = {
                'date': 'fecha',
                'start_time': 'hora de inicio',
                'activity_type': 'tipo de actividad'
            }
            missing_fields = []
            
            for field, field_name in required_fields.items():
                if field not in data or data[field] is None:
                    missing_fields.append(field_name)
            
            if missing_fields:
                raise serializers.ValidationError({
                    'detail': f'Los siguientes campos son requeridos cuando no se sube un archivo: {", ".join(missing_fields)}'
                })
        
        return data
    
    def create(self, validated_data):
        """
        Crea un nuevo entrenamiento, ya sea manualmente o a partir de un archivo
        """
        uploaded_file = validated_data.pop('gpx_file', None)
        
        # Crear el entrenamiento primero
        training = Training.objects.create(**validated_data)
        logger.info(f"Entrenamiento creado con ID: {training.id}")
        
        # Si hay archivo, procesarlo después
        if uploaded_file:
            try:
                # Guardar el archivo
                training.gpx_file = uploaded_file
                training.save()
                
                # Procesar el archivo según su tipo
                filename = uploaded_file.name.lower()
                
                if filename.endswith('.gpx'):
                    logger.info(f"Procesando archivo GPX: {filename}")
                    self.process_gpx_file_improved(training, uploaded_file)
                elif filename.endswith('.tcx'):
                    logger.info(f"Procesando archivo TCX: {filename}")
                    self.process_tcx_file_improved(training, uploaded_file)
                elif filename.endswith('.fit'):
                    logger.info(f"Procesando archivo FIT: {filename}")
                    self.process_fit_file_improved(training, uploaded_file)
                else:
                    training.processing_error = "Formato de archivo no compatible. Solo se admiten archivos GPX, TCX y FIT."
                    training.save()
                    logger.warning(f"Formato no compatible: {filename}")
                
                # Marcar como procesado
                training.file_processed = True
                training.save()
                
            except Exception as e:
                error_msg = f"Error al procesar el archivo: {str(e)}"
                training.processing_error = error_msg
                training.file_processed = True
                training.save()
                logger.error(f"Error al procesar archivo para entrenamiento {training.id}: {e}", exc_info=True)
        
        else:
            # Entrenamiento manual
            if not training.date or not training.start_time:
                training.processing_error = "Faltan datos obligatorios (fecha y hora de inicio)"
                training.save()
            else:
                training.file_processed = True
                training.save()
        
        return training
    
    def process_gpx_file_improved(self, training, gpx_file):
        """
        Procesa un archivo GPX usando gpxpy (mejorado)
        """
        logger.info(f"Iniciando procesamiento mejorado de archivo GPX: {gpx_file.name}")
        
        try:
            # Leer el archivo GPX
            gpx_file.seek(0)
            gpx_content = gpx_file.read()
            
            # Intentar decodificar con diferentes encodings
            for encoding in ['utf-8', 'latin-1', 'iso-8859-1']:
                try:
                    gpx_text = gpx_content.decode(encoding)
                    break
                except UnicodeDecodeError:
                    continue
            else:
                raise ValueError("No se pudo decodificar el archivo GPX")
            
            # Parsear con gpxpy
            gpx = gpxpy.parse(gpx_text)
            
            # Variables para estadísticas
            track_points = []
            total_distance = 0
            speeds = []
            heart_rates = []
            cadences = []
            temperatures = []
            elevations = []
            start_time = None
            end_time = None
            
            # Procesar tracks
            for track in gpx.tracks:
                # Usar nombre del track si existe
                if track.name and not training.title:
                    training.title = track.name[:100]
                
                for segment in track.segments:
                    prev_point = None
                    
                    for point in segment.points:
                        # Tiempo
                        if start_time is None:
                            start_time = point.time
                        end_time = point.time
                        
                        # Calcular distancia incremental
                        if prev_point and point.time:
                            distance_2d = point.distance_2d(prev_point)
                            if distance_2d:
                                total_distance += distance_2d
                                
                                # Calcular velocidad
                                time_diff = (point.time - prev_point.time).total_seconds()
                                if time_diff > 0:
                                    speed_ms = distance_2d / time_diff
                                    speed_kmh = speed_ms * 3.6
                                    speeds.append(speed_kmh)
                        
                        # Datos del punto
                        elevation = point.elevation
                        if elevation:
                            elevations.append(elevation)
                        
                        # Extraer extensiones (heart rate, cadence, temperature)
                        hr, cadence, temp = self._extract_gpx_extensions(point)
                        
                        if hr:
                            heart_rates.append(hr)
                        if cadence:
                            cadences.append(cadence)
                        if temp:
                            temperatures.append(temp)
                        
                        # Crear punto de track
                        track_point = TrackPoint(
                            training=training,
                            latitude=point.latitude,
                            longitude=point.longitude,
                            elevation=elevation,
                            time=point.time,
                            heart_rate=hr,
                            speed=speeds[-1] if speeds else None,
                            cadence=cadence,
                            temperature=temp
                        )
                        track_points.append(track_point)
                        
                        prev_point = point
            
            # Guardar puntos en lotes
            if track_points:
                TrackPoint.objects.bulk_create(track_points, batch_size=1000)
                logger.info(f"Guardados {len(track_points)} puntos de ruta GPX")
            
            # Actualizar estadísticas del entrenamiento
            self._update_training_stats(training, start_time, end_time, total_distance/1000, 
                                      speeds, heart_rates, elevations, cadences, temperatures)
            
            logger.info(f"Procesamiento GPX completado para entrenamiento {training.id}")
            
        except Exception as e:
            error_msg = f"Error procesando GPX: {str(e)}"
            training.processing_error = error_msg
            training.save()
            logger.error(f"Error en process_gpx_file_improved: {e}", exc_info=True)
            raise
    
    def process_tcx_file_improved(self, training, tcx_file):
        """
        Procesa un archivo TCX usando python-tcxparser (mucho mejor que BeautifulSoup)
        """
        if not TCX_AVAILABLE:
            raise ImportError("python-tcxparser no está instalado. Ejecuta: pip install python-tcxparser")
        
        logger.info(f"Iniciando procesamiento mejorado de archivo TCX: {tcx_file.name}")
        
        try:
            # Crear parser TCX
            tcx_file.seek(0)
            
            # Crear archivo temporal para tcxparser
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.tcx', delete=False) as tmp_file:
                tcx_file.seek(0)
                tmp_file.write(tcx_file.read())
                tmp_file.flush()
                
                # Parser con tcxparser
                tcx = tcxparser.TCXParser(tmp_file.name)
                
                # Extraer datos básicos
                if tcx.completed_at:
                    completed_dt = datetime.datetime.fromisoformat(tcx.completed_at.replace('Z', '+00:00'))
                    if completed_dt.tzinfo:
                        completed_dt = completed_dt.replace(tzinfo=None)
                    training.date = completed_dt.date()
                    training.start_time = (completed_dt - datetime.timedelta(seconds=tcx.duration)).time()
                
                if tcx.duration:
                    training.duration = datetime.timedelta(seconds=tcx.duration)
                
                if tcx.distance:
                    training.distance = tcx.distance / 1000  # metros a km
                
                if tcx.calories:
                    training.calories = tcx.calories
                
                # Actividad
                if tcx.activity_type:
                    activity_map = {
                        'running': 'running',
                        'biking': 'cycling',
                        'cycling': 'cycling',
                        'swimming': 'swimming',
                        'walking': 'walking',
                        'hiking': 'hiking'
                    }
                    training.activity_type = activity_map.get(tcx.activity_type.lower(), 'other')
                
                # Velocidades
                if training.distance and training.duration:
                    hours = training.duration.total_seconds() / 3600
                    training.avg_speed = training.distance / hours
                
                # Procesar trackpoints
                track_points = []
                heart_rates = []
                elevations = []
                
                for point_data in tcx.trackpoints:
                    # Tiempo
                    time_obj = point_data.get('time')
                    if isinstance(time_obj, str):
                        time_obj = datetime.datetime.fromisoformat(time_obj.replace('Z', '+00:00'))
                        if time_obj.tzinfo:
                            time_obj = time_obj.replace(tzinfo=None)
                    
                    # Coordenadas
                    lat = point_data.get('latitude')
                    lon = point_data.get('longitude')
                    
                    if lat and lon and time_obj:
                        # Elevación
                        elevation = point_data.get('elevation')
                        if elevation:
                            elevations.append(elevation)
                        
                        # Heart rate
                        hr = point_data.get('hr')
                        if hr:
                            heart_rates.append(hr)
                        
                        # Crear punto
                        track_point = TrackPoint(
                            training=training,
                            latitude=lat,
                            longitude=lon,
                            elevation=elevation,
                            time=time_obj,
                            heart_rate=hr
                        )
                        track_points.append(track_point)
                
                # Guardar puntos
                if track_points:
                    TrackPoint.objects.bulk_create(track_points, batch_size=1000)
                    logger.info(f"Guardados {len(track_points)} puntos de ruta TCX")
                
                # Estadísticas de heart rate
                if heart_rates:
                    training.avg_heart_rate = sum(heart_rates) / len(heart_rates)
                    training.max_heart_rate = max(heart_rates)
                
                # Ganancia de elevación
                if elevations and len(elevations) > 1:
                    elevation_gain = 0
                    for i in range(1, len(elevations)):
                        if elevations[i] > elevations[i-1]:
                            elevation_gain += elevations[i] - elevations[i-1]
                    training.elevation_gain = elevation_gain
                
                # Limpiar archivo temporal
                import os
                os.unlink(tmp_file.name)
                
                training.save()
                logger.info(f"Procesamiento TCX completado para entrenamiento {training.id}")
            
        except Exception as e:
            error_msg = f"Error procesando TCX: {str(e)}"
            training.processing_error = error_msg
            training.save()
            logger.error(f"Error en process_tcx_file_improved: {e}", exc_info=True)
            raise
    
    def process_fit_file_improved(self, training, fit_file):
        """
        Procesa un archivo FIT usando fitparse
        """
        if not FIT_AVAILABLE:
            raise ImportError("fitparse no está instalado. Ejecuta: pip install fitparse")
        
        logger.info(f"Iniciando procesamiento de archivo FIT: {fit_file.name}")
        
        try:
            # Leer archivo FIT
            fit_file.seek(0)
            fitfile = fitparse.FitFile(fit_file)
            
            # Variables para estadísticas
            track_points = []
            heart_rates = []
            speeds = []
            cadences = []
            temperatures = []
            elevations = []
            distances = []
            start_time = None
            end_time = None
            
            # Procesar mensajes del archivo FIT
            for record in fitfile.get_messages('record'):
                record_data = {}
                
                # Extraer todos los campos del registro
                for field in record:
                    if field.name in ['timestamp', 'position_lat', 'position_long', 'altitude', 
                                     'heart_rate', 'speed', 'cadence', 'temperature', 'distance']:
                        record_data[field.name] = field.value
                
                # Procesar si tenemos datos de posición
                if 'position_lat' in record_data and 'position_long' in record_data:
                    # Convertir coordenadas (FIT usa semicircles)
                    lat = record_data['position_lat'] * (180 / 2**31)
                    lon = record_data['position_long'] * (180 / 2**31)
                    
                    # Tiempo
                    timestamp = record_data.get('timestamp')
                    if timestamp:
                        if start_time is None:
                            start_time = timestamp
                        end_time = timestamp
                    
                    # Otros datos
                    elevation = record_data.get('altitude')
                    hr = record_data.get('heart_rate')
                    speed = record_data.get('speed')
                    cadence = record_data.get('cadence')
                    temp = record_data.get('temperature')
                    distance = record_data.get('distance')
                    
                    # Recopilar para estadísticas
                    if elevation:
                        elevations.append(elevation)
                    if hr:
                        heart_rates.append(hr)
                    if speed:
                        speed_kmh = speed * 3.6  # m/s a km/h
                        speeds.append(speed_kmh)
                    if cadence:
                        cadences.append(cadence)
                    if temp:
                        temperatures.append(temp)
                    if distance:
                        distances.append(distance)
                    
                    # Crear punto de track
                    track_point = TrackPoint(
                        training=training,
                        latitude=lat,
                        longitude=lon,
                        elevation=elevation,
                        time=timestamp,
                        heart_rate=hr,
                        speed=speed_kmh if speed else None,
                        cadence=cadence,
                        temperature=temp
                    )
                    track_points.append(track_point)
            
            # Procesar información de sesión
            for session in fitfile.get_messages('session'):
                for field in session:
                    if field.name == 'start_time' and field.value:
                        training.date = field.value.date()
                        training.start_time = field.value.time()
                    elif field.name == 'total_elapsed_time' and field.value:
                        training.duration = datetime.timedelta(seconds=field.value)
                    elif field.name == 'total_distance' and field.value:
                        training.distance = field.value / 1000  # metros a km
                    elif field.name == 'total_calories' and field.value:
                        training.calories = field.value
                    elif field.name == 'avg_speed' and field.value:
                        training.avg_speed = field.value * 3.6  # m/s a km/h
                    elif field.name == 'max_speed' and field.value:
                        training.max_speed = field.value * 3.6  # m/s a km/h
                    elif field.name == 'avg_heart_rate' and field.value:
                        training.avg_heart_rate = field.value
                    elif field.name == 'max_heart_rate' and field.value:
                        training.max_heart_rate = field.value
                    elif field.name == 'total_ascent' and field.value:
                        training.elevation_gain = field.value
                    elif field.name == 'sport' and field.value:
                        # Mapear deportes FIT a nuestros tipos
                        sport_map = {
                            'running': 'running',
                            'cycling': 'cycling',
                            'swimming': 'swimming',
                            'walking': 'walking',
                            'hiking': 'hiking'
                        }
                        training.activity_type = sport_map.get(field.value.lower(), 'other')
            
            # Guardar puntos de track
            if track_points:
                TrackPoint.objects.bulk_create(track_points, batch_size=1000)
                logger.info(f"Guardados {len(track_points)} puntos de ruta FIT")
            
            # Calcular estadísticas si no están en la sesión
            if cadences:
                training.avg_cadence = sum(cadences) / len(cadences)
                training.max_cadence = max(cadences)
            
            if temperatures:
                training.avg_temperature = sum(temperatures) / len(temperatures)
                training.min_temperature = min(temperatures)
                training.max_temperature = max(temperatures)
            
            training.save()
            logger.info(f"Procesamiento FIT completado para entrenamiento {training.id}")
            
        except Exception as e:
            error_msg = f"Error procesando FIT: {str(e)}"
            training.processing_error = error_msg
            training.save()
            logger.error(f"Error en process_fit_file_improved: {e}", exc_info=True)
            raise
    
    def _extract_gpx_extensions(self, point):
        """
        Extrae datos de extensiones GPX (heart rate, cadence, temperature)
        """
        hr = None
        cadence = None
        temp = None
        
        if hasattr(point, 'extensions') and point.extensions:
            for extension in point.extensions:
                # Buscar TrackPointExtension
                for child in extension:
                    if 'TrackPointExtension' in str(child.tag):
                        for data in child:
                            tag_lower = str(data.tag).lower()
                            if 'hr' in tag_lower and data.text:
                                try:
                                    hr = float(data.text)
                                except ValueError:
                                    pass
                            elif 'cad' in tag_lower and data.text:
                                try:
                                    cadence = float(data.text)
                                except ValueError:
                                    pass
                            elif 'temp' in tag_lower and data.text:
                                try:
                                    temp = float(data.text)
                                except ValueError:
                                    pass
        
        return hr, cadence, temp
    
    def _update_training_stats(self, training, start_time, end_time, distance_km, 
                             speeds, heart_rates, elevations, cadences, temperatures):
        """
        Actualiza las estadísticas del entrenamiento
        """
        try:
            # Fechas y tiempo
            if start_time:
                training.date = start_time.date()
                training.start_time = start_time.time()
                
                if end_time:
                    training.duration = end_time - start_time
            
            # Distancia
            if distance_km > 0:
                training.distance = distance_km
            
            # Velocidades
            if speeds:
                training.avg_speed = sum(speeds) / len(speeds)
                training.max_speed = max(speeds)
            elif training.distance and training.duration:
                hours = training.duration.total_seconds() / 3600
                if hours > 0:
                    training.avg_speed = training.distance / hours
            
            # Heart rate
            if heart_rates:
                training.avg_heart_rate = sum(heart_rates) / len(heart_rates)
                training.max_heart_rate = max(heart_rates)
            
            # Elevación
            if elevations and len(elevations) > 1:
                elevation_gain = 0
                for i in range(1, len(elevations)):
                    if elevations[i] > elevations[i-1]:
                        elevation_gain += elevations[i] - elevations[i-1]
                training.elevation_gain = elevation_gain
            
            # Cadencia
            if cadences:
                training.avg_cadence = sum(cadences) / len(cadences)
                training.max_cadence = max(cadences)
            
            # Temperatura
            if temperatures:
                training.avg_temperature = sum(temperatures) / len(temperatures)
                training.min_temperature = min(temperatures)
                training.max_temperature = max(temperatures)
            
            # Estimación de calorías si falta
            if not training.calories and training.duration and hasattr(training.user, 'weight') and training.user.weight:
                met_values = {
                    'running': 8.0,
                    'cycling': 6.0,
                    'swimming': 7.0,
                    'walking': 3.5,
                    'hiking': 5.0,
                    'other': 5.0
                }
                
                met = met_values.get(training.activity_type, 5.0)
                duration_hours = training.duration.total_seconds() / 3600
                training.calories = int(met * training.user.weight * duration_hours)
            
            training.save()
            
        except Exception as e:
            logger.error(f"Error actualizando estadísticas: {e}")

class GoalSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    start_date = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d', 'iso-8601'])
    end_date = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d', 'iso-8601'], required=False, allow_null=True)
    
    class Meta:
        model = Goal
        fields = ['id', 'user', 'title', 'description', 'goal_type', 'target_value',
                'period', 'start_date', 'end_date', 'is_active', 'is_completed',
                'created_at', 'updated_at', 'progress']
        read_only_fields = ['id', 'created_at', 'updated_at', 'progress']
    
    def get_progress(self, obj):
        """Calcula el progreso actual hacia el objetivo"""
        
        # Definir el rango de fechas para el período
        today = datetime.date.today()
        
        if obj.period == 'daily':
            start_date = today
            end_date = today
        elif obj.period == 'weekly':
            start_date = today - datetime.timedelta(days=today.weekday())
            end_date = start_date + datetime.timedelta(days=6)
        elif obj.period == 'monthly':
            start_date = today.replace(day=1)
            if today.month == 12:
                end_date = today.replace(day=31)
            else:
                end_date = today.replace(month=today.month+1, day=1) - datetime.timedelta(days=1)
        elif obj.period == 'yearly':
            start_date = today.replace(month=1, day=1)
            end_date = today.replace(month=12, day=31)
        else:  # custom
            start_date = obj.start_date
            end_date = obj.end_date or today
        
        # Obtener entrenamientos en el período
        trainings = Training.objects.filter(
            user=obj.user,
            date__gte=start_date,
            date__lte=end_date,
            file_processed=True
        ).exclude(date__isnull=True)
        
        # Calcular valor actual según tipo de objetivo
        current_value = 0
        
        if obj.goal_type == 'distance':
            current_value = trainings.aggregate(
                total=models.Sum('distance')
            )['total'] or 0
        
        elif obj.goal_type == 'duration':
            total_seconds = 0
            for training in trainings:
                if training.duration:
                    total_seconds += training.duration.total_seconds()
            current_value = total_seconds / 60  # Convertir a minutos
        
        elif obj.goal_type == 'frequency':
            current_value = trainings.count()
        
        elif obj.goal_type == 'speed':
            speeds = [t.avg_speed for t in trainings if t.avg_speed]
            if speeds:
                current_value = sum(speeds) / len(speeds)
        
        # Calcular porcentaje de progreso
        if obj.target_value > 0:
            progress_percent = min(100, (current_value / obj.target_value) * 100)
        else:
            progress_percent = 0
        
        # Actualizar estado si se completó
        if current_value >= obj.target_value and not obj.is_completed:
            obj.is_completed = True
            obj.save()
        
        return {
            'current_value': round(current_value, 2),
            'target_value': obj.target_value,
            'percent': round(progress_percent, 1)
        }