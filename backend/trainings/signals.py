from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Training
from stats.models import UserStats

@receiver(post_save, sender=Training)
def actualizar_estadisticas_al_guardar(sender, instance, created, **kwargs):
    """
    Esta función se ejecuta automáticamente cuando se guarda un entrenamiento.
    Sirve para mantener actualizadas las estadísticas del usuario.
    """
    try:
        # Obtener o crear estadísticas para este usuario
        estadisticas, _ = UserStats.objects.get_or_create(user=instance.user)
        # Actualizar todas las estadísticas
        estadisticas.update_stats()
        
        if created:
            print(f"Se ha creado un nuevo entrenamiento '{instance.title}' y se han actualizado las estadísticas.")
        else:
            print(f"Se ha actualizado el entrenamiento '{instance.title}' y se han recalculado las estadísticas.")
            
    except Exception as e:
        # Si algo falla, lo registramos para poder solucionarlo
        print(f"ERROR al actualizar estadísticas: {e}")
        # Aquí podríamos enviar un email al administrador o hacer algo más

@receiver(post_delete, sender=Training)
def actualizar_estadisticas_al_eliminar(sender, instance, **kwargs):
    """
    Esta función se ejecuta automáticamente cuando se elimina un entrenamiento.
    Necesitamos actualizar las estadísticas porque han cambiado los datos.
    """
    try:
        # Obtener o crear estadísticas para este usuario
        estadisticas, _ = UserStats.objects.get_or_create(user=instance.user)
        # Actualizar estadísticas
        estadisticas.update_stats()
        print(f"Se ha eliminado el entrenamiento '{instance.title}' y se han actualizado las estadísticas.")
        
    except Exception as e:
        # Registramos el error
        print(f"ERROR al actualizar estadísticas después de eliminar: {e}")