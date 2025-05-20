// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

/**
 * Contexto para la gestión de autenticación
 * Maneja el estado del usuario, login, logout y verificación de sesión
 */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Verifica si hay una sesión activa al iniciar la app
   */
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si hay un token almacenado
      const token = await SecureStore.getItemAsync('access_token');
      
      if (token) {
        try {
          // Obtener información del usuario
          const response = await api.getUserProfile();
          setUser(response.data);
        } catch (error) {
          // Si falla, limpiar tokens
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('refresh_token');
          setUser(null);
          console.log('Sesión expirada o inválida');
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar sesión al montar el componente
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Inicia sesión con credenciales
   * @param {string} email - Email o nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} - Datos del usuario
   */
  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Llamar al método de login del servicio API
      const result = await api.login(email, password);
      setUser(result.user);
      
      return result.user;
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra la sesión del usuario actual
   */
  const handleLogout = async () => {
    try {
      setLoading(true);
      
      // Llamar al método de logout del servicio API
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza el perfil del usuario
   * @param {Object} userData - Nuevos datos del usuario
   */
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      
      // Asegurar que tenemos el ID del usuario actual
      const updateData = {
        ...userData,
        id: user.id
      };
      
      const response = await api.updateProfile(updateData);
      setUser(response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del nuevo usuario
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.register(userData);
      
      // Opcionalmente iniciar sesión automáticamente
      if (response.data.token) {
        await SecureStore.setItemAsync('access_token', response.data.token);
        setUser(response.data.usuario);
      }
      
      return response.data;
    } catch (error) {
      setError(error.message || 'Error al registrar usuario');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Valor del contexto
  const contextValue = {
    user,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    updateProfile,
    register,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para facilitar el uso del contexto
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};