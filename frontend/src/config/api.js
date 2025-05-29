/**
 * Configuración de la API para conectar con el backend Django - COMPLETO
 * 
 * Este archivo configura:
 * - La instancia de Axios para peticiones HTTP
 * - Interceptores para manejo automático de tokens JWT
 * - Auto-renovación de tokens expirados
 * - Manejo de errores globales
 * - URLs base para diferentes endpoints
 * - Soporte completo para entrenamientos con archivos GPX/TCX
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== CONFIGURACIÓN BASE =====
const getApiBaseUrl = () => {
  return 'http://192.168.0.7:8000';

  /*
  // CONFIGURACIÓN PARA EMULADORES Y DISPOSITIVOS
  
  const ANDROID_EMULATOR_IP = 'http://10.0.2.2:8000';  // IP especial del emulador Android
  const IOS_SIMULATOR_IP = 'http://localhost:8000';     // iOS puede usar localhost directamente
  
  const Platform = require('react-native').Platform;
  
  if (Platform.OS === 'android') {
    return ANDROID_EMULATOR_IP;
  } else if (Platform.OS === 'ios') {
    return IOS_SIMULATOR_IP;
  }
  
  // Por defecto para Android
  return ANDROID_EMULATOR_IP;
  */
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL configurada:', API_BASE_URL);
console.log('📱 Plataforma:', require('react-native').Platform.OS);

// ===== INSTANCIA DE AXIOS =====
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 segundos para archivos grandes
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ===== INTERCEPTORES DE PETICIONES =====
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;  // JWT Bearer token
      }
      
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
      console.log('📡 Authorization:', config.headers.Authorization ? 'Bearer ***' : 'None');
      
      // Log especial para archivos
      if (config.headers['Content-Type'] === 'multipart/form-data') {
        console.log('📎 Subiendo archivo...');
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

// ===== INTERCEPTORES DE RESPUESTAS CON AUTO-REFRESH =====
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    
    // Log especial para archivos procesados
    if (response.data?.file_processed) {
      console.log('📄 Archivo procesado exitosamente');
    }
    
    return response;
  },
  async (error) => {
    console.error('❌ Error respuesta:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
    });
    
    const originalRequest = error.config;
    
    // Si es error 401 y no hemos intentado refresh ya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar refrescar el token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (refreshToken) {
          console.log('🔄 Intentando refrescar token...');
          
          const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = refreshResponse.data;
          
          if (access) {
            // Guardar nuevo token
            await AsyncStorage.setItem('userToken', access);
            
            // Reintentar la petición original con el nuevo token
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('❌ Error refrescando token:', refreshError);
        
        // Si falla el refresh, limpiar datos y redirigir al login
        await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userData', 'isLoggedIn']);
        
        // Aquí podrías disparar un evento para redirigir al login
        // Por ejemplo: NavigationService.navigate('Login');
      }
    }
    
    return Promise.reject(error);
  }
);

// ===== ENDPOINTS DE LA API COMPLETOS =====
export const API_ENDPOINTS = {
  // Autenticación JWT
  auth: {
    login: '/api/auth/login/',
    register: '/api/auth/register/',
    logout: '/api/auth/logout/',
    refresh: '/api/auth/refresh/',
  },
  
  // Usuarios
  users: {
    profile: '/api/usuarios/me/',
    updateProfile: '/api/usuarios/update_profile/',
    changePassword: '/api/usuarios/change_password/',
    deleteAccount: '/api/usuarios/delete_account/',
  },
  
  // Entrenamientos - COMPLETO CON SOPORTE GPX/TCX
  trainings: {
    list: '/api/entrenamientos/trainings/',
    create: '/api/entrenamientos/trainings/',
    detail: (id) => `/api/entrenamientos/trainings/${id}/`,
    trackPoints: (id) => `/api/entrenamientos/trainings/${id}/track_points/`,
    uploadAndProcess: '/api/entrenamientos/trainings/upload_and_process/',
    createFromProcessed: '/api/entrenamientos/trainings/create_from_processed_data/',
    exportCsv: (id) => `/api/entrenamientos/trainings/${id}/export_csv/`,
    exportPdf: (id) => `/api/entrenamientos/trainings/${id}/export_pdf/`,
  },
  
  // Objetivos
  goals: {
    list: '/api/entrenamientos/goals/',
    create: '/api/entrenamientos/goals/',
    detail: (id) => `/api/entrenamientos/goals/${id}/`,
    active: '/api/entrenamientos/goals/active/',
    completed: '/api/entrenamientos/goals/completed/',
    markCompleted: (id) => `/api/entrenamientos/goals/${id}/mark_completed/`,
  },
  
  // Estadísticas
  stats: {
    userStats: '/api/estadisticas/user-stats/',
    summary: '/api/estadisticas/user-stats/resumen/',
    tendencias: '/api/estadisticas/user-stats/tendencias/',
    exportPdf: '/api/estadisticas/user-stats/exportar_pdf/',
  },
  
  // Resúmenes de actividad
  activitySummaries: {
    list: '/api/estadisticas/activity-summaries/',
    create: '/api/estadisticas/activity-summaries/',
    detail: (id) => `/api/estadisticas/activity-summaries/${id}/`,
    generate: '/api/estadisticas/activity-summaries/generar_resumenes/',
  }
};

