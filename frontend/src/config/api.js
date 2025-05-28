/**
 * Configuración de la API para conectar con el backend Django - VERSIÓN CORREGIDA
 * 
 * Este archivo configura:
 * - La instancia de Axios para peticiones HTTP
 * - Interceptores para manejo automático de tokens JWT
 * - Manejo de errores globales
 * - URLs base para diferentes endpoints
 * - Detección automática de conexión
 */

import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== CONFIGURACIÓN BASE =====
// Función para obtener la URL base de la API
function getApiBaseUrl() {
  // Prioridad de configuración:
  // 1. Variable de entorno EXPO_PUBLIC_API_URL
  // 2. Configuración en app.config.js
  // 3. localhost por defecto
  
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  const fallbackUrl = "http://localhost:8000";
  
  const baseUrl = envUrl || configUrl || fallbackUrl;
  
  console.log('🔗 API Base URL configurada:', baseUrl);
  
  return baseUrl;
}

const API_BASE_URL = getApiBaseUrl();

// ===== INSTANCIA DE AXIOS =====
// Crear instancia principal de Axios con configuración base
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos de timeout (aumentado)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ===== INTERCEPTORES DE PETICIONES =====
// Interceptor para añadir token JWT automáticamente a las peticiones
api.interceptors.request.use(
  async (config) => {
    try {
      // Obtener token guardado en AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        // Añadir token JWT al header Authorization
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
      
      // Log de debugging para desarrollo
      if (__DEV__) {
        console.log('📡 Request config:', {
          url: config.url,
          method: config.method,
          baseURL: config.baseURL,
          headers: config.headers,
        });
      }
      
      return config;
    } catch (error) {
      console.error('❌ Error en interceptor de petición:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Error en interceptor de petición:', error);
    return Promise.reject(error);
  }
);

// ===== INTERCEPTORES DE RESPUESTAS =====
// Interceptor para manejo global de respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Log de respuestas exitosas en desarrollo
    if (__DEV__) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log detallado del error
    console.error('❌ Error en respuesta API:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    // Si el token ha expirado (401) y no hemos intentado renovarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar renovar token con refresh token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (refreshToken) {
          console.log('🔄 Intentando renovar token...');
          
          const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken
          });
          
          const newToken = response.data.access;
          await AsyncStorage.setItem('userToken', newToken);
          
          console.log('✅ Token renovado exitosamente');
          
          // Reintentar petición original con nuevo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si falla la renovación, limpiar tokens y rediriger a login
        console.error('❌ Error renovando token:', refreshError);
        await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userData']);
        console.log('🚪 Tokens limpiados, necesario login nuevamente');
      }
    }
    
    // Manejo específico de errores de conexión
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      console.error('🔌 Error de conexión: Verifica que el servidor esté ejecutándose');
    }
    
    return Promise.reject(error);
  }
);

// ===== ENDPOINTS DE LA API =====
// URLs organizadas por funcionalidad
export const API_ENDPOINTS = {
  // Autenticación
  auth: {
    login: '/api/token/',
    refresh: '/api/token/refresh/',
    register: '/api/usuarios/register/',
  },
  
  // Usuarios
  users: {
    profile: '/api/usuarios/me/',
    updateProfile: '/api/usuarios/update_profile/',
    changePassword: '/api/usuarios/change_password/',
  },
  
  // Entrenamientos
  trainings: {
    list: '/api/entrenamientos/trainings/',
    create: '/api/entrenamientos/trainings/',
    detail: (id) => `/api/entrenamientos/trainings/${id}/`,
    trackPoints: (id) => `/api/entrenamientos/trainings/${id}/track_points/`,
    exportCsv: (id) => `/api/entrenamientos/trainings/${id}/export_csv/`,
    exportPdf: (id) => `/api/entrenamientos/trainings/${id}/export_pdf/`,
  },
  
  // Estadísticas
  stats: {
    userStats: '/api/estadisticas/user-stats/',
    summary: '/api/estadisticas/user-stats/resumen/',
    trends: '/api/estadisticas/user-stats/tendencias/',
  },
  
  // Objetivos
  goals: {
    list: '/api/entrenamientos/goals/',
    create: '/api/entrenamientos/goals/',
    detail: (id) => `/api/entrenamientos/goals/${id}/`,
    active: '/api/entrenamientos/goals/active/',
    completed: '/api/entrenamientos/goals/completed/',
  }
};

