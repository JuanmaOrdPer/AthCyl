from django.db import models
from users.models import User
from trainings.models import Training
import datetime

class UserStats(models.Model):
    """Modelo para almacenar estadísticas agregadas del usuario"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    
    # Estadísticas totales
    total_trainings = models.IntegerField(default=0)
    total_distance = models.FloatField(default=0, help_text="Distancia total en kilómetros")
    total_duration = models.DurationField(default=datetime.timedelta(0))
    total_calories = models.IntegerField(default=0)
    
    # Promedios
    avg_distance_per_training = models.FloatField(default=0, help_text="Distancia promedio por entrenamiento en km")
    avg_duration_per_training = models.DurationField(default=datetime.timedelta(0))
    avg_speed = models.FloatField(default=0, help_text="Velocidad promedio en km/h")
    avg_heart_rate = models.FloatField(default=0, help_text="Ritmo cardíaco promedio")
    
    # Récords
    longest_distance = models.FloatField(default=0, help_text="Distancia más larga en km")
    longest_duration = models.DurationField(default=datetime.timedelta(0))
    highest_speed = models.FloatField(default=0, help_text="Velocidad más alta en km/h")
    highest_elevation_gain = models.FloatField(default=0, help_text="Mayor ganancia de elevación en metros")
    
    # Fechas
    first_training_date = models.DateField(null=True, blank=True)
    last_training_date = models.DateField(null=True, blank=True)
    
    # Metadatos
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Estadísticas de {self.user.username}"
    
    def update_stats(self):
        """Actualiza todas las estadísticas basadas en los entrenamientos del usuario"""
        
        trainings = Training.objects.filter(user=self.user)
        count = trainings.count()
        
        if count == 0:
            # No hay entrenamientos, reiniciar estadísticas
            self.total_trainings = 0
            self.total_distance = 0
            self.total_duration = datetime.timedelta(0)
            self.total_calories = 0
            self.avg_distance_per_training = 0
            self.avg_duration_per_training = datetime.timedelta(0)
            self.avg_speed = 0
            self.avg_heart_rate = 0
            self.longest_distance = 0
            self.longest_duration = datetime.timedelta(0)
            self.highest_speed = 0
            self.highest_elevation_gain = 0
            self.first_training_date = None
            self.last_training_date = None
            self.save()
            return
        
        # Calcular totales
        total_distance = 0
        total_duration_seconds = 0
        total_calories = 0
        
        # Listas para calcular promedios
        distances = []
        durations = []
        speeds = []
        heart_rates = []
        
        # Variables para récords
        longest_distance = 0
        longest_duration = datetime.timedelta(0)
        highest_speed = 0
        highest_elevation_gain = 0
        
        # Fechas
        dates = []
        
        # Procesar cada entrenamiento
        for training in trainings:
            # Distancia
            if training.distance:
                total_distance += training.distance
                distances.append(training.distance)
                longest_distance = max(longest_distance, training.distance)
            
            # Duración
            if training.duration:
                total_duration_seconds += training.duration.total_seconds()
                durations.append(training.duration)
                if training.duration > longest_duration:
                    longest_duration = training.duration
            
            # Calorías
            if training.calories:
                total_calories += training.calories
            
            # Velocidad
            if training.avg_speed:
                speeds.append(training.avg_speed)
            
            if training.max_speed:
                highest_speed = max(highest_speed, training.max_speed)
            
            # Ritmo cardíaco
            if training.avg_heart_rate:
                heart_rates.append(training.avg_heart_rate)
            
            # Elevación
            if training.elevation_gain:
                highest_elevation_gain = max(highest_elevation_gain, training.elevation_gain)
            
            # Fecha
            dates.append(training.date)
        
        # Actualizar totales
        self.total_trainings = count
        self.total_distance = total_distance
        self.total_duration = datetime.timedelta(seconds=total_duration_seconds)
        self.total_calories = total_calories
        
        # Actualizar promedios
        self.avg_distance_per_training = total_distance / count if count > 0 else 0
        self.avg_duration_per_training = datetime.timedelta(seconds=total_duration_seconds / count) if count > 0 else datetime.timedelta(0)
        self.avg_speed = sum(speeds) / len(speeds) if speeds else 0
        self.avg_heart_rate = sum(heart_rates) / len(heart_rates) if heart_rates else 0
        
        # Actualizar récords
        self.longest_distance = longest_distance
        self.longest_duration = longest_duration
        self.highest_speed = highest_speed
        self.highest_elevation_gain = highest_elevation_gain
        
        # Actualizar fechas
        if dates:
            self.first_training_date = min(dates)
            self.last_training_date = max(dates)
        
        self.save()

class ActivitySummary(models.Model):
    """Modelo para almacenar resúmenes de actividad por período"""
    
    PERIOD_CHOICES = [
        ('daily', 'Diario'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
        ('yearly', 'Anual'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_summaries')
    period_type = models.CharField(max_length=10, choices=PERIOD_CHOICES)
    
    # Identificadores de período
    year = models.IntegerField()
    month = models.IntegerField(null=True, blank=True)  # Solo para mensual y diario
    week = models.IntegerField(null=True, blank=True)   # Solo para semanal
    day = models.IntegerField(null=True, blank=True)    # Solo para diario
    
    # Estadísticas del período
    start_date = models.DateField()
    end_date = models.DateField()
    training_count = models.IntegerField(default=0)
    total_distance = models.FloatField(default=0, help_text="Distancia total en kilómetros")
    total_duration = models.DurationField(default=datetime.timedelta(0))
    total_calories = models.FloatField(default=0)
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'period_type', 'year', 'month', 'week', 'day')
        ordering = ['-year', '-month', '-week', '-day']
    
    def __str__(self):
        if self.period_type == 'daily':
            return f"Resumen diario: {self.day}/{self.month}/{self.year} ({self.user.username})"
        elif self.period_type == 'weekly':
            return f"Resumen semanal: Semana {self.week}/{self.year} ({self.user.username})"
        elif self.period_type == 'monthly':
            return f"Resumen mensual: {self.month}/{self.year} ({self.user.username})"
        else:  # yearly
            return f"Resumen anual: {self.year} ({self.user.username})"
