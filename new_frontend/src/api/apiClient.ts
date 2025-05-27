import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Configuración de la URL base de la API
// En desarrollo, usa la IP de tu máquina en la red local
const API_URL = __DEV__ 
  ? 'http://192.168.0.7:8000' // Usando tu IP local sin /api al final
  : 'https://tu-api-en-produccion.com';

console.log('API URL:', API_URL); // Para depuración

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Exportar la función para poder usarla en otros archivos
export const createApiRequest = async (method: string, url: string, data?: any, config?: AxiosRequestConfig) => {
  try {
    // Asegurarse de que la URL no comience con /api para evitar duplicados
    const cleanUrl = url.startsWith('/api') ? url : `/api${url}`;
    
    const response = await apiClient({
      method,
      url: cleanUrl,
      data,
      ...config
    });
    return response;
  } catch (error) {
    console.error(`Error en la petición ${method} a ${url}:`, error);
    throw error;
  }
};

// Variable para evitar múltiples intentos de refresco de token
let isRefreshing = false;

// Interfaz para la cola de peticiones fallidas
interface FailedRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}

let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

// Interceptor para añadir el token de autenticación a las peticiones
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    // Si el error no es 401 o no hay configuración de la petición, rechazamos
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Si ya estamos refrescando el token, encolamos la petición
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        }) as Promise<AxiosResponse>;
    }

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        
        if (!refreshToken) {
          // No hay refresh token, forzar logout
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('refresh_token');
          // Aquí podrías redirigir al usuario al login
          return Promise.reject(error);
        }

        // Intento de refrescar el token
        const response = await axios.post<{ access: string }>(
          `${API_URL}/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        
        // Guardar el nuevo token
        await SecureStore.setItemAsync('access_token', access);
        
        // Actualizar el header de autorización
        // No es necesario establecer el header común aquí, ya que el interceptor de solicitud lo manejará
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
        }
        
        // Procesar la cola de peticiones fallidas
        processQueue(null, access);
        
        // Reintentar la petición original
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si hay un error al refrescar, forzar logout
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        processQueue(refreshError, null);
        // Aquí podrías redirigir al usuario al login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
