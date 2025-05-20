// src/contexts/AuthContext.js (Simplificado)
import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar sesión al iniciar
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        if (token) {
          try {
            const response = await api.get('/api/users/me/');
            setUser(response.data);
          } catch (error) {
            // Si falla, limpiar tokens
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');
            setUser(null);
          }
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener tokens y realizar login
      await api.login(username, password);
      
      // Obtener perfil de usuario
      const response = await api.get('/api/users/me/');
      setUser(response.data);
      return response.data;
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login: handleLogin,
        logout,
        // Otras funciones...
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};