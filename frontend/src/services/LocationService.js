import * as Location from 'expo-location';

/**
 * Solicita permisos de ubicación al usuario
 * @returns {Promise<boolean>} - true si los permisos fueron concedidos, false en caso contrario
 */
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error al solicitar permisos de ubicación:', error);
    throw error;
  }
};

/**
 * Obtiene la ubicación actual del dispositivo
 * @returns {Promise<Object>} - Objeto con la información de ubicación
 */
export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    return location;
  } catch (error) {
    console.error('Error al obtener la ubicación actual:', error);
    throw error;
  }
};

/**
 * Inicia el seguimiento de ubicación en tiempo real
 * @param {Function} callback - Función que se ejecutará cada vez que cambie la ubicación
 * @returns {Promise<Object>} - Objeto watcher para detener el seguimiento posteriormente
 */
export const startLocationTracking = async (callback) => {
  try {
    // Configuración para el seguimiento de ubicación
    const options = {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,  // 5 segundos
      distanceInterval: 10, // 10 metros
      mayShowUserSettingsDialog: true
    };

    // Iniciar el seguimiento y devolver el watcher
    const locationWatcher = await Location.watchPositionAsync(options, callback);
    return locationWatcher;
  } catch (error) {
    console.error('Error al iniciar el seguimiento de ubicación:', error);
    throw error;
  }
};

/**
 * Detiene el seguimiento de ubicación
 * @param {Object} locationWatcher - Objeto watcher devuelto por startLocationTracking
 */
export const stopLocationTracking = async (locationWatcher) => {
  if (locationWatcher) {
    locationWatcher.remove();
  }
};

/**
 * Calcula la distancia entre dos puntos geográficos en metros
 * @param {Object} point1 - Primer punto {latitude, longitude}
 * @param {Object} point2 - Segundo punto {latitude, longitude}
 * @returns {number} - Distancia en metros
 */
export const calculateDistance = (point1, point2) => {
  if (!point1 || !point2) return 0;

  const toRad = (value) => (value * Math.PI) / 180;
  
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = toRad(point1.latitude);
  const φ2 = toRad(point2.latitude);
  const Δφ = toRad(point2.latitude - point1.latitude);
  const Δλ = toRad(point2.longitude - point1.longitude);

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distancia en metros
};

/**
 * Calcula la velocidad en km/h basada en la distancia y el tiempo
 * @param {number} distanceInMeters - Distancia en metros
 * @param {number} timeInSeconds - Tiempo en segundos
 * @returns {number} - Velocidad en km/h
 */
export const calculateSpeed = (distanceInMeters, timeInSeconds) => {
  if (timeInSeconds === 0) return 0;
  
  // Convertir metros/segundo a km/h
  return (distanceInMeters / timeInSeconds) * 3.6;
};

/**
 * Formatea las coordenadas para mostrarlas en la interfaz
 * @param {number} coordinate - Coordenada (latitud o longitud)
 * @returns {string} - Coordenada formateada
 */
export const formatCoordinate = (coordinate) => {
  return coordinate.toFixed(6);
};

/**
 * Verifica si la ubicación está dentro de un área determinada
 * @param {Object} location - Ubicación a verificar {latitude, longitude}
 * @param {Object} center - Centro del área {latitude, longitude}
 * @param {number} radiusInMeters - Radio del área en metros
 * @returns {boolean} - true si la ubicación está dentro del área, false en caso contrario
 */
export const isLocationInArea = (location, center, radiusInMeters) => {
  const distance = calculateDistance(location, center);
  return distance <= radiusInMeters;
};

export default {
  requestLocationPermission,
  getCurrentLocation,
  startLocationTracking,
  stopLocationTracking,
  calculateDistance,
  calculateSpeed,
  formatCoordinate,
  isLocationInArea
};
