import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Configuración de la URL base según la plataforma
let API_URL = 'http://192.168.0.7:8000';  // IP del servidor

// Para desarrollo local
if (__DEV__) {
  if (Platform.OS === 'android') {
    // Usamos varias opciones para el emulador de Android
    // 10.0.2.2 es el localhost del host desde el emulador de Android
    // 10.0.0.2 se usa en algunos emuladores
    // También probamos con la IP directa 192.168.0.7
    
    // IMPORTANTE: Vamos a probar con todas las opciones de conexión posibles
    
    // Opción 1: Emulador estándar (10.0.2.2 es el localhost desde el emulador)
    API_URL = 'http://10.0.2.2:8000';  // localhost desde el emulador
    
    // Opción 2: localhost directo
    // API_URL = 'http://localhost:8000';
    
    // Opción 3: IP directa - Esta es la opción más segura para emuladores y dispositivos físicos
    API_URL = 'http://192.168.0.7:8000';
    
    // Opción 2: Algunos emuladores específicos
    // API_URL = 'http://10.0.0.2:8000';
    
    // Opción 3: Dispositivo físico - descomentar y usar la IP de tu máquina
    // API_URL = 'http://192.168.0.7:8000';
  } else if (Platform.OS === 'ios') {
    // Para iOS Simulator
    API_URL = 'http://localhost:8000';
    // Para dispositivo físico iOS
    // API_URL = 'http://192.168.1.131:8000';
  } else {
    // Para web
    API_URL = 'http://localhost:8000';
  }
}

console.log('🚀 Conectando a la API en:', API_URL, 'en', Platform.OS);

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Importante para evitar problemas con CORS
  validateStatus: function (status) {
    // Aceptamos todos los status codes para poder manejarlos explícitamente
    return true;
  }
});

// Configuración global de headers
api.defaults.headers.common['Content-Type'] = 'application/json';
api.defaults.headers.common['Accept'] = 'application/json';

