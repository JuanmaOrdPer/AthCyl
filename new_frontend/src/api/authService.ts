import apiClient, { createApiRequest } from './apiClient';
import * as SecureStore from 'expo-secure-store';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}  // Agrega más campos según sea necesario

export const login = async (email: string, password: string) => {
  try {
    const response = await createApiRequest('post', '/usuarios/login/', { 
      email,
      password 
    });
    
    if (response.data && response.data.token) {
      await SecureStore.setItemAsync('access_token', response.data.token);
      return { 
        success: true, 
        token: response.data.token, 
        user: response.data.user 
      };
    }
    
    return { 
      success: false, 
      error: 'Credenciales inválidas' 
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Error al iniciar sesión',
      details: error.response?.data?.detalles
    };
  }
};

export const register = async (userData: RegisterData) => {
  try {
    // Preparar los datos para el registro
    const registerData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      password_confirm: userData.confirmPassword,
      first_name: userData.name?.split(' ')[0] || userData.username,
      last_name: userData.name?.split(' ').slice(1).join(' ') || ' ',
    };
    
    console.log('Datos de registro procesados:', registerData);
    
    console.log('Datos de registro enviados:', registerData);
    
    // Usar la ruta correcta para el registro (con barra final para Django)
    const response = await createApiRequest('post', '/usuarios/register/', registerData);
    
    console.log('Respuesta del servidor:', response.data);
    
    // Si el registro es exitoso, intentar iniciar sesión automáticamente
    if (response.data && response.data.token) {
      await SecureStore.setItemAsync('access_token', response.data.token);
      return { 
        success: true, 
        data: response.data,
        token: response.data.token
      };
    }
    
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Register error:', error);
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const { data } = error.response;
      
      // Si hay errores de validación del servidor
      if (data) {
        // Intentar obtener el primer mensaje de error
        const firstError = Object.values(data).flat()[0];
        return { 
          success: false, 
          error: firstError || 'Error en los datos del formulario'
        };
      }
      
      return { 
        success: false, 
        error: data?.detail || 'Error en el servidor'
      };
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      return { 
        success: false, 
        error: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
      };
    } else {
      // Error al configurar la solicitud
      return { 
        success: false, 
        error: 'Error al procesar la solicitud'
      };
    }
  }
};

export const logout = async () => {
  try {
    // Opcional: Llamar al endpoint de logout del backend si existe
    // await apiClient.post('/logout/');
    
    // Eliminar tokens
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Error al cerrar sesión' };
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await SecureStore.getItemAsync('access_token');
  return !!token;
};
