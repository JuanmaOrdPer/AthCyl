/**
 * Servicio de Estadísticas para AthCyl
 * 
 * Este servicio maneja todas las operaciones relacionadas con estadísticas:
 * - Obtener estadísticas generales del usuario
 * - Obtener resúmenes de actividad
 * - Obtener tendencias por períodos
 * - Formatear datos para mostrar en gráficos
 */

import { api, API_ENDPOINTS, getErrorMessage } from '../config/api';

// ===== CLASE STATSSERVICE =====
class StatsService {
  
  /**
   * Obtener estadísticas generales del usuario
   * @param {boolean} forceUpdate - Forzar actualización desde el servidor
   * @returns {Promise<object>} Estadísticas del usuario
   */
  async getUserStats(forceUpdate = false) {
    try {
      console.log('📊 Obteniendo estadísticas del usuario...');
      
      // Agregar parámetro para forzar actualización si es necesario
      const params = forceUpdate ? { actualizar: 'true' } : {};
      
      const response = await api.get(API_ENDPOINTS.stats.userStats, { params });
      
      // Procesar estadísticas para mostrar
      const stats = response.data.results ? response.data.results[0] : response.data;
      
      if (!stats) {
        return {
          success: true,
          data: this.getEmptyStats(),
          message: 'No hay estadísticas disponibles aún'
        };
      }
      
      const processedStats = {
        ...stats,
        // Formatear datos para mostrar
        totalDistanceDisplay: stats.total_distance ? `${stats.total_distance.toFixed(2)} km` : '0 km',
        totalDurationDisplay: this.formatDuration(stats.total_duration),
        avgDistanceDisplay: stats.avg_distance_per_training ? `${stats.avg_distance_per_training.toFixed(2)} km` : '0 km',
        avgDurationDisplay: this.formatDuration(stats.avg_duration_per_training),
        avgSpeedDisplay: stats.avg_speed ? `${stats.avg_speed.toFixed(1)} km/h` : '0 km/h',
        avgHeartRateDisplay: stats.avg_heart_rate ? `${Math.round(stats.avg_heart_rate)} bpm` : 'N/A',
        longestDistanceDisplay: stats.longest_distance ? `${stats.longest_distance.toFixed(2)} km` : '0 km',
        longestDurationDisplay: this.formatDuration(stats.longest_duration),
        highestSpeedDisplay: stats.highest_speed ? `${stats.highest_speed.toFixed(1)} km/h` : '0 km/h',
        elevationGainDisplay: stats.highest_elevation_gain ? `${stats.highest_elevation_gain.toFixed(0)} m` : '0 m',
        firstTrainingDisplay: this.formatDate(stats.first_training_date),
        lastTrainingDisplay: this.formatDate(stats.last_training_date)
      };
      
      console.log('✅ Estadísticas obtenidas correctamente');
      
      return {
        success: true,
        data: processedStats
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      
      return {
        success: false,
        error: getErrorMessage(error),
        data: this.getEmptyStats()
      };
    }
  }
  
  /**
   * Obtener resumen completo con estadísticas y actividad reciente
   * @returns {Promise<object>} Resumen completo
   */
  async getStatsSummary() {
    try {
      console.log('📈 Obteniendo resumen de estadísticas...');
      
      const response = await api.get(API_ENDPOINTS.stats.summary);
      
      const summary = response.data;
      
      // Procesar resumen
      const processedSummary = {
        estadisticas: summary.estadisticas,
        actividadReciente: {
          ...summary.actividad_reciente,
          entrenamientos_ultimo_mes: summary.actividad_reciente?.entrenamientos_ultimo_mes || 0,
          distancia_ultimo_mes: summary.actividad_reciente?.distancia_ultimo_mes || 0,
          distanciaDisplay: `${(summary.actividad_reciente?.distancia_ultimo_mes || 0).toFixed(2)} km`
        },
        distribucionPorTipo: summary.distribucion_por_tipo || {}
      };
      
      console.log('✅ Resumen obtenido correctamente');
      
      return {
        success: true,
        data: processedSummary
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo resumen:', error);
      
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }
  
  /**
   * Obtener tendencias de actividad por período
   * @param {string} periodo - Tipo de período (semanal, mensual, anual)
   * @returns {Promise<object>} Datos de tendencias
   */
  async getTrends(periodo = 'mensual') {
    try {
      console.log(`📊 Obteniendo tendencias ${periodo}...`);
      
      const response = await api.get(API_ENDPOINTS.stats.tendencias, {
        params: { periodo }
      });
      
      const trends = response.data;
      
      // Procesar datos para gráficos
      const processedTrends = {
        tipoPeriodo: trends.tipo_periodo,
        datos: trends.datos.map(item => ({
          ...item,
          // Formatear para gráficos
          periodo: item.periodo,
          entrenamientos: item.entrenamientos || 0,
          distanciaTotal: item.distancia_total || 0,
          duracionTotal: item.duracion_total || '0h 0m',
          caloriasTotal: item.calorias_total || 0
        }))
      };
      
      console.log(`✅ Tendencias ${periodo} obtenidas correctamente`);
      
      return {
        success: true,
        data: processedTrends
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo tendencias:', error);
      
      return {
        success: false,
        error: getErrorMessage(error),
        data: { datos: [] }
      };
    }
  }
  
  /**
   * Obtener estadísticas básicas para dashboard
   * @returns {Promise<object>} Estadísticas básicas
   */
  async getDashboardStats() {
    try {
      console.log('🏠 Obteniendo estadísticas para dashboard...');
      
      // Obtener estadísticas y resumen en paralelo
      const [statsResult, summaryResult] = await Promise.all([
        this.getUserStats(),
        this.getStatsSummary()
      ]);
      
      if (!statsResult.success || !summaryResult.success) {
        throw new Error('Error obteniendo datos');
      }
      
      const stats = statsResult.data;
      const summary = summaryResult.data;
      
      // Crear resumen para dashboard
      const dashboardStats = {
        // Estadísticas principales
        totalTrainings: stats.total_trainings || 0,
        totalDistance: stats.total_distance || 0,
        totalDistanceDisplay: stats.totalDistanceDisplay,
        totalDuration: stats.total_duration,
        totalDurationDisplay: stats.totalDurationDisplay,
        totalCalories: stats.total_calories || 0,
        
        // Promedios
        avgDistance: stats.avg_distance_per_training || 0,
        avgDistanceDisplay: stats.avgDistanceDisplay,
        avgSpeed: stats.avg_speed || 0,
        avgSpeedDisplay: stats.avgSpeedDisplay,
        
        // Actividad reciente
        trainingsThisMonth: summary.actividadReciente?.entrenamientos_ultimo_mes || 0,
        distanceThisMonth: summary.actividadReciente?.distancia_ultimo_mes || 0,
        distanceThisMonthDisplay: summary.actividadReciente?.distanciaDisplay,
        
        // Distribución por tipo
        activityDistribution: summary.distribucionPorTipo,
        
        // Fechas
        firstTraining: stats.first_training_date,
        lastTraining: stats.last_training_date,
        firstTrainingDisplay: stats.firstTrainingDisplay,
        lastTrainingDisplay: stats.lastTrainingDisplay
      };
      
      console.log('✅ Estadísticas de dashboard obtenidas');
      
      return {
        success: true,
        data: dashboardStats
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de dashboard:', error);
      
      return {
        success: false,
        error: getErrorMessage(error),
        data: this.getEmptyDashboardStats()
      };
    }
  }
  
  // ===== FUNCIONES UTILITARIAS =====
  
  /**
   * Obtener estadísticas vacías por defecto
   * @returns {object} Estadísticas vacías
   */
  getEmptyStats() {
    return {
      total_trainings: 0,
      total_distance: 0,
      total_duration: null,
      total_calories: 0,
      avg_distance_per_training: 0,
      avg_duration_per_training: null,
      avg_speed: 0,
      avg_heart_rate: 0,
      longest_distance: 0,
      longest_duration: null,
      highest_speed: 0,
      highest_elevation_gain: 0,
      first_training_date: null,
      last_training_date: null,
      totalDistanceDisplay: '0 km',
      totalDurationDisplay: '0h 0m',
      avgDistanceDisplay: '0 km',
      avgDurationDisplay: '0h 0m',
      avgSpeedDisplay: '0 km/h',
      avgHeartRateDisplay: 'N/A',
      longestDistanceDisplay: '0 km',
      longestDurationDisplay: '0h 0m',
      highestSpeedDisplay: '0 km/h',
      elevationGainDisplay: '0 m',
      firstTrainingDisplay: 'N/A',
      lastTrainingDisplay: 'N/A'
    };
  }
  
  /**
   * Obtener estadísticas de dashboard vacías
   * @returns {object} Estadísticas de dashboard vacías
   */
  getEmptyDashboardStats() {
    return {
      totalTrainings: 0,
      totalDistance: 0,
      totalDistanceDisplay: '0 km',
      totalDuration: null,
      totalDurationDisplay: '0h 0m',
      totalCalories: 0,
      avgDistance: 0,
      avgDistanceDisplay: '0 km',
      avgSpeed: 0,
      avgSpeedDisplay: '0 km/h',
      trainingsThisMonth: 0,
      distanceThisMonth: 0,
      distanceThisMonthDisplay: '0 km',
      activityDistribution: {},
      firstTraining: null,
      lastTraining: null,
      firstTrainingDisplay: 'N/A',
      lastTrainingDisplay: 'N/A'
    };
  }
  
  /**
   * Formatear duración para mostrar
   * @param {string} duration - Duración en formato HH:MM:SS
   * @returns {string} Duración formateada
   */
  formatDuration(duration) {
    if (!duration) return '0h 0m';
    
    // Si es una cadena con formato de tiempo
    if (typeof duration === 'string' && duration.includes(':')) {
      const parts = duration.split(':');
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
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
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return date;
    }
  }
  
  /**
   * Preparar datos para gráfico de barras
   * @param {array} trendsData - Datos de tendencias
   * @returns {object} Datos formateados para gráfico
   */
  prepareChartData(trendsData) {
    if (!trendsData || !Array.isArray(trendsData)) {
      return { labels: [], datasets: [] };
    }
    
    const labels = trendsData.map(item => item.periodo);
    const distanceData = trendsData.map(item => item.distanciaTotal || 0);
    const trainingsData = trendsData.map(item => item.entrenamientos || 0);
    
    return {
      labels,
      datasets: [
        {
          name: 'Distancia (km)',
          data: distanceData,
          color: '#2E7D32'
        },
        {
          name: 'Entrenamientos',
          data: trainingsData,
          color: '#4CAF50'
        }
      ]
    };
  }
}

// ===== EXPORTAR INSTANCIA SINGLETON =====
const statsService = new StatsService();
export default statsService;

// ===== EXPORTAR FUNCIONES INDIVIDUALES =====
export const {
  getUserStats,
  getStatsSummary,
  getTrends,
  getDashboardStats,
  getEmptyStats,
  formatDuration,
  formatDate,
  prepareChartData
} = statsService;