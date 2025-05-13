from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Avg, Max, Count
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay
import datetime
import pandas as pd
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from django.http import HttpResponse

from .models import UserStats, ActivitySummary
from .serializers import UserStatsSerializer, ActivitySummarySerializer
from trainings.models import Training

class StatsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserStatsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Obtener estadísticas del usuario autenticado"""
        user = self.request.user
        stats, created = UserStats.objects.get_or_create(user=user)
        
        # Actualizar estadísticas si se solicita
        if self.request.query_params.get('update', 'false').lower() == 'true':
            stats.update_stats()
        
        return UserStats.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Obtener un resumen de las estadísticas del usuario"""
        user = request.user
        stats, created = UserStats.objects.get_or_create(user=user)
        
        # Actualizar estadísticas
        stats.update_stats()
        
        # Obtener datos adicionales
        today = datetime.date.today()
        
        # Entrenamientos en el último mes
        thirty_days_ago = today - datetime.timedelta(days=30)
        trainings_last_month = Training.objects.filter(
            user=user,
            date__gte=thirty_days_ago
        ).count()
        
        # Distancia en el último mes
        distance_last_month = Training.objects.filter(
            user=user,
            date__gte=thirty_days_ago
        ).aggregate(total=Sum('distance'))['total'] or 0
        
        # Entrenamientos por tipo de actividad
        activity_counts = Training.objects.filter(
            user=user
        ).values('activity_type').annotate(count=Count('id')).order_by('-count')
        
        # Construir respuesta
        response_data = {
            'stats': UserStatsSerializer(stats).data,
            'recent_activity': {
                'trainings_last_month': trainings_last_month,
                'distance_last_month': distance_last_month,
            },
            'activity_distribution': {item['activity_type']: item['count'] for item in activity_counts}
        }
        
        return Response(response_data)
    
    @action(detail=False, methods=['get'])
    def activity_trends(self, request):
        """Obtener tendencias de actividad por período (semanal, mensual, anual)"""
        user = request.user
        period = request.query_params.get('period', 'weekly')
        
        if period not in ['weekly', 'monthly', 'yearly']:
            return Response(
                {'error': 'Período no válido. Debe ser weekly, monthly o yearly.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener entrenamientos del usuario
        trainings = Training.objects.filter(user=user)
        
        if not trainings.exists():
            return Response({'message': 'No hay entrenamientos registrados.'})
        
        # Preparar datos según el período
        if period == 'weekly':
            # Agrupar por semana
            data = trainings.annotate(
                period=TruncWeek('date')
            ).values('period').annotate(
                count=Count('id'),
                distance=Sum('distance'),
                duration=Sum('duration'),
                calories=Sum('calories')
            ).order_by('period')
        
        elif period == 'monthly':
            # Agrupar por mes
            data = trainings.annotate(
                period=TruncMonth('date')
            ).values('period').annotate(
                count=Count('id'),
                distance=Sum('distance'),
                duration=Sum('duration'),
                calories=Sum('calories')
            ).order_by('period')
        
        else:  # yearly
            # Agrupar por año
            data = trainings.values(
                period=models.functions.ExtractYear('date')
            ).annotate(
                count=Count('id'),
                distance=Sum('distance'),
                duration=Sum('duration'),
                calories=Sum('calories')
            ).order_by('period')
        
        # Formatear respuesta
        result = []
        for item in data:
            # Convertir duración de segundos a formato legible
            duration_seconds = item['duration'].total_seconds() if item['duration'] else 0
            hours, remainder = divmod(duration_seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            
            result.append({
                'period': item['period'].strftime('%Y-%m-%d') if hasattr(item['period'], 'strftime') else str(item['period']),
                'training_count': item['count'],
                'total_distance': round(item['distance'] or 0, 2),
                'total_duration': f"{int(hours)}h {int(minutes)}m",
                'total_calories': item['calories'] or 0
            })
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def export_stats(self, request):
        """Exportar estadísticas a PDF"""
        user = request.user
        stats, created = UserStats.objects.get_or_create(user=user)
        
        # Actualizar estadísticas
        stats.update_stats()
        
        # Crear buffer para el PDF
        buffer = BytesIO()
        
        # Crear documento PDF
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = styles['Heading1']
        subtitle_style = styles['Heading2']
        normal_style = styles['Normal']
        
        # Título
        elements.append(Paragraph(f"Estadísticas de Entrenamiento - {user.username}", title_style))
        elements.append(Spacer(1, 12))
        
        # Datos generales
        elements.append(Paragraph("Resumen General", subtitle_style))
        elements.append(Spacer(1, 6))
        
        general_data = [
            ["Total de entrenamientos", str(stats.total_trainings)],
            ["Distancia total", f"{stats.total_distance:.2f} km"],
            ["Duración total", str(stats.total_duration)],
            ["Calorías totales", str(stats.total_calories)],
            ["Primer entrenamiento", str(stats.first_training_date) if stats.first_training_date else "N/A"],
            ["Último entrenamiento", str(stats.last_training_date) if stats.last_training_date else "N/A"]
        ]
        
        general_table = Table(general_data, colWidths=[200, 200])
        general_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(general_table)
        elements.append(Spacer(1, 12))
        
        # Promedios
        elements.append(Paragraph("Promedios", subtitle_style))
        elements.append(Spacer(1, 6))
        
        avg_data = [
            ["Distancia promedio por entrenamiento", f"{stats.avg_distance_per_training:.2f} km"],
            ["Duración promedio por entrenamiento", str(stats.avg_duration_per_training)],
            ["Velocidad promedio", f"{stats.avg_speed:.2f} km/h"],
            ["Ritmo cardíaco promedio", f"{stats.avg_heart_rate:.1f} ppm"]
        ]
        
        avg_table = Table(avg_data, colWidths=[200, 200])
        avg_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(avg_table)
        elements.append(Spacer(1, 12))
        
        # Récords
        elements.append(Paragraph("Récords", subtitle_style))
        elements.append(Spacer(1, 6))
        
        records_data = [
            ["Distancia más larga", f"{stats.longest_distance:.2f} km"],
            ["Duración más larga", str(stats.longest_duration)],
            ["Velocidad más alta", f"{stats.highest_speed:.2f} km/h"],
            ["Mayor ganancia de elevación", f"{stats.highest_elevation_gain:.1f} m"]
        ]
        
        records_table = Table(records_data, colWidths=[200, 200])
        records_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(records_table)
        
        # Generar PDF
        doc.build(elements)
        
        # Preparar respuesta
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="estadisticas_{user.username}.pdf"'
        
        return response

class ActivitySummaryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivitySummarySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Obtener resúmenes de actividad del usuario autenticado"""
        user = self.request.user
        
        # Filtrar por tipo de período si se especifica
        period_type = self.request.query_params.get('period_type')
        if period_type in ['daily', 'weekly', 'monthly', 'yearly']:
            return ActivitySummary.objects.filter(user=user, period_type=period_type)
        
        return ActivitySummary.objects.filter(user=user)
    
    @action(detail=False, methods=['post'])
    def generate_summaries(self, request):
        """Generar o actualizar resúmenes de actividad para el usuario"""
        user = request.user
        period_types = request.data.get('period_types', ['weekly', 'monthly', 'yearly'])
        
        # Validar tipos de período
        valid_types = ['daily', 'weekly', 'monthly', 'yearly']
        for period_type in period_types:
            if period_type not in valid_types:
                return Response(
                    {'error': f'Tipo de período no válido: {period_type}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Obtener todos los entrenamientos del usuario
        trainings = Training.objects.filter(user=user).order_by('date')
        
        if not trainings.exists():
            return Response({'message': 'No hay entrenamientos para generar resúmenes.'})
        
        # Generar resúmenes para cada tipo de período
        summaries_created = 0
        summaries_updated = 0
        
        for period_type in period_types:
            if period_type == 'daily':
                # Agrupar por día
                daily_data = trainings.values('date').annotate(
                    count=Count('id'),
                    total_distance=Sum('distance'),
                    total_calories=Sum('calories')
                )
                
                for day_data in daily_data:
                    date = day_data['date']
                    
                    # Calcular duración total
                    day_trainings = trainings.filter(date=date)
                    total_duration_seconds = sum(
                        t.duration.total_seconds() for t in day_trainings if t.duration
                    )
                    
                    # Crear o actualizar resumen
                    summary, created = ActivitySummary.objects.update_or_create(
                        user=user,
                        period_type='daily',
                        year=date.year,
                        month=date.month,
                        day=date.day,
                        defaults={
                            'start_date': date,
                            'end_date': date,
                            'training_count': day_data['count'],
                            'total_distance': day_data['total_distance'] or 0,
                            'total_duration': datetime.timedelta(seconds=total_duration_seconds),
                            'total_calories': day_data['total_calories'] or 0,
                        }
                    )
                    
                    if created:
                        summaries_created += 1
                    else:
                        summaries_updated += 1
            
            elif period_type == 'weekly':
                # Obtener todas las semanas únicas
                dates = trainings.values_list('date', flat=True).distinct()
                weeks = set((d.year, d.isocalendar()[1]) for d in dates)
                
                for year, week in weeks:
                    # Calcular fechas de inicio y fin de la semana
                    first_day = datetime.datetime.strptime(f'{year}-{week}-1', '%Y-%W-%w').date()
                    last_day = first_day + datetime.timedelta(days=6)
                    
                    # Obtener entrenamientos de la semana
                    week_trainings = trainings.filter(date__gte=first_day, date__lte=last_day)
                    
                    if week_trainings.exists():
                        # Calcular estadísticas
                        training_count = week_trainings.count()
                        total_distance = week_trainings.aggregate(Sum('distance'))['distance__sum'] or 0
                        total_calories = week_trainings.aggregate(Sum('calories'))['calories__sum'] or 0
                        
                        # Calcular duración total
                        total_duration_seconds = sum(
                            t.duration.total_seconds() for t in week_trainings if t.duration
                        )
                        
                        # Crear o actualizar resumen
                        summary, created = ActivitySummary.objects.update_or_create(
                            user=user,
                            period_type='weekly',
                            year=year,
                            week=week,
                            defaults={
                                'start_date': first_day,
                                'end_date': last_day,
                                'training_count': training_count,
                                'total_distance': total_distance,
                                'total_duration': datetime.timedelta(seconds=total_duration_seconds),
                                'total_calories': total_calories,
                            }
                        )
                        
                        if created:
                            summaries_created += 1
                        else:
                            summaries_updated += 1
            
            elif period_type == 'monthly':
                # Obtener todos los meses únicos
                dates = trainings.values_list('date', flat=True).distinct()
                months = set((d.year, d.month) for d in dates)
                
                for year, month in months:
                    # Calcular fechas de inicio y fin del mes
                    first_day = datetime.date(year, month, 1)
                    if month == 12:
                        last_day = datetime.date(year, month, 31)
                    else:
                        last_day = datetime.date(year, month + 1, 1) - datetime.timedelta(days=1)
                    
                    # Obtener entrenamientos del mes
                    month_trainings = trainings.filter(date__gte=first_day, date__lte=last_day)
                    
                    if month_trainings.exists():
                        # Calcular estadísticas
                        training_count = month_trainings.count()
                        total_distance = month_trainings.aggregate(Sum('distance'))['distance__sum'] or 0
                        total_calories = month_trainings.aggregate(Sum('calories'))['calories__sum'] or 0
                        
                        # Calcular duración total
                        total_duration_seconds = sum(
                            t.duration.total_seconds() for t in month_trainings if t.duration
                        )
                        
                        # Crear o actualizar resumen
                        summary, created = ActivitySummary.objects.update_or_create(
                            user=user,
                            period_type='monthly',
                            year=year,
                            month=month,
                            defaults={
                                'start_date': first_day,
                                'end_date': last_day,
                                'training_count': training_count,
                                'total_distance': total_distance,
                                'total_duration': datetime.timedelta(seconds=total_duration_seconds),
                                'total_calories': total_calories,
                            }
                        )
                        
                        if created:
                            summaries_created += 1
                        else:
                            summaries_updated += 1
            
            elif period_type == 'yearly':
                # Obtener todos los años únicos
                dates = trainings.values_list('date', flat=True).distinct()
                years = set(d.year for d in dates)
                
                for year in years:
                    # Calcular fechas de inicio y fin del año
                    first_day = datetime.date(year, 1, 1)
                    last_day = datetime.date(year, 12, 31)
                    
                    # Obtener entrenamientos del año
                    year_trainings = trainings.filter(date__gte=first_day, date__lte=last_day)
                    
                    if year_trainings.exists():
                        # Calcular estadísticas
                        training_count = year_trainings.count()
                        total_distance = year_trainings.aggregate(Sum('distance'))['distance__sum'] or 0
                        total_calories = year_trainings.aggregate(Sum('calories'))['calories__sum'] or 0
                        
                        # Calcular duración total
                        total_duration_seconds = sum(
                            t.duration.total_seconds() for t in year_trainings if t.duration
                        )
                        
                        # Crear o actualizar resumen
                        summary, created = ActivitySummary.objects.update_or_create(
                            user=user,
                            period_type='yearly',
                            year=year,
                            defaults={
                                'start_date': first_day,
                                'end_date': last_day,
                                'training_count': training_count,
                                'total_distance': total_distance,
                                'total_duration': datetime.timedelta(seconds=total_duration_seconds),
                                'total_calories': total_calories,
                            }
                        )
                        
                        if created:
                            summaries_created += 1
                        else:
                            summaries_updated += 1
        
        return Response({
            'message': f'Resúmenes generados: {summaries_created}, actualizados: {summaries_updated}',
            'created': summaries_created,
            'updated': summaries_updated
        })
