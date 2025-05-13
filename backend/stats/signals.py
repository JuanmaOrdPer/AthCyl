from django.db.models.signals import post_save
from django.dispatch import receiver
from trainings.models import Training
from .models import ActivitySummary
import datetime

@receiver(post_save, sender=Training)
def update_activity_summaries(sender, instance, created, **kwargs):
    """Actualizar resúmenes de actividad cuando se crea o modifica un entrenamiento"""
    try:
        # Obtener fecha del entrenamiento
        date = instance.date
        
        # Actualizar resumen diario
        daily_summary, _ = ActivitySummary.objects.get_or_create(
            user=instance.user,
            period_type='daily',
            year=date.year,
            month=date.month,
            day=date.day,
            defaults={
                'start_date': date,
                'end_date': date
            }
        )
        
        # Obtener todos los entrenamientos del día
        day_trainings = Training.objects.filter(
            user=instance.user,
            date=date
        )
        
        # Actualizar estadísticas del día
        daily_summary.training_count = day_trainings.count()
        daily_summary.total_distance = sum(t.distance or 0 for t in day_trainings)
        daily_summary.total_calories = sum(t.calories or 0 for t in day_trainings)
        
        # Calcular duración total
        total_duration_seconds = sum(
            t.duration.total_seconds() for t in day_trainings if t.duration
        )
        daily_summary.total_duration = datetime.timedelta(seconds=total_duration_seconds)
        
        daily_summary.save()
        
        # También podríamos actualizar los resúmenes semanales, mensuales y anuales
        # pero lo dejamos para que se haga a través de la API para evitar
        # demasiadas actualizaciones en cada guardado de entrenamiento
        
    except Exception as e:
        print(f"Error al actualizar resúmenes de actividad: {e}")
