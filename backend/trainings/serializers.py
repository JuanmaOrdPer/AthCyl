from rest_framework import serializers
from .models import Training, TrackPoint, Goal
import gpxpy
import datetime
from bs4 import BeautifulSoup
from django.utils import timezone
import logging

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
        Valida que si no hay archivo GPX/TCX, se proporcionen los campos requeridos
        """
        gpx_file = data.get('gpx_file')
        
        # Si no hay archivo, validar que los campos requeridos estén presentes
        if not gpx_file:
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
        archivo_subido = validated_data.pop('gpx_file', None)
        
        # Crear el entrenamiento primero (sin el archivo)
        training = Training.objects.create(**validated_data)
        logger.info(f"Entrenamiento creado con ID: {training.id}")
        
        # Si hay archivo, procesarlo después
        if archivo_subido:
            try:
                # Guardar el archivo
                training.gpx_file = archivo_subido
                training.save()
                
                # Procesar el archivo según su tipo
                nombre_archivo = archivo_subido.name.lower()
                
                if nombre_archivo.endswith('.gpx'):
                    logger.info(f"Procesando archivo GPX: {nombre_archivo}")
                    self.process_gpx_file(training, archivo_subido)
                elif nombre_archivo.endswith('.tcx'):
                    logger.info(f"Procesando archivo TCX: {nombre_archivo}")
                    self.process_tcx_file(training, archivo_subido)
                else:
                    # Archivo no compatible, pero no eliminamos el entrenamiento
                    training.processing_error = "Formato de archivo no compatible. Solo se admiten archivos GPX y TCX."
                    training.save()
                    logger.warning(f"Formato no compatible: {nombre_archivo}")
                
                # Marcar como procesado (exitoso o con error)
                training.file_processed = True
                training.save()
                
            except Exception as e:
                # Guardar el error pero no eliminar el entrenamiento
                error_msg = f"Error al procesar el archivo: {str(e)}"
                training.processing_error = error_msg
                training.file_processed = True
                training.save()
                logger.error(f"Error al procesar archivo para entrenamiento {training.id}: {e}", exc_info=True)
        
        else:
            # Entrenamiento manual, validar que tenga datos mínimos
            if not training.date or not training.start_time:
                training.processing_error = "Faltan datos obligatorios (fecha y hora de inicio)"
                training.save()
            else:
                training.file_processed = True
                training.save()
        
        return training
    
    def process_gpx_file(self, training, gpx_file):
        """
        Procesa un archivo GPX y extrae los datos relevantes.
        Versión mejorada con mejor manejo de errores.
        """
        logger.info(f"Iniciando procesamiento de archivo GPX: {gpx_file.name}")
        
        try:
            # Leer el archivo GPX
            gpx_file.seek(0)
            gpx_content = gpx_file.read().decode('utf-8')
            
            # Usar gpxpy para estructura básica
            gpx_file.seek(0)
            gpx = gpxpy.parse(gpx_content)
            
            # Usar BeautifulSoup para extensiones
            soup = BeautifulSoup(gpx_content, 'xml')
            
            # Variables para calcular métricas
            total_distance = 0
            speeds = []
            heart_rates = []
            cadences = []
            temperatures = []
            elevations = []
            start_time = None
            end_time = None
            
            # Procesar los puntos del track
            track_points = []
            trkpts_soup = soup.find_all('trkpt')
            point_index = 0
            
            for track in gpx.tracks:
                # Extraer nombre del track si existe
                if track.name and not training.title:
                    training.title = track.name[:100]  # Limitar longitud
                
                for segment in track.segments:
                    prev_point = None
                    
                    for point in segment.points:
                        # Guardar el primer punto como tiempo de inicio
                        if start_time is None:
                            start_time = point.time
                        
                        # Actualizar el tiempo final
                        end_time = point.time
                        
                        # Calcular distancia desde el punto anterior
                        if prev_point:
                            distance = point.distance_3d(prev_point)
                            if distance:
                                total_distance += distance
                                
                                # Calcular velocidad
                                time_diff = (point.time - prev_point.time).total_seconds()
                                if time_diff > 0:
                                    speed = (distance / 1000) / (time_diff / 3600)
                                    speeds.append(speed)
                        
                        # Guardar elevación
                        if point.elevation:
                            elevations.append(point.elevation)
                        
                        # Extraer datos de extensiones
                        heart_rate = None
                        cadence = None
                        temperature = None
                        
                        if point_index < len(trkpts_soup):
                            trkpt_soup = trkpts_soup[point_index]
                            extensions = trkpt_soup.find('extensions')
                            
                            if extensions:
                                # Buscar diferentes formatos de extensiones
                                for ext_tag in ['TrackPointExtension', 'ns3:TrackPointExtension']:
                                    track_ext = extensions.find(ext_tag)
                                    if track_ext:
                                        # Ritmo cardíaco
                                        hr_elem = track_ext.find(['hr', 'ns3:hr'])
                                        if hr_elem and hr_elem.text:
                                            try:
                                                heart_rate = float(hr_elem.text)
                                                heart_rates.append(heart_rate)
                                            except (ValueError, TypeError):
                                                pass
                                        
                                        # Cadencia
                                        cad_elem = track_ext.find(['cad', 'ns3:cad'])
                                        if cad_elem and cad_elem.text:
                                            try:
                                                cadence = float(cad_elem.text)
                                                cadences.append(cadence)
                                            except (ValueError, TypeError):
                                                pass
                                        
                                        # Temperatura
                                        temp_elem = track_ext.find(['atemp', 'ns3:atemp'])
                                        if temp_elem and temp_elem.text:
                                            try:
                                                temperature = float(temp_elem.text)
                                                temperatures.append(temperature)
                                            except (ValueError, TypeError):
                                                pass
                        
                        # Crear punto de track
                        track_point = TrackPoint(
                            training=training,
                            latitude=point.latitude,
                            longitude=point.longitude,
                            elevation=point.elevation,
                            time=point.time,
                            heart_rate=heart_rate,
                            speed=speeds[-1] if speeds else None,
                            cadence=cadence,
                            temperature=temperature
                        )
                        track_points.append(track_point)
                        
                        prev_point = point
                        point_index += 1
            
            # Guardar puntos de track en lotes
            if track_points:
                TrackPoint.objects.bulk_create(track_points, batch_size=1000)
                logger.info(f"Se han guardado {len(track_points)} puntos de ruta.")
            
            # Actualizar métricas del entrenamiento
            self._update_training_metrics(training, start_time, end_time, total_distance, 
                                        speeds, heart_rates, elevations, cadences, temperatures)
            
            logger.info(f"Procesamiento de archivo GPX completado exitosamente para entrenamiento {training.id}")
            
        except Exception as e:
            error_msg = f"Error al procesar archivo GPX: {str(e)}"
            training.processing_error = error_msg
            training.save()
            logger.error(f"Error en process_gpx_file: {e}", exc_info=True)
            raise
    
    def process_tcx_file(self, training, tcx_file):
        """
        Procesa un archivo TCX para extraer los datos de entrenamiento.
        Versión mejorada con mejor manejo de errores.
        """
        logger.info(f"Iniciando procesamiento de archivo TCX: {tcx_file.name}")
        
        try:
            tcx_file.seek(0)
            contenido_tcx = tcx_file.read().decode('utf-8')
            
            # Parsear XML
            soup = BeautifulSoup(contenido_tcx, 'xml')
            
            # Buscar elemento Activity
            activity = soup.find('Activity')
            if not activity:
                raise ValueError("No se encontró el elemento Activity en el archivo TCX")
            
            # Extraer fecha del ID de la actividad
            activity_id = activity.find('Id')
            fecha_inicio = None
            
            if activity_id and activity_id.text:
                fecha_str = activity_id.text.strip()
                try:
                    if 'T' in fecha_str:
                        if fecha_str.endswith('Z'):
                            fecha_str = fecha_str.replace('Z', '+00:00')
                        fecha_inicio = datetime.datetime.fromisoformat(fecha_str)
                        # Convertir a naive datetime para evitar problemas de timezone
                        if fecha_inicio.tzinfo:
                            fecha_inicio = fecha_inicio.replace(tzinfo=None)
                        training.date = fecha_inicio.date()
                        training.start_time = fecha_inicio.time()
                except ValueError as e:
                    logger.warning(f"Error al parsear fecha del ID: {e}")
            
            # Extraer estadísticas del Lap
            lap = soup.find('Lap')
            if lap:
                # Fecha alternativa del Lap
                if not fecha_inicio:
                    start_time_attr = lap.get('StartTime')
                    if start_time_attr:
                        try:
                            fecha_inicio = datetime.datetime.fromisoformat(start_time_attr.replace('Z', '+00:00'))
                            if fecha_inicio.tzinfo:
                                fecha_inicio = fecha_inicio.replace(tzinfo=None)
                            training.date = fecha_inicio.date()
                            training.start_time = fecha_inicio.time()
                        except ValueError:
                            pass
                
                # Duración
                total_time = lap.find('TotalTimeSeconds')
                if total_time and total_time.text:
                    try:
                        segundos = float(total_time.text)
                        training.duration = datetime.timedelta(seconds=segundos)
                    except ValueError:
                        pass
                
                # Distancia
                distance = lap.find('DistanceMeters')
                if distance and distance.text:
                    try:
                        distancia_metros = float(distance.text)
                        training.distance = distancia_metros / 1000.0
                    except ValueError:
                        pass
                
                # Velocidad máxima
                max_speed = lap.find('MaximumSpeed')
                if max_speed and max_speed.text:
                    try:
                        velocidad_ms = float(max_speed.text)
                        training.max_speed = velocidad_ms * 3.6  # Convertir a km/h
                    except ValueError:
                        pass
                
                # Calorías
                calories = lap.find('Calories')
                if calories and calories.text:
                    try:
                        training.calories = int(calories.text)
                    except ValueError:
                        pass
                
                # Ritmo cardíaco promedio
                avg_hr = lap.find('AverageHeartRateBpm')
                if avg_hr:
                    hr_value = avg_hr.find('Value')
                    if hr_value and hr_value.text:
                        try:
                            training.avg_heart_rate = float(hr_value.text)
                        except ValueError:
                            pass
                
                # Ritmo cardíaco máximo
                max_hr = lap.find('MaximumHeartRateBpm')
                if max_hr:
                    hr_value = max_hr.find('Value')
                    if hr_value and hr_value.text:
                        try:
                            training.max_heart_rate = float(hr_value.text)
                        except ValueError:
                            pass
            
            # Procesar trackpoints
            trackpoints = soup.find_all('Trackpoint')
            puntos_ruta = []
            elevaciones = []
            
            for punto in trackpoints:
                try:
                    # Tiempo
                    elemento_tiempo = punto.find('Time')
                    if not elemento_tiempo or not elemento_tiempo.text:
                        continue
                    
                    tiempo_str = elemento_tiempo.text.strip()
                    tiempo = datetime.datetime.fromisoformat(tiempo_str.replace('Z', '+00:00'))
                    if tiempo.tzinfo:
                        tiempo = tiempo.replace(tzinfo=None)
                    
                    # Coordenadas
                    posicion = punto.find('Position')
                    if not posicion:
                        continue
                        
                    lat_elem = posicion.find('LatitudeDegrees')
                    lon_elem = posicion.find('LongitudeDegrees')
                    
                    if not (lat_elem and lon_elem and lat_elem.text and lon_elem.text):
                        continue
                    
                    latitud = float(lat_elem.text.strip())
                    longitud = float(lon_elem.text.strip())
                    
                    # Elevación
                    elevacion = None
                    elem_altitud = punto.find('AltitudeMeters')
                    if elem_altitud and elem_altitud.text.strip():
                        try:
                            elevacion = float(elem_altitud.text.strip())
                            elevaciones.append(elevacion)
                        except ValueError:
                            pass
                    
                    # Ritmo cardíaco
                    ritmo_cardiaco = None
                    elem_hr = punto.find('HeartRateBpm')
                    if elem_hr:
                        hr_value = elem_hr.find('Value')
                        if hr_value and hr_value.text.strip():
                            try:
                                ritmo_cardiaco = int(hr_value.text.strip())
                            except ValueError:
                                pass
                    
                    # Velocidad de extensiones
                    velocidad = None
                    extensiones = punto.find('Extensions')
                    if extensiones:
                        elem_velocidad = extensiones.find('Speed') or extensiones.find('ns3:Speed')
                        if elem_velocidad and elem_velocidad.text.strip():
                            try:
                                velocidad = float(elem_velocidad.text.strip()) * 3.6  # m/s a km/h
                            except ValueError:
                                pass
                    
                    # Crear punto de track
                    punto_track = TrackPoint(
                        training=training,
                        latitude=latitud,
                        longitude=longitud,
                        elevation=elevacion,
                        time=tiempo,
                        heart_rate=ritmo_cardiaco,
                        speed=velocidad
                    )
                    puntos_ruta.append(punto_track)
                    
                except Exception as e:
                    logger.warning(f"Error procesando trackpoint: {e}")
                    continue
            
            # Guardar puntos de ruta
            if puntos_ruta:
                TrackPoint.objects.bulk_create(puntos_ruta, batch_size=1000)
                logger.info(f"Se han guardado {len(puntos_ruta)} puntos de ruta.")
            
            # Calcular velocidad promedio si tenemos distancia y duración
            if training.distance and training.duration:
                horas = training.duration.total_seconds() / 3600
                if horas > 0:
                    training.avg_speed = training.distance / horas
            
            # Calcular ganancia de elevación
            if elevaciones and len(elevaciones) > 1:
                elevation_gain = 0
                for i in range(1, len(elevaciones)):
                    if elevaciones[i] > elevaciones[i-1]:
                        elevation_gain += elevaciones[i] - elevaciones[i-1]
                training.elevation_gain = elevation_gain
            
            # Guardar cambios
            training.save()
            
            logger.info(f"Procesamiento de archivo TCX completado exitosamente para entrenamiento {training.id}")
            
        except Exception as e:
            error_msg = f"Error al procesar archivo TCX: {str(e)}"
            training.processing_error = error_msg
            training.save()
            logger.error(f"Error en process_tcx_file: {e}", exc_info=True)
            raise
    
    def _update_training_metrics(self, training, start_time, end_time, total_distance, 
                               speeds, heart_rates, elevations, cadences, temperatures):
        """
        Actualiza las métricas del entrenamiento basándose en los datos procesados
        """
        try:
            # Fecha y hora
            if start_time:
                training.date = start_time.date()
                training.start_time = start_time.time()
                
                if end_time:
                    training.duration = end_time - start_time
            
            # Distancia
            if total_distance > 0:
                training.distance = total_distance / 1000  # Convertir a km
            
            # Velocidad promedio
            if training.distance and training.duration:
                horas = training.duration.total_seconds() / 3600
                if horas > 0:
                    training.avg_speed = training.distance / horas
            
            # Velocidad máxima
            if speeds:
                training.max_speed = max(speeds)
            
            # Ritmo cardíaco
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
            
            # Cadencia
            if cadences:
                training.avg_cadence = sum(cadences) / len(cadences)
                training.max_cadence = max(cadences)
            
            # Temperatura
            if temperatures:
                training.avg_temperature = sum(temperatures) / len(temperatures)
                training.min_temperature = min(temperatures)
                training.max_temperature = max(temperatures)
            
            # Estimación de calorías si no se tienen
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
            logger.error(f"Error actualizando métricas del entrenamiento: {e}")

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
        
        # Obtener entrenamientos en el período con datos válidos
        trainings = Training.objects.filter(
            user=obj.user,
            date__gte=start_date,
            date__lte=end_date,
            file_processed=True
        ).exclude(date__isnull=True)
        
        # Calcular el valor actual según el tipo de objetivo
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
        
        # Actualizar estado si se completó el objetivo
        if current_value >= obj.target_value and not obj.is_completed:
            obj.is_completed = True
            obj.save()
        
        return {
            'current_value': round(current_value, 2),
            'target_value': obj.target_value,
            'percent': round(progress_percent, 1)
        }