"""
Módulo para gestionar los modelos de entrenamientos.

Este módulo contiene las clases de modelos para:
- Training: Almacena los datos principales de un entrenamiento
- TrackPoint: Guarda los puntos GPS de la ruta seguida
- Goal: Maneja los objetivos de entrenamiento del usuario

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
Proyecto: AthCyl - Gestión de entrenamientos deportivos
"""

from django.db import models
from users.models import User
import uuid
import os

def gpx_file_path(instance, filename):
    """Genera una ruta única para los archivos GPX/TCX"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('trainings/gpx', filename)

class Training(models.Model):
    """
    Modelo para almacenar entrenamientos de los usuarios.
    
    Cada entrenamiento tiene información como la distancia, duración, 
    tipo de actividad y estadísticas relacionadas con el rendimiento
    del usuario durante la sesión.
    """
    
    # Opciones para el campo de tipo de actividad
    ACTIVITY_CHOICES = [
        ('running', 'Correr'),
        ('cycling', 'Ciclismo'),
        ('swimming', 'Natación'),
        ('walking', 'Caminar'),
        ('hiking', 'Senderismo'),
        ('other', 'Otro'),
    ]
    
    # Relación con el usuario (cuando se elimina un usuario, se eliminan sus entrenamientos)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trainings', verbose_name="Usuario")
    
    # Datos básicos
    title = models.CharField(max_length=100, verbose_name="Título")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_CHOICES, default='running', verbose_name="Tipo de actividad")
    
    # Archivo GPX/TCX subido por el usuario
    gpx_file = models.FileField(upload_to=gpx_file_path, blank=True, null=True, verbose_name="Archivo GPX/TCX")
    
    # Información temporal del entrenamiento
    date = models.DateField(verbose_name="Fecha")
    start_time = models.TimeField(verbose_name="Hora de inicio")
    duration = models.DurationField(blank=True, null=True, verbose_name="Duración")
    
    # Métricas básicas
    distance = models.FloatField(blank=True, null=True, help_text="Distancia en kilómetros", verbose_name="Distancia")
    
    # Métricas de rendimiento
    avg_speed = models.FloatField(blank=True, null=True, help_text="Velocidad promedio en km/h", verbose_name="Velocidad promedio")
    max_speed = models.FloatField(blank=True, null=True, help_text="Velocidad máxima en km/h", verbose_name="Velocidad máxima")
    avg_heart_rate = models.FloatField(blank=True, null=True, help_text="Ritmo cardíaco promedio", verbose_name="Ritmo cardíaco promedio")
    max_heart_rate = models.FloatField(blank=True, null=True, help_text="Ritmo cardíaco máximo", verbose_name="Ritmo cardíaco máximo")
    elevation_gain = models.FloatField(blank=True, null=True, help_text="Ganancia de elevación en metros", verbose_name="Ganancia de elevación")
    calories = models.IntegerField(blank=True, null=True, help_text="Calorías quemadas", verbose_name="Calorías quemadas")
    
    # Datos de auditoría
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    def __str__(self):
        """Devuelve una representación en texto del objeto"""
        return f"{self.title} - {self.date} ({self.user.username})"
    
    class Meta:
        """Meta opciones del modelo"""
        verbose_name = "Entrenamiento"
        verbose_name_plural = "Entrenamientos"
        ordering = ['-date', '-start_time']  # Ordenar por fecha descendente y luego por hora

class TrackPoint(models.Model):
    """
    Modelo para almacenar los puntos individuales de una ruta de entrenamiento.
    
    Cada punto tiene coordenadas geográficas, tiempo, y opcionalmente otros datos
    como elevación, ritmo cardíaco y velocidad en ese punto específico.
    """
    
    training = models.ForeignKey(Training, on_delete=models.CASCADE, related_name='track_points', verbose_name="Entrenamiento")
    latitude = models.FloatField(verbose_name="Latitud")
    longitude = models.FloatField(verbose_name="Longitud")
    elevation = models.FloatField(blank=True, null=True, verbose_name="Elevación")
    time = models.DateTimeField(verbose_name="Tiempo")
    heart_rate = models.IntegerField(blank=True, null=True, verbose_name="Ritmo cardíaco")
    speed = models.FloatField(blank=True, null=True, verbose_name="Velocidad")
    
    def __str__(self):
        return f"Punto de ruta en {self.time} para {self.training.title}"
    
    class Meta:
        verbose_name = "Punto de ruta"
        verbose_name_plural = "Puntos de ruta"
        ordering = ['time']  # Ordenamos por tiempo para mantener la secuencia correcta

class Goal(models.Model):
    """
    Modelo para almacenar objetivos de entrenamiento del usuario.
    
    Los usuarios pueden establecer diferentes tipos de objetivos como
    distancia a recorrer, duración de entrenamientos, frecuencia, etc.
    El sistema hace seguimiento automático del progreso.
    """
    
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
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals', verbose_name="Usuario")
    title = models.CharField(max_length=100, verbose_name="Título")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPE_CHOICES, verbose_name="Tipo de objetivo")
    target_value = models.FloatField(help_text="Valor objetivo (km, minutos, etc.)", verbose_name="Valor objetivo")
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES, default='weekly', verbose_name="Periodo")
    
    start_date = models.DateField(verbose_name="Fecha de inicio")
    end_date = models.DateField(blank=True, null=True, verbose_name="Fecha de finalización")
    
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    is_completed = models.BooleanField(default=False, verbose_name="Completado")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")

    def __str__(self):
        verbose_name = "Objetivo"
        verbose_name_plural = "Objetivos"
        return f"{self.title} - {self.get_goal_type_display()} ({self.user.username})"
    
    class Meta:
        ordering = ['-created_at']