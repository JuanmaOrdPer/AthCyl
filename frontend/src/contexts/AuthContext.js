import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si hay un usuario almacenado en AsyncStorage
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@AthCyl:user');
        const storedCredentials = await AsyncStorage.getItem('@AthCyl:credentials');
        
        if (storedUser && storedCredentials) {
          api.defaults.headers.common['Authorization'] = `Basic ${storedCredentials}`;
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Configurar autenticación básica
      const credentials = btoa(`${username}:${password}`);
      api.defaults.headers.common['Authorization'] = `Basic ${credentials}`;
      
      // Intentar obtener el perfil del usuario para verificar las credenciales
      const response = await api.get('/api/users/profile/');
      
      const user = response.data;
      
      // Guardar usuario y credenciales en AsyncStorage
      await AsyncStorage.setItem('@AthCyl:user', JSON.stringify(user));
      await AsyncStorage.setItem('@AthCyl:credentials', credentials);
      
      setUser(user);
      return user;
    } catch (error) {
      // Limpiar cabeceras en caso de error
      delete api.defaults.headers.common['Authorization'];
      setError(error.response?.data?.detail || 'Error al iniciar sesión. Verifica tus credenciales.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/users/register/', userData);
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Error al registrarse');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // No es necesario llamar a una API para cerrar sesión con autenticación básica
      // ya que no hay sesión del lado del servidor
      
      // Eliminar usuario y credenciales de AsyncStorage
      await AsyncStorage.removeItem('@AthCyl:user');
      await AsyncStorage.removeItem('@AthCyl:credentials');
      
      // Eliminar credenciales de las cabeceras
      delete api.defaults.headers.common['Authorization'];
      
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.patch(`/api/users/${user.id}/`, userData);
      
      const updatedUser = response.data;
      
      // Actualizar usuario en AsyncStorage
      await AsyncStorage.setItem('@AthCyl:user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      setError(error.response?.data?.error || 'Error al actualizar perfil');
      throw error;
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
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
