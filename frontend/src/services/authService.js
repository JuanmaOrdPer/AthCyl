/**
 * Servicio de Autenticación Completo para AthCyl
 * 
 * Este servicio usa autenticación JWT de Django con refresh tokens
 * Incluye todas las funcionalidades necesarias para el manejo de usuarios
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, API_ENDPOINTS, getErrorMessage, checkConnectivity } from '../config/api';

// ===== KEYS PARA ASYNCSTORAGE =====
const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',           
  REFRESH_TOKEN: 'refreshToken',     
  USER_DATA: 'userData',
  IS_LOGGED_IN: 'isLoggedIn',
  LAST_LOGIN: 'lastLogin',
  REMEMBER_ME: 'rememberMe'
};

// ===== CÓDIGOS DE ERROR ESPECÍFICOS =====
const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  NETWORK_ERROR: 'network_error',
  SERVER_ERROR: 'server_error',
  TOKEN_EXPIRED: 'token_expired',
  USER_NOT_FOUND: 'user_not_found',
  EMAIL_ALREADY_EXISTS: 'email_already_exists',
  USERNAME_ALREADY_EXISTS: 'username_already_exists',
  WEAK_PASSWORD: 'weak_password',
  INVALID_EMAIL: 'invalid_email'
};

// ===== CLASE AUTHSERVICE COMPLETA =====
class AuthService {
  
  // ===== MÉTODOS DE AUTENTICACIÓN PRINCIPALES =====
  
  /**
   * Iniciar sesión con email/usuario y contraseña
   */
  async login(usernameOrEmail, password, rememberMe = false) {
    try {
      console.log('🔐 Iniciando sesión...', { usernameOrEmail, rememberMe });
      
      // Verificar conectividad primero
      const isConnected = await checkConnectivity();
      if (!isConnected) {
        return {
          success: false,
          error: 'No se puede conectar al servidor. Verifica tu conexión.',
          errorCode: AUTH_ERRORS.NETWORK_ERROR
        };
      }
      
      // Validar entrada
      if (!usernameOrEmail || !password) {
        return {
          success: false,
          error: 'Usuario y contraseña son requeridos',
          errorCode: AUTH_ERRORS.INVALID_CREDENTIALS
        };
      }
      
      // Crear datos de login
      const loginData = {
        username: usernameOrEmail.trim(),
        password: password
      };
      
      console.log('📤 Enviando datos de login:', { username: loginData.username });
      
      // Realizar petición de login al backend
      const response = await api.post(API_ENDPOINTS.auth.login, loginData);
      
      console.log('📥 Respuesta de login:', response.data);
      
      const { token, refresh, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Respuesta del servidor inválida: falta token o usuario');
      }
      
      // Preparar datos para guardar
      const storageData = [
        [STORAGE_KEYS.USER_TOKEN, token],
        [STORAGE_KEYS.REFRESH_TOKEN, refresh || ''],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
        [STORAGE_KEYS.IS_LOGGED_IN, 'true'],
        [STORAGE_KEYS.LAST_LOGIN, new Date().toISOString()],
        [STORAGE_KEYS.REMEMBER_ME, rememberMe.toString()]
      ];
      
      // Guardar datos
      await AsyncStorage.multiSet(storageData);
      
      console.log('✅ Login exitoso, datos guardados');
      
      return {
        success: true,
        user: user,
        token: token,
        refreshToken: refresh,
        message: 'Inicio de sesión exitoso'
      };
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      console.error('📥 Error response:', error.response?.data);
      
      return {
        success: false,
        error: getErrorMessage(error),
        errorCode: this._getErrorCode(error)
      };
    }
  }
  
  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      console.log('📝 Registrando nuevo usuario...', { 
        email: userData.email, 
        username: userData.username 
      });
      
      // Verificar conectividad
      const isConnected = await checkConnectivity();
      if (!isConnected) {
        return {
          success: false,
          error: 'No se puede conectar al servidor',
          errorCode: AUTH_ERRORS.NETWORK_ERROR
        };
      }
      
      // Validar datos de entrada
      const validationError = this._validateRegistrationData(userData);
      if (validationError) {
        return {
          success: false,
          error: validationError.message,
          errorCode: validationError.code
        };
      }
      
      // Crear datos de registro
      const registerData = {
        username: userData.username.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        password_confirm: userData.passwordConfirm,
        first_name: userData.firstName?.trim() || '',
        last_name: userData.lastName?.trim() || ''
      };
      
      console.log('📤 Enviando datos de registro:', { 
        ...registerData, 
        password: '***', 
        password_confirm: '***' 
      });
      
      // Realizar petición de registro
      const response = await api.post(API_ENDPOINTS.auth.register, registerData);
      
      console.log('📥 Respuesta de registro:', response.data);
      
      // Si el registro incluye auto-login
      if (response.data.token && response.data.user) {
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.USER_TOKEN, response.data.token],
          [STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh || ''],
          [STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user)],
          [STORAGE_KEYS.IS_LOGGED_IN, 'true'],
          [STORAGE_KEYS.LAST_LOGIN, new Date().toISOString()]
        ]);
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refresh,
          autoLogin: true,
          message: 'Registro exitoso. Sesión iniciada automáticamente.'
        };
      }
      
      return {
        success: true,
        user: response.data.user,
        autoLogin: false,
        message: 'Registro exitoso. Por favor inicia sesión.'
      };
      
    } catch (error) {
      console.error('❌ Error en registro:', error);
      console.error('📥 Error response:', error.response?.data);
      
      return {
        success: false,
        error: getErrorMessage(error),
        errorCode: this._getErrorCode(error)
      };
    }
  }
  
  /**
   * Cerrar sesión
   */
  async logout(clearAllData = true) {
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Intentar notificar al servidor con refresh token
      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (refreshToken) {
          await api.post(API_ENDPOINTS.auth.logout, {
            refresh: refreshToken
          });
        }
        console.log('✅ Logout notificado al servidor');
      } catch (error) {
        console.warn('⚠️ Error notificando logout al servidor:', error.message);
      }
      
      // Limpiar datos locales
      const keysToRemove = clearAllData 
        ? Object.values(STORAGE_KEYS)
        : [STORAGE_KEYS.USER_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.IS_LOGGED_IN];
      
      await AsyncStorage.multiRemove(keysToRemove);
      
      console.log('✅ Sesión cerrada correctamente');
      
      return { 
        success: true,
        message: 'Sesión cerrada correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      return { 
        success: false, 
        error: error.message,
        errorCode: AUTH_ERRORS.SERVER_ERROR
      };
    }
  }
  
  // ===== MÉTODOS DE VERIFICACIÓN Y ESTADO =====
  
  /**
   * Verificar si el usuario está autenticado
   */
  async isAuthenticated() {
    try {
      const [isLoggedIn, token] = await AsyncStorage.multiGet([
        STORAGE_KEYS.IS_LOGGED_IN,
        STORAGE_KEYS.USER_TOKEN
      ]);
      
      const authenticated = isLoggedIn[1] === 'true' && !!token[1];
      console.log('🔍 Usuario autenticado:', authenticated);
      
      return authenticated;
      
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  }
  
  /**
   * Verificar si el token es válido haciendo una petición al servidor
   */
  async validateToken() {
    try {
      console.log('🔍 Validando token...');
      
      // Hacer petición al perfil para verificar token
      const response = await api.get(API_ENDPOINTS.users.profile);
      
      if (response.status === 200) {
        console.log('✅ Token válido');
        
        // Actualizar datos de usuario si han cambiado
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA, 
          JSON.stringify(response.data)
        );
        
        return { valid: true, user: response.data };
      }
      
      return { valid: false };
      
    } catch (error) {
      // LOGGING SILENCIOSO - no mostrar al usuario
      console.log('🔄 Token necesita renovación (401 normal)');
      
      // Si falla con 401, el token no es válido
      if (error.response?.status === 401) {
        console.log('🔄 Intentando auto-renovación...');
        return { valid: false, expired: true };
      }
      
      // Para otros errores, también silencioso
      console.log('⚠️ Error validando token:', error.message);
      return { valid: false, networkError: true };
    }
  }
  
  /**
   * Verificar estado completo de autenticación
   */
  async getAuthStatus() {
    try {
      const isAuth = await this.isAuthenticated();
      
      if (!isAuth) {
        return {
          isAuthenticated: false,
          user: null,
          token: null
        };
      }
      
      // Validar token si está autenticado
      const tokenValidation = await this.validateToken();
      
      if (!tokenValidation.valid) {
        return {
          isAuthenticated: false,
          user: null,
          token: null,
          tokenExpired: tokenValidation.expired
        };
      }
      
      const token = await this.getToken();
      
      return {
        isAuthenticated: true,
        user: tokenValidation.user,
        token: token,
        tokenValid: true
      };
      
    } catch (error) {
      console.error('Error obteniendo estado de auth:', error);
      return {
        isAuthenticated: false,
        user: null,
        token: null,
        error: error.message
      };
    }
  }
  
  // ===== MÉTODOS DE GESTIÓN DE USUARIO =====
  
  /**
   * Refrescar token automáticamente
   */
  async refreshToken() {
    try {
      console.log('🔄 Refrescando token...');
      
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }
      
      // Hacer petición de refresh
      const response = await api.post(API_ENDPOINTS.auth.refresh, {
        refresh: refreshToken
      });
      
      const { access } = response.data;
      
      if (access) {
        // Guardar nuevo access token
        await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, access);
        console.log('✅ Token refrescado correctamente');
        
        return { 
          success: true, 
          token: access 
        };
      } else {
        throw new Error('No se recibió access token');
      }
      
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      
      // Si falla el refresh, cerrar sesión
      await this.logout();
      
      return {
        success: false,
        error: 'Token expirado. Por favor, inicia sesión nuevamente.',
        errorCode: AUTH_ERRORS.TOKEN_EXPIRED
      };
    }
  }
  
  /**
   * Obtener datos del usuario actual
   */
  async getCurrentUser() {
    try {
      const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log('👤 Usuario actual obtenido:', userData.email || userData.username);
        return userData;
      }
      
      console.log('👤 No hay datos de usuario guardados');
      return null;
      
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }
  
  /**
   * Obtener perfil del usuario desde el servidor
   */
  async getUserProfile() {
    try {
      console.log('👤 Obteniendo perfil desde servidor...');
      
      const response = await api.get(API_ENDPOINTS.users.profile);
      
      // Actualizar datos guardados
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA, 
        JSON.stringify(response.data)
      );
      
      console.log('✅ Perfil actualizado');
      return {
        success: true,
        user: response.data
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      return {
        success: false,
        error: getErrorMessage(error),
        errorCode: this._getErrorCode(error)
      };
    }
  }
  
  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(userData) {
    try {
      console.log('📝 Actualizando perfil...');
      
      const response = await api.post(API_ENDPOINTS.users.updateProfile, userData);
      
      // Actualizar datos locales con la respuesta del servidor
      const updatedUser = response.data.user || response.data;
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA, 
        JSON.stringify(updatedUser)
      );
      
      console.log('✅ Perfil actualizado correctamente');
      return {
        success: true,
        user: updatedUser,
        message: response.data.message || 'Perfil actualizado correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      return {
        success: false,
        error: getErrorMessage(error),
        errorCode: this._getErrorCode(error)
      };
    }
  }
  
  /**
   * Cambiar contraseña del usuario
   */
  async changePassword(oldPassword, newPassword, confirmPassword) {
    try {
      console.log('🔐 Cambiando contraseña...');
      
      const response = await api.post(API_ENDPOINTS.users.changePassword, {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      console.log('✅ Contraseña cambiada correctamente');
      return {
        success: true,
        message: response.data.message || 'Contraseña cambiada correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      return {
        success: false,
        error: getErrorMessage(error),
        errorCode: this._getErrorCode(error)
      };
    }
  }
  
  /**
   * Eliminar cuenta del usuario
   */
  async deleteAccount(password) {
    try {
      console.log('🗑️ Eliminando cuenta...');
      
      const response = await api.delete(API_ENDPOINTS.users.deleteAccount, {
        data: { password }
      });
      
      // Limpiar datos locales después de eliminar cuenta
      await this.logout(true);
      
      console.log('✅ Cuenta eliminada correctamente');
      return {
        success: true,
        message: response.data.message || 'Cuenta eliminada correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error eliminando cuenta:', error);
      return {
        success: false,
        error: getErrorMessage(error),
        errorCode: this._getErrorCode(error)
      };
    }
  }
  
  // ===== MÉTODOS DE UTILIDAD =====
  
  /**
   * Obtener token de acceso actual
   */
  async getToken() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      return token;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }
  
  /**
   * Obtener token de refresh actual
   */
  async getRefreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      return refreshToken;
    } catch (error) {
      console.error('Error obteniendo refresh token:', error);
      return null;
    }
  }
  
  /**
   * Limpiar todos los datos de autenticación
   */
  async clearAuthData() {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      console.log('🧹 Datos de autenticación limpiados');
      return { success: true };
    } catch (error) {
      console.error('Error limpiando datos:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Obtener información de la última sesión
   */
  async getLastLoginInfo() {
    try {
      const [lastLogin, rememberMe] = await AsyncStorage.multiGet([
        STORAGE_KEYS.LAST_LOGIN,
        STORAGE_KEYS.REMEMBER_ME
      ]);
      
      return {
        lastLogin: lastLogin[1] ? new Date(lastLogin[1]) : null,
        rememberMe: rememberMe[1] === 'true'
      };
    } catch (error) {
      console.error('Error obteniendo info de última sesión:', error);
      return { lastLogin: null, rememberMe: false };
    }
  }
  
  /**
   * Verificar si se debe recordar la sesión
   */
  async shouldRememberSession() {
    try {
      const rememberMe = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
      return rememberMe === 'true';
    } catch (error) {
      return false;
    }
  }
  
  // ===== MÉTODOS PRIVADOS DE VALIDACIÓN =====
  
  /**
   * Validar datos de registro
   */
  _validateRegistrationData(userData) {
    // Validar email
    if (!userData.email || !this._isValidEmail(userData.email)) {
      return {
        message: 'Email inválido',
        code: AUTH_ERRORS.INVALID_EMAIL
      };
    }
    
    // Validar username
    if (!userData.username || userData.username.length < 3) {
      return {
        message: 'El nombre de usuario debe tener al menos 3 caracteres',
        code: AUTH_ERRORS.USERNAME_ALREADY_EXISTS
      };
    }
    
    // Validar contraseña
    if (!userData.password || userData.password.length < 8) {
      return {
        message: 'La contraseña debe tener al menos 8 caracteres',
        code: AUTH_ERRORS.WEAK_PASSWORD
      };
    }
    
    // Validar confirmación de contraseña
    if (userData.password !== userData.passwordConfirm) {
      return {
        message: 'Las contraseñas no coinciden',
        code: AUTH_ERRORS.WEAK_PASSWORD
      };
    }
    
    return null;
  }
  
  /**
   * Validar formato de email
   */
  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Obtener código de error específico desde la respuesta
   */
  _getErrorCode(error) {
    if (!error.response) {
      return AUTH_ERRORS.NETWORK_ERROR;
    }
    
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        if (data?.email || data?.details?.email) return AUTH_ERRORS.EMAIL_ALREADY_EXISTS;
        if (data?.username || data?.details?.username) return AUTH_ERRORS.USERNAME_ALREADY_EXISTS;
        return AUTH_ERRORS.INVALID_CREDENTIALS;
      case 401:
        return AUTH_ERRORS.TOKEN_EXPIRED;
      case 404:
        return AUTH_ERRORS.USER_NOT_FOUND;
      case 500:
        return AUTH_ERRORS.SERVER_ERROR;
      default:
        return AUTH_ERRORS.SERVER_ERROR;
    }
  }
}

// ===== EXPORTAR INSTANCIA SINGLETON =====
const authService = new AuthService();
export default authService;
export { AUTH_ERRORS };