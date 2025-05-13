from django.db import models
from users.models import User
import uuid
import os

def gpx_file_path(instance, filename):
    """Genera una ruta única para los archivos GPX"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('trainings/gpx', filename)

class Training(models.Model):
    """Modelo para almacenar los entrenamientos de los usuarios"""
    
    ACTIVITY_CHOICES = [
        ('running', 'Correr'),
        ('cycling', 'Ciclismo'),
        ('swimming', 'Natación'),
        ('walking', 'Caminar'),
        ('hiking', 'Senderismo'),
        ('other', 'Otro'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trainings')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_CHOICES, default='running')
    
    # Archivo GPX/TCX
    gpx_file = models.FileField(upload_to=gpx_file_path, blank=True, null=True)
    
    # Datos básicos del entrenamiento
    date = models.DateField()
    start_time = models.TimeField()
    duration = models.DurationField(blank=True, null=True)  # Duración total
    distance = models.FloatField(blank=True, null=True, help_text="Distancia en kilómetros")
    
    # Métricas adicionales
    avg_speed = models.FloatField(blank=True, null=True, help_text="Velocidad promedio en km/h")
    max_speed = models.FloatField(blank=True, null=True, help_text="Velocidad máxima en km/h")
    avg_heart_rate = models.FloatField(blank=True, null=True, help_text="Ritmo cardíaco promedio")
    max_heart_rate = models.FloatField(blank=True, null=True, help_text="Ritmo cardíaco máximo")
    elevation_gain = models.FloatField(blank=True, null=True, help_text="Ganancia de elevación en metros")
    calories = models.IntegerField(blank=True, null=True, help_text="Calorías quemadas")
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.date} ({self.user.username})"
    
    class Meta:
        ordering = ['-date', '-start_time']

class TrackPoint(models.Model):
    """Modelo para almacenar puntos de seguimiento de un entrenamiento"""
    
    training = models.ForeignKey(Training, on_delete=models.CASCADE, related_name='track_points')
    latitude = models.FloatField()
    longitude = models.FloatField()
    elevation = models.FloatField(blank=True, null=True)
    time = models.DateTimeField()
    heart_rate = models.IntegerField(blank=True, null=True)
    speed = models.FloatField(blank=True, null=True)
    
    def __str__(self):
        return f"Point at {self.time} for {self.training.title}"
    
    class Meta:
        ordering = ['time']

class Goal(models.Model):
    """Modelo para almacenar objetivos de entrenamiento del usuario"""
    
    GOAL_TYPE_CHOICES = [
        ('distance', 'Distancia'),
        ('duration', 'Duración'),
        ('frequency', 'Frecuencia'),
        ('speed', 'Velocidad'),
        ('other', 'Otro'),
    ]
    
    PERIOD_CHOICES = [
        ('daily', 'Diario'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
        ('yearly', 'Anual'),
        ('custom', 'Personalizado'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPE_CHOICES)
    target_value = models.FloatField(help_text="Valor objetivo (km, minutos, etc.)")
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES, default='weekly')
    
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    is_completed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.get_goal_type_display()} ({self.user.username})"
    
    class Meta:
        ordering = ['-created_at']
