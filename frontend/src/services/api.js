// src/services/api.js (Simplificado)
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Configuración de URL base según plataforma - simplificada
let API_URL = 'http://192.168.0.7:8000';  // IP por defecto
if (__DEV__) {
  // En Android usar 10.0.2.2 para localhost
  API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
}

// Instancia de axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Interceptor simplificado para token
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {
    // Silenciar error pero continuar la petición
  }
  return config;
});

// Interceptor simplificado para respuestas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Manejo del token expirado (401)
    if (error.response?.status === 401 && !error.config._retry) {
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!refreshToken) throw new Error();
        
        // Renovar token
        const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
        const { access, refresh } = response.data;
        
        // Guardar nuevos tokens
        await SecureStore.setItemAsync('access_token', access);
        if (refresh) await SecureStore.setItemAsync('refresh_token', refresh);
        
        // Reintentar petición original
        error.config.headers.Authorization = `Bearer ${access}`;
        error.config._retry = true;
        return api(error.config);
      } catch (refreshError) {
        // Limpiar tokens
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
      }
    }
    
    // Mensajes de error más limpios
    const message = error.response?.data?.detail || 
                  'Error en la conexión. Inténtalo de nuevo.';
    return Promise.reject(new Error(message));
  }
);

// Funciones de autenticación simplificadas
export const login = async (username, password) => {
  const response = await api.post('/api/token/', { email: username.trim(), password });
  const { access, refresh } = response.data;
  
  // Guardar tokens
  await SecureStore.setItemAsync('access_token', access);
  if (refresh) await SecureStore.setItemAsync('refresh_token', refresh);
  
  return { access, refresh: refresh || '' };
};

export const logout = async () => {
  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('refresh_token');
};

export default api;