from django.contrib import admin
from .models import Training, TrackPoint, Goal

@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'activity_type', 'date', 'distance', 'duration')
    list_filter = ('activity_type', 'date', 'user')
    search_fields = ('title', 'description', 'user__username', 'user__email')
    date_hierarchy = 'date'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('user', 'title', 'description', 'activity_type')}),
        ('Archivo', {'fields': ('gpx_file',)}),
        ('Datos básicos', {'fields': ('date', 'start_time', 'duration', 'distance')}),
        ('Métricas', {'fields': ('avg_speed', 'max_speed', 'avg_heart_rate', 'max_heart_rate', 'elevation_gain', 'calories')}),
        ('Metadatos', {'fields': ('created_at', 'updated_at')}),
    )

@admin.register(TrackPoint)
class TrackPointAdmin(admin.ModelAdmin):
    list_display = ('training', 'time', 'latitude', 'longitude', 'elevation', 'heart_rate', 'speed')
    list_filter = ('training', 'time')
    search_fields = ('training__title',)
    date_hierarchy = 'time'

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'goal_type', 'target_value', 'period', 'start_date', 'is_active', 'is_completed')
    list_filter = ('goal_type', 'period', 'is_active', 'is_completed', 'start_date')
    search_fields = ('title', 'description', 'user__username', 'user__email')
    date_hierarchy = 'start_date'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('user', 'title', 'description')}),
        ('Objetivo', {'fields': ('goal_type', 'target_value', 'period')}),
        ('Fechas', {'fields': ('start_date', 'end_date')}),
        ('Estado', {'fields': ('is_active', 'is_completed')}),
        ('Metadatos', {'fields': ('created_at', 'updated_at')}),
    )
