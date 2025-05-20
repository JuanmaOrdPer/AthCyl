// src/services/api.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Servicio API para comunicación con el backend
 * Configurado para trabajar con tokens JWT y manejar automáticamente
 * la renovación de tokens y errores de autenticación
 */

// Obtener la URL base de la API desde la configuración
const apiConfig = Constants.expoConfig?.extra || {};
let API_URL = apiConfig.apiUrl || 'http://192.168.0.7:8000';

// En desarrollo, ajustar URL para dispositivos Android
if (__DEV__) {
  if (Platform.OS === 'android') {
    API_URL = 'http://10.0.2.2:8000'; // Android emulator usa esta IP para localhost
  }
}

// Instancia de axios con configuración predeterminada
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

/**
 * Interceptor para añadir token JWT a las solicitudes
 */
api.interceptors.request.use(async (config) => {
  try {
    // Obtener token de acceso
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log('Error al obtener el token de acceso:', error);
  }
  return config;
});

/**
 * Interceptor para manejar respuestas y renovar token automáticamente
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si es error 401 (no autorizado) y no es un reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar renovar el token
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          
          // Guardar el nuevo token de acceso
          await SecureStore.setItemAsync('access_token', access);
          
          // Actualizar el token en la solicitud original y reintentarla
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si no se puede renovar el token, limpiar tokens y redirigir a login
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        
        // Aquí eventualmente podrías usar un contexto para redirigir al login
        console.log('Sesión expirada. Redirigiendo a login...');
      }
    }
    
    // Formatear mensajes de error para que sean más amigables
    let errorMessage = 'Error de conexión. Intenta de nuevo más tarde.';
    
    if (error.response) {
      // Error de respuesta del servidor
      if (error.response.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      }
    } else if (error.request) {
      // Error de red (sin respuesta)
      errorMessage = 'No hay conexión con el servidor. Verifica tu conexión a internet.';
    } else {
      // Error en la configuración de la solicitud
      errorMessage = error.message;
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Iniciar sesión con email/username y contraseña
 * @param {string} email - Email o nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} - Datos del usuario y tokens
 */
const login = async (email, password) => {
  try {
    // Usar el endpoint personalizado que permite login con email/username
    const response = await api.post('/api/token/', {
      username: email.trim(), // El backend espera 'username' aunque puede ser email
      password: password
    });
    
    const { access, refresh } = response.data;
    
    // Guardar tokens
    await SecureStore.setItemAsync('access_token', access);
    if (refresh) {
      await SecureStore.setItemAsync('refresh_token', refresh);
    }
    
    // Obtener datos del usuario
    const userResponse = await api.get('/api/usuarios/me/');
    
    return {
      user: userResponse.data,
      tokens: { access, refresh }
    };
  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    throw error;
  }
};

/**
 * Cerrar sesión y limpiar tokens
 */
const logout = async () => {
  try {
    // Eliminar tokens
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    
    return true;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};

/**
 * Registrar un nuevo usuario
 * @param {Object} userData - Datos del usuario a registrar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
const register = async (userData) => {
  return await api.post('/api/usuarios/register/', userData);
};

/**
 * Obtener perfil del usuario actual
 * @returns {Promise<Object>} - Datos del perfil
 */
const getUserProfile = async () => {
  return await api.get('/api/usuarios/me/');
};

/**
 * Actualizar perfil de usuario
 * @param {Object} userData - Nuevos datos de usuario
 * @returns {Promise<Object>} - Perfil actualizado
 */
const updateProfile = async (userData) => {
  const userId = userData.id;
  return await api.patch(`/api/usuarios/${userId}/`, userData);
};

// Exportar todas las funciones útiles
export default {
  // Métodos HTTP básicos
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
  
  // Métodos específicos de autenticación
  login,
  logout,
  register,
  getUserProfile,
  updateProfile
};