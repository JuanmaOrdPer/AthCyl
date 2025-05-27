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
                'created_at', 'updated_at', 'track_points']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
    
    def validate(self, data):
        """
        Valida que si no hay archivo GPX/TCX, se proporcionen los campos requeridos
        """
        gpx_file = data.get('gpx_file')
        
        # Si no hay archivo, validar que los campos requeridos estén presentes
        if not gpx_file:
            required_fields = ['date', 'start_time', 'duration', 'distance', 'activity_type']
            missing_fields = [field for field in required_fields if field not in data or data[field] is None]
            
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
        training = Training.objects.create(**validated_data)
        
        if archivo_subido:
            try:
                # Guardar el archivo
                training.gpx_file = archivo_subido
                training.save()
                
                # Comprobar qué tipo de archivo es por su extensión
                nombre_archivo = archivo_subido.name.lower()
                
                # Si es GPX usamos el método existente
                if nombre_archivo.endswith('.gpx'):
                    self.process_gpx_file(training, archivo_subido)
                
                # Si es TCX usamos el nuevo método
                elif nombre_archivo.endswith('.tcx'):
                    self.procesar_archivo_tcx(training, archivo_subido)
                
                # Si no es ninguno de los formatos válidos, mostramos error
                else:
                    raise serializers.ValidationError(
                        {"gpx_file": "Solo puedes subir archivos GPX o TCX."}
                    )
                
                # Actualizar los datos del entrenamiento con la información del archivo
                training.save()
                
            except Exception as e:
                logger.error(f"Error al procesar el archivo: {str(e)}", exc_info=True)
                # Si hay un error, eliminamos el entrenamiento creado
                training.delete()
                raise serializers.ValidationError({
                    'gpx_file': f'Error al procesar el archivo: {str(e)}'
                })
                
        return training
    
    def process_gpx_file(self, training, gpx_file):
        """
        Procesa un archivo GPX y extrae los datos relevantes.
        Versión mejorada que combina gpxpy para estructura básica y BeautifulSoup para extensiones.
        """
        print(f"[DEBUG] Iniciando procesamiento de archivo GPX: {gpx_file.name}")
        
        try:
            # Guardar el archivo GPX
            training.gpx_file = gpx_file
            training.save()
            
            # Leer el archivo GPX
            gpx_file.seek(0)  # Asegurar que se lee desde el inicio
            gpx_content = gpx_file.read().decode('utf-8')
            
            # === USAR GPXPY PARA ESTRUCTURA BÁSICA ===
            gpx_file.seek(0)  # Volver al inicio para gpxpy
            gpx = gpxpy.parse(gpx_content)
            
            # === USAR BEAUTIFULSOUP PARA EXTENSIONES ===
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
            
            # Procesar los puntos del track con gpxpy
            track_points = []
            trkpts_soup = soup.find_all('trkpt')  # Para extensiones
            
            print(f"[DEBUG] Encontrados {len(trkpts_soup)} puntos en el archivo GPX")
            
            point_index = 0
            
            for track in gpx.tracks:
                # Extraer nombre del track si existe
                if track.name and not training.title:
                    training.title = track.name
                    print(f"[DEBUG] Título extraído del track: {training.title}")
                
                for segment in track.segments:
                    prev_point = None
                    
                    for point in segment.points:
                        # Guardar el primer punto como tiempo de inicio
                        if start_time is None:
                            start_time = point.time
                        
                        # Actualizar el tiempo final
                        end_time = point.time
                        
                        # Calcular la distancia desde el punto anterior
                        if prev_point:
                            # Distancia en metros
                            distance = point.distance_3d(prev_point)
                            total_distance += distance
                            
                            # Calcular velocidad si hay tiempo entre puntos
                            time_diff = (point.time - prev_point.time).total_seconds()
                            if time_diff > 0:
                                # Velocidad en km/h
                                speed = (distance / 1000) / (time_diff / 3600)
                                speeds.append(speed)
                        
                        # Guardar datos de elevación
                        if point.elevation:
                            elevations.append(point.elevation)
                        
                        # === EXTRAER DATOS DE EXTENSIONES CON BEAUTIFULSOUP ===
                        heart_rate = None
                        cadence = None
                        temperature = None
                        
                        # Buscar el trkpt correspondiente en el soup
                        if point_index < len(trkpts_soup):
                            trkpt_soup = trkpts_soup[point_index]
                            extensions = trkpt_soup.find('extensions')
                            
                            if extensions:
                                track_point_ext = extensions.find('ns3:TrackPointExtension')
                                if track_point_ext:
                                    # Extraer ritmo cardíaco
                                    hr_elem = track_point_ext.find('ns3:hr')
                                    if hr_elem and hr_elem.text:
                                        try:
                                            heart_rate = float(hr_elem.text)
                                            heart_rates.append(heart_rate)
                                        except (ValueError, TypeError):
                                            pass
                                    
                                    # Extraer cadencia
                                    cad_elem = track_point_ext.find('ns3:cad')
                                    if cad_elem and cad_elem.text:
                                        try:
                                            cadence = float(cad_elem.text)
                                            cadences.append(cadence)
                                        except (ValueError, TypeError):
                                            pass
                                    
                                    # Extraer temperatura
                                    temp_elem = track_point_ext.find('ns3:atemp')
                                    if temp_elem and temp_elem.text:
                                        try:
                                            temperature = float(temp_elem.text)
                                            temperatures.append(temperature)
                                        except (ValueError, TypeError):
                                            pass
                        
                        # También intentar extraer HR del método original (por compatibilidad)
                        if not heart_rate:
                            for extension in point.extensions:
                                if 'hr' in extension.tag.lower():
                                    try:
                                        heart_rate = float(extension.text)
                                        heart_rates.append(heart_rate)
                                        break
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
            
            # Guardar todos los puntos de track en la base de datos
            if track_points:
                TrackPoint.objects.bulk_create(track_points)
                print(f"[INFO] Se han guardado {len(track_points)} puntos de ruta.")
            
            # === ACTUALIZAR MÉTRICAS DEL ENTRENAMIENTO ===
            
            # Establecer fecha y hora de inicio
            if start_time:
                # Convertir a la zona horaria local si es necesario
                if start_time.tzinfo is not None:
                    from django.utils import timezone
                    start_time = timezone.make_naive(start_time)
                    end_time = timezone.make_naive(end_time) if end_time else start_time
                    
                training.date = start_time.date()
                training.start_time = start_time.time()
                
                # Calcular duración
                if end_time:
                    training.duration = end_time - start_time
            
            # Distancia total
            training.distance = total_distance / 1000  # Convertir a kilómetros
            
            # Calcular velocidad promedio basada en distancia y duración
            if training.distance and training.duration:
                horas = training.duration.total_seconds() / 3600
                if horas > 0:
                    training.avg_speed = training.distance / horas
            
            # Velocidad máxima
            if speeds:
                training.max_speed = max(speeds)
            
            # Ritmo cardíaco promedio y máximo
            if heart_rates:
                training.avg_heart_rate = sum(heart_rates) / len(heart_rates)
                training.max_heart_rate = max(heart_rates)
            
            # Calcular ganancia de elevación
            if elevations and len(elevations) > 1:
                elevation_gain = 0
                for i in range(1, len(elevations)):
                    if elevations[i] > elevations[i-1]:
                        elevation_gain += elevations[i] - elevations[i-1]
                training.elevation_gain = elevation_gain
            
            # Estimación de calorías
            if training.duration and hasattr(training.user, 'weight') and training.user.weight:
                met = {
                    'running': 8.0,
                    'cycling': 6.0,
                    'swimming': 7.0,
                    'walking': 3.5,
                    'hiking': 5.0,
                    'other': 5.0
                }.get(training.activity_type, 5.0)
                
                duration_hours = training.duration.total_seconds() / 3600
                training.calories = int(met * training.user.weight * duration_hours)
            
            # Guardar estadísticas de cadencia
            if cadences:
                training.avg_cadence = sum(cadences) / len(cadences)
                training.max_cadence = max(cadences)
            
            # Guardar estadísticas de temperatura
            if temperatures:
                training.avg_temperature = sum(temperatures) / len(temperatures)
                training.min_temperature = min(temperatures)
                training.max_temperature = max(temperatures)
            
            # Guardar el entrenamiento
            training.save()
            
            # === MOSTRAR RESUMEN FINAL ===
            print("\n[DEBUG] ===== RESUMEN DE DATOS EXTRAÍDOS (GPX) =====")
            print(f"  📅 Fecha: {training.date}")
            print(f"  🕒 Hora de inicio: {training.start_time}")
            if training.duration and start_time:
                fecha_fin = start_time + training.duration
                print(f"  🏁 Hora de fin: {fecha_fin.time()}")
            print(f"  📏 Distancia: {training.distance:.3f} km")
            print(f"  ⏱️  Duración: {training.duration}")
            print(f"  🏃 Velocidad promedio: {training.avg_speed:.2f} km/h" if training.avg_speed else "  🏃 Velocidad promedio: No disponible")
            print(f"  🚀 Velocidad máxima: {training.max_speed:.2f} km/h" if training.max_speed else "  🚀 Velocidad máxima: No disponible")
            print(f"  💓 Ritmo cardíaco promedio: {training.avg_heart_rate:.1f} bpm" if training.avg_heart_rate else "  💓 Ritmo cardíaco promedio: No disponible")
            print(f"  ❤️  Ritmo cardíaco máximo: {training.max_heart_rate} bpm" if training.max_heart_rate else "  ❤️  Ritmo cardíaco máximo: No disponible")
            print(f"  ⛰️  Ganancia de elevación: {training.elevation_gain:.1f} m" if training.elevation_gain else "  ⛰️  Ganancia de elevación: No disponible")
            print(f"  🔥 Calorías: {training.calories}" if training.calories else "  🔥 Calorías: No disponible")
            
            # Datos adicionales extraídos de extensiones
            if training.avg_cadence:
                print(f"  🦶 Cadencia promedio: {training.avg_cadence:.1f} spm")
                print(f"  🦶 Cadencia máxima: {training.max_cadence} spm")
            
            if training.avg_temperature:
                print(f"  🌡️ Temperatura promedio: {training.avg_temperature:.1f}°C")
                print(f"  🌡️ Temperatura mín/máx: {training.min_temperature}°C / {training.max_temperature}°C")
            
            print(f"  📍 Puntos de ruta guardados: {len(track_points)}")
            print("[DEBUG] ==========================================\n")
            
            print(f"[INFO] ✅ Procesamiento del archivo GPX completado exitosamente")
            
        except Exception as e:
            print(f"[ERROR] ❌ Error al procesar el archivo GPX: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    def procesar_archivo_tcx(self, training, tcx_file):
        """
        Procesa un archivo TCX para extraer los datos de entrenamiento.
        Este método extrae tanto las estadísticas generales del <Lap> como los trackpoints individuales.
        """
        print(f"[DEBUG] Iniciando procesamiento de archivo TCX: {tcx_file.name}")
        
        try:
            # Rebobinar el archivo por si acaso
            tcx_file.seek(0)
            
            # Leemos el contenido del archivo
            contenido_tcx = tcx_file.read().decode('utf-8')
            print(f"[DEBUG] Tamaño del archivo: {len(contenido_tcx)} caracteres")
            
            # Usamos BeautifulSoup para parsear el XML
            soup = BeautifulSoup(contenido_tcx, 'xml')
            print("[DEBUG] Archivo TCX parseado correctamente")
            
            # === EXTRAER DATOS BÁSICOS DE LA ACTIVIDAD ===
            activity = soup.find('Activity')
            if not activity:
                raise ValueError("No se encontró el elemento Activity en el archivo TCX")
            
            print("[DEBUG] Se encontró el elemento Activity")
            
            # Extraer la fecha del ID de la actividad
            activity_id = activity.find('Id')
            fecha_inicio = None
            
            if activity_id and activity_id.text:
                fecha_str = activity_id.text.strip()
                print(f"[DEBUG] ID de actividad: {fecha_str}")
                
                try:
                    # Parsear la fecha del ID
                    if 'T' in fecha_str and 'Z' in fecha_str:
                        fecha_str = fecha_str.replace('Z', '+00:00')
                    
                    fecha_inicio = datetime.datetime.fromisoformat(fecha_str)
                    training.date = fecha_inicio.date()
                    training.start_time = fecha_inicio.time()
                    print(f"[DEBUG] Fecha y hora de inicio extraídas: {training.date} {training.start_time}")
                except ValueError as e:
                    print(f"[ERROR] Error al convertir la fecha del ID: {e}")
            
            # === EXTRAER ESTADÍSTICAS PRINCIPALES DEL LAP ===
            lap = soup.find('Lap')
            if lap:
                print("[DEBUG] Se encontró elemento Lap con estadísticas principales")
                
                # Extraer fecha/hora de inicio del Lap (alternativa si el ID no funcionó)
                if not fecha_inicio:
                    start_time_attr = lap.get('StartTime')
                    if start_time_attr:
                        try:
                            fecha_inicio = datetime.datetime.fromisoformat(start_time_attr.replace('Z', '+00:00'))
                            training.date = fecha_inicio.date()
                            training.start_time = fecha_inicio.time()
                            print(f"[DEBUG] Fecha/hora extraídas del Lap StartTime: {training.date} {training.start_time}")
                        except ValueError as e:
                            print(f"[ERROR] Error al parsear StartTime del Lap: {e}")
                
                # Extraer duración total
                total_time = lap.find('TotalTimeSeconds')
                if total_time and total_time.text:
                    try:
                        segundos_totales = float(total_time.text)
                        training.duration = datetime.timedelta(seconds=segundos_totales)
                        print(f"[DEBUG] Duración extraída: {training.duration}")
                        
                        # Calcular hora de fin
                        if fecha_inicio:
                            fecha_fin = fecha_inicio + training.duration
                            print(f"[DEBUG] Hora de fin calculada: {fecha_fin.time()}")
                    except ValueError as e:
                        print(f"[ERROR] Error al extraer duración: {e}")
                
                # Extraer distancia total
                distance = lap.find('DistanceMeters')
                if distance and distance.text:
                    try:
                        distancia_metros = float(distance.text)
                        training.distance = distancia_metros / 1000.0  # Convertir a km
                        print(f"[DEBUG] Distancia extraída: {training.distance} km")
                    except ValueError as e:
                        print(f"[ERROR] Error al extraer distancia: {e}")
                
                # Extraer velocidad máxima
                max_speed = lap.find('MaximumSpeed')
                if max_speed and max_speed.text:
                    try:
                        # La velocidad en TCX viene en m/s, convertir a km/h
                        velocidad_ms = float(max_speed.text)
                        training.max_speed = velocidad_ms * 3.6
                        print(f"[DEBUG] Velocidad máxima extraída: {training.max_speed:.2f} km/h")
                    except ValueError as e:
                        print(f"[ERROR] Error al extraer velocidad máxima: {e}")
                
                # Calcular velocidad promedio si tenemos distancia y duración
                if training.distance and training.duration:
                    horas = training.duration.total_seconds() / 3600
                    if horas > 0:
                        training.avg_speed = training.distance / horas
                        print(f"[DEBUG] Velocidad promedio calculada: {training.avg_speed:.2f} km/h")
                
                # Extraer calorías
                calories = lap.find('Calories')
                if calories and calories.text:
                    try:
                        training.calories = int(calories.text)
                        print(f"[DEBUG] Calorías extraídas: {training.calories}")
                    except ValueError as e:
                        print(f"[ERROR] Error al extraer calorías: {e}")
                
                # Extraer ritmo cardíaco promedio
                avg_hr = lap.find('AverageHeartRateBpm')
                if avg_hr:
                    hr_value = avg_hr.find('Value')
                    if hr_value and hr_value.text:
                        try:
                            training.avg_heart_rate = float(hr_value.text)
                            print(f"[DEBUG] Ritmo cardíaco promedio extraído: {training.avg_heart_rate} bpm")
                        except ValueError as e:
                            print(f"[ERROR] Error al extraer ritmo cardíaco promedio: {e}")
                
                # Extraer ritmo cardíaco máximo
                max_hr = lap.find('MaximumHeartRateBpm')
                if max_hr:
                    hr_value = max_hr.find('Value')
                    if hr_value and hr_value.text:
                        try:
                            training.max_heart_rate = float(hr_value.text)
                            print(f"[DEBUG] Ritmo cardíaco máximo extraído: {training.max_heart_rate} bpm")
                        except ValueError as e:
                            print(f"[ERROR] Error al extraer ritmo cardíaco máximo: {e}")
            
            # === PROCESAR TRACKPOINTS INDIVIDUALES ===
            trackpoints = soup.find_all('Trackpoint')
            print(f"[DEBUG] Número de Trackpoints encontrados: {len(trackpoints)}")
            
            puntos_ruta = []
            elevaciones = []
            
            for i, punto in enumerate(trackpoints):
                try:
                    # Extraer tiempo
                    elemento_tiempo = punto.find('Time')
                    if not elemento_tiempo or not elemento_tiempo.text:
                        continue
                    
                    tiempo_str = elemento_tiempo.text.strip()
                    try:
                        tiempo = datetime.datetime.fromisoformat(tiempo_str.replace('Z', '+00:00'))
                    except ValueError:
                        continue
                    
                    # Extraer coordenadas
                    posicion = punto.find('Position')
                    latitud = None
                    longitud = None
                    
                    if posicion:
                        lat_elem = posicion.find('LatitudeDegrees')
                        lon_elem = posicion.find('LongitudeDegrees')
                        
                        if lat_elem and lon_elem and lat_elem.text and lon_elem.text:
                            try:
                                latitud = float(lat_elem.text.strip())
                                longitud = float(lon_elem.text.strip())
                            except ValueError:
                                continue
                    
                    # Extraer elevación
                    elevacion = None
                    elem_altitud = punto.find('AltitudeMeters')
                    if elem_altitud and elem_altitud.text.strip():
                        try:
                            elevacion = float(elem_altitud.text.strip())
                            elevaciones.append(elevacion)
                        except ValueError:
                            pass
                    
                    # Extraer ritmo cardíaco del trackpoint
                    ritmo_cardiaco = None
                    elem_hr = punto.find('HeartRateBpm')
                    if elem_hr and elem_hr.find('Value') and elem_hr.find('Value').text.strip():
                        try:
                            ritmo_cardiaco = float(elem_hr.find('Value').text.strip())
                        except ValueError:
                            pass
                    
                    # Extraer velocidad de extensiones
                    velocidad = None
                    extensiones = punto.find('Extensions')
                    if extensiones:
                        try:
                            elem_velocidad = extensiones.find('Speed')
                            if not elem_velocidad:
                                # Buscar con namespace ns3
                                elem_velocidad = extensiones.find('ns3:Speed')
                            
                            if elem_velocidad and elem_velocidad.text.strip():
                                # Convertir de m/s a km/h
                                velocidad = float(elem_velocidad.text.strip()) * 3.6
                        except ValueError:
                            pass
                    
                    # Crear punto de track si tenemos coordenadas
                    if latitud is not None and longitud is not None:
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
                    print(f"[ERROR] Error procesando trackpoint {i+1}: {e}")
                    continue
            
            # Guardar todos los puntos en la base de datos
            if puntos_ruta:
                try:
                    TrackPoint.objects.bulk_create(puntos_ruta)
                    print(f"[INFO] Se han guardado {len(puntos_ruta)} puntos de ruta.")
                except Exception as e:
                    print(f"[ERROR] Error al guardar puntos de ruta: {e}")
            
            # === CALCULAR GANANCIA DE ELEVACIÓN ===
            if elevaciones and len(elevaciones) > 1:
                elevation_gain = 0
                for i in range(1, len(elevaciones)):
                    if elevaciones[i] > elevaciones[i-1]:
                        elevation_gain += elevaciones[i] - elevaciones[i-1]
                training.elevation_gain = elevation_gain
                print(f"[DEBUG] Ganancia de elevación calculada: {elevation_gain:.1f} m")
            
            # === ESTIMAR CALORÍAS SI NO SE OBTUVIERON DEL ARCHIVO ===
            if not training.calories and training.duration and hasattr(training.user, 'weight') and training.user.weight:
                met_valores = {
                    'running': 8.0,
                    'cycling': 6.0,
                    'swimming': 7.0,
                    'walking': 3.5,
                    'hiking': 5.0,
                    'other': 5.0
                }
                
                met = met_valores.get(training.activity_type, 5.0)
                horas = training.duration.total_seconds() / 3600
                training.calories = int(met * training.user.weight * horas)
                print(f"[DEBUG] Calorías estimadas: {training.calories}")
            
            # === GUARDAR EL ENTRENAMIENTO ===
            training.save()
            
            # === MOSTRAR RESUMEN FINAL ===
            print("\n[DEBUG] ===== RESUMEN DE DATOS EXTRAÍDOS (TCX) =====")
            print(f"  📅 Fecha: {training.date}")
            print(f"  🕒 Hora de inicio: {training.start_time}")
            if training.duration and fecha_inicio:
                fecha_fin = fecha_inicio + training.duration
                print(f"  🏁 Hora de fin: {fecha_fin.time()}")
            print(f"  📏 Distancia: {training.distance} km")
            print(f"  ⏱️  Duración: {training.duration}")
            print(f"  🏃 Velocidad promedio: {training.avg_speed:.2f} km/h" if training.avg_speed else "  🏃 Velocidad promedio: No disponible")
            print(f"  🚀 Velocidad máxima: {training.max_speed:.2f} km/h" if training.max_speed else "  🚀 Velocidad máxima: No disponible")
            print(f"  💓 Ritmo cardíaco promedio: {training.avg_heart_rate} bpm" if training.avg_heart_rate else "  💓 Ritmo cardíaco promedio: No disponible")
            print(f"  ❤️  Ritmo cardíaco máximo: {training.max_heart_rate} bpm" if training.max_heart_rate else "  ❤️  Ritmo cardíaco máximo: No disponible")
            print(f"  ⛰️  Ganancia de elevación: {training.elevation_gain:.1f} m" if training.elevation_gain else "  ⛰️  Ganancia de elevación: No disponible")
            print(f"  🔥 Calorías: {training.calories}" if training.calories else "  🔥 Calorías: No disponible")
            print(f"  📍 Puntos de ruta guardados: {len(puntos_ruta)}")
            print("[DEBUG] =====================================\n")
            
            print(f"[INFO] ✅ Procesamiento del archivo TCX completado exitosamente")
            
        except Exception as e:
            print(f"[ERROR] ❌ Error al procesar el archivo TCX: {e}")
            import traceback
            traceback.print_exc()
            raise

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
    
    def validate(self, data):
        """
        Valida que si no hay archivo GPX/TCX, se proporcionen fecha y hora
        """
        # Si no hay archivo GPX/TCX, fecha y hora son obligatorios
        if 'gpx_file' not in data:
            if 'date' not in data or data['date'] is None:
                raise serializers.ValidationError(
                    {"date": "Este campo es obligatorio cuando no se sube un archivo GPX/TCX"}
                )
            if 'start_time' not in data or data['start_time'] is None:
                raise serializers.ValidationError(
                    {"start_time": "Este campo es obligatorio cuando no se sube un archivo GPX/TCX"}
                )
        return data
    
    def get_progress(self, obj):
        """Calcula el progreso actual hacia el objetivo"""
        
        # Definir el rango de fechas para el período
        today = datetime.date.today()
        
        if obj.period == 'daily':
            start_date = today
            end_date = today
        elif obj.period == 'weekly':
            # Inicio de la semana (lunes)
            start_date = today - datetime.timedelta(days=today.weekday())
            # Fin de la semana (domingo)
            end_date = start_date + datetime.timedelta(days=6)
        elif obj.period == 'monthly':
            # Primer día del mes
            start_date = today.replace(day=1)
            # Último día del mes
            if today.month == 12:
                end_date = today.replace(day=31)
            else:
                end_date = today.replace(month=today.month+1, day=1) - datetime.timedelta(days=1)
        elif obj.period == 'yearly':
            # Primer día del año
            start_date = today.replace(month=1, day=1)
            # Último día del año
            end_date = today.replace(month=12, day=31)
        else:  # custom o cualquier otro
            start_date = obj.start_date
            end_date = obj.end_date or today
        
        # Obtener los entrenamientos en el período
        trainings = Training.objects.filter(
            user=obj.user,
            date__gte=start_date,
            date__lte=end_date
        )
        
        # Calcular el valor actual según el tipo de objetivo
        current_value = 0
        
        if obj.goal_type == 'distance':
            # Sumar distancias
            for training in trainings:
                if training.distance:
                    current_value += training.distance
        
        elif obj.goal_type == 'duration':
            # Sumar duraciones (en minutos)
            for training in trainings:
                if training.duration:
                    current_value += training.duration.total_seconds() / 60
        
        elif obj.goal_type == 'frequency':
            # Contar número de entrenamientos
            current_value = trainings.count()
        
        elif obj.goal_type == 'speed':
            # Calcular velocidad promedio
            speeds = [t.avg_speed for t in trainings if t.avg_speed]
            if speeds:
                current_value = sum(speeds) / len(speeds)
        
        # Calcular porcentaje de progreso
        if obj.target_value > 0:
            progress_percent = min(100, (current_value / obj.target_value) * 100)
        else:
            progress_percent = 0
        
        # Actualizar el estado de completado si se alcanzó el objetivo
        if current_value >= obj.target_value and not obj.is_completed:
            obj.is_completed = True
            obj.save()
        
        return {
            'current_value': current_value,
            'target_value': obj.target_value,
            'percent': progress_percent
        }