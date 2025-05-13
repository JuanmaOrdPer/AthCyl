from django.contrib import admin
from .models import UserStats, ActivitySummary

@admin.register(UserStats)
class UserStatsAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_trainings', 'total_distance', 'total_duration', 'last_updated')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('user', 'total_trainings', 'total_distance', 'total_duration', 
                      'total_calories', 'avg_distance_per_training', 'avg_duration_per_training',
                      'avg_speed', 'avg_heart_rate', 'longest_distance', 'longest_duration',
                      'highest_speed', 'highest_elevation_gain', 'first_training_date',
                      'last_training_date', 'last_updated')
    fieldsets = (
        (None, {'fields': ('user',)}),
        ('Totales', {'fields': ('total_trainings', 'total_distance', 'total_duration', 'total_calories')}),
        ('Promedios', {'fields': ('avg_distance_per_training', 'avg_duration_per_training', 'avg_speed', 'avg_heart_rate')}),
        ('Récords', {'fields': ('longest_distance', 'longest_duration', 'highest_speed', 'highest_elevation_gain')}),
        ('Fechas', {'fields': ('first_training_date', 'last_training_date', 'last_updated')}),
    )

@admin.register(ActivitySummary)
class ActivitySummaryAdmin(admin.ModelAdmin):
    list_display = ('user', 'period_type', 'year', 'month', 'week', 'day', 'training_count', 'total_distance')
    list_filter = ('period_type', 'year', 'month', 'week')
    search_fields = ('user__username', 'user__email')
    date_hierarchy = 'start_date'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('user', 'period_type')}),
        ('Período', {'fields': ('year', 'month', 'week', 'day', 'start_date', 'end_date')}),
        ('Estadísticas', {'fields': ('training_count', 'total_distance', 'total_duration', 'total_calories')}),
        ('Metadatos', {'fields': ('created_at', 'updated_at')}),
    )
