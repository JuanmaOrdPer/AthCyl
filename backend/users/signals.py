from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from stats.models import UserStats

@receiver(post_save, sender=User)
def create_user_stats(sender, instance, created, **kwargs):
    """Crear estadísticas de usuario cuando se crea un nuevo usuario"""
    if created:
        UserStats.objects.create(user=instance)
