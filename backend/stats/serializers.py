from rest_framework import serializers
from .models import UserStats, ActivitySummary
import datetime

class UserStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStats
        fields = [
            'id', 'user', 'total_trainings', 'total_distance', 'total_duration',
            'total_calories', 'avg_distance_per_training', 'avg_duration_per_training',
            'avg_speed', 'avg_heart_rate', 'longest_distance', 'longest_duration',
            'highest_speed', 'highest_elevation_gain', 'first_training_date',
            'last_training_date', 'last_updated'
        ]
        read_only_fields = fields

class ActivitySummarySerializer(serializers.ModelSerializer):
    period_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ActivitySummary
        fields = [
            'id', 'user', 'period_type', 'year', 'month', 'week', 'day',
            'start_date', 'end_date', 'training_count', 'total_distance',
            'total_duration', 'total_calories', 'period_display'
        ]
        read_only_fields = fields
    
    def get_period_display(self, obj):
        """Devuelve una representación legible del período"""
        if obj.period_type == 'daily':
            return f"{obj.day}/{obj.month}/{obj.year}"
        elif obj.period_type == 'weekly':
            return f"Semana {obj.week} de {obj.year}"
        elif obj.period_type == 'monthly':
            # Convertir número de mes a nombre
            month_names = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ]
            month_name = month_names[obj.month - 1]
            return f"{month_name} {obj.year}"
        else:  # yearly
            return str(obj.year)
