"""
Vistas para estadísticas de entrenamiento.

Este módulo define las vistas API para:
- Obtener estadísticas globales de usuario
- Gestionar resúmenes de actividad por períodos
- Exportar estadísticas a diferentes formatos

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Avg, Max, Count
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay
import datetime
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
    """
    ViewSet para estadísticas de usuario.
    
    Proporciona acceso a las estadísticas generales del usuario
    y métodos para actualizar, resumir y exportar esas estadísticas.
    """
    
    serializer_class = UserStatsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Obtener estadísticas del usuario autenticado.
        
        Asegura que cada usuario sólo pueda ver sus propias estadísticas.
        """
        usuario = self.request.user
        
        # Obtener o crear objeto de estadísticas
        estadisticas, creado = UserStats.objects.get_or_create(user=usuario)
        
        # Actualizar estadísticas si se solicita
        if self.request.query_params.get('actualizar', 'false').lower() == 'true':
            estadisticas.update_stats()
            
        return UserStats.objects.filter(user=usuario)
    
    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """
        Obtener un resumen general de las estadísticas del usuario.
        
        Incluye estadísticas globales, actividad reciente y distribución por tipo.
        """
        usuario = request.user
        estadisticas, creado = UserStats.objects.get_or_create(user=usuario)
        
        # Actualizar las estadísticas para asegurar que están al día
        estadisticas.update_stats()
        
        # Calculamos datos adicionales
        hoy = datetime.date.today()
        
        # Entrenamientos en el último mes
        hace_30_dias = hoy - datetime.timedelta(days=30)
        entrenamientos_ultimo_mes = Training.objects.filter(
            user=usuario,
            date__gte=hace_30_dias
        ).count()
        
        # Distancia en el último mes
        distancia_ultimo_mes = Training.objects.filter(
            user=usuario,
            date__gte=hace_30_dias
        ).aggregate(total=Sum('distance'))['total'] or 0
        
        # Distribución por tipo de actividad
        tipos_actividad = Training.objects.filter(
            user=usuario
        ).values('activity_type').annotate(cantidad=Count('id')).order_by('-cantidad')
        
        # Construir respuesta
        datos_respuesta = {
            'estadisticas': UserStatsSerializer(estadisticas).data,
            'actividad_reciente': {
                'entrenamientos_ultimo_mes': entrenamientos_ultimo_mes,
                'distancia_ultimo_mes': distancia_ultimo_mes,
            },
            'distribucion_por_tipo': {item['activity_type']: item['cantidad'] for item in tipos_actividad}
        }
        
        return Response(datos_respuesta)
    
    @action(detail=False, methods=['get'])
    def tendencias(self, request):
        """
        Obtener tendencias de actividad por período (semanal, mensual, anual).
        
        Permite visualizar la evolución de la actividad deportiva a lo largo del tiempo.
        Versión simplificada sin pandas.
        """
        usuario = request.user
        periodo = request.query_params.get('periodo', 'semanal')
        
        # Validar el período
        if periodo not in ['semanal', 'mensual', 'anual']:
            return Response(
                {'error': 'Período no válido. Debe ser semanal, mensual o anual.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener todos los entrenamientos del usuario
        entrenamientos = Training.objects.filter(user=usuario)
        
        if not entrenamientos.exists():
            return Response({'mensaje': 'No tienes entrenamientos registrados todavía.'})
        
        # Preparar datos según el período seleccionado
        if periodo == 'semanal':
            # Agrupar por semana
            datos = entrenamientos.annotate(
                periodo=TruncWeek('date')
            ).values('periodo').annotate(
                cantidad=Count('id'),
                distancia=Sum('distance'),
                duracion=Sum('duration'),
                calorias=Sum('calories')
            ).order_by('periodo')
            etiqueta_periodo = 'Semana'
        
        elif periodo == 'mensual':
            # Agrupar por mes
            datos = entrenamientos.annotate(
                periodo=TruncMonth('date')
            ).values('periodo').annotate(
                cantidad=Count('id'),
                distancia=Sum('distance'),
                duracion=Sum('duration'),
                calorias=Sum('calories')
            ).order_by('periodo')
            etiqueta_periodo = 'Mes'
        
        else:  # anual
            # Simplificamos y usamos el año directamente en lugar de ExtractYear
            datos = []
            years = entrenamientos.dates('date', 'year')
            for year in years:
                year_trainings = entrenamientos.filter(date__year=year.year)
                year_data = {
                    'periodo': year.year,
                    'cantidad': year_trainings.count(),
                    'distancia': year_trainings.aggregate(Sum('distance'))['distance__sum'] or 0,
                    'duracion': year_trainings.aggregate(Sum('duration'))['duration__sum'] or datetime.timedelta(0),
                    'calorias': year_trainings.aggregate(Sum('calories'))['calories__sum'] or 0
                }
                datos.append(year_data)
            etiqueta_periodo = 'Año'
        
        # Formatear la respuesta para que sea más amigable
        resultado = []
        for item in datos:
            # Convertir duración de segundos a formato legible
            if isinstance(item['duracion'], datetime.timedelta):
                segundos_duracion = item['duracion'].total_seconds()
            else:
                segundos_duracion = 0
                
            horas, resto = divmod(segundos_duracion, 3600)
            minutos, segundos = divmod(resto, 60)
            
            # Formato para el período
            if hasattr(item['periodo'], 'strftime'):
                if periodo == 'semanal':
                    etiqueta = f"Semana {item['periodo'].strftime('%W')} de {item['periodo'].strftime('%Y')}"
                elif periodo == 'mensual':
                    etiqueta = item['periodo'].strftime('%B %Y')
                else:
                    etiqueta = str(item['periodo'])
            else:
                etiqueta = str(item['periodo'])
            
            resultado.append({
                'periodo': etiqueta,
                'entrenamientos': item['cantidad'],
                'distancia_total': round(item['distancia'] or 0, 2),
                'duracion_total': f"{int(horas)}h {int(minutos)}m",
                'calorias_total': item['calorias'] or 0
            })
        
        return Response({
            'tipo_periodo': etiqueta_periodo,
            'datos': resultado
        })
    
    @action(detail=False, methods=['get'])
    def exportar_pdf(self, request):
        """
        Exporta todas las estadísticas a un archivo PDF.
        
        Genera un informe completo con todas las métricas del usuario.
        """
        usuario = request.user
        estadisticas, _ = UserStats.objects.get_or_create(user=usuario)
        
        # Actualizar estadísticas antes de exportar
        estadisticas.update_stats()
        
        # Crear buffer para el PDF
        buffer = BytesIO()
        
        # Crear documento PDF
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elementos = []
        
        # Estilos
        estilos = getSampleStyleSheet()
        estilo_titulo = estilos['Heading1']
        estilo_subtitulo = estilos['Heading2']
        estilo_normal = estilos['Normal']
        
        # Título
        elementos.append(Paragraph(f"Estadísticas de Entrenamiento - {usuario.username}", estilo_titulo))
        elementos.append(Spacer(1, 12))
        
        # Datos generales
        elementos.append(Paragraph("Resumen General", estilo_subtitulo))
        elementos.append(Spacer(1, 6))
        
        datos_generales = [
            ["Total de entrenamientos", str(estadisticas.total_trainings)],
            ["Distancia total", f"{estadisticas.total_distance:.2f} km"],
            ["Duración total", str(estadisticas.total_duration)],
            ["Calorías totales", str(estadisticas.total_calories)],
            ["Primer entrenamiento", str(estadisticas.first_training_date) if estadisticas.first_training_date else "N/A"],
            ["Último entrenamiento", str(estadisticas.last_training_date) if estadisticas.last_training_date else "N/A"]
        ]
        
        tabla_general = Table(datos_generales, colWidths=[200, 200])
        tabla_general.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elementos.append(tabla_general)
        elementos.append(Spacer(1, 12))
        
        # Promedios
        elementos.append(Paragraph("Promedios", estilo_subtitulo))
        elementos.append(Spacer(1, 6))
        
        datos_promedios = [
            ["Distancia promedio por entrenamiento", f"{estadisticas.avg_distance_per_training:.2f} km"],
            ["Duración promedio por entrenamiento", str(estadisticas.avg_duration_per_training)],
            ["Velocidad promedio", f"{estadisticas.avg_speed:.2f} km/h"],
            ["Ritmo cardíaco promedio", f"{estadisticas.avg_heart_rate:.1f} ppm"]
        ]
        
        tabla_promedios = Table(datos_promedios, colWidths=[200, 200])
        tabla_promedios.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elementos.append(tabla_promedios)
        elementos.append(Spacer(1, 12))
        
        # Récords
        elementos.append(Paragraph("Récords Personales", estilo_subtitulo))
        elementos.append(Spacer(1, 6))
        
        datos_records = [
            ["Distancia más larga", f"{estadisticas.longest_distance:.2f} km"],
            ["Duración más larga", str(estadisticas.longest_duration)],
            ["Velocidad más alta", f"{estadisticas.highest_speed:.2f} km/h"],
            ["Mayor ganancia de elevación", f"{estadisticas.highest_elevation_gain:.1f} m"]
        ]
        
        tabla_records = Table(datos_records, colWidths=[200, 200])
        tabla_records.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elementos.append(tabla_records)
        elementos.append(Spacer(1, 12))
        
        # Actividad reciente
        elementos.append(Paragraph("Actividad Reciente (Último Mes)", estilo_subtitulo))
        elementos.append(Spacer(1, 6))
        
        # Calcular actividad reciente
        hoy = datetime.date.today()
        hace_30_dias = hoy - datetime.timedelta(days=30)
        entrenamientos_recientes = Training.objects.filter(
            user=usuario,
            date__gte=hace_30_dias
        )
        
        # Contar por tipo de actividad
        tipos_recientes = {}
        for t in entrenamientos_recientes:
            tipo = t.get_activity_type_display()
            tipos_recientes[tipo] = tipos_recientes.get(tipo, 0) + 1
        
        # Datos de actividad reciente
        datos_recientes = [
            ["Entrenamientos realizados", str(entrenamientos_recientes.count())],
            ["Distancia total", f"{entrenamientos_recientes.aggregate(total=Sum('distance'))['total'] or 0:.2f} km"],
        ]
        
        for tipo, cantidad in tipos_recientes.items():
            datos_recientes.append([f"Entrenamientos de {tipo}", str(cantidad)])
        
        tabla_recientes = Table(datos_recientes, colWidths=[200, 200])
        tabla_recientes.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elementos.append(tabla_recientes)
        
        # Generar PDF
        doc.build(elementos)
        
        # Preparar respuesta
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="estadisticas_{usuario.username}.pdf"'
        
        return response

class ActivitySummaryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para resúmenes de actividad.
    
    Permite acceder a los resúmenes de actividad por períodos
    (diario, semanal, mensual, anual) y generar nuevos resúmenes.
    """
    
    serializer_class = ActivitySummarySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Obtener resúmenes de actividad del usuario autenticado.
        
        Permite filtrar por tipo de período.
        """
        usuario = self.request.user
        
        # Filtrar por tipo de período si se especifica
        tipo_periodo = self.request.query_params.get('tipo_periodo')
        if tipo_periodo in ['daily', 'weekly', 'monthly', 'yearly']:
            return ActivitySummary.objects.filter(user=usuario, period_type=tipo_periodo)
        
        return ActivitySummary.objects.filter(user=usuario)
    
    @action(detail=False, methods=['post'])
    def generar_resumenes(self, request):
        """
        Generar o actualizar resúmenes de actividad para el usuario.
        
        Permite crear resúmenes para diferentes períodos de tiempo
        a partir de los entrenamientos existentes.
        """
        usuario = request.user
        tipos_periodo = request.data.get('tipos_periodo', ['weekly', 'monthly', 'yearly'])
        
        # Validar tipos de período
        tipos_validos = ['daily', 'weekly', 'monthly', 'yearly']
        for tipo in tipos_periodo:
            if tipo not in tipos_validos:
                return Response(
                    {'error': f'Tipo de período no válido: {tipo}. Debe ser uno de: {", ".join(tipos_validos)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Obtener todos los entrenamientos del usuario
        entrenamientos = Training.objects.filter(user=usuario).order_by('date')
        
        if not entrenamientos.exists():
            return Response({'mensaje': 'No hay entrenamientos para generar resúmenes de actividad.'})
        
        # Variables para contar resultados
        resumenes_creados = 0
        resumenes_actualizados = 0
        
        # Generar resúmenes para cada tipo de período solicitado
        for tipo_periodo in tipos_periodo:
            if tipo_periodo == 'daily':
                # Agrupar por día
                fechas_unicas = entrenamientos.dates('date', 'day')
                
                for fecha in fechas_unicas:
                    # Obtener entrenamientos de ese día
                    entrenamientos_dia = entrenamientos.filter(date=fecha)
                    
                    # Calcular estadísticas
                    cantidad = entrenamientos_dia.count()
                    distancia_total = entrenamientos_dia.aggregate(total=Sum('distance'))['total'] or 0
                    calorias_total = entrenamientos_dia.aggregate(total=Sum('calories'))['total'] or 0
                    
                    # Calcular duración total
                    segundos_totales = sum(
                        t.duration.total_seconds() for t in entrenamientos_dia if t.duration
                    )
                    
                    # Crear o actualizar resumen
                    resumen, creado = ActivitySummary.objects.update_or_create(
                        user=usuario,
                        period_type='daily',
                        year=fecha.year,
                        month=fecha.month,
                        day=fecha.day,
                        defaults={
                            'start_date': fecha,
                            'end_date': fecha,
                            'training_count': cantidad,
                            'total_distance': distancia_total,
                            'total_duration': datetime.timedelta(seconds=segundos_totales),
                            'total_calories': calorias_total,
                        }
                    )
                    
                    if creado:
                        resumenes_creados += 1
                    else:
                        resumenes_actualizados += 1
            
            elif tipo_periodo == 'weekly':
                # Obtener todas las semanas únicas por año-semana
                # Usamos dates() y un procesamiento manual para evitar dependencias
                fechas_unicas = entrenamientos.dates('date', 'week')
                semanas_procesadas = set()
                
                for fecha in fechas_unicas:
                    # Obtener el número de semana
                    año = fecha.year
                    semana = fecha.isocalendar()[1]
                    
                    # Evitar duplicados
                    clave_semana = f"{año}-{semana}"
                    if clave_semana in semanas_procesadas:
                        continue
                    semanas_procesadas.add(clave_semana)
                    
                    # Calcular fechas de inicio y fin de la semana
                    # Aproximación simple: inicio = fecha - (día de la semana - 1)
                    dia_semana = fecha.isocalendar()[2]  # 1=lunes, 7=domingo
                    primer_dia = fecha - datetime.timedelta(days=dia_semana-1)
                    ultimo_dia = primer_dia + datetime.timedelta(days=6)
                    
                    # Obtener entrenamientos de la semana
                    entrenamientos_semana = entrenamientos.filter(
                        date__gte=primer_dia, 
                        date__lte=ultimo_dia
                    )
                    
                    if entrenamientos_semana.exists():
                        # Calcular estadísticas
                        cantidad = entrenamientos_semana.count()
                        distancia_total = entrenamientos_semana.aggregate(total=Sum('distance'))['total'] or 0
                        calorias_total = entrenamientos_semana.aggregate(total=Sum('calories'))['total'] or 0
                        
                       # Calcular duración total
                        segundos_totales = sum(
                            t.duration.total_seconds() for t in entrenamientos_semana if t.duration
                        )
                        
                        # Crear o actualizar resumen
                        resumen, creado = ActivitySummary.objects.update_or_create(
                            user=usuario,
                            period_type='weekly',
                            year=año,
                            week=semana,
                            defaults={
                                'start_date': primer_dia,
                                'end_date': ultimo_dia,
                                'training_count': cantidad,
                                'total_distance': distancia_total,
                                'total_duration': datetime.timedelta(seconds=segundos_totales),
                                'total_calories': calorias_total,
                            }
                        )
                        
                        if creado:
                            resumenes_creados += 1
                        else:
                            resumenes_actualizados += 1
            
            elif tipo_periodo == 'monthly':
                # Obtener todos los meses únicos
                fechas_unicas = entrenamientos.dates('date', 'month')
                
                for fecha in fechas_unicas:
                    año = fecha.year
                    mes = fecha.month
                    
                    # Calcular fechas de inicio y fin del mes
                    primer_dia = datetime.date(año, mes, 1)
                    
                    # Último día del mes (usando el primer día del siguiente mes - 1 día)
                    if mes == 12:
                        ultimo_dia = datetime.date(año, mes, 31)
                    else:
                        ultimo_dia = datetime.date(año, mes + 1, 1) - datetime.timedelta(days=1)
                    
                    # Obtener entrenamientos del mes
                    entrenamientos_mes = entrenamientos.filter(
                        date__gte=primer_dia, 
                        date__lte=ultimo_dia
                    )
                    
                    if entrenamientos_mes.exists():
                        # Calcular estadísticas
                        cantidad = entrenamientos_mes.count()
                        distancia_total = entrenamientos_mes.aggregate(total=Sum('distance'))['total'] or 0
                        calorias_total = entrenamientos_mes.aggregate(total=Sum('calories'))['total'] or 0
                        
                        # Calcular duración total
                        segundos_totales = sum(
                            t.duration.total_seconds() for t in entrenamientos_mes if t.duration
                        )
                        
                        # Crear o actualizar resumen
                        resumen, creado = ActivitySummary.objects.update_or_create(
                            user=usuario,
                            period_type='monthly',
                            year=año,
                            month=mes,
                            defaults={
                                'start_date': primer_dia,
                                'end_date': ultimo_dia,
                                'training_count': cantidad,
                                'total_distance': distancia_total,
                                'total_duration': datetime.timedelta(seconds=segundos_totales),
                                'total_calories': calorias_total,
                            }
                        )
                        
                        if creado:
                            resumenes_creados += 1
                        else:
                            resumenes_actualizados += 1
            
            elif tipo_periodo == 'yearly':
                # Obtener todos los años únicos
                fechas_unicas = entrenamientos.dates('date', 'year')
                
                for fecha in fechas_unicas:
                    año = fecha.year
                    
                    # Calcular fechas de inicio y fin del año
                    primer_dia = datetime.date(año, 1, 1)
                    ultimo_dia = datetime.date(año, 12, 31)
                    
                    # Obtener entrenamientos del año
                    entrenamientos_año = entrenamientos.filter(
                        date__gte=primer_dia, 
                        date__lte=ultimo_dia
                    )
                    
                    if entrenamientos_año.exists():
                        # Calcular estadísticas
                        cantidad = entrenamientos_año.count()
                        distancia_total = entrenamientos_año.aggregate(total=Sum('distance'))['total'] or 0
                        calorias_total = entrenamientos_año.aggregate(total=Sum('calories'))['total'] or 0
                        
                        # Calcular duración total
                        segundos_totales = sum(
                            t.duration.total_seconds() for t in entrenamientos_año if t.duration
                        )
                        
                        # Crear o actualizar resumen
                        resumen, creado = ActivitySummary.objects.update_or_create(
                            user=usuario,
                            period_type='yearly',
                            year=año,
                            defaults={
                                'start_date': primer_dia,
                                'end_date': ultimo_dia,
                                'training_count': cantidad,
                                'total_distance': distancia_total,
                                'total_duration': datetime.timedelta(seconds=segundos_totales),
                                'total_calories': calorias_total,
                            }
                        )
                        
                        if creado:
                            resumenes_creados += 1
                        else:
                            resumenes_actualizados += 1
        
        return Response({
            'mensaje': f'Resúmenes generados: {resumenes_creados}, actualizados: {resumenes_actualizados}',
            'creados': resumenes_creados,
            'actualizados': resumenes_actualizados
        })