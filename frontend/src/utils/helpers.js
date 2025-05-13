/**
 * Funciones de utilidad para la aplicación AthCyl
 */

/**
 * Formatea una duración en formato HH:MM:SS a un formato más legible
 * @param {string} durationString - Duración en formato HH:MM:SS
 * @returns {string} Duración formateada
 */
export const formatDuration = (durationString) => {
  if (!durationString) return 'N/A';
  
  // Formato esperado: "HH:MM:SS"
  const parts = durationString.split(':');
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parts.length > 2 ? parseInt(parts[2]) : 0;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Formatea una fecha a un formato legible
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Obtiene el icono correspondiente a un tipo de actividad
 * @param {string} activityType - Tipo de actividad
 * @returns {string} Nombre del icono de Ionicons
 */
export const getActivityIcon = (activityType) => {
  switch (activityType) {
    case 'running':
      return 'run';
    case 'cycling':
      return 'bicycle';
    case 'swimming':
      return 'water';
    case 'walking':
      return 'walk';
    case 'hiking':
      return 'trending-up';
    default:
      return 'fitness';
  }
};

/**
 * Obtiene el nombre legible de un tipo de actividad
 * @param {string} activityType - Tipo de actividad
 * @returns {string} Nombre legible
 */
export const getActivityName = (activityType) => {
  switch (activityType) {
    case 'running':
      return 'Correr';
    case 'cycling':
      return 'Ciclismo';
    case 'swimming':
      return 'Natación';
    case 'walking':
      return 'Caminar';
    case 'hiking':
      return 'Senderismo';
    default:
      return 'Otro';
  }
};

/**
 * Calcula el ritmo (pace) en minutos por kilómetro
 * @param {number} distance - Distancia en kilómetros
 * @param {string} duration - Duración en formato HH:MM:SS
 * @returns {string} Ritmo formateado (min/km)
 */
export const calculatePace = (distance, duration) => {
  if (!distance || !duration || distance <= 0) return 'N/A';
  
  // Convertir duración a segundos
  const parts = duration.split(':');
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parts.length > 2 ? parseInt(parts[2]) : 0;
  
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  
  // Calcular ritmo en segundos por kilómetro
  const paceSeconds = totalSeconds / distance;
  
  // Convertir a minutos:segundos
  const paceMinutes = Math.floor(paceSeconds / 60);
  const paceRemainingSeconds = Math.floor(paceSeconds % 60);
  
  return `${paceMinutes}:${paceRemainingSeconds.toString().padStart(2, '0')} min/km`;
};

/**
 * Calcula calorías quemadas (estimación simple)
 * @param {string} activityType - Tipo de actividad
 * @param {number} weight - Peso en kg
 * @param {string} duration - Duración en formato HH:MM:SS
 * @returns {number} Calorías estimadas
 */
export const calculateCalories = (activityType, weight, duration) => {
  if (!weight || !duration) return 0;
  
  // MET (Metabolic Equivalent of Task) aproximado según actividad
  const metValues = {
    running: 8.0,
    cycling: 6.0,
    swimming: 7.0,
    walking: 3.5,
    hiking: 5.0,
    other: 5.0
  };
  
  const met = metValues[activityType] || 5.0;
  
  // Convertir duración a horas
  const parts = duration.split(':');
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parts.length > 2 ? parseInt(parts[2]) : 0;
  
  const durationHours = hours + minutes / 60 + seconds / 3600;
  
  // Fórmula: Calorías = MET * peso en kg * tiempo en horas
  return Math.round(met * weight * durationHours);
};

/**
 * Genera un color aleatorio en formato hexadecimal
 * @returns {string} Color hexadecimal
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
 * Valida si una cadena tiene formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido, false en caso contrario
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Trunca un texto si excede la longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
