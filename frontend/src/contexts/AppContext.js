// src/contexts/AppContext.js
import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import api from '../services/api';
import * as SecureStore from 'expo-secure-store';

// Acciones
const ACTIONS = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
  HIDE_NOTIFICATION: 'HIDE_NOTIFICATION',
  SET_THEME: 'SET_THEME',
};

// Estado inicial
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: {
    auth: true,
    data: false,
  },
  error: null,
  notification: {
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
  },
  theme: 'light',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          ...action.payload,
        },
      };
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case ACTIONS.SHOW_NOTIFICATION:
      return {
        ...state,
        notification: {
          visible: true,
          ...action.payload,
        },
      };
    case ACTIONS.HIDE_NOTIFICATION:
      return {
        ...state,
        notification: {
          ...state.notification,
          visible: false,
        },
      };
    case ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    default:
      return state;
  }
};

// Crear contexto
const AppContext = createContext();

/**
 * Proveedor para el contexto global de la aplicación
 * @param {Object} props - Propiedades del componente
 */
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Comprobar autenticación
  const checkAuth = useCallback(async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { auth: true } });
      
      // Verificar si hay un token almacenado
      const token = await SecureStore.getItemAsync('access_token');
      
      if (token) {
        try {
          // Obtener información del usuario
          const response = await api.get('/api/users/me/');
          dispatch({ type: ACTIONS.SET_USER, payload: response.data });
        } catch (error) {
          // Si falla, limpiar tokens
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('refresh_token');
          dispatch({ type: ACTIONS.SET_USER, payload: null });
        }
      } else {
        dispatch({ type: ACTIONS.SET_USER, payload: null });
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_USER, payload: null });
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: 'Error al verificar la sesión' 
      });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { auth: false } });
    }
  }, []);
  
  // Iniciar sesión
  const login = useCallback(async (username, password) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { auth: true } });
      dispatch({ type: ACTIONS.CLEAR_ERROR });
      
      // Obtener tokens
      await api.login(username, password);
      
      // Obtener información del usuario
      const response = await api.get('/api/users/me/');
      dispatch({ type: ACTIONS.SET_USER, payload: response.data });
      
      // Mostrar notificación de éxito
      dispatch({ 
        type: ACTIONS.SHOW_NOTIFICATION, 
        payload: { 
          message: '¡Sesión iniciada correctamente!', 
          type: 'success' 
        } 
      });
      
      return response.data;
    } catch (error) {
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: error.message || 'Error al iniciar sesión' 
      });
      
      // Mostrar notificación de error
      dispatch({ 
        type: ACTIONS.SHOW_NOTIFICATION, 
        payload: { 
          message: error.message || 'Error al iniciar sesión', 
          type: 'error' 
        } 
      });
      
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { auth: false } });
    }
  }, []);
  
  // Cerrar sesión
  const logout = useCallback(async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { auth: true } });
      
      // Eliminar tokens
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      
      // Actualizar estado
      dispatch({ type: ACTIONS.SET_USER, payload: null });
      
      // Mostrar notificación
      dispatch({ 
        type: ACTIONS.SHOW_NOTIFICATION, 
        payload: { 
          message: 'Sesión cerrada correctamente', 
          type: 'info' 
        } 
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { auth: false } });
    }
  }, []);
  
  // Mostrar notificación
  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    dispatch({
      type: ACTIONS.SHOW_NOTIFICATION,
      payload: { message, type, duration }
    });
    
    // Ocultar automáticamente después de la duración
    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: ACTIONS.HIDE_NOTIFICATION });
      }, duration);
    }
  }, []);
  
  // Ocultar notificación
  const hideNotification = useCallback(() => {
    dispatch({ type: ACTIONS.HIDE_NOTIFICATION });
  }, []);
  
  // Cambiar tema
  const setTheme = useCallback((theme) => {
    dispatch({ type: ACTIONS.SET_THEME, payload: theme });
  }, []);
  
  // Inicializar autenticación al montar el componente
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // Valores expuestos en el contexto
  const contextValue = useMemo(() => ({
    ...state,
    login,
    logout,
    checkAuth,
    showNotification,
    hideNotification,
    setTheme,
  }), [
    state, 
    login, 
    logout, 
    checkAuth, 
    showNotification, 
    hideNotification, 
    setTheme
  ]);
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Hook para usar el contexto de la aplicación
 * @returns {Object} - Estado y acciones del contexto
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};