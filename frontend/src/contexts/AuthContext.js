import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import * as authService from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si hay un token almacenado
    const checkAuth = async () => {
      console.log('🔍 Iniciando verificación de autenticación...');
      try {
        // 1. Verificar si hay un token de acceso
        const token = await SecureStore.getItemAsync('access_token');
        console.log('🔑 Token de acceso encontrado:', token ? 'Sí' : 'No');
        
        if (token) {
          console.log('🔐 Token encontrado, verificando validez...');
          // 2. Si hay token, verificar si es válido obteniendo el perfil del usuario
          try {
            console.log('👤 Intentando obtener perfil del usuario...');
            const response = await api.get('/api/users/me/');
            console.log('✅ Perfil obtenido con éxito:', response.data);
            setUser(response.data);
          } catch (profileError) {
            console.error('❌ Error al obtener perfil:', profileError);
            console.log('🔄 Intentando renovar el token...');
            // 3. Si falla, intentar renovar el token con el refresh token
            try {
              const refreshToken = await SecureStore.getItemAsync('refresh_token');
              if (refreshToken) {
                console.log('🔄 Token de refresco encontrado, intentando renovar...');
                const { access, refresh } = await authService.refreshToken(refreshToken);
                await SecureStore.setItemAsync('access_token', access);
                if (refresh) {
                  await SecureStore.setItemAsync('refresh_token', refresh);
                }
                // Intentar obtener el perfil nuevamente
                const response = await api.get('/api/users/me/');
                console.log('🔄✅ Token renovado y perfil obtenido con éxito');
                setUser(response.data);
              } else {
                console.log('❌ No hay token de refresco disponible');
                throw new Error('No hay token de refresco disponible');
              }
            } catch (refreshError) {
              console.error('❌ Error al renovar el token:', refreshError);
              throw refreshError;
            }
          }
        } else {
          console.log('🔓 No hay token de acceso, redirigiendo a login');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Error en la verificación de autenticación:', error);
        // Si hay error (token inválido), limpiar todo
        console.log('🧹 Limpiando tokens...');
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        setUser(null);
      } finally {
        console.log('🏁 Finalizando verificación de autenticación');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 Iniciando proceso de autenticación...');
      
      // 1. Primero, obtener los tokens
      console.log('🔑 Solicitando tokens...');
      let tokens;
      try {
        tokens = await authService.login(username, password);
        console.log('✅ Tokens recibidos');
      } catch (loginError) {
        console.error('❌ Error al obtener tokens:', loginError);
        throw new Error(loginError.message || 'Error al conectar con el servidor');
      }
      
      const { access, refresh } = tokens;
      
      // 2. Obtener información del usuario
      console.log('👤 Obteniendo información del usuario...');
      try {
        const response = await api.get('/api/users/me/');
        const user = response.data;
        console.log('✅ Información de usuario obtenida:', user);
        
        // 3. Actualizar el estado
        console.log('🔄 Actualizando estado de autenticación...');
        setUser(user);
        return user;
      } catch (userError) {
        console.error('❌ Error al obtener información del usuario:', userError);
        // Si falla obtener el perfil pero tenemos tokens, limpiar todo
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        throw new Error('Error al cargar la información del usuario');
      }
    } catch (error) {
      // Limpiar credenciales en caso de error
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      const errorMessage = error.response?.data?.detail || 'Error al iniciar sesión. Verifica tus credenciales.';
      setError(errorMessage);
      throw new Error(errorMessage);
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
      
      // Eliminar tokens de SecureStore
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      
      // Limpiar el estado del usuario
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
      
      // Asegurarse de que solo se envíen los campos permitidos
      const dataToSend = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        height: parseFloat(userData.height) || null,
        weight: parseFloat(userData.weight) || null,
        birth_date: userData.birth_date || null,
      };
      
      console.log('Enviando datos al servidor:', dataToSend); // Para depuración
      
      const response = await api.patch(`/api/users/${user.id}/`, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const updatedUser = response.data;
      
      console.log('Respuesta del servidor:', updatedUser); // Para depuración
      
      // Actualizar usuario en AsyncStorage
      await AsyncStorage.setItem('@AthCyl:user', JSON.stringify(updatedUser));
      
      // Actualizar el estado del usuario
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error en updateProfile:', error.response || error); // Más detalles del error
      setError(error.response?.data?.error || 'Error al actualizar el perfil');
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
        login: handleLogin, // Usar handleLogin en lugar de login
        logout,
        register,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
