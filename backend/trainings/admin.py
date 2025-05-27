"""
Configuración del Admin de Django para la app de entrenamientos.

Proporciona una interfaz administrativa completa para:
- Gestionar entrenamientos (con y sin archivos)
- Ver puntos de ruta 
- Gestionar objetivos
- Procesamiento fácil de archivos

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

from django.contrib import admin
from django import forms
from django.forms import DateInput, TimeInput
from django.utils.html import format_html
from django.urls import reverse
from django.http import HttpResponseRedirect
from django.contrib import messages
from .models import Training, TrackPoint, Goal
from django.forms import ModelForm, FileInput

class TrainingAdminForm(forms.ModelForm):
    """Formulario personalizado para entrenamientos en el admin"""
    
    class Meta:
        model = Training
        fields = '__all__'
        widgets = {
            'date': DateInput(attrs={
                'type': 'date',
                'class': 'vDateField'
            }),
            'start_time': TimeInput(attrs={
                'type': 'time', 
                'class': 'vTimeField'
            }),
            'description': forms.Textarea(attrs={
                'rows': 3,
                'cols': 40
            }),
            'gpx_file': FileInput(attrs={
                'accept': '.gpx,.tcx,.fit',
                'class': 'vFileUploadField'
            }),
        }
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Configurar el campo de archivo
        self.fields['gpx_file'].widget.attrs.update({
            'accept': '.gpx,.tcx,.fit',
            'style': 'width: 100%;'
        })
        
        # Configurar campos obligatorios según el contexto
        if not self.instance.pk or not self.instance.gpx_file:
            # Para entrenamientos nuevos o sin archivo
            self.fields['date'].required = True
            self.fields['start_time'].required = True
            self.fields['activity_type'].required = True
            
            # Ayuda contextual
            self.fields['date'].help_text = "📅 Obligatorio para entrenamientos manuales"
            self.fields['start_time'].help_text = "⏰ Obligatorio para entrenamientos manuales"
            self.fields['gpx_file'].help_text = "📎 Sube un archivo GPX/TCX/FIT para extraer datos automáticamente"
        else:
            # Para entrenamientos con archivo
            self.fields['gpx_file'].help_text = "📎 Archivo procesado automáticamente"

@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    """Administración avanzada de entrenamientos"""
    
    form = TrainingAdminForm
    
    # Configuración de la lista
    list_display = (
        'id', 'title', 'user', 'activity_type', 'date', 'distance_display', 
        'duration_display', 'file_status', 'processing_status'
    )
    
    list_filter = (
        'activity_type', 'date', 'file_processed', 'user',
        ('date', admin.DateFieldListFilter),
        ('created_at', admin.DateFieldListFilter),
    )
    
    search_fields = ('title', 'description', 'user__username', 'user__email')
    date_hierarchy = 'date'
    
    readonly_fields = (
        'created_at', 'updated_at', 'file_processed', 'processing_error',
        'track_points_count', 'file_info'
    )
    
    # Configuración del formulario
    fieldsets = (
        ('📋 Información Básica', {
            'fields': ('user', 'title', 'description', 'activity_type'),
            'description': 'Información general del entrenamiento'
        }),
        
        ('📎 Archivo Deportivo', {
            'fields': ('gpx_file', 'file_info'),
            'description': '🚀 Sube un archivo GPX, TCX o FIT para extraer datos automáticamente'
        }),
        
        ('📅 Datos Temporales', {
            'fields': ('date', 'start_time', 'duration'),
            'description': 'Fecha y tiempo del entrenamiento (obligatorios para entrenamientos manuales)'
        }),
        
        ('📏 Métricas Básicas', {
            'fields': ('distance', 'calories'),
            'classes': ('wide',),
            'description': 'Distancia y calorías del entrenamiento'
        }),
        
        ('🏃 Velocidad y Rendimiento', {
            'fields': ('avg_speed', 'max_speed', 'avg_heart_rate', 'max_heart_rate'),
            'classes': ('wide',)
        }),
        
        ('⛰️ Elevación', {
            'fields': ('elevation_gain',),
            'classes': ('wide',)
        }),
        
        ('📊 Datos Avanzados (GPX/FIT)', {
            'fields': ('avg_cadence', 'max_cadence', 'avg_temperature', 'min_temperature', 'max_temperature'),
            'classes': ('collapse', 'wide'),
            'description': 'Datos extraídos automáticamente desde archivos con extensiones'
        }),
        
        ('🔧 Estado del Procesamiento', {
            'fields': ('file_processed', 'processing_error', 'track_points_count'),
            'classes': ('collapse',),
            'description': 'Información técnica sobre el procesamiento del archivo'
        }),
        
        ('🕒 Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Campos calculados para la lista
    def distance_display(self, obj):
        """Mostrar distancia formateada"""
        if obj.distance:
            return f"{obj.distance:.2f} km"
        return "No disponible"
    distance_display.short_description = "📏 Distancia"
    
    def duration_display(self, obj):
        """Mostrar duración formateada"""
        if obj.duration:
            return str(obj.duration)
        return "No disponible"
    duration_display.short_description = "⏱️ Duración"
    
    def file_status(self, obj):
        """Estado del archivo"""
        if obj.gpx_file:
            return format_html(
                '<span style="color: green;">📎 Con archivo</span>'
            )
        return format_html(
            '<span style="color: gray;">📝 Manual</span>'
        )
    file_status.short_description = "📁 Tipo"
    
    def processing_status(self, obj):
        """Estado del procesamiento"""
        if not obj.gpx_file:
            return format_html('<span style="color: gray;">➖ N/A</span>')
        
        if obj.file_processed:
            if obj.processing_error:
                return format_html(
                    '<span style="color: red;">❌ Error</span>'
                )
            else:
                return format_html(
                    '<span style="color: green;">✅ Procesado</span>'
                )
        else:
            return format_html(
                '<span style="color: orange;">⏳ Pendiente</span>'
            )
    processing_status.short_description = "🔄 Estado"
    
    def track_points_count(self, obj):
        """Contar puntos de ruta"""
        if obj.pk:
            count = TrackPoint.objects.filter(training=obj).count()
            if count > 0:
                return format_html(
                    f'<strong>{count:,} puntos</strong>'
                )
        return "0 puntos"
    track_points_count.short_description = "📍 Puntos GPS"
    
    def file_info(self, obj):
        """Información del archivo"""
        if obj.gpx_file:
            try:
                size = obj.gpx_file.size
                size_mb = size / (1024 * 1024) if size > 1024*1024 else size / 1024
                unit = "MB" if size > 1024*1024 else "KB"
                
                return format_html(
                    f'<div style="font-family: monospace;">'
                    f'📁 Nombre: {obj.gpx_file.name}<br>'
                    f'📊 Tamaño: {size_mb:.1f} {unit}<br>'
                    f'🔗 URL: <a href="{obj.gpx_file.url}" target="_blank">Ver archivo</a>'
                    f'</div>'
                )
            except:
                return format_html(
                    '<span style="color: red;">❌ Archivo no accesible</span>'
                )
        return "No hay archivo"
    file_info.short_description = "📎 Info del Archivo"
    
    # Personalizar guardado
    def save_model(self, request, obj, form, change):
        """Personalizar el guardado desde el admin"""
        
        # Asignar usuario si no está definido
        if not obj.user_id and hasattr(request, 'user'):
            obj.user = request.user
        
        # Generar título automático si está vacío
        if not obj.title:
            tipo_actividad = obj.get_activity_type_display()
            if obj.date:
                obj.title = f"{tipo_actividad} - {obj.date.strftime('%d/%m/%Y')}"
            else:
                from django.utils import timezone
                obj.title = f"{tipo_actividad} - {timezone.now().strftime('%d/%m/%Y')}"
        
        # Guardar el objeto
        super().save_model(request, obj, form, change)
        
        # Mensajes informativos
        if obj.gpx_file and not change:  # Nuevo entrenamiento con archivo
            messages.info(
                request, 
                f"📎 Archivo '{obj.gpx_file.name}' subido. "
                f"Usa el comando 'process_training_files --training-id {obj.id}' para procesarlo."
            )
        elif obj.date and obj.start_time:
            messages.success(
                request, 
                f"✅ Entrenamiento '{obj.title}' guardado correctamente."
            )
        else:
            messages.warning(
                request, 
                f"⚠️ Entrenamiento guardado, pero sin fecha/hora completas."
            )
    
    # Acciones personalizadas
    actions = ['process_selected_files', 'mark_as_processed']
    
    def process_selected_files(self, request, queryset):
        """Acción para procesar archivos seleccionados"""
        with_files = queryset.filter(gpx_file__isnull=False)
        
        if not with_files.exists():
            messages.warning(
                request, 
                "❌ Ningún entrenamiento seleccionado tiene archivos para procesar."
            )
            return
        
        processed = 0
        for training in with_files:
            try:
                # Aquí podrías llamar al procesamiento directamente
                # Por ahora, solo marcamos para procesamiento manual
                training.file_processed = False
                training.processing_error = None
                training.save()
                processed += 1
            except Exception as e:
                messages.error(
                    request,
                    f"❌ Error preparando entrenamiento {training.id}: {e}"
                )
        
        if processed > 0:
            messages.success(
                request,
                f"✅ {processed} entrenamientos preparados para procesamiento. "
                f"Ejecuta: python manage.py process_training_files --all"
            )
    
    process_selected_files.short_description = "🔄 Preparar para procesamiento"
    
    def mark_as_processed(self, request, queryset):
        """Marcar como procesados (para debugging)"""
        updated = queryset.update(file_processed=True)
        messages.success(
            request,
            f"✅ {updated} entrenamientos marcados como procesados."
        )
    
    mark_as_processed.short_description = "✅ Marcar como procesados"

@admin.register(TrackPoint)
class TrackPointAdmin(admin.ModelAdmin):
    """Administración de puntos de ruta GPS"""
    
    list_display = (
        'id', 'training', 'time', 'latitude_display', 'longitude_display', 
        'elevation_display', 'heart_rate', 'speed_display'
    )
    
    list_filter = (
        'training', 
        ('time', admin.DateFieldListFilter),
        'training__activity_type'
    )
    
    search_fields = ('training__title', 'training__user__username')
    date_hierarchy = 'time'
    readonly_fields = ('training',)
    
    # Configuración del formulario
    fieldsets = (
        ('🎯 Entrenamiento', {
            'fields': ('training',)
        }),
        ('🕒 Tiempo', {
            'fields': ('time',)
        }),
        ('📍 Ubicación', {
            'fields': ('latitude', 'longitude', 'elevation'),
            'classes': ('wide',)
        }),
        ('📊 Métricas', {
            'fields': ('heart_rate', 'speed', 'cadence'),
            'classes': ('wide',)
        }),
        ('🌡️ Ambiente', {
            'fields': ('temperature',),
            'classes': ('wide',)
        }),
    )
    
    # Campos formateados
    def latitude_display(self, obj):
        return f"{obj.latitude:.6f}°" if obj.latitude else "N/A"
    latitude_display.short_description = "📍 Latitud"
    
    def longitude_display(self, obj):
        return f"{obj.longitude:.6f}°" if obj.longitude else "N/A"
    longitude_display.short_description = "📍 Longitud"
    
    def elevation_display(self, obj):
        return f"{obj.elevation:.1f} m" if obj.elevation else "N/A"
    elevation_display.short_description = "⛰️ Elevación"
    
    def speed_display(self, obj):
        return f"{obj.speed:.1f} km/h" if obj.speed else "N/A"
    speed_display.short_description = "🏃 Velocidad"
    
    # Permisos restringidos
    def has_add_permission(self, request):
        """No permitir agregar puntos manualmente"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Permitir eliminar solo a superusuarios"""
        return request.user.is_superuser

