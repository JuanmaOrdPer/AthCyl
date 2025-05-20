from django.apps import AppConfig


class StatsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'stats'
    verbose_name = 'Estadísticas'
    
    def ready(self):
        import stats.signals
