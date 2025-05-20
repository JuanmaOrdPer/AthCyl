// src/services/LocationService.js
import * as Location from 'expo-location';

/**
 * Servicio para gestionar la ubicación y cálculos geográficos
 * Adaptado para la comunicación con el backend con mensajes en español
 */

/**
 * Solicita permisos de ubicación al usuario
 * @returns {Promise<boolean>} - true si los permisos fueron concedidos
 */
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error al solicitar permisos de ubicación:', error);
    throw new Error('No se pudieron solicitar permisos de ubicación.');
  }
};

/**
 * Obtiene la ubicación actual del dispositivo con alta precisión
 * @returns {Promise<Object>} - Objeto con la información de ubicación
 */
export const getCurrentLocation = async () => {
  // Primero verificamos los permisos
  const permisoConcedido = await requestLocationPermission();
  if (!permisoConcedido) {
    throw new Error('Permiso de ubicación denegado. La aplicación necesita acceso a tu ubicación.');
  }
  
  try {
    // Configuración para obtener la mejor precisión posible
    const options = {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1000,  // 1 segundo
      distanceInterval: 1  // 1 metro
    };
    
    return await Location.getCurrentPositionAsync(options);
  } catch (error) {
    console.error('Error al obtener la ubicación actual:', error);
    throw new Error('No se pudo obtener tu ubicación actual. Verifica que el GPS esté activado.');
  }
};

/**
 * Inicia el seguimiento de ubicación en tiempo real
 * @param {Function} callback - Función que se ejecutará cada vez que cambie la ubicación
 * @param {Object} options - Opciones de configuración opcional
 * @returns {Promise<Object>} - Objeto watcher para detener el seguimiento
 */
export const startLocationTracking = async (callback, options = {}) => {
  // Verificar permisos primero
  const permisoConcedido = await requestLocationPermission();
  if (!permisoConcedido) {
    throw new Error('Permiso de ubicación denegado. No se puede iniciar el seguimiento.');
  }
  
  const defaultOptions = {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 3000,      // 3 segundos
    distanceInterval: 5,     // 5 metros
    foregroundService: {     // Solo para Android
      notificationTitle: 'AthCyl está registrando tu entrenamiento',
      notificationBody: 'Ubicación activa para seguimiento de ruta',
      notificationColor: '#1E88E5'
    },
    pausesUpdatesAutomatically: false,  // No pausar actualizaciones
    activityType: Location.ActivityType.Fitness  // Optimizar para deporte
  };

  try {
    // Combinar opciones por defecto con las proporcionadas
    const trackingOptions = { ...defaultOptions, ...options };
    
    // Iniciar el seguimiento
    const locationSubscription = await Location.watchPositionAsync(trackingOptions, callback);
    
    // Devolver el objeto de suscripción que se usará para detener el seguimiento
    return locationSubscription;
  } catch (error) {
    console.error('Error al iniciar el seguimiento de ubicación:', error);
    throw new Error('No se pudo iniciar el seguimiento de ubicación. Verifica tus ajustes de GPS.');
  }
};

/**
 * Detiene el seguimiento de ubicación
 * @param {Object} locationSubscription - Objeto devuelto por startLocationTracking
 */
export const stopLocationTracking = (locationSubscription) => {
  if (locationSubscription && typeof locationSubscription.remove === 'function') {
    locationSubscription.remove();
    console.log('Seguimiento de ubicación detenido correctamente.');
  } else {
    console.warn('No hay un seguimiento de ubicación activo para detener.');
  }
};

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula haversine
 * @param {Object} point1 - Primer punto {latitude, longitude}
 * @param {Object} point2 - Segundo punto {latitude, longitude}
 * @returns {number} - Distancia en metros
 */
export const calculateDistance = (point1, point2) => {
  if (!point1 || !point2) return 0;

  // Convertir grados a radianes
  const toRad = (value) => (value * Math.PI) / 180;
  
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = toRad(point1.latitude);
  const φ2 = toRad(point2.latitude);
  const Δφ = toRad(point2.latitude - point1.latitude);
  const Δλ = toRad(point2.longitude - point1.longitude);

  // Fórmula haversine
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distancia en metros
};

/**
 * Calcula la velocidad en km/h a partir de distancia y tiempo
 * @param {number} distanceInMeters - Distancia en metros
 * @param {number} timeInSeconds - Tiempo en segundos
 * @returns {number} - Velocidad en km/h
 */
export const calculateSpeed = (distanceInMeters, timeInSeconds) => {
  if (!timeInSeconds || timeInSeconds === 0) return 0;
  // Convertir m/s a km/h
  return (distanceInMeters / timeInSeconds) * 3.6;
};

/**
 * Calcula la pendiente (inclinación) entre dos puntos
 * @param {Object} point1 - Primer punto {latitude, longitude, altitude}
 * @param {Object} point2 - Segundo punto {latitude, longitude, altitude}
 * @returns {number} - Pendiente en porcentaje
 */
export const calculateGrade = (point1, point2) => {
  if (!point1 || !point2 || !point1.altitude || !point2.altitude) return 0;
  
  // Calcular la distancia horizontal en metros
  const horizontalDistance = calculateDistance(point1, point2);
  
  if (horizontalDistance === 0) return 0;
  
  // Calcular la elevación (diferencia de altitud)
  const verticalDistance = point2.altitude - point1.altitude;
  
  // Calcular pendiente en porcentaje
  return (verticalDistance / horizontalDistance) * 100;
};

// Exportar todas las funciones como un objeto para uso más simple
export default {
  requestLocationPermission,
  getCurrentLocation,
  startLocationTracking,
  stopLocationTracking,
  calculateDistance,
  calculateSpeed,
  calculateGrade
};