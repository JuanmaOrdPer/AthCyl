from django.apps import AppConfig


class TrainingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'trainings'
    verbose_name = 'Entrenamientos'
    
    def ready(self):
        import trainings.signals