// ===== FUNCIONES UTILITARIAS =====

/**
 * Función para verificar conectividad con el servidor
 * @returns {Promise<boolean>} true si hay conectividad
 */
export const checkConnectivity = async () => {
  try {
    console.log('🔍 Verificando conectividad con el servidor...');
    
    const response = await axios.get(`${API_BASE_URL}/admin/`, {
      timeout: 5000
    });
    
    const isConnected = response.status < 400;
    console.log(isConnected ? '✅ Servidor accesible' : '❌ Servidor no accesible');
    
    return isConnected;
  } catch (error) {
    console.error('❌ Error de conectividad:', error.message);
    return false;
  }
};

/**
 * Función para hacer peticiones GET
 * @param {string} url - URL del endpoint
 * @param {object} params - Parámetros de consulta
 */
export const get = async (url, params = {}) => {
  const response = await api.get(url, { params });
  return response.data;
};

/**
 * Función para hacer peticiones POST
 * @param {string} url - URL del endpoint
 * @param {object} data - Datos a enviar
 */
export const post = async (url, data = {}) => {
  const response = await api.post(url, data);
  return response.data;
};

/**
 * Función para hacer peticiones PUT
 * @param {string} url - URL del endpoint
 * @param {object} data - Datos a enviar
 */
export const put = async (url, data = {}) => {
  const response = await api.put(url, data);
  return response.data;
};

/**
 * Función para hacer peticiones PATCH
 * @param {string} url - URL del endpoint
 * @param {object} data - Datos a enviar
 */
export const patch = async (url, data = {}) => {
  const response = await api.patch(url, data);
  return response.data;
};

/**
 * Función para hacer peticiones DELETE
 * @param {string} url - URL del endpoint
 */
export const del = async (url) => {
  const response = await api.delete(url);
  return response.data;
};

// ===== MANEJO DE ERRORES MEJORADO =====
/**
 * Extrae mensaje de error legible desde la respuesta de la API
 * @param {object} error - Error de Axios
 * @returns {string} Mensaje de error legible
 */
export const getErrorMessage = (error) => {
  // Error de red/conexión
  if (!error.response) {
    if (error.code === 'ECONNREFUSED') {
      return 'No se puede conectar al servidor. Verifica que esté ejecutándose en ' + API_BASE_URL;
    } else if (error.code === 'NETWORK_ERROR') {
      return 'Error de red. Verifica tu conexión a internet.';
    } else if (error.code === 'ECONNABORTED') {
      return 'La conexión tardó demasiado. Verifica tu conexión de red.';
    }
    return 'Error de conexión. Verifica que el servidor esté ejecutándose.';
  }
  
  // Errores con respuesta del servidor
  if (error.response?.data) {
    const data = error.response.data;
    
    // Si hay un mensaje específico
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    
    // Si hay errores de validación
    if (data.errors) {
      const firstError = Object.values(data.errors)[0];
      return Array.isArray(firstError) ? firstError[0] : firstError;
    }
    
    // Errores de campos específicos
    const fieldErrors = Object.keys(data).filter(key => Array.isArray(data[key]));
    if (fieldErrors.length > 0) {
      return data[fieldErrors[0]][0];
    }
  }
  
  // Mensajes por defecto según código de estado
  const status = error.response?.status;
  switch (status) {
    case 401:
      return 'Credenciales inválidas. Por favor, inicia sesión nuevamente.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no fue encontrado.';
    case 500:
      return 'Error del servidor. Por favor, inténtalo más tarde.';
    default:
      return `Error ${status}: ${error.response?.statusText || 'Error desconocido'}`;
  }
};

export default api;