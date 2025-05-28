/**
 * Servicio de Entrenamientos para AthCyl
 * 
 * Este servicio maneja todas las operaciones relacionadas con entrenamientos:
 * - Obtener lista de entrenamientos
 * - Crear nuevos entrenamientos
 * - Obtener detalles de un entrenamiento específico
 * - Actualizar y eliminar entrenamientos
 * - Exportar datos de entrenamientos
 */

import { api, API_ENDPOINTS, getErrorMessage } from '../config/api';

// ===== TIPOS DE ACTIVIDAD =====
// Mapeo de tipos de actividad con sus traducciones
export const ACTIVITY_TYPES = {
  running: 'Correr',
  cycling: 'Ciclismo',
  swimming: 'Natación',
  walking: 'Caminar',
  hiking: 'Senderismo',
  other: 'Otro'
};

// ===== CLASE TRAININGSERVICE =====
class TrainingService {
  
  /**
   * Obtener lista de entrenamientos del usuario actual
   * @param {object} params - Parámetros de filtrado (opcional)
   * @returns {Promise<object>} Lista de entrenamientos
   */
  async getTrainings(params = {}) {
    try {
      console.log('📊 Obteniendo entrenamientos...');
      
      const response = await api.get(API_ENDPOINTS.trainings.list, { params });
      
      // Procesar entrenamientos para mostrar datos legibles
      const trainings = response.data.results || response.data;
      const processedTrainings = trainings.map(training => ({
        ...training,
        activityTypeDisplay: ACTIVITY_TYPES[training.activity_type] || training.activity_type,
        durationDisplay: this.formatDuration(training.duration),
        distanceDisplay: training.distance ? `${training.distance.toFixed(2)} km` : 'N/A',
        dateDisplay: this.formatDate(training.date)
      }));
      
      console.log(`✅ ${processedTrainings.length} entrenamientos obtenidos`);
      
      return {
        success: true,
        data: processedTrainings,
        count: response.data.count || processedTrainings.length,
        next: response.data.next,
        previous: response.data.previous
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo entrenamientos:', error);
      
      return {
        success: false,
        error: getErrorMessage(error),
        data: []
      };
    }
  }
  
  /**
   * Crear un nuevo entrenamiento
   * @param {object} trainingData - Datos del entrenamiento
   * @returns {Promise<object>} Resultado de la creación
   */
  async createTraining(trainingData) {
    try {
      console.log('🏃 Creando nuevo entrenamiento...');
      
      // Preparar datos para enviar al backend
      const dataToSend = {
        title: trainingData.title,
        description: trainingData.description || '',
        activity_type: trainingData.activityType,
        date: trainingData.date, // Formato: YYYY-MM-DD
        start_time: trainingData.startTime, // Formato: HH:MM:SS
        duration: trainingData.duration, // En segundos o formato HH:MM:SS
        distance: trainingData.distance ? parseFloat(trainingData.distance) : null,
        calories: trainingData.calories ? parseInt(trainingData.calories) : null,
        avg_speed: trainingData.avgSpeed ? parseFloat(trainingData.avgSpeed) : null,
        max_speed: trainingData.maxSpeed ? parseFloat(trainingData.maxSpeed) : null,
        avg_heart_rate: trainingData.avgHeartRate ? parseFloat(trainingData.avgHeartRate) : null,
        max_heart_rate: trainingData.maxHeartRate ? parseFloat(trainingData.maxHeartRate) : null,
        elevation_gain: trainingData.elevationGain ? parseFloat(trainingData.elevationGain) : null
      };
      
      const response = await api.post(API_ENDPOINTS.trainings.create, dataToSend);
      
      console.log('✅ Entrenamiento creado correctamente');
      
      return {
        success: true,
        data: response.data.training || response.data,
        message: response.data.message || 'Entrenamiento creado exitosamente'
      };
      
    } catch (error) {
      console.error('❌ Error creando entrenamiento:', error);
      
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }
  
  /**
   * Obtener detalles de un entrenamiento específico
   * @param {number} trainingId - ID del entrenamiento
   * @returns {Promise<object>} Detalles del entrenamiento
   */
  async getTrainingDetails(trainingId) {
    try {
      console.log(`🔍 Obteniendo detalles del entrenamiento ${trainingId}...`);
      
      const response = await api.get(API_ENDPOINTS.trainings.detail(trainingId));
      
      // Procesar datos para mostrar
      const training = {
        ...response.data,
        activityTypeDisplay: ACTIVITY_TYPES[response.data.activity_type] || response.data.activity_type,
        durationDisplay: this.formatDuration(response.data.duration),
        distanceDisplay: response.data.distance ? `${response.data.distance.toFixed(2)} km` : 'N/A',
        dateDisplay: this.formatDate(response.data.date),
        speedDisplay: response.data.avg_speed ? `${response.data.avg_speed.toFixed(1)} km/h` : 'N/A'
      };
      
      console.log('✅ Detalles obtenidos correctamente');
      
      return {
        success: true,
        data: training
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo detalles:', error);
      
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }
  
  /**
   * Actualizar un entrenamiento existente
   * @param {number} trainingId - ID del entrenamiento
   * @param {object} trainingData - Datos actualizados
   * @returns {Promise<object>} Resultado de la actualización
   */
  async updateTraining(trainingId, trainingData) {
    try {
      console.log(`📝 Actualizando entrenamiento ${trainingId}...`);
      
      // Preparar datos (similar a createTraining)
      const dataToSend = {
        title: trainingData.title,
        description: trainingData.description || '',
        activity_type: trainingData.activityType,
        date: trainingData.date,
        start_time: trainingData.startTime,
        duration: trainingData.duration,
        distance: trainingData.distance ? parseFloat(trainingData.distance) : null,
        calories: trainingData.calories ? parseInt(trainingData.calories) : null,
        avg_speed: trainingData.avgSpeed ? parseFloat(trainingData.avgSpeed) : null,
        max_speed: trainingData.maxSpeed ? parseFloat(trainingData.maxSpeed) : null,
        avg_heart_rate: trainingData.avgHeartRate ? parseFloat(trainingData.avgHeartRate) : null,
        max_heart_rate: trainingData.maxHeartRate ? parseFloat(trainingData.maxHeartRate) : null,
        elevation_gain: trainingData.elevationGain ? parseFloat(trainingData.elevationGain) : null
      };
      
      const response = await api.put(API_ENDPOINTS.trainings.detail(trainingId), dataToSend);
      
      console.log('✅ Entrenamiento actualizado correctamente');
      
      return {
        success: true,
        data: response.data,
        message: 'Entrenamiento actualizado exitosamente'
      };
      
    } catch (error) {
      console.error('❌ Error actualizando entrenamiento:', error);
      
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }
  
  /**
   * Eliminar un entrenamiento
   * @param {number} trainingId - ID del entrenamiento
   * @returns {Promise<object>} Resultado de la eliminación
   */
  async deleteTraining(trainingId) {
    try {
      console.log(`🗑️ Eliminando entrenamiento ${trainingId}...`);
      
      await api.delete(API_ENDPOINTS.trainings.detail(trainingId));
      
      console.log('✅ Entrenamiento eliminado correctamente');
      
      return {
        success: true,
        message: 'Entrenamiento eliminado exitosamente'
      };
      
    } catch (error) {
      console.error('❌ Error eliminando entrenamiento:', error);
      
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }
  
  /**
   * Obtener puntos de ruta GPS de un entrenamiento (si existen)
   * @param {number} trainingId - ID del entrenamiento
   * @returns {Promise<object>} Puntos de la ruta
   */
  async getTrackPoints(trainingId) {
    try {
      console.log(`📍 Obteniendo puntos de ruta para entrenamiento ${trainingId}...`);
      
      const response = await api.get(API_ENDPOINTS.trainings.trackPoints(trainingId));
      
      return {
        success: true,
        data: response.data
      };
      
    } catch (error) {
      // Si no hay puntos de ruta, no es necesariamente un error
      if (error.response?.status === 404) {
        return {
          success: true,
          data: [],
          message: 'Este entrenamiento no tiene puntos de ruta GPS'
        };
      }
      
      console.error('❌ Error obteniendo puntos de ruta:', error);
      
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }
  
  // ===== FUNCIONES UTILITARIAS =====
  
  /**
   * Formatear duración para mostrar
   * @param {string} duration - Duración en formato HH:MM:SS o segundos
   * @returns {string} Duración formateada
   */
  formatDuration(duration) {
    if (!duration) return 'N/A';
    
    // Si ya es una cadena con formato de tiempo
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }
    
    // Si es un número (segundos), convertir a HH:MM:SS
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }
    
    return duration;
  }
  
  /**
   * Formatear fecha para mostrar
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @returns {string} Fecha formateada
   */
  formatDate(date) {
    if (!date) return 'N/A';
    
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return date;
    }
  }
  
  /**
   * Convertir segundos a formato HH:MM:SS
   * @param {number} seconds - Segundos
   * @returns {string} Tiempo formateado
   */
  secondsToTimeString(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  /**
   * Convertir formato HH:MM:SS a segundos
   * @param {string} timeString - Tiempo en formato HH:MM:SS
   * @returns {number} Segundos
   */
  timeStringToSeconds(timeString) {
    if (!timeString) return 0;
    
    const parts = timeString.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    
    return (hours * 3600) + (minutes * 60) + seconds;
  }
}

// ===== EXPORTAR INSTANCIA SINGLETON =====
const trainingService = new TrainingService();
export default trainingService;

// ===== EXPORTAR FUNCIONES INDIVIDUALES =====
export const {
  getTrainings,
  createTraining,
  getTrainingDetails,
  updateTraining,
  deleteTraining,
  getTrackPoints,
  formatDuration,
  formatDate,
  secondsToTimeString,
  timeStringToSeconds
} = trainingService;