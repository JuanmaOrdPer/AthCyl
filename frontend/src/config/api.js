/**
 * Configuración de la API para conectar con el backend Django
 * 
 * Este archivo configura:
 * - La instancia de Axios para peticiones HTTP
 * - Interceptores para manejo automático de tokens JWT
 * - Manejo de errores globales
 * - URLs base para diferentes endpoints
 */

import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== CONFIGURACIÓN BASE =====
// URL base del backend (desde app.config.js)
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.100:8000';

console.log('API Base URL:', API_BASE_URL); // Para debug

// ===== INSTANCIA DE AXIOS =====
// Crear instancia principal de Axios con configuración base
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos de timeout
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
      
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`); // Debug
      return config;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return config;
    }
  },
  (error) => {
    console.error('Error en interceptor de petición:', error);
    return Promise.reject(error);
  }
);

// ===== INTERCEPTORES DE RESPUESTAS =====
// Interceptor para manejo global de respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Log de respuestas exitosas en desarrollo
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si el token ha expirado (401) y no hemos intentado renovarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar renovar token con refresh token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken
          });
          
          const newToken = response.data.access;
          await AsyncStorage.setItem('userToken', newToken);
          
          // Reintentar petición original con nuevo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si falla la renovación, limpiar tokens y rediriger a login
        await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userData']);
        console.log('Token expirado, necesario login nuevamente');
      }
    }
    
    // Log de errores
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, 
                error.response?.status, error.response?.data);
    
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

// ===== MANEJO DE ERRORES =====
/**
 * Extrae mensaje de error legible desde la respuesta de la API
 * @param {object} error - Error de Axios
 * @returns {string} Mensaje de error legible
 */
export const getErrorMessage = (error) => {
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
  if (error.response?.status === 401) {
    return 'Credenciales inválidas. Por favor, inicia sesión nuevamente.';
  } else if (error.response?.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  } else if (error.response?.status === 404) {
    return 'El recurso solicitado no fue encontrado.';
  } else if (error.response?.status >= 500) {
    return 'Error del servidor. Por favor, inténtalo más tarde.';
  } else if (error.code === 'NETWORK_ERROR') {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }
  
  return 'Ha ocurrido un error inesperado. Por favor, inténtalo nuevamente.';
};

export default api;