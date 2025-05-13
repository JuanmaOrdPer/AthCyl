from rest_framework import serializers
from .models import Training, TrackPoint, Goal
import gpxpy
import datetime

class TrackPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackPoint
        fields = ['id', 'latitude', 'longitude', 'elevation', 'time', 'heart_rate', 'speed']
        read_only_fields = ['id']

class TrainingSerializer(serializers.ModelSerializer):
    track_points = TrackPointSerializer(many=True, read_only=True)
    gpx_file = serializers.FileField(required=False)
    
    class Meta:
        model = Training
        fields = ['id', 'user', 'title', 'description', 'activity_type', 'gpx_file',
                 'date', 'start_time', 'duration', 'distance', 'avg_speed', 'max_speed',
                 'avg_heart_rate', 'max_heart_rate', 'elevation_gain', 'calories',
                 'created_at', 'updated_at', 'track_points']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        gpx_file = validated_data.pop('gpx_file', None)
        training = Training.objects.create(**validated_data)
        
        if gpx_file:
            self.process_gpx_file(training, gpx_file)
            
        return training
    
    def process_gpx_file(self, training, gpx_file):
        """Procesa un archivo GPX y extrae los datos relevantes"""
        
        # Guardar el archivo GPX
        training.gpx_file = gpx_file
        training.save()
        
        # Leer el archivo GPX
        gpx_content = gpx_file.read().decode('utf-8')
        gpx = gpxpy.parse(gpx_content)
        
        # Variables para calcular métricas
        total_distance = 0
        speeds = []
        heart_rates = []
        elevations = []
        start_time = None
        end_time = None
        
        # Procesar los puntos del track
        track_points = []
        
        for track in gpx.tracks:
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
                    
                    # Guardar datos de elevación y ritmo cardíaco
                    if point.elevation:
                        elevations.append(point.elevation)
                    
                    # Extraer ritmo cardíaco de las extensiones (si existe)
                    heart_rate = None
                    for extension in point.extensions:
                        if 'hr' in extension.tag:
                            try:
                                heart_rate = float(extension.text)
                                heart_rates.append(heart_rate)
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
                        speed=speeds[-1] if speeds else None
                    )
                    track_points.append(track_point)
                    
                    prev_point = point
        
        # Guardar todos los puntos de track en la base de datos
        if track_points:
            TrackPoint.objects.bulk_create(track_points)
        
        # Actualizar las métricas del entrenamiento
        if start_time and end_time:
            training.duration = end_time - start_time
        
        training.distance = total_distance / 1000  # Convertir a kilómetros
        
        if speeds:
            training.avg_speed = sum(speeds) / len(speeds)
            training.max_speed = max(speeds)
        
        if heart_rates:
            training.avg_heart_rate = sum(heart_rates) / len(heart_rates)
            training.max_heart_rate = max(heart_rates)
        
        if elevations and len(elevations) > 1:
            # Calcular ganancia de elevación (suma de todas las subidas)
            elevation_gain = 0
            for i in range(1, len(elevations)):
                diff = elevations[i] - elevations[i-1]
                if diff > 0:
                    elevation_gain += diff
            
            training.elevation_gain = elevation_gain
        
        # Estimación simple de calorías (muy aproximada)
        if training.duration and training.user.weight:
            # MET aproximado según actividad
            met = {
                'running': 8.0,
                'cycling': 6.0,
                'swimming': 7.0,
                'walking': 3.5,
                'hiking': 5.0,
                'other': 5.0
            }.get(training.activity_type, 5.0)
            
            # Calorías = MET * peso en kg * tiempo en horas
            duration_hours = training.duration.total_seconds() / 3600
            training.calories = int(met * training.user.weight * duration_hours)
        
        training.save()

class GoalSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    
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