// ===== FUNCIONES UTILITARIAS =====

/**
 * Función para verificar conectividad con el servidor
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
 * Función para probar conexiones específicas
 */
export const testConnection = async () => {
  // Prueba solo las URLs relevantes
  const urls = [
    'http://10.0.2.2:8000',      // Android Emulator -> 127.0.0.1:8000
    'http://localhost:8000',      // iOS Simulator
    'http://192.168.0.7:8000',   // Red local
  ];
  
  console.log('🔍 Probando conexiones con Django...');
  
  for (const url of urls) {
    try {
      console.log(`Probando: ${url}`);
      const response = await axios.get(`${url}/admin/`, { timeout: 5000 });
      
      if (response.status < 400) {
        console.log(`✅ FUNCIONA: ${url}`);
        return url;
      }
    } catch (error) {
      console.log(`❌ FALLA: ${url} - ${error.message}`);
    }
  }
  
  console.log('❌ Ninguna URL funciona. Asegúrate de que Django esté corriendo con: python manage.py runserver 0.0.0.0:8000');
  return null;
};

/**
 * Función específica para subir archivos grandes
 * @param {string} url - URL del endpoint
 * @param {FormData} formData - Datos del formulario con archivo
 * @param {function} onUploadProgress - Callback para progreso
 * @returns {Promise} - Promesa con la respuesta
 */
export const uploadLargeFile = async (url, formData, onUploadProgress = null) => {
  try {
    console.log('📤 Iniciando subida de archivo grande...');
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutos para archivos muy grandes
    };
    
    if (onUploadProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`📊 Progreso: ${percentCompleted}%`);
        onUploadProgress(percentCompleted);
      };
    }
    
    const response = await api.post(url, formData, config);
    
    console.log('✅ Archivo subido exitosamente');
    return response;
    
  } catch (error) {
    console.error('❌ Error subiendo archivo:', error);
    throw error;
  }
};

/**
 * Extrae mensaje de error legible desde la respuesta de la API
 */
export const getErrorMessage = (error) => {
  // Error de red/conexión
  if (!error.response) {
    if (error.code === 'ECONNREFUSED') {
      return `No se puede conectar al servidor en ${API_BASE_URL}. Verifica que Django esté ejecutándose.`;
    } else if (error.code === 'NETWORK_ERROR') {
      return 'Error de red. Verifica tu conexión.';
    } else if (error.code === 'ECONNABORTED') {
      return 'Timeout de conexión. El servidor tardó demasiado en responder.';
    }
    return `Error de conexión con ${API_BASE_URL}`;
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
    
    // Si hay detalles de errores de campos
    if (data.details) {
      const firstError = Object.values(data.details)[0];
      return Array.isArray(firstError) ? firstError[0] : firstError;
    }
    
    // Errores de campos específicos
    const fieldErrors = Object.keys(data).filter(key => Array.isArray(data[key]));
    if (fieldErrors.length > 0) {
      return data[fieldErrors[0]][0];
    }
    
    // Si hay un mensaje simple como string
    if (typeof data === 'string') {
      return data;
    }
  }
  
  // Mensajes por defecto según código de estado
  const status = error.response?.status;
  switch (status) {
    case 400:
      return 'Datos inválidos. Verifica la información enviada.';
    case 401:
      return 'Credenciales inválidas. Por favor, inicia sesión nuevamente.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no fue encontrado.';
    case 413:
      return 'El archivo es demasiado grande. Máximo 50MB permitido.';
    case 415:
      return 'Formato de archivo no soportado. Solo se permiten archivos GPX, TCX y FIT.';
    case 500:
      return 'Error del servidor. Por favor, inténtalo más tarde.';
    default:
      return `Error ${status}: ${error.response?.statusText || 'Error desconocido'}`;
  }
};

export default api;