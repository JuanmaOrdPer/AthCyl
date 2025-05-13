import * as Location from 'expo-location';
import { 
  requestLocationPermission, 
  startLocationTracking, 
  stopLocationTracking,
  getCurrentLocation
} from '../../src/services/LocationService';

// Mock de expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  stopLocationUpdatesAsync: jest.fn(),
  hasStartedLocationUpdatesAsync: jest.fn(),
  Accuracy: {
    Balanced: 3,
    High: 4,
    Highest: 5,
    Low: 2,
    Lowest: 1
  }
}));

describe('LocationService', () => {
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
  });

  describe('requestLocationPermission', () => {
    it('devuelve true cuando se otorgan los permisos', async () => {
      // Configurar el mock para devolver permisos concedidos
      Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted'
      });

      // Llamar a la función
      const result = await requestLocationPermission();

      // Verificar que se llamó a la función de permisos
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      
      // Verificar que el resultado es true
      expect(result).toBe(true);
    });

    it('devuelve false cuando se deniegan los permisos', async () => {
      // Configurar el mock para devolver permisos denegados
      Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied'
      });

      // Llamar a la función
      const result = await requestLocationPermission();

      // Verificar que se llamó a la función de permisos
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      
      // Verificar que el resultado es false
      expect(result).toBe(false);
    });

    it('maneja errores al solicitar permisos', async () => {
      // Configurar el mock para lanzar un error
      const error = new Error('Error al solicitar permisos');
      Location.requestForegroundPermissionsAsync.mockRejectedValueOnce(error);

      // Llamar a la función y esperar que lance un error
      await expect(requestLocationPermission()).rejects.toThrow('Error al solicitar permisos');
    });
  });

  describe('getCurrentLocation', () => {
    it('obtiene la ubicación actual correctamente', async () => {
      // Ubicación de prueba
      const mockLocation = {
        coords: {
          latitude: 40.416775,
          longitude: -3.703790,
          altitude: 650,
          accuracy: 5,
          altitudeAccuracy: 5,
          heading: 0,
          speed: 0
        },
        timestamp: 1589072835000
      };

      // Configurar el mock para devolver la ubicación
      Location.getCurrentPositionAsync.mockResolvedValueOnce(mockLocation);

      // Llamar a la función
      const result = await getCurrentLocation();

      // Verificar que se llamó a la función con la precisión correcta
      expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.High
      });
      
      // Verificar que el resultado es la ubicación esperada
      expect(result).toEqual(mockLocation);
    });

    it('maneja errores al obtener la ubicación', async () => {
      // Configurar el mock para lanzar un error
      const error = new Error('Error al obtener la ubicación');
      Location.getCurrentPositionAsync.mockRejectedValueOnce(error);

      // Llamar a la función y esperar que lance un error
      await expect(getCurrentLocation()).rejects.toThrow('Error al obtener la ubicación');
    });
  });

  describe('startLocationTracking', () => {
    it('inicia el seguimiento de ubicación correctamente', async () => {
      // Mock de la función de callback
      const mockCallback = jest.fn();
      
      // Mock del objeto de seguimiento
      const mockWatcher = {
        remove: jest.fn()
      };
      
      // Configurar el mock para devolver el watcher
      Location.watchPositionAsync.mockResolvedValueOnce(mockWatcher);

      // Llamar a la función
      const result = await startLocationTracking(mockCallback);

      // Verificar que se llamó a watchPositionAsync con los parámetros correctos
      expect(Location.watchPositionAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          accuracy: Location.Accuracy.High,
          distanceInterval: expect.any(Number),
          timeInterval: expect.any(Number)
        }),
        mockCallback
      );
      
      // Verificar que el resultado es el watcher
      expect(result).toBe(mockWatcher);
    });

    it('maneja errores al iniciar el seguimiento', async () => {
      // Configurar el mock para lanzar un error
      const error = new Error('Error al iniciar el seguimiento');
      Location.watchPositionAsync.mockRejectedValueOnce(error);

      // Mock de la función de callback
      const mockCallback = jest.fn();

      // Llamar a la función y esperar que lance un error
      await expect(startLocationTracking(mockCallback)).rejects.toThrow('Error al iniciar el seguimiento');
    });
  });

  describe('stopLocationTracking', () => {
    it('detiene el seguimiento correctamente', async () => {
      // Mock del objeto de seguimiento
      const mockWatcher = {
        remove: jest.fn()
      };

      // Llamar a la función
      await stopLocationTracking(mockWatcher);

      // Verificar que se llamó a remove
      expect(mockWatcher.remove).toHaveBeenCalled();
    });

    it('no hace nada si no hay un watcher', async () => {
      // Llamar a la función sin watcher
      await stopLocationTracking(null);
      
      // No debería haber errores
    });
  });
});
