from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
import pandas as pd
import io
import csv
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

from .models import Training, TrackPoint, Goal
from .serializers import TrainingSerializer, TrackPointSerializer, GoalSerializer

class TrainingViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrar entrenamientos por usuario autenticado"""
        return Training.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Asignar automáticamente el usuario actual"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def track_points(self, request, pk=None):
        """Obtener todos los puntos de seguimiento de un entrenamiento"""
        training = self.get_object()
        track_points = TrackPoint.objects.filter(training=training)
        serializer = TrackPointSerializer(track_points, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def export_csv(self, request, pk=None):
        """Exportar entrenamiento a CSV"""
        training = self.get_object()
        track_points = TrackPoint.objects.filter(training=training)
        
        # Crear DataFrame con los datos
        data = []
        for point in track_points:
            data.append({
                'time': point.time,
                'latitude': point.latitude,
                'longitude': point.longitude,
                'elevation': point.elevation,
                'heart_rate': point.heart_rate,
                'speed': point.speed
            })
        
        df = pd.DataFrame(data)
        
        # Crear respuesta CSV
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{training.title}_{training.date}.csv"'
        
        # Escribir datos al CSV
        df.to_csv(path_or_buf=response, index=False)
        
        return response
    
    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        """Exportar entrenamiento a PDF"""
        training = self.get_object()
        
        # Crear buffer para el PDF
        buffer = io.BytesIO()
        
        # Crear documento PDF
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = styles['Heading1']
        subtitle_style = styles['Heading2']
        normal_style = styles['Normal']
        
        # Título
        elements.append(Paragraph(f"Entrenamiento: {training.title}", title_style))
        elements.append(Paragraph(f"Fecha: {training.date}", subtitle_style))
        elements.append(Paragraph(f"Usuario: {training.user.username}", subtitle_style))
        elements.append(Paragraph(" ", normal_style))  # Espacio
        
        # Datos generales
        data = [
            ["Tipo de actividad", training.get_activity_type_display()],
            ["Duración", str(training.duration) if training.duration else "N/A"],
            ["Distancia", f"{training.distance} km" if training.distance else "N/A"],
            ["Velocidad promedio", f"{training.avg_speed} km/h" if training.avg_speed else "N/A"],
            ["Velocidad máxima", f"{training.max_speed} km/h" if training.max_speed else "N/A"],
            ["Ritmo cardíaco promedio", f"{training.avg_heart_rate} ppm" if training.avg_heart_rate else "N/A"],
            ["Ritmo cardíaco máximo", f"{training.max_heart_rate} ppm" if training.max_heart_rate else "N/A"],
            ["Ganancia de elevación", f"{training.elevation_gain} m" if training.elevation_gain else "N/A"],
            ["Calorías", f"{training.calories} kcal" if training.calories else "N/A"]
        ]
        
        # Crear tabla
        table = Table(data, colWidths=[200, 200])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(table)
        
        # Descripción
        if training.description:
            elements.append(Paragraph(" ", normal_style))  # Espacio
            elements.append(Paragraph("Descripción:", subtitle_style))
            elements.append(Paragraph(training.description, normal_style))
        
        # Generar PDF
        doc.build(elements)
        
        # Preparar respuesta
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{training.title}_{training.date}.pdf"'
        
        return response

class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrar objetivos por usuario autenticado"""
        return Goal.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Asignar automáticamente el usuario actual"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Obtener objetivos activos del usuario"""
        goals = Goal.objects.filter(user=request.user, is_active=True)
        serializer = self.get_serializer(goals, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Obtener objetivos completados del usuario"""
        goals = Goal.objects.filter(user=request.user, is_completed=True)
        serializer = self.get_serializer(goals, many=True)
        return Response(serializer.data)