// Interceptor para loggear las peticiones y mejorar el manejo de errores de red
api.interceptors.request.use(
  config => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    // Añadir un timeout más largo solo para solicitudes de autenticación
    if (config.url?.includes('/token/')) {
      config.timeout = 60000; // 60 segundos para autenticación
    }
    return config;
  },
  error => {
    console.error('❌ Error en la petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta recibida:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error('❌ Error en la petición:', error.config?.url, error.response?.status);
    
    // Si no hay config o ya se reintentó, rechazar
    if (!error.config || error.config._retry) {
      console.log('🚫 No se puede reintentar, rechazando...');
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;
    
    // Solo manejar errores 401 que no sean de login/refresh
    if (error.response?.status === 401) {
      // Evitar bucles con las rutas de autenticación
      if (originalRequest.url.includes('/api/token/')) {
        console.log('🔒 Error en ruta de autenticación, no reintentar');
        return Promise.reject(error);
      }
      
      console.log('🔄 Intentando renovar token expirado...');
      originalRequest._retry = true;
      
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!refreshToken) {
          console.log('❌ No hay refresh token disponible');
          throw new Error('No hay sesión activa');
        }
        
        // Intentar renovar el token (llamando a la función refreshTokenAPI para evitar colisión de nombres)
        console.log('🔄 Renovando token...');
        const { access, refresh } = await refreshTokenAPI(refreshToken);
        
        // Guardar los nuevos tokens
        console.log('✅ Token renovado, guardando...');
        await SecureStore.setItemAsync('access_token', access);
        if (refresh) {
          await SecureStore.setItemAsync('refresh_token', refresh);
        }
        
        // Actualizar el token en las cabeceras
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        console.log('🔄 Reintentando petición original...');
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Error al renovar el token:', refreshError);
        // Limpiar tokens en caso de error
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        
        // Rechazar con un mensaje claro
        return Promise.reject(new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'));
      }
    } // Cierre del if (error.response?.status === 401)
    
    // Manejar errores de red
    if (error.message === 'Network Error') {
      return Promise.reject(new Error('No se pudo conectar al servidor. Verifica tu conexión a internet.'));
    }
    
    // Para otros errores, devolver el mensaje del servidor o un mensaje genérico
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
    
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Función para realizar el login
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<{access: string, refresh: string}>} Tokens de acceso y refresh
 */
export const login = async (username, password) => {
  try {
    console.log('🕑 Iniciando proceso de login...');
    
    if (!username || !password) {
      throw new Error('Usuario y contraseña son requeridos');
    }
    
    // 1. Obtener tokens
    console.log('🔐 Solicitando tokens...');
    // El backend ahora acepta tanto email como username
    const credentials = {
      email: username.trim(),  // Usamos el mismo campo para ambos casos
      password: password
    };
    console.log('📢 Enviando credenciales:', JSON.stringify(credentials));
    
    // SimpleJWT espera 'username', aunque nuestro USERNAME_FIELD sea 'email'
    const response = await api.post('/api/token/', credentials);
    
    // Log detallado de la respuesta para depurar
    console.log('✅ Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    
    // Verificar la respuesta
    if (response.status >= 400) {
      console.error('❌ Error HTTP:', response.status, response.statusText);
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }
    
    if (!response.data?.access) {
      console.error('❌ Respuesta sin token de acceso:', response.data);
      throw new Error('La respuesta del servidor no contiene un token de acceso');
    }
    
    const { access, refresh } = response.data;
    
    // 2. Guardar tokens
    console.log('💾 Guardando tokens...');
    await Promise.all([
      SecureStore.setItemAsync('access_token', access),
      refresh ? SecureStore.setItemAsync('refresh_token', refresh) : Promise.resolve()
    ]);
    
    // 3. Configurar headers para futuras peticiones
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    console.log('✅ Autenticación exitosa');
    return { access, refresh: refresh || '' };
  } catch (error) {
    console.error('❌ Error en login:', {
      message: error.message,
      response: {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      },
      request: error.request,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    
    // Proporcionar mensajes de error más descriptivos
    if (error.response) {
      // El servidor respondió con un estado de error
      if (error.response.status === 400) {
        throw new Error('Usuario o contraseña incorrectos');
      } else if (error.response.status === 401) {
        throw new Error('No autorizado. Verifica tus credenciales');
      } else if (error.response.status >= 500) {
        throw new Error('Error en el servidor. Por favor, inténtalo más tarde');
      } else if (error.response.data?.detail) {
        throw new Error(error.response.data.detail);
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('❌ Error en la petición:', error.request);
      throw new Error(`No se pudo conectar al servidor en ${API_URL}. Verifica que el backend esté corriendo y tu conexión a internet.`);
    }
    
    // Error en la configuración de la solicitud
    throw new Error(error.message || 'Error al iniciar sesión');
  }
};

/**
 * Renueva el token de acceso usando el refresh token
 * @param {string} refreshToken - Token de refresh
 * @returns {Promise<{access: string, refresh: string}>} Nuevos tokens
 */
export const refreshTokenAPI = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new Error('No hay token de refresh disponible');
    }
    
    console.log('🔄 Renovando token de acceso...');
    
    // 1. Solicitar nuevo token
    const response = await api.post('/api/token/refresh/', {
      refresh: refreshToken
    });
    
    // 2. Verificar la respuesta
    if (!response.data?.access) {
      throw new Error('Respuesta del servidor inválida');
    }
    
    const { access, refresh: newRefreshToken } = response.data;
    
    // 3. Guardar los nuevos tokens
    await Promise.all([
      SecureStore.setItemAsync('access_token', access),
      newRefreshToken ? SecureStore.setItemAsync('refresh_token', newRefreshToken) : Promise.resolve()
    ]);
    
    // 4. Actualizar el header de autorización
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    console.log('✅ Token renovado exitosamente');
    return { 
      access, 
      refresh: newRefreshToken || refreshToken
    };
  } catch (error) {
    console.error('❌ Error al renovar token:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Limpiar tokens en caso de error
    await Promise.all([
      SecureStore.deleteItemAsync('access_token'),
      SecureStore.deleteItemAsync('refresh_token')
    ]);
    
    throw new Error(error.response?.data?.detail || 'La sesión ha expirado. Por favor, inicia sesión nuevamente.');
  }
};

export const logout = async () => {
  try {
    // Eliminar tokens
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    
    // Eliminar token de las cabeceras
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const isAuthenticated = async () => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    return !!token;
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
};

export const getAuthHeaders = async () => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return { 'Content-Type': 'application/json' };
  }
};

export default api;
