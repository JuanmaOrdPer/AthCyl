import * as api from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock de fetch global
global.fetch = jest.fn();

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

describe('API Service', () => {
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Configurar el mock de fetch para devolver una respuesta exitosa por defecto
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
      status: 200,
      headers: {
        get: jest.fn()
      }
    });
  });

  describe('login', () => {
    it('realiza la solicitud correcta y devuelve los datos del usuario', async () => {
      // Configurar la respuesta del servidor
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ user: mockUser }),
        status: 200,
        headers: {
          get: jest.fn()
        }
      });

      // Llamar a la función login
      const result = await api.login('testuser', 'password123');

      // Verificar que se llamó a fetch con los parámetros correctos
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/login/'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: JSON.stringify({
            username: 'testuser',
            password: 'password123'
          })
        })
      );

      // Verificar que se devolvieron los datos correctos
      expect(result).toEqual({ user: mockUser });
    });

    it('maneja errores de autenticación', async () => {
      // Configurar la respuesta del servidor con un error
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({ 
          detail: 'Credenciales inválidas' 
        }),
        status: 401,
        headers: {
          get: jest.fn()
        }
      });

      // Llamar a la función login y esperar que lance un error
      await expect(api.login('testuser', 'wrongpassword')).rejects.toThrow('Credenciales inválidas');
    });
  });

  describe('register', () => {
    it('realiza la solicitud correcta y devuelve los datos del usuario', async () => {
      // Datos de registro
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
        height: 175,
        weight: 70
      };

      // Configurar la respuesta del servidor
      const mockUser = { id: 2, ...userData, password: undefined };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ user: mockUser }),
        status: 201,
        headers: {
          get: jest.fn()
        }
      });

      // Llamar a la función register
      const result = await api.register(userData);

      // Verificar que se llamó a fetch con los parámetros correctos
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/register/'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: JSON.stringify(userData)
        })
      );

      // Verificar que se devolvieron los datos correctos
      expect(result).toEqual({ user: mockUser });
    });
  });

  describe('getUserProfile', () => {
    it('obtiene el perfil del usuario correctamente', async () => {
      // Configurar la respuesta del servidor
      const mockProfile = { 
        id: 1, 
        username: 'testuser', 
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        height: 175,
        weight: 70
      };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockProfile),
        status: 200,
        headers: {
          get: jest.fn()
        }
      });

      // Llamar a la función getUserProfile
      const result = await api.getUserProfile();

      // Verificar que se llamó a fetch con los parámetros correctos
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/me/'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object)
        })
      );

      // Verificar que se devolvieron los datos correctos
      expect(result).toEqual(mockProfile);
    });
  });

  describe('setAuthToken y clearAuthToken', () => {
    it('configura el token de autenticación correctamente', () => {
      // Llamar a la función setAuthToken
      api.setAuthToken('testuser', 'password123');
      
      // Verificar que se configuró el token básico correctamente
      const base64Credentials = Buffer.from('testuser:password123').toString('base64');
      expect(api.getAuthHeader()).toEqual({
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/json'
      });
    });

    it('limpia el token de autenticación correctamente', () => {
      // Primero configuramos un token
      api.setAuthToken('testuser', 'password123');
      
      // Luego lo limpiamos
      api.clearAuthToken();
      
      // Verificar que se eliminó el token
      expect(api.getAuthHeader()).toEqual({
        'Content-Type': 'application/json'
      });
    });
  });
});