class GoalAdminForm(forms.ModelForm):
    """Formulario para objetivos"""
    
    class Meta:
        model = Goal
        fields = '__all__'
        widgets = {
            'start_date': DateInput(attrs={'type': 'date'}),
            'end_date': DateInput(attrs={'type': 'date'}),
            'description': forms.Textarea(attrs={'rows': 3}),
        }

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    """Administración de objetivos de entrenamiento"""
    
    form = GoalAdminForm
    
    list_display = (
        'title', 'user', 'goal_type', 'target_value_display', 'period', 
        'start_date', 'end_date', 'status_display'
    )
    
    list_filter = (
        'goal_type', 'period', 'is_active', 'is_completed', 
        ('start_date', admin.DateFieldListFilter)
    )
    
    search_fields = ('title', 'description', 'user__username', 'user__email')
    date_hierarchy = 'start_date'
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('👤 Usuario', {
            'fields': ('user',)
        }),
        ('🎯 Objetivo', {
            'fields': ('title', 'description', 'goal_type', 'target_value', 'period'),
            'description': 'Define qué quieres lograr y en qué período'
        }),
        ('📅 Fechas', {
            'fields': ('start_date', 'end_date'),
            'classes': ('wide',)
        }),
        ('⚙️ Estado', {
            'fields': ('is_active', 'is_completed')
        }),
        ('🕒 Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def target_value_display(self, obj):
        """Mostrar valor objetivo con unidades"""
        unit_map = {
            'distance': 'km',
            'duration': 'min',
            'frequency': 'veces',
            'speed': 'km/h',
            'other': ''
        }
        unit = unit_map.get(obj.goal_type, '')
        return f"{obj.target_value} {unit}".strip()
    target_value_display.short_description = "🎯 Objetivo"
    
    def status_display(self, obj):
        """Estado visual del objetivo"""
        if obj.is_completed:
            return format_html('<span style="color: green;">✅ Completado</span>')
        elif obj.is_active:
            return format_html('<span style="color: blue;">🔄 Activo</span>')
        else:
            return format_html('<span style="color: gray;">⏸️ Inactivo</span>')
    status_display.short_description = "📊 Estado"
    
    def save_model(self, request, obj, form, change):
        """Personalizar guardado de objetivos"""
        
        # Asignar usuario si no está definido
        if not obj.user_id and hasattr(request, 'user'):
            obj.user = request.user
        
        super().save_model(request, obj, form, change)
        
        messages.success(
            request,
            f"✅ Objetivo '{obj.title}' guardado correctamente."
        )

# Personalización del admin principal
admin.site.site_header = "🏃‍♂️ AthCyl - Administración"
admin.site.site_title = "AthCyl Admin"
admin.site.index_title = "Panel de Control Deportivo"