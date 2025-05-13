import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../../src/services/api';

// Mock de las funciones de API
jest.mock('../../src/services/api', () => ({
  login: jest.fn(),
  register: jest.fn(),
  getUserProfile: jest.fn(),
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
}));

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
  });

  it('proporciona un estado inicial correcto', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.register).toBe('function');
  });

  it('maneja el inicio de sesión correctamente', async () => {
    // Configurar el mock para devolver un usuario
    const mockUser = { 
      id: 1, 
      username: 'testuser', 
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User'
    };
    
    api.login.mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    // Ejecutar la función login
    await act(async () => {
      await result.current.login('testuser', 'password123');
    });

    // Verificar que se llamó a la API correctamente
    expect(api.login).toHaveBeenCalledWith('testuser', 'password123');
    
    // Verificar que se actualizó el estado
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    
    // Verificar que se guardó en AsyncStorage
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify(mockUser)
    );
  });

  it('maneja el cierre de sesión correctamente', async () => {
    // Configurar un estado inicial con un usuario autenticado
    const mockUser = { id: 1, username: 'testuser' };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUser));
    
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });
    
    // Esperar a que se cargue el usuario desde AsyncStorage
    await waitForNextUpdate();
    
    // Verificar que el usuario está autenticado
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    
    // Ejecutar la función logout
    await act(async () => {
      await result.current.logout();
    });
    
    // Verificar que se actualizó el estado
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    
    // Verificar que se eliminó de AsyncStorage
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    expect(api.clearAuthToken).toHaveBeenCalled();
  });

  it('carga el usuario almacenado al iniciar', async () => {
    // Configurar AsyncStorage para devolver un usuario
    const mockUser = { id: 1, username: 'testuser' };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUser));
    
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });
    
    // Inicialmente, isLoading debe ser true
    expect(result.current.isLoading).toBe(true);
    
    // Esperar a que se cargue el usuario
    await waitForNextUpdate();
    
    // Verificar que se cargó el usuario
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(api.setAuthToken).toHaveBeenCalled();
  });

  it('maneja errores de inicio de sesión', async () => {
    // Configurar el mock para lanzar un error
    const errorMessage = 'Credenciales inválidas';
    api.login.mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });
    
    // Ejecutar la función login y esperar que lance un error
    await expect(
      act(async () => {
        await result.current.login('testuser', 'wrongpassword');
      })
    ).rejects.toThrow(errorMessage);
    
    // Verificar que el estado no cambió
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
