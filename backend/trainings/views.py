"""
Vistas para gestionar entrenamientos y objetivos.

Este módulo contiene las vistas API que permiten a los usuarios:
- Crear, ver, editar y eliminar entrenamientos
- Exportar datos a CSV y PDF
- Gestionar objetivos de entrenamiento

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

import io
import csv
import logging
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

from .models import Training, TrackPoint, Goal
from .serializers import TrainingSerializer, TrackPointSerializer, GoalSerializer

# Configurar logger
logger = logging.getLogger(__name__)


class TrainingViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar los entrenamientos del usuario.
    
    Permite crear, ver, editar y eliminar entrenamientos, así como
    exportar los datos a diferentes formatos.
    
    Para crear un entrenamiento manualmente, envíe los campos requeridos:
    - title: Título del entrenamiento
    - activity_type: Tipo de actividad (running, cycling, etc.)
    - date: Fecha del entrenamiento (YYYY-MM-DD)
    - start_time: Hora de inicio (HH:MM:SS)
    - duration: Duración en segundos o formato HH:MM:SS
    - distance: Distancia en kilómetros
    
    Para crear un entrenamiento desde archivo, adjunte un archivo GPX o TCX:
    - gpx_file: Archivo GPX o TCX con los datos del entrenamiento
    """
    serializer_class = TrainingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrar entrenamientos por usuario autenticado"""
        if not hasattr(self.request, 'user') or not self.request.user.is_authenticated:
            return Training.objects.none()
            
        try:
            return Training.objects.filter(
                user=self.request.user
            ).select_related('user').order_by('-date', '-start_time')
                
        except Exception as e:
            logger.error(f"Error al obtener entrenamientos del usuario {self.request.user}: {e}")
            return Training.objects.none()
    
    def create(self, request, *args, **kwargs):
        """
        Crea un nuevo entrenamiento, ya sea manual o desde archivo.
        """
        logger.info(f"Iniciando creación de entrenamiento para usuario: {request.user.username}")
        
        # Hacer una copia mutable del QueryDict
        data = request.data.copy()
        
        # Si no se proporciona el usuario, usar el usuario autenticado
        if 'user' not in data and hasattr(request, 'user') and request.user.is_authenticated:
            data['user'] = request.user.id
            logger.debug(f"Usuario autenticado asignado: {request.user.username}")
        
        # Verificar si se está subiendo un archivo
        if 'gpx_file' in request.FILES:
            gpx_file = request.FILES['gpx_file']
            logger.info(f"Archivo recibido: {gpx_file.name}, tamaño: {gpx_file.size} bytes")
            
            # Solo mostrar tipo de archivo en logs (no todo el contenido)
            file_extension = gpx_file.name.lower().split('.')[-1]
            logger.debug(f"Tipo de archivo: {file_extension}")
        
        # Crear el serializador con los datos
        serializer = self.get_serializer(data=data)
        
        try:
            serializer.is_valid(raise_exception=True)
            logger.debug("Datos del serializador válidos")
            
            # Guardar el entrenamiento
            self.perform_create(serializer)
            logger.info(f"Entrenamiento creado con ID: {serializer.instance.id}")
            
            # Devolver la respuesta con los datos del entrenamiento creado
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, 
                status=status.HTTP_201_CREATED, 
                headers=headers
            )
            
        except Exception as e:
            logger.error(f"Error al crear el entrenamiento: {e}")
            return Response(
                {"error": "Error al crear el entrenamiento", "detalle": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
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
        puntos = TrackPoint.objects.filter(
            training=entrenamiento
        ).select_related('training').order_by('time')
        
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
        try:
            # Obtener el entrenamiento
            training = self.get_object()
            track_points = TrackPoint.objects.filter(
                training=training
            ).order_by('time')
            
            # Comprobar si hay puntos para exportar
            if not track_points.exists():
                return Response(
                    {"error": "No hay puntos de seguimiento para exportar."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Crear respuesta CSV
            response = HttpResponse(content_type='text/csv; charset=utf-8')
            response['Content-Disposition'] = f'attachment; filename="{training.title}_{training.date}.csv"'
            
            # Utilizar el módulo csv para escribir los datos
            writer = csv.writer(response)
            
            # Escribir la cabecera
            writer.writerow([
                'tiempo', 'latitud', 'longitud', 'elevacion', 
                'ritmo_cardiaco', 'velocidad'
            ])
            
            # Escribir los datos de cada punto
            for punto in track_points:
                writer.writerow([
                    punto.time,
                    punto.latitude,
                    punto.longitude, 
                    punto.elevation or '',
                    punto.heart_rate or '',
                    punto.speed or ''
                ])
            
            logger.info(f"CSV exportado para entrenamiento {training.id}")
            return response
            
        except Exception as e:
            logger.error(f"Error al exportar CSV: {e}")
            return Response(
                {"error": "Error al exportar los datos a CSV"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        """
        Exporta un entrenamiento a PDF con un resumen de las métricas.
        
        Crea un informe en PDF con los datos principales del entrenamiento,
        como distancia, duración, velocidad media, etc.
        """
        try:
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
            elementos.append(Paragraph(
                f"Entrenamiento: {entrenamiento.title}", estilo_titulo
            ))
            elementos.append(Paragraph(
                f"Fecha: {entrenamiento.date}", estilo_subtitulo
            ))
            elementos.append(Paragraph(
                f"Usuario: {entrenamiento.user.username}", estilo_subtitulo
            ))
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
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
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
            
            logger.info(f"PDF exportado para entrenamiento {entrenamiento.id}")
            return response
            
        except Exception as e:
            logger.error(f"Error al exportar PDF: {e}")
            return Response(
                {"error": "Error al exportar el PDF"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
        if not hasattr(self.request, 'user') or not self.request.user.is_authenticated:
            return Goal.objects.none()
            
        try:
            usuario = self.request.user
            
            # Si hay un parámetro 'estado' en la URL, filtramos por él
            estado = self.request.query_params.get('estado')
            queryset = Goal.objects.filter(user=usuario).select_related('user')
            
            if estado == 'activos':
                return queryset.filter(is_active=True, is_completed=False)
            elif estado == 'completados':
                return queryset.filter(is_completed=True)
            elif estado == 'inactivos':
                return queryset.filter(is_active=False)
            
            # Por defecto, devolver todos los objetivos del usuario
            return queryset.order_by('-created_at')
            
        except Exception as e:
            logger.error(f"Error al obtener objetivos del usuario {self.request.user}: {e}")
            return Goal.objects.none()
    
    def perform_create(self, serializer):
        """Asignar automáticamente el usuario actual al objetivo"""
        try:
            serializer.save(user=self.request.user)
            logger.info(f"Objetivo creado para usuario {self.request.user.username}")
        except Exception as e:
            logger.error(f"Error al crear objetivo: {e}")
            raise
    
    def update(self, request, *args, **kwargs):
        """Sobrescribir el método update para manejar correctamente las fechas"""
        try:
            instance = self.get_object()
            
            # Si no se proporciona end_date, mantener el valor existente
            if 'end_date' not in request.data and instance.end_date:
                request.data['end_date'] = instance.end_date.isoformat()
            
            response = super().update(request, *args, **kwargs)
            logger.info(f"Objetivo {instance.id} actualizado correctamente")
            return response
            
        except Exception as e:
            logger.error(f"Error al actualizar objetivo: {e}")
            return Response(
                {"error": "Error al actualizar el objetivo", "detalle": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Obtener objetivos activos del usuario.
        
        Esta es una forma alternativa de filtrar, además del parámetro 'estado'.
        Se mantiene para compatibilidad con versiones anteriores.
        """
        try:
            objetivos = Goal.objects.filter(
                user=request.user, 
                is_active=True
            ).select_related('user').order_by('-created_at')
            
            serializer = self.get_serializer(objetivos, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error al obtener objetivos activos: {e}")
            return Response(
                {"error": "Error al obtener objetivos activos"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def completed(self, request):
        """
        Obtener objetivos completados del usuario.
        
        Esta es una forma alternativa de filtrar, además del parámetro 'estado'.
        Se mantiene para compatibilidad con versiones anteriores.
        """
        try:
            objetivos = Goal.objects.filter(
                user=request.user, 
                is_completed=True
            ).select_related('user').order_by('-completed_at', '-created_at')
            
            serializer = self.get_serializer(objetivos, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error al obtener objetivos completados: {e}")
            return Response(
                {"error": "Error al obtener objetivos completados"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """
        Marcar un objetivo como completado.
        
        Método adicional para facilitar el marcado de objetivos como completados
        desde el frontend.
        """
        try:
            objetivo = self.get_object()
            objetivo.is_completed = True
            objetivo.save()
            
            logger.info(f"Objetivo {objetivo.id} marcado como completado")
            
            serializer = self.get_serializer(objetivo)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error al marcar objetivo como completado: {e}")
            return Response(
                {"error": "Error al marcar el objetivo como completado"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )