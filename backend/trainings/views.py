"""
Vistas para gestionar entrenamientos y objetivos.

Este módulo contiene las vistas API que permiten a los usuarios:
- Crear, ver, editar y eliminar entrenamientos
- Exportar datos a CSV y PDF
- Gestionar objetivos de entrenamiento

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
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
    """
    ViewSet para gestionar los entrenamientos del usuario.
    
    Permite crear, ver, editar y eliminar entrenamientos, así como
    exportar los datos a diferentes formatos.
    """
    serializer_class = TrainingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrar entrenamientos por usuario autenticado"""
        # Asegúrate de que el usuario está correctamente autenticado
        from users.models import User
        
        # Verificar el tipo de usuario
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            try:
                # Obtener el usuario correctamente tipado
                if isinstance(self.request.user, User):
                    return Training.objects.filter(user=self.request.user)
                else:
                    # Si no es un objeto User, usar el ID o username para buscar el usuario
                    user_obj = User.objects.get(username=self.request.user)
                    return Training.objects.filter(user=user_obj)
            except Exception as e:
                print(f"Error al obtener usuario: {e}")
                return Training.objects.none()
        else:
            # Si el usuario no está autenticado, devolver queryset vacío
            return Training.objects.none()
    
    def perform_create(self, serializer):
        """
        Asigna automáticamente el usuario actual al entrenamiento.
        Así no hay que especificarlo en cada creación.
        """
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def track_points(self, request, pk=None):
        """
        Devuelve todos los puntos de seguimiento de un entrenamiento.
        Útil para visualizar la ruta completa en un mapa.
        """
        entrenamiento = self.get_object()
        puntos = TrackPoint.objects.filter(training=entrenamiento)
        
        # Comprobar si hay puntos para mostrar
        if not puntos.exists():
            return Response(
                {"mensaje": "Este entrenamiento no tiene puntos de ruta registrados."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        serializer = TrackPointSerializer(puntos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def export_csv(self, request, pk=None):
        """
        Exporta los datos de un entrenamiento a formato CSV utilizando
        la biblioteca estándar csv en lugar de pandas.
        """
        # Obtener el entrenamiento
        training = self.get_object()
        track_points = TrackPoint.objects.filter(training=training)
        
        # Comprobar si hay puntos para exportar
        if not track_points.exists():
            return Response(
                {"error": "No hay puntos de seguimiento para exportar."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Crear respuesta CSV
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{training.title}_{training.date}.csv"'
        
        # Utilizar el módulo csv para escribir los datos
        writer = csv.writer(response)
        
        # Escribir la cabecera
        writer.writerow(['tiempo', 'latitud', 'longitud', 'elevacion', 'ritmo_cardiaco', 'velocidad'])
        
        # Escribir los datos de cada punto
        for punto in track_points:
            writer.writerow([
                punto.time,
                punto.latitude,
                punto.longitude, 
                punto.elevation,
                punto.heart_rate,
                punto.speed
            ])
        
        return response
    
    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        """
        Exporta un entrenamiento a PDF con un resumen de las métricas.
        
        Crea un informe en PDF con los datos principales del entrenamiento,
        como distancia, duración, velocidad media, etc.
        """
        entrenamiento = self.get_object()
        
        # Crear buffer en memoria para el PDF
        buffer = io.BytesIO()
        
        # Crear documento PDF
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elementos = []
        
        # Definir estilos
        estilos = getSampleStyleSheet()
        estilo_titulo = estilos['Heading1']
        estilo_subtitulo = estilos['Heading2']
        estilo_normal = estilos['Normal']
        
        # Título
        elementos.append(Paragraph(f"Entrenamiento: {entrenamiento.title}", estilo_titulo))
        elementos.append(Paragraph(f"Fecha: {entrenamiento.date}", estilo_subtitulo))
        elementos.append(Paragraph(f"Usuario: {entrenamiento.user.username}", estilo_subtitulo))
        elementos.append(Paragraph(" ", estilo_normal))  # Espacio
        
        # Datos generales en formato de tabla
        datos = [
            ["Tipo de actividad", entrenamiento.get_activity_type_display()],
            ["Duración", str(entrenamiento.duration) if entrenamiento.duration else "No disponible"],
            ["Distancia", f"{entrenamiento.distance} km" if entrenamiento.distance else "No disponible"],
            ["Velocidad promedio", f"{entrenamiento.avg_speed} km/h" if entrenamiento.avg_speed else "No disponible"],
            ["Velocidad máxima", f"{entrenamiento.max_speed} km/h" if entrenamiento.max_speed else "No disponible"],
            ["Ritmo cardíaco promedio", f"{entrenamiento.avg_heart_rate} ppm" if entrenamiento.avg_heart_rate else "No disponible"],
            ["Ritmo cardíaco máximo", f"{entrenamiento.max_heart_rate} ppm" if entrenamiento.max_heart_rate else "No disponible"],
            ["Ganancia de elevación", f"{entrenamiento.elevation_gain} m" if entrenamiento.elevation_gain else "No disponible"],
            ["Calorías quemadas", f"{entrenamiento.calories} kcal" if entrenamiento.calories else "No disponible"]
        ]
        
        # Crear tabla
        tabla = Table(datos, colWidths=[200, 200])
        tabla.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elementos.append(tabla)
        
        # Añadir descripción si existe
        if entrenamiento.description:
            elementos.append(Paragraph(" ", estilo_normal))  # Espacio
            elementos.append(Paragraph("Descripción:", estilo_subtitulo))
            elementos.append(Paragraph(entrenamiento.description, estilo_normal))
        
        # Construir PDF
        doc.build(elementos)
        
        # Preparar respuesta para descarga
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{entrenamiento.title}_{entrenamiento.date}.pdf"'
        
        return response

class GoalViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar los objetivos de entrenamiento.
    
    Permite a los usuarios crear, ver, editar y eliminar sus objetivos,
    así como filtrarlos por estado (activos, completados, etc.)
    """
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrar objetivos por usuario autenticado"""
        usuario = self.request.user
        
        # Si hay un parámetro 'estado' en la URL, filtramos por él
        estado = self.request.query_params.get('estado')
        if estado == 'activos':
            return Goal.objects.filter(user=usuario, is_active=True, is_completed=False)
        elif estado == 'completados':
            return Goal.objects.filter(user=usuario, is_completed=True)
        elif estado == 'inactivos':
            return Goal.objects.filter(user=usuario, is_active=False)
        
        # Por defecto, devolver todos los objetivos del usuario
        return Goal.objects.filter(user=usuario)
    
    def perform_create(self, serializer):
        """Asignar automáticamente el usuario actual al objetivo"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Obtener objetivos activos del usuario.
        
        Esta es una forma alternativa de filtrar, además del parámetro 'estado'.
        Se mantiene para compatibilidad con versiones anteriores.
        """
        objetivos = Goal.objects.filter(user=request.user, is_active=True)
        serializer = self.get_serializer(objetivos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def completed(self, request):
        """
        Obtener objetivos completados del usuario.
        
        Esta es una forma alternativa de filtrar, además del parámetro 'estado'.
        Se mantiene para compatibilidad con versiones anteriores.
        """
        objetivos = Goal.objects.filter(user=request.user, is_completed=True)
        serializer = self.get_serializer(objetivos, many=True)
        return Response(serializer.data)