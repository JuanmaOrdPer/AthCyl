"""
Serializadores para los modelos de estadísticas.

Este módulo define los serializadores para convertir modelos
de estadísticas a JSON y viceversa, facilitando el envío de
datos a través de la API.

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

from rest_framework import serializers
from .models import UserStats, ActivitySummary
import datetime

class UserStatsSerializer(serializers.ModelSerializer):
    """
    Serializador para estadísticas globales de un usuario.
    """
    
    class Meta:
        model = UserStats
        fields = [
            'id', 'user', 'total_trainings', 'total_distance', 'total_duration',
            'total_calories', 'avg_distance_per_training', 'avg_duration_per_training',
            'avg_speed', 'avg_heart_rate', 'longest_distance', 'longest_duration',
            'highest_speed', 'highest_elevation_gain', 'first_training_date',
            'last_training_date', 'last_updated'
        ]
        read_only_fields = fields  # Todos los campos son de solo lectura

class ActivitySummarySerializer(serializers.ModelSerializer):
    """
    Serializador para resúmenes de actividad por períodos.
    
    Incluye un campo calculado para mostrar el período en formato legible.
    """
    
    periodo_texto = serializers.SerializerMethodField(method_name='get_periodo_texto')
    
    class Meta:
        model = ActivitySummary
        fields = [
            'id', 'user', 'period_type', 'year', 'month', 'week', 'day',
            'start_date', 'end_date', 'training_count', 'total_distance',
            'total_duration', 'total_calories', 'periodo_texto'
        ]
        read_only_fields = fields  # Todos los campos son de solo lectura
    
    def get_periodo_texto(self, obj):
        """
        Devuelve una representación legible del período.
        
        Args:
            obj: Objeto ActivitySummary
            
        Returns:
            String: Texto que representa el período en formato legible
        """
        if obj.period_type == 'daily':
            return f"{obj.day}/{obj.month}/{obj.year}"
        elif obj.period_type == 'weekly':
            return f"Semana {obj.week} de {obj.year}"
        elif obj.period_type == 'monthly':
            # Convertir número de mes a nombre
            nombres_meses = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ]
            nombre_mes = nombres_meses[obj.month - 1]
            return f"{nombre_mes} {obj.year}"
        else:  # yearly
            return str(obj.year)