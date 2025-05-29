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

import logging
import datetime
from django.utils import timezone
from rest_framework import serializers
from .models import Training, TrackPoint, Goal

# Importar librerías para procesamiento de archivos
try:
    import gpxpy
    import gpxpy.gpx
    GPX_AVAILABLE = True
except ImportError:
    GPX_AVAILABLE = False
    
try:
    from tcxparser import TCXParser
    TCX_AVAILABLE = True
except ImportError:
    TCX_AVAILABLE = False

try:
    import fitparse
    FIT_AVAILABLE = True
except ImportError:
    FIT_AVAILABLE = False

logger = logging.getLogger(__name__)

class TrainingSerializer(serializers.ModelSerializer):
    """
    Serializador para entrenamientos con soporte completo de archivos GPX/TCX/FIT.
    """
    
    class Meta:
        model = Training
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at', 'file_processed', 'processing_error')
    
    def create(self, validated_data):
        """
        Crea un entrenamiento y procesa el archivo GPX/TCX si está presente.
        """
        gpx_file = validated_data.get('gpx_file')
        
        # Crear el entrenamiento
        training = Training.objects.create(**validated_data)
        
        # Procesar archivo si existe
        if gpx_file:
            try:
                filename = gpx_file.name.lower()
                
                if filename.endswith('.gpx'):
                    logger.info(f"Procesando archivo GPX: {filename}")
                    self.process_gpx_file_improved(training, gpx_file)
                elif filename.endswith('.tcx'):
                    logger.info(f"Procesando archivo TCX: {filename}")
                    self.process_tcx_file_improved(training, gpx_file)
                elif filename.endswith('.fit'):
                    logger.info(f"Procesando archivo FIT: {filename}")
                    self.process_fit_file_improved(training, gpx_file)
                else:
                    training.processing_error = f"Formato no soportado: {filename}"
                    training.save()
                    logger.warning(f"Formato no soportado: {filename}")
                
            except Exception as e:
                training.processing_error = str(e)
                training.save()
                logger.error(f"Error procesando archivo: {e}")
        
        return training
    
    def process_gpx_file_improved(self, training, gpx_file):
        """
        Procesa archivo GPX y extrae toda la información posible.
        """
        if not GPX_AVAILABLE:
            raise Exception("Librería gpxpy no está instalada. Ejecuta: pip install gpxpy")
        
        try:
            # Leer contenido del archivo
            gpx_content = gpx_file.read()
            if isinstance(gpx_content, bytes):
                gpx_content = gpx_content.decode('utf-8')
            
            # Parsear GPX
            gpx = gpxpy.parse(gpx_content)
            
            # Variables para cálculos
            track_points = []
            total_distance = 0
            elevations = []
            speeds = []
            heart_rates = []
            cadences = []
            temperatures = []
            
            # Procesar tracks y segments
            for track in gpx.tracks:
                for segment in track.segments:
                    previous_point = None
                    
                    for point in segment.points:
                        # Crear punto de seguimiento
                        track_point_data = {
                            'latitude': point.latitude,
                            'longitude': point.longitude,
                            'elevation': point.elevation,
                            'time': point.time,
                        }
                        
                        # Extraer datos adicionales de extensiones
                        if hasattr(point, 'extensions') and point.extensions:
                            for extension in point.extensions:
                                # Ritmo cardíaco
                                hr_elements = extension.findall('.//{*}hr')
                                if hr_elements:
                                    try:
                                        track_point_data['heart_rate'] = int(hr_elements[0].text)
                                    except (ValueError, AttributeError):
                                        pass
                                
                                # Cadencia
                                cadence_elements = extension.findall('.//{*}cad')
                                if cadence_elements:
                                    try:
                                        track_point_data['cadence'] = float(cadence_elements[0].text)
                                    except (ValueError, AttributeError):
                                        pass
                                
                                # Temperatura
                                temp_elements = extension.findall('.//{*}atemp')
                                if temp_elements:
                                    try:
                                        track_point_data['temperature'] = float(temp_elements[0].text)
                                    except (ValueError, AttributeError):
                                        pass
                        
                        # Calcular velocidad si hay punto anterior
                        if previous_point and point.time and previous_point.time:
                            try:
                                distance = point.distance_2d(previous_point)
                                time_diff = (point.time - previous_point.time).total_seconds()
                                
                                if time_diff > 0:
                                    speed_ms = distance / time_diff
                                    speed_kmh = speed_ms * 3.6
                                    track_point_data['speed'] = speed_kmh
                                    speeds.append(speed_kmh)
                                    total_distance += distance / 1000  # Convertir a km
                            except Exception as e:
                                logger.warning(f"Error calculando velocidad: {e}")
                        
                        track_points.append(track_point_data)
                        
                        # Recopilar datos para estadísticas
                        if point.elevation:
                            elevations.append(point.elevation)
                        if track_point_data.get('heart_rate'):
                            heart_rates.append(track_point_data['heart_rate'])
                        if track_point_data.get('cadence'):
                            cadences.append(track_point_data['cadence'])
                        if track_point_data.get('temperature'):
                            temperatures.append(track_point_data['temperature'])
                        
                        previous_point = point
            
            # Calcular estadísticas generales
            if track_points:
                # Fechas y tiempos
                times = [tp['time'] for tp in track_points if tp.get('time')]
                if times:
                    training.date = times[0].date()
                    training.start_time = times[0].time()
                    duration_seconds = (times[-1] - times[0]).total_seconds()
                    training.duration = datetime.timedelta(seconds=duration_seconds)
                
                # Distancia
                if total_distance > 0:
                    training.distance = total_distance
                
                # Velocidades
                if speeds:
                    training.avg_speed = sum(speeds) / len(speeds)
                    training.max_speed = max(speeds)
                
                # Elevación
                if elevations:
                    # Calcular ganancia de elevación
                    elevation_gain = 0
                    for i in range(1, len(elevations)):
                        diff = elevations[i] - elevations[i-1]
                        if diff > 0:
                            elevation_gain += diff
                    training.elevation_gain = elevation_gain
                
                # Ritmo cardíaco
                if heart_rates:
                    training.avg_heart_rate = sum(heart_rates) / len(heart_rates)
                    training.max_heart_rate = max(heart_rates)
                
                # Cadencia
                if cadences:
                    training.avg_cadence = sum(cadences) / len(cadences)
                    training.max_cadence = max(cadences)
                
                # Temperatura
                if temperatures:
                    training.avg_temperature = sum(temperatures) / len(temperatures)
                    training.min_temperature = min(temperatures)
                    training.max_temperature = max(temperatures)
                
                # Estimación de calorías (fórmula básica)
                if training.duration and hasattr(training.user, 'weight') and training.user.weight:
                    hours = training.duration.total_seconds() / 3600
                    # Fórmula aproximada basada en MET values
                    met_value = 8.0 if training.activity_type == 'running' else 6.0
                    training.calories = int(met_value * training.user.weight * hours)
            
            # Guardar puntos de seguimiento
            for point_data in track_points:
                if point_data.get('time'):  # Solo guardar puntos con tiempo válido
                    TrackPoint.objects.create(
                        training=training,
                        **point_data
                    )
            
            # Marcar como procesado exitosamente
            training.file_processed = True
            training.processing_error = None
            training.save()
            
            logger.info(f"GPX procesado exitosamente: {len(track_points)} puntos, {total_distance:.2f} km")
            
        except Exception as e:
            training.file_processed = False
            training.processing_error = f"Error procesando GPX: {str(e)}"
            training.save()
            logger.error(f"Error procesando GPX: {e}")
            raise
    
    def process_tcx_file_improved(self, training, tcx_file):
        """
        Procesa archivo TCX y extrae información.
        """
        if not TCX_AVAILABLE:
            raise Exception("Librería tcxparser no está instalada. Ejecuta: pip install python-tcx-parser")
        
        try:
            # Leer y parsear TCX
            tcx_content = tcx_file.read()
            if isinstance(tcx_content, bytes):
                tcx_content = tcx_content.decode('utf-8')
            
            tcx = TCXParser(tcx_content)
            
            # Extraer información básica
            if tcx.started_at:
                training.date = tcx.started_at.date()
                training.start_time = tcx.started_at.time()
            
            if tcx.duration:
                training.duration = datetime.timedelta(seconds=tcx.duration)
            
            if tcx.distance:
                training.distance = tcx.distance / 1000  # Convertir a km
            
            if tcx.avg_speed:
                training.avg_speed = tcx.avg_speed * 3.6  # Convertir a km/h
            
            if tcx.max_speed:
                training.max_speed = tcx.max_speed * 3.6
            
            if tcx.avg_hr:
                training.avg_heart_rate = tcx.avg_hr
            
            if tcx.max_hr:
                training.max_heart_rate = tcx.max_hr
            
            if tcx.ascent:
                training.elevation_gain = tcx.ascent
            
            if tcx.calories:
                training.calories = tcx.calories
            
            # Procesar puntos de seguimiento
            if hasattr(tcx, 'trackpoints') and tcx.trackpoints:
                for point in tcx.trackpoints:
                    track_point_data = {
                        'training': training,
                        'time': point.time,
                    }
                    
                    if point.latitude:
                        track_point_data['latitude'] = point.latitude
                    if point.longitude:
                        track_point_data['longitude'] = point.longitude
                    if point.elevation:
                        track_point_data['elevation'] = point.elevation
                    if point.hr_value:
                        track_point_data['heart_rate'] = point.hr_value
                    if point.speed:
                        track_point_data['speed'] = point.speed * 3.6  # Convertir a km/h
                    
                    TrackPoint.objects.create(**track_point_data)
            
            training.file_processed = True
            training.processing_error = None
            training.save()
            
            logger.info(f"TCX procesado exitosamente")
            
        except Exception as e:
            training.file_processed = False
            training.processing_error = f"Error procesando TCX: {str(e)}"
            training.save()
            logger.error(f"Error procesando TCX: {e}")
            raise
    
    def process_fit_file_improved(self, training, fit_file):
        """
        Procesa archivo FIT (Garmin, etc.) y extrae información.
        """
        if not FIT_AVAILABLE:
            raise Exception("Librería fitparse no está instalada. Ejecuta: pip install fitparse")
        
        try:
            # Parsear archivo FIT
            fit_file.seek(0)
            fitfile = fitparse.FitFile(fit_file)
            
            # Variables para almacenar datos
            session_data = {}
            track_points = []
            
            # Procesar mensajes del archivo FIT
            for record in fitfile.get_messages():
                # Información de sesión
                if record.name == 'session':
                    for record_data in record:
                        if record_data.name == 'start_time':
                            session_data['start_time'] = record_data.value
                        elif record_data.name == 'total_elapsed_time':
                            session_data['duration'] = record_data.value
                        elif record_data.name == 'total_distance':
                            session_data['distance'] = record_data.value / 1000  # Convertir a km
                        elif record_data.name == 'avg_speed':
                            session_data['avg_speed'] = record_data.value * 3.6  # Convertir a km/h
                        elif record_data.name == 'max_speed':
                            session_data['max_speed'] = record_data.value * 3.6
                        elif record_data.name == 'avg_heart_rate':
                            session_data['avg_heart_rate'] = record_data.value
                        elif record_data.name == 'max_heart_rate':
                            session_data['max_heart_rate'] = record_data.value
                        elif record_data.name == 'total_ascent':
                            session_data['elevation_gain'] = record_data.value
                        elif record_data.name == 'total_calories':
                            session_data['calories'] = record_data.value
                
                # Puntos de seguimiento
                elif record.name == 'record':
                    point_data = {}
                    for record_data in record:
                        if record_data.name == 'timestamp':
                            point_data['time'] = record_data.value
                        elif record_data.name == 'position_lat':
                            point_data['latitude'] = record_data.value * (180.0 / 2**31)
                        elif record_data.name == 'position_long':
                            point_data['longitude'] = record_data.value * (180.0 / 2**31)
                        elif record_data.name == 'altitude':
                            point_data['elevation'] = record_data.value
                        elif record_data.name == 'heart_rate':
                            point_data['heart_rate'] = record_data.value
                        elif record_data.name == 'speed':
                            point_data['speed'] = record_data.value * 3.6  # Convertir a km/h
                        elif record_data.name == 'cadence':
                            point_data['cadence'] = record_data.value
                        elif record_data.name == 'temperature':
                            point_data['temperature'] = record_data.value
                    
                    if 'time' in point_data:
                        track_points.append(point_data)
            
            # Aplicar datos de sesión al entrenamiento
            if session_data.get('start_time'):
                training.date = session_data['start_time'].date()
                training.start_time = session_data['start_time'].time()
            
            if session_data.get('duration'):
                training.duration = datetime.timedelta(seconds=session_data['duration'])
            
            for field in ['distance', 'avg_speed', 'max_speed', 'avg_heart_rate', 'max_heart_rate', 'elevation_gain', 'calories']:
                if session_data.get(field):
                    setattr(training, field, session_data[field])
            
            # Guardar puntos de seguimiento
            for point_data in track_points:
                TrackPoint.objects.create(
                    training=training,
                    **point_data
                )
            
            training.file_processed = True
            training.processing_error = None
            training.save()
            
            logger.info(f"FIT procesado exitosamente: {len(track_points)} puntos")
            
        except Exception as e:
            training.file_processed = False
            training.processing_error = f"Error procesando FIT: {str(e)}"
            training.save()
            logger.error(f"Error procesando FIT: {e}")
            raise


class TrackPointSerializer(serializers.ModelSerializer):
    """
    Serializador para puntos de seguimiento GPS.
    """
    
    class Meta:
        model = TrackPoint
        fields = '__all__'
        read_only_fields = ('training',)


class GoalSerializer(serializers.ModelSerializer):
    """
    Serializador para objetivos de entrenamiento.
    """
    
    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')