from django.db.models.signals import post_save
from django.dispatch import receiver
from trainings.models import Training
from .models import ActivitySummary
import datetime

@receiver(post_save, sender=Training)
def actualizar_resumenes_actividad(sender, instance, created, **kwargs):
    """
    Actualiza los resúmenes de actividad diaria cuando se guarda un entrenamiento.
    Esto nos permite tener estadísticas agrupadas por días.
    """
    try:
        # Obtenemos la fecha del entrenamiento
        fecha = instance.date
        
        # Si no hay fecha, no podemos crear un resumen
        if fecha is None:
            print(f"[ADVERTENCIA] El entrenamiento {instance.id} no tiene fecha, no se puede crear resumen de actividad")
            return
            
        # Actualizamos el resumen diario (lo creamos si no existe)
        resumen_diario, es_nuevo = ActivitySummary.objects.get_or_create(
            user=instance.user,
            period_type='daily',  # Tipo de período: diario
            year=fecha.year,      # Año
            month=fecha.month,    # Mes
            day=fecha.day,        # Día
            defaults={
                'start_date': fecha,  # Fecha de inicio (la misma)
                'end_date': fecha     # Fecha de fin (la misma)
            }
        )
        
        # Obtenemos todos los entrenamientos del día para este usuario
        entrenamientos_dia = Training.objects.filter(
            user=instance.user,
            date=fecha
        )
        
        # Calculamos los totales para este día
        resumen_diario.training_count = entrenamientos_dia.count()
        
        # Sumamos las distancias (si hay alguna)
        distancia_total = 0
        for ent in entrenamientos_dia:
            if ent.distance:
                distancia_total += ent.distance
        resumen_diario.total_distance = distancia_total
        
        # Sumamos las calorías (si hay alguna)
        calorias_total = 0
        for ent in entrenamientos_dia:
            if ent.calories:
                calorias_total += ent.calories
        resumen_diario.total_calories = calorias_total
        
        # Calculamos la duración total
        segundos_totales = 0
        for ent in entrenamientos_dia:
            if ent.duration:
                segundos_totales += ent.duration.total_seconds()
        
        # Convertimos los segundos a objeto timedelta
        resumen_diario.total_duration = datetime.timedelta(seconds=segundos_totales)
        
        # Guardamos los cambios
        resumen_diario.save()
        
        if es_nuevo:
            print(f"Se ha creado un nuevo resumen diario para la fecha {fecha}")
        else:
            print(f"Se ha actualizado el resumen diario para la fecha {fecha}")
        
    except Exception as e:
        print(f"ERROR al actualizar los resúmenes de actividad: {e}")
        # Aquí podríamos hacer alguna acción adicional como enviar una notificación