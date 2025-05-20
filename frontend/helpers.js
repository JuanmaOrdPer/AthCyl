/**
 * helpers.js - Funciones de utilidad para la aplicación AthCyl
 * 
 * Contiene funciones comunes para formateo, cálculos y conversiones
 * Adaptado para trabajar con los datos del backend y textos en español
 */

/**
 * Formatea una duración en formato HH:MM:SS a un formato más legible en español
 * @param {string} durationString - Duración en formato HH:MM:SS
 * @returns {string} Duración formateada (ej: "2h 30m" o "45m 20s")
 */
export const formatDuration = (durationString) => {
    if (!durationString) return 'N/A';
    
    // Formato esperado: "HH:MM:SS" o "MM:SS"
    const parts = durationString.split(':');
    
    // Si solo tenemos minutos y segundos
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const seconds = parseInt(parts[1]);
      return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    }
    
    // Si tenemos horas, minutos y segundos
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseInt(parts[2]);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  /**
   * Formatea una fecha a un formato legible en español
   * @param {string} dateString - Fecha en formato ISO
   * @returns {string} Fecha formateada (ej: "15 de junio de 2023")
   */
  export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Opciones de formato para español
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      };
      
      // Formatear fecha en español
      return date.toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString; // Devolver el string original si hay error
    }
  };
  
  /**
   * Mapeo de tipos de actividad a iconos de Ionicons
   * Usa los mismos tipos que el backend
   */
  const ACTIVITY_ICONS = {
    running: 'run',
    cycling: 'bicycle',
    swimming: 'water',
    walking: 'walk',
    hiking: 'trending-up',
    other: 'fitness'
  };
  
  /**
   * Obtiene el icono correspondiente a un tipo de actividad
   * @param {string} activityType - Tipo de actividad del backend
   * @returns {string} Nombre del icono de Ionicons
   */
  export const getActivityIcon = (activityType) => {
    return ACTIVITY_ICONS[activityType] || ACTIVITY_ICONS.other;
  };
  
  /**
   * Mapeo de tipos de actividad a nombres legibles en español
   * Estos deben coincidir con los choices del modelo en el backend
   */
  const ACTIVITY_NAMES = {
    running: 'Correr',
    cycling: 'Ciclismo',
    swimming: 'Natación',
    walking: 'Caminar',
    hiking: 'Senderismo',
    other: 'Otro'
  };
  
  /**
   * Obtiene el nombre legible en español de un tipo de actividad
   * @param {string} activityType - Tipo de actividad del backend
   * @returns {string} Nombre legible en español
   */
  export const getActivityName = (activityType) => {
    return ACTIVITY_NAMES[activityType] || ACTIVITY_NAMES.other;
  };
  
  /**
   * Calcula el ritmo (pace) en minutos por kilómetro
   * @param {number} distance - Distancia en kilómetros
   * @param {string} duration - Duración en formato HH:MM:SS
   * @returns {string} Ritmo formateado (ej: "5:30 min/km")
   */
  export const calculatePace = (distance, duration) => {
    if (!distance || !duration || distance <= 0) return 'N/A';
    
    // Convertir duración a segundos
    const parts = duration.split(':');
    let totalSeconds = 0;
    
    // Si es HH:MM:SS
    if (parts.length === 3) {
      totalSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    } 
    // Si es MM:SS
    else if (parts.length === 2) {
      totalSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    
    if (totalSeconds === 0) return 'N/A';
    
    // Calcular ritmo en segundos por kilómetro
    const paceSeconds = totalSeconds / distance;
    
    // Convertir a minutos:segundos
    const paceMinutes = Math.floor(paceSeconds / 60);
    const paceRemainingSeconds = Math.floor(paceSeconds % 60);
    
    return `${paceMinutes}:${paceRemainingSeconds.toString().padStart(2, '0')} min/km`;
  };
  
  /**
   * Traduce la información de objetivos para coincidir con el backend
   */
  export const goalTypeInfo = {
    distance: { 
      name: 'Distancia', 
      icon: 'speedometer',
      unit: 'km',
      format: (value) => `${value.toFixed(1)} km`
    },
    duration: { 
      name: 'Tiempo', 
      icon: 'time',
      unit: 'minutos',
      format: (value) => {
        const hours = Math.floor(value / 60);
        const minutes = Math.floor(value % 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      }
    },
    frequency: { 
      name: 'Frecuencia', 
      icon: 'calendar',
      unit: 'sesiones',
      format: (value) => `${Math.round(value)} sesiones`
    },
    speed: { 
      name: 'Velocidad', 
      icon: 'flash',
      unit: 'km/h',
      format: (value) => `${value.toFixed(1)} km/h`
    },
    other: { 
      name: 'Otro', 
      icon: 'flag',
      unit: '',
      format: (value) => `${value}`
    }
  };
  
  /**
   * Obtiene la etiqueta de un período de objetivo
   * @param {string} period - Valor del período del backend
   * @returns {string} - Etiqueta traducida
   */
  export const getPeriodLabel = (period) => {
    const labels = {
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual',
      yearly: 'Anual',
      custom: 'Personalizado'
    };
    return labels[period] || 'Personalizado';
  };
  
  /**
   * Formatea un valor según su tipo para mostrarlo correctamente
   * @param {any} value - Valor a formatear
   * @param {string} type - Tipo de valor
   * @returns {string} - Valor formateado
   */
  export const formatValue = (value, type) => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (type) {
      case 'distance':
        return `${parseFloat(value).toFixed(2)} km`;
      case 'speed':
        return `${parseFloat(value).toFixed(1)} km/h`;
      case 'heart_rate':
        return `${Math.round(parseFloat(value))} ppm`;
      case 'elevation':
        return `${Math.round(parseFloat(value))} m`;
      case 'calories':
        return `${Math.round(parseFloat(value))} kcal`;
      default:
        return value.toString();
    }
  };
  
  /**
   * Genera un color aleatorio para gráficas
   * @returns {string} - Color en formato hexadecimal
   */
  export const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  
  /**
   * Valida si un texto es un email válido
   * @param {string} email - Email a validar
   * @returns {boolean} - true si es válido
   */
  export const isValidEmail = (email) => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  /**
   * Obtiene el nombre del mes en español
   * @param {number} month - Número de mes (1-12)
   * @returns {string} - Nombre del mes
   */
  export const getMonthName = (month) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || '';
  };