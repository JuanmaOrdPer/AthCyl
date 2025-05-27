"""
Modelos para el seguimiento de estadísticas de entrenamiento.

Este módulo define los modelos para almacenar y calcular:
- Estadísticas globales de entrenamiento por usuario
- Resúmenes de actividad por períodos (diario, semanal, mensual, anual)

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

from django.db import models
from users.models import User
import datetime
import logging

logger = logging.getLogger(__name__)

class UserStats(models.Model):
    """
    Modelo para almacenar estadísticas agregadas del usuario.
    
    Contiene métricas totales, promedios y récords basados
    en todos los entrenamientos del usuario.
    """
    
    # Relación con el usuario (one-to-one)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats', verbose_name="Usuario", db_column="usuario")
    
    # Estadísticas totales
    total_trainings = models.IntegerField(default=0, verbose_name="Total de entrenamientos", db_column="total_entrenamientos")
    total_distance = models.FloatField(default=0, help_text="Distancia total en kilómetros", verbose_name="Distancia total", db_column="distancia_total")
    total_duration = models.DurationField(default=datetime.timedelta(0), verbose_name="Duración total", db_column="duracion_total")
    total_calories = models.IntegerField(default=0, verbose_name="Total de calorías", db_column="calorías_total")
    
    # Promedios
    avg_distance_per_training = models.FloatField(default=0, help_text="Distancia promedio por entrenamiento en km", verbose_name="Distancia promedio", db_column="distancia_promedio_por_entrenamiento")
    avg_duration_per_training = models.DurationField(default=datetime.timedelta(0), verbose_name="Duración promedio", db_column="duracion_promedio_por_entrenamiento")
    avg_speed = models.FloatField(default=0, help_text="Velocidad promedio en km/h", verbose_name="Velocidad promedio", db_column="velocidad_promedio")
    avg_heart_rate = models.FloatField(default=0, help_text="Ritmo cardíaco promedio", verbose_name="Ritmo cardíaco promedio", db_column="ritmo_cardíaco_promedio")
    
    # Récords
    longest_distance = models.FloatField(default=0, help_text="Distancia más larga en km", verbose_name="Distancia más larga", db_column="distancia_más_larga")
    longest_duration = models.DurationField(default=datetime.timedelta(0), verbose_name="Duración más larga", db_column="duracion_más_larga")
    highest_speed = models.FloatField(default=0, help_text="Velocidad más alta en km/h", verbose_name="Velocidad más alta", db_column="velocidad_más_alta")
    highest_elevation_gain = models.FloatField(default=0, help_text="Mayor ganancia de elevación en metros", verbose_name="Mayor desnivel", db_column="mayor_desnivel")
    
    # Fechas
    first_training_date = models.DateField(null=True, blank=True, verbose_name="Fecha del primer entrenamiento", db_column="fecha_del_primer_entrenamiento")
    last_training_date = models.DateField(null=True, blank=True, verbose_name="Fecha del último entrenamiento", db_column="fecha_del_último_entrenamiento")
    
    # Metadatos
    last_updated = models.DateTimeField(auto_now=True, verbose_name="Última actualización", db_column="última_actualización")
    
    def __str__(self):
        """Representación en texto del objeto"""
        return f"Estadísticas de {self.user.username}"
    
    def update_stats(self):
        """
        Actualiza todas las estadísticas basadas en los entrenamientos del usuario.
        
        Este método recalcula todas las métricas a partir de los entrenamientos
        actuales del usuario, asegurando que las estadísticas estén siempre actualizadas.
        """
        logger.info(f"Actualizando estadísticas para el usuario {self.user.username}...")
        
        # Importar aquí para evitar importación circular
        from trainings.models import Training
        
        # Obtener todos los entrenamientos del usuario que tengan datos válidos
        entrenamientos = Training.objects.filter(user=self.user).exclude(
            date__isnull=True
        )
        cantidad = entrenamientos.count()
        
        if cantidad == 0:
            # No hay entrenamientos, reiniciar estadísticas
            logger.info("El usuario no tiene entrenamientos, reiniciando estadísticas.")
            self._reset_stats()
            self.save()
            return
        
        logger.info(f"Encontrados {cantidad} entrenamientos.")
        
        # Variables para calcular totales
        distancia_total = 0
        segundos_totales = 0
        calorias_totales = 0
        
        # Listas para calcular promedios
        distancias = []
        duraciones = []
        velocidades = []
        ritmos_cardiacos = []
        
        # Variables para récords
        distancia_maxima = 0
        duracion_maxima = datetime.timedelta(0)
        velocidad_maxima = 0
        desnivel_maximo = 0
        
        # Fechas de los entrenamientos
        fechas = []
        
        # Procesar cada entrenamiento
        for entrenamiento in entrenamientos:
            # Distancia
            if entrenamiento.distance:
                distancia_total += entrenamiento.distance
                distancias.append(entrenamiento.distance)
                # Actualizar récord si es necesario
                if entrenamiento.distance > distancia_maxima:
                    distancia_maxima = entrenamiento.distance
            
            # Duración
            if entrenamiento.duration:
                segundos_totales += entrenamiento.duration.total_seconds()
                duraciones.append(entrenamiento.duration)
                # Actualizar récord si es necesario
                if entrenamiento.duration > duracion_maxima:
                    duracion_maxima = entrenamiento.duration
            
            # Calorías
            if entrenamiento.calories:
                calorias_totales += entrenamiento.calories
            
            # Velocidad
            if entrenamiento.avg_speed:
                velocidades.append(entrenamiento.avg_speed)
            
            # Velocidad máxima (récord)
            if entrenamiento.max_speed and entrenamiento.max_speed > velocidad_maxima:
                velocidad_maxima = entrenamiento.max_speed
            
            # Ritmo cardíaco
            if entrenamiento.avg_heart_rate:
                ritmos_cardiacos.append(entrenamiento.avg_heart_rate)
            
            # Elevación (desnivel)
            if entrenamiento.elevation_gain and entrenamiento.elevation_gain > desnivel_maximo:
                desnivel_maximo = entrenamiento.elevation_gain
            
            # Fecha
            if entrenamiento.date:
                fechas.append(entrenamiento.date)
        
        # Actualizar totales
        self.total_trainings = cantidad
        self.total_distance = distancia_total
        self.total_duration = datetime.timedelta(seconds=segundos_totales)
        self.total_calories = calorias_totales
        
        # Actualizar promedios
        if cantidad > 0:
            self.avg_distance_per_training = distancia_total / cantidad
            self.avg_duration_per_training = datetime.timedelta(seconds=segundos_totales / cantidad)
        else:
            self.avg_distance_per_training = 0
            self.avg_duration_per_training = datetime.timedelta(0)
            
        if velocidades:
            self.avg_speed = sum(velocidades) / len(velocidades)
        else:
            self.avg_speed = 0
            
        if ritmos_cardiacos:
            self.avg_heart_rate = sum(ritmos_cardiacos) / len(ritmos_cardiacos)
        else:
            self.avg_heart_rate = 0
        
        # Actualizar récords
        self.longest_distance = distancia_maxima
        self.longest_duration = duracion_maxima
        self.highest_speed = velocidad_maxima
        self.highest_elevation_gain = desnivel_maximo
        
        # Actualizar fechas
        if fechas:
            self.first_training_date = min(fechas)
            self.last_training_date = max(fechas)
        else:
            self.first_training_date = None
            self.last_training_date = None
        
        self.save()
        logger.info(f"Estadísticas actualizadas correctamente para {self.user.username}.")
    
    def _reset_stats(self):
        """Reinicia todas las estadísticas a cero"""
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
    
    class Meta:
        verbose_name = "Estadísticas de usuario"
        verbose_name_plural = "Estadísticas de usuarios"
        db_table = "estadisticas_usuario"  # Nombre de tabla en español

class ActivitySummary(models.Model):
    """
    Modelo para almacenar resúmenes de actividad por período.
    
    Permite agrupar estadísticas por día, semana, mes o año para
    facilitar la visualización de tendencias y progreso.
    """
    
    PERIOD_CHOICES = [
        ('daily', 'Diario'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
        ('yearly', 'Anual'),
    ]
    
    # Relaciones
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_summaries', verbose_name="Usuario")
    
    # Tipo de período
    period_type = models.CharField(max_length=10, choices=PERIOD_CHOICES, verbose_name="Tipo de período")
    
    # Identificadores de período
    year = models.IntegerField(verbose_name="Año")
    month = models.IntegerField(null=True, blank=True, verbose_name="Mes")  # Solo para mensual y diario
    week = models.IntegerField(null=True, blank=True, verbose_name="Semana")   # Solo para semanal
    day = models.IntegerField(null=True, blank=True, verbose_name="Día")    # Solo para diario
    
    # Rango de fechas
    start_date = models.DateField(verbose_name="Fecha de inicio")
    end_date = models.DateField(verbose_name="Fecha de fin")
    
    # Estadísticas del período
    training_count = models.IntegerField(default=0, verbose_name="Número de entrenamientos")
    total_distance = models.FloatField(default=0, help_text="Distancia total en kilómetros", verbose_name="Distancia total")
    total_duration = models.DurationField(default=datetime.timedelta(0), verbose_name="Duración total")
    total_calories = models.FloatField(default=0, verbose_name="Calorías totales")
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        unique_together = ('user', 'period_type', 'year', 'month', 'week', 'day')
        ordering = ['-year', '-month', '-week', '-day']
        verbose_name = "Resumen de actividad"
        verbose_name_plural = "Resúmenes de actividad"
        db_table = "resumenes_actividad"  # Nombre de tabla en español
    
    def __str__(self):
        """Representación en texto del resumen de actividad"""
        if self.period_type == 'daily':
            return f"Resumen diario: {self.day}/{self.month}/{self.year} ({self.user.username})"
        elif self.period_type == 'weekly':
            return f"Resumen semanal: Semana {self.week}/{self.year} ({self.user.username})"
        elif self.period_type == 'monthly':
            return f"Resumen mensual: {self.month}/{self.year} ({self.user.username})"
        else:  # yearly
            return f"Resumen anual: {self.year} ({self.user.username})"