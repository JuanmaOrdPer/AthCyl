/**
 * Servicio de Autenticación para AthCyl
 * 
 * Este servicio maneja todas las operaciones relacionadas con autenticación:
 * - Inicio de sesión (login)
 * - Registro de nuevos usuarios
 * - Cierre de sesión (logout)
 * - Gestión de tokens JWT
 * - Verificación de estado de autenticación
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, API_ENDPOINTS, getErrorMessage } from '../config/api';

// ===== KEYS PARA ASYNCSTORAGE =====
const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  IS_LOGGED_IN: 'isLoggedIn'
};

// ===== CLASE AUTHSERVICE =====
class AuthService {
  
  /**
   * Iniciar sesión con email/usuario y contraseña
   * @param {string} usernameOrEmail - Email o nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<object>} Datos del usuario y tokens
   */
  async login(usernameOrEmail, password) {
    try {
      console.log('🔐 Iniciando sesión...');
      
      // Realizar petición de login al backend
      const response = await api.post(API_ENDPOINTS.auth.login, {
        username_or_email: usernameOrEmail,
        password: password
      });
      
      const { access, refresh, user_id, email, username } = response.data;
      
      // Guardar tokens en AsyncStorage
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.USER_TOKEN, access],
        [STORAGE_KEYS.REFRESH_TOKEN, refresh],
        [STORAGE_KEYS.IS_LOGGED_IN, 'true']
      ]);
      
      // Obtener datos completos del usuario
      const userData = await this.getUserProfile();
      
      console.log('✅ Sesión iniciada correctamente');
      
      return {
        success: true,
        user: userData,
        tokens: { access, refresh }
      };
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }
  
  /**
   * Registrar nuevo usuario
   * @param {object} userData - Datos del nuevo usuario
   * @returns {Promise<object>} Resultado del registro
   */
  async register(userData) {
    try {
      console.log('📝 Registrando nuevo usuario...');
      
      // Realizar petición de registro
      const response = await api.post(API_ENDPOINTS.auth.register, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password_confirm: userData.passwordConfirm,
        first_name: userData.firstName || '',
        last_name: userData.lastName || ''
      });
      
      // Si el registro incluye tokens (auto-login), guardarlos
      if (response.data.tokens) {
        const { access, refresh } = response.data.tokens;
        
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.USER_TOKEN, access],
          [STORAGE_KEYS.REFRESH_TOKEN, refresh],
          [STORAGE_KEYS.IS_LOGGED_IN, 'true']
        ]);
        
        // Guardar datos del usuario
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA, 
          JSON.stringify(response.data.user)
        );
      }
      
      console.log('✅ Usuario registrado correctamente');
      
      return {
        success: true,
        user: response.data.user,
        autoLogin: !!response.data.tokens
      };
      
    } catch (error) {
      console.error('❌ Error en registro:', error);
      
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }
  
  /**
   * Cerrar sesión y limpiar datos locales
   */
  async logout() {
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Limpiar todos los datos de AsyncStorage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.IS_LOGGED_IN
      ]);
      
      console.log('✅ Sesión cerrada correctamente');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Verificar si el usuario está autenticado
   * @returns {Promise<boolean>} true si está autenticado
   */
  async isAuthenticated() {
    try {
      const isLoggedIn = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      
      return isLoggedIn === 'true' && !!token;
      
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  }
  
  /**
   * Obtener datos del usuario actual
   * @returns {Promise<object|null>} Datos del usuario o null
   */
  async getCurrentUser() {
    try {
      const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (userDataString) {
        return JSON.parse(userDataString);
      }
      
      // Si no hay datos guardados, obtenerlos del servidor
      return await this.getUserProfile();
      
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }
  
  /**
   * Obtener perfil del usuario desde el servidor
   * @returns {Promise<object>} Datos del perfil
   */
  async getUserProfile() {
    try {
      const response = await api.get(API_ENDPOINTS.users.profile);
      
      // Guardar datos actualizados en AsyncStorage
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA, 
        JSON.stringify(response.data)
      );
      
      return response.data;
      
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  }
  
  /**
   * Obtener token de acceso actual
   * @returns {Promise<string|null>} Token o null
   */
  async getToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }
  
  /**
   * Verificar si el token es válido haciendo una petición de prueba
   * @returns {Promise<boolean>} true si el token es válido
   */
  async validateToken() {
    try {
      // Hacer petición al perfil para verificar token
      await this.getUserProfile();
      return true;
    } catch (error) {
      // Si falla, el token no es válido
      if (error.response?.status === 401) {
        await this.logout(); // Limpiar datos inválidos
      }
      return false;
    }
  }
  
  /**
   * Cambiar contraseña del usuario actual
   * @param {string} oldPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @param {string} confirmPassword - Confirmación de nueva contraseña
   * @returns {Promise<object>} Resultado del cambio
   */
  async changePassword(oldPassword, newPassword, confirmPassword) {
    try {
      console.log('🔑 Cambiando contraseña...');
      
      const response = await api.post(API_ENDPOINTS.users.changePassword, {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      console.log('✅ Contraseña cambiada correctamente');
      
      return {
        success: true,
        message: response.data.message
      };
      
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }
}

// ===== EXPORTAR INSTANCIA SINGLETON =====
// Crear una única instancia para usar en toda la app
const authService = new AuthService();
export default authService;

// ===== EXPORTAR FUNCIONES INDIVIDUALES =====
// Para uso más directo si se prefiere
export const {
  login,
  register,
  logout,
  isAuthenticated,
  getCurrentUser,
  getUserProfile,
  getToken,
  validateToken,
  changePassword
} = authService;