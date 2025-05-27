from django.contrib import admin
from django import forms
from django.forms import DateInput
from .models import Training, TrackPoint, Goal

class GoalForm(forms.ModelForm):
    class Meta:
        model = Goal
        fields = '__all__'
        widgets = {
            'start_date': DateInput(attrs={'type': 'date'}),
            'end_date': DateInput(attrs={'type': 'date'}),
        }

@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'activity_type', 'date', 'distance', 'duration', 'avg_heart_rate', 'calories')
    list_filter = ('activity_type', 'date', 'user')
    search_fields = ('title', 'description', 'user__username', 'user__email')
    date_hierarchy = 'date'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('user', 'title', 'description', 'activity_type')}),
        ('Archivo', {'fields': ('gpx_file',)}),
        ('Datos básicos', {'fields': ('date', 'start_time', 'duration', 'distance')}),
        ('Velocidad y ritmo cardíaco', {
            'fields': ('avg_speed', 'max_speed', 'avg_heart_rate', 'max_heart_rate'),
            'classes': ('wide',)
        }),
        ('Elevación y calorías', {
            'fields': ('elevation_gain', 'calories'),
            'classes': ('wide',)
        }),
        ('Cadencia (GPX)', {
            'fields': ('avg_cadence', 'max_cadence'),
            'classes': ('collapse', 'wide'),
            'description': 'Datos de cadencia extraídos de archivos GPX con extensiones'
        }),
        ('Temperatura (GPX)', {
            'fields': ('avg_temperature', 'min_temperature', 'max_temperature'),
            'classes': ('collapse', 'wide'),
            'description': 'Datos de temperatura ambiente extraídos de archivos GPX'
        }),
        ('Metadatos', {'fields': ('created_at', 'updated_at')}),
    )

@admin.register(TrackPoint)
class TrackPointAdmin(admin.ModelAdmin):
    list_display = ('training', 'time', 'latitude', 'longitude', 'elevation', 'heart_rate', 'speed', 'cadence', 'temperature')
    list_filter = ('training', 'time')
    search_fields = ('training__title',)
    date_hierarchy = 'time'
    fieldsets = (
        (None, {
            'fields': ('training', 'time')
        }),
        ('Ubicación', {
            'fields': ('latitude', 'longitude', 'elevation'),
            'classes': ('wide',)
        }),
        ('Métricas de rendimiento', {
            'fields': ('heart_rate', 'speed', 'cadence'),
            'classes': ('wide',)
        }),
        ('Condiciones ambientales', {
            'fields': ('temperature',),
            'classes': ('wide',)
        }),
    )

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    form = GoalForm
    list_display = ('title', 'user', 'goal_type', 'target_value', 'period', 'start_date', 'is_active', 'is_completed')
    list_filter = ('goal_type', 'period', 'is_active', 'is_completed', 'start_date')
    search_fields = ('title', 'description', 'user__username', 'user__email')
    date_hierarchy = 'start_date'
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('user', 'title', 'description')
        }),
        ('Objetivo', {
            'fields': ('goal_type', 'target_value', 'period')
        }),
        ('Fechas', {
            'fields': ('start_date', 'end_date'),
            'classes': ('wide',)
        }),
        ('Estado', {
            'fields': ('is_active', 'is_completed')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )