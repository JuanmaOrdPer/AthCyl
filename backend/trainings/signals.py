from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Training
from stats.models import UserStats

@receiver(post_save, sender=Training)
def update_user_stats_on_training_save(sender, instance, created, **kwargs):
    """Actualizar estadísticas de usuario cuando se crea o modifica un entrenamiento"""
    try:
        stats, _ = UserStats.objects.get_or_create(user=instance.user)
        stats.update_stats()
    except Exception as e:
        print(f"Error al actualizar estadísticas: {e}")

@receiver(post_delete, sender=Training)
def update_user_stats_on_training_delete(sender, instance, **kwargs):
    """Actualizar estadísticas de usuario cuando se elimina un entrenamiento"""
    try:
        stats, _ = UserStats.objects.get_or_create(user=instance.user)
        stats.update_stats()
    except Exception as e:
        print(f"Error al actualizar estadísticas: {e}")
