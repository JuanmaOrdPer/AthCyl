"""
Utilidades para integración con APIs externas de servicios deportivos.

Este módulo proporciona funciones para:
- Integración con Strava API
- Validación de datos usando servicios externos
- Enriquecimiento de datos faltantes

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

import requests
import logging
from django.conf import settings
import json
from typing import Dict, Optional, List, Tuple

logger = logging.getLogger('trainings')

class StravaAPI:
    """
    Cliente para la API de Strava.
    
    Útil para:
    - Validar archivos con problemas
    - Obtener datos adicionales
    - Enriquecer información faltante
    """
    
    def __init__(self, access_token: str = None):
        self.access_token = access_token
        self.base_url = "https://www.strava.com/api/v3"
        self.session = requests.Session()
        
        if access_token:
            self.session.headers.update({
                'Authorization': f'Bearer {access_token}'
            })
    
    def upload_activity(self, file_path: str, activity_type: str = None, 
                       name: str = None, description: str = None) -> Dict:
        """
        Sube una actividad a Strava y devuelve los datos procesados.
        Útil como validación cruzada de nuestro procesamiento.
        """
        try:
            url = f"{self.base_url}/uploads"
            
            files = {'file': open(file_path, 'rb')}
            data = {}
            
            if activity_type:
                data['activity_type'] = activity_type
            if name:
                data['name'] = name
            if description:
                data['description'] = description
            
            response = self.session.post(url, files=files, data=data)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error subiendo a Strava: {e}")
            return None
    
    def get_activity_details(self, activity_id: int) -> Dict:
        """
        Obtiene detalles completos de una actividad.
        """
        try:
            url = f"{self.base_url}/activities/{activity_id}"
            response = self.session.get(url)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error obteniendo actividad de Strava: {e}")
            return None

class GarminConnect:
    """
    Cliente básico para Garmin Connect (no oficial).
    Útil para obtener datos adicionales de dispositivos Garmin.
    """
    
    def __init__(self, username: str = None, password: str = None):
        self.username = username
        self.password = password
        self.session = requests.Session()
        self.base_url = "https://connect.garmin.com"
        self._authenticated = False
    
    def authenticate(self) -> bool:
        """
        Autentica con Garmin Connect.
        NOTA: Esto es un ejemplo básico. En producción usar OAuth.
        """
        # Implementación básica - en producción usar OAuth2
        logger.warning("Garmin Connect requiere autenticación OAuth2 en producción")
        return False

class FileValidator:
    """
    Validador de archivos deportivos usando múltiples fuentes.
    """
    
    @staticmethod
    def validate_gpx_structure(file_content: str) -> Tuple[bool, List[str]]:
        """
        Valida la estructura básica de un archivo GPX.
        """
        errors = []
        
        # Verificar XML válido
        try:
            import xml.etree.ElementTree as ET
            ET.fromstring(file_content)
        except ET.ParseError as e:
            errors.append(f"XML no válido: {e}")
            return False, errors
        
        # Verificar elementos GPX obligatorios
        required_elements = ['<gpx', '<trk', '<trkpt']
        for element in required_elements:
            if element not in file_content:
                errors.append(f"Elemento obligatorio faltante: {element}")
        
        # Verificar coordenadas
        if 'lat=' not in file_content or 'lon=' not in file_content:
            errors.append("No se encontraron coordenadas GPS")
        
        return len(errors) == 0, errors
    
    @staticmethod
    def validate_tcx_structure(file_content: str) -> Tuple[bool, List[str]]:
        """
        Valida la estructura básica de un archivo TCX.
        """
        errors = []
        
        # Verificar XML válido
        try:
            import xml.etree.ElementTree as ET
            ET.fromstring(file_content)
        except ET.ParseError as e:
            errors.append(f"XML no válido: {e}")
            return False, errors
        
        # Verificar elementos TCX obligatorios
        required_elements = ['<TrainingCenterDatabase', '<Activity', '<Trackpoint']
        for element in required_elements:
            if element not in file_content:
                errors.append(f"Elemento TCX obligatorio faltante: {element}")
        
        return len(errors) == 0, errors
    
    @staticmethod
    def validate_fit_file(file_path: str) -> Tuple[bool, List[str]]:
        """
        Valida un archivo FIT usando fitparse.
        """
        try:
            import fitparse
            
            fitfile = fitparse.FitFile(file_path)
            
            # Intentar leer algunos registros
            record_count = 0
            for record in fitfile.get_messages('record'):
                record_count += 1
                if record_count > 10:  # Solo verificar algunos registros
                    break
            
            if record_count == 0:
                return False, ["No se encontraron registros de datos en el archivo FIT"]
            
            return True, []
            
        except Exception as e:
            return False, [f"Error validando archivo FIT: {e}"]

class DataEnricher:
    """
    Enriquece datos faltantes usando diversas fuentes.
    """
    
    @staticmethod
    def estimate_calories(distance_km: float, duration_minutes: float, 
                         activity_type: str, user_weight_kg: float = 70) -> int:
        """
        Estima calorías quemadas usando MET values.
        """
        met_values = {
            'running': 8.0,
            'cycling': 6.0,
            'swimming': 7.0,
            'walking': 3.5,
            'hiking': 5.0,
            'other': 5.0
        }
        
        met = met_values.get(activity_type, 5.0)
        hours = duration_minutes / 60
        calories = met * user_weight_kg * hours
        
        return int(calories)
    
    @staticmethod
    def estimate_elevation_gain(track_points: List[Dict]) -> float:
        """
        Calcula ganancia de elevación desde puntos de track.
        """
        if len(track_points) < 2:
            return 0
        
        total_gain = 0
        prev_elevation = None
        
        for point in track_points:
            elevation = point.get('elevation')
            if elevation and prev_elevation:
                if elevation > prev_elevation:
                    total_gain += elevation - prev_elevation
            prev_elevation = elevation
        
        return total_gain
    
    @staticmethod
    def calculate_speeds(track_points: List[Dict]) -> Tuple[float, float]:
        """
        Calcula velocidad promedio y máxima desde puntos de track.
        """
        if len(track_points) < 2:
            return 0, 0
        
        speeds = []
        
        for i in range(1, len(track_points)):
            prev_point = track_points[i-1]
            curr_point = track_points[i]
            
            # Calcular distancia usando fórmula de Haversine
            distance = DataEnricher._haversine_distance(
                prev_point.get('latitude', 0),
                prev_point.get('longitude', 0),
                curr_point.get('latitude', 0),
                curr_point.get('longitude', 0)
            )
            
            # Calcular tiempo transcurrido
            prev_time = prev_point.get('time')
            curr_time = curr_point.get('time')
            
            if prev_time and curr_time and distance > 0:
                time_diff = (curr_time - prev_time).total_seconds()
                if time_diff > 0:
                    speed_ms = distance / time_diff
                    speed_kmh = speed_ms * 3.6
                    speeds.append(speed_kmh)
        
        if not speeds:
            return 0, 0
        
        avg_speed = sum(speeds) / len(speeds)
        max_speed = max(speeds)
        
        return avg_speed, max_speed
    
    @staticmethod
    def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calcula la distancia entre dos puntos GPS usando la fórmula de Haversine.
        Devuelve distancia en metros.
        """
        import math
        
        # Radio de la Tierra en metros
        R = 6371000
        
        # Convertir grados a radianes
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        # Diferencias
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        # Fórmula de Haversine
        a = (math.sin(dlat/2)**2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c
        
        return distance

# Funciones de utilidad para usar en el serializador

def enhance_training_data(training, track_points_data: List[Dict]) -> Dict:
    """
    Mejora los datos de un entrenamiento usando diversas técnicas.
    
    Args:
        training: Objeto Training
        track_points_data: Lista de diccionarios con datos de puntos
    
    Returns:
        Dict con datos mejorados
    """
    enhanced_data = {}
    
    try:
        # Estimar calorías si faltan
        if not training.calories and training.distance and training.duration:
            duration_minutes = training.duration.total_seconds() / 60
            user_weight = getattr(training.user, 'weight', 70)
            
            enhanced_data['calories'] = DataEnricher.estimate_calories(
                training.distance, duration_minutes, training.activity_type, user_weight
            )
        
        # Calcular ganancia de elevación si falta
        if not training.elevation_gain and track_points_data:
            enhanced_data['elevation_gain'] = DataEnricher.estimate_elevation_gain(
                track_points_data
            )
        
        # Calcular velocidades si faltan
        if (not training.avg_speed or not training.max_speed) and track_points_data:
            avg_speed, max_speed = DataEnricher.calculate_speeds(track_points_data)
            if not training.avg_speed:
                enhanced_data['avg_speed'] = avg_speed
            if not training.max_speed:
                enhanced_data['max_speed'] = max_speed
        
        logger.info(f"Datos mejorados para entrenamiento {training.id}: {enhanced_data}")
        return enhanced_data
        
    except Exception as e:
        logger.error(f"Error mejorando datos del entrenamiento: {e}")
        return {}

def validate_uploaded_file(file_obj, filename: str) -> Tuple[bool, List[str]]:
    """
    Valida un archivo subido antes del procesamiento.
    
    Args:
        file_obj: Objeto archivo de Django
        filename: Nombre del archivo
    
    Returns:
        Tuple[bool, List[str]]: (es_válido, lista_errores)
    """
    try:
        file_obj.seek(0)
        content = file_obj.read()
        
        if filename.lower().endswith('.gpx'):
            content_str = content.decode('utf-8')
            return FileValidator.validate_gpx_structure(content_str)
        
        elif filename.lower().endswith('.tcx'):
            content_str = content.decode('utf-8')
            return FileValidator.validate_tcx_structure(content_str)
        
        elif filename.lower().endswith('.fit'):
            # Para FIT necesitamos escribir a archivo temporal
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.fit', delete=False) as tmp_file:
                tmp_file.write(content)
                tmp_file.flush()
                
                result = FileValidator.validate_fit_file(tmp_file.name)
                
                # Limpiar archivo temporal
                import os
                os.unlink(tmp_file.name)
                
                return result
        
        else:
            return False, [f"Tipo de archivo no soportado: {filename}"]
    
    except Exception as e:
        return False, [f"Error validando archivo: {e}"]