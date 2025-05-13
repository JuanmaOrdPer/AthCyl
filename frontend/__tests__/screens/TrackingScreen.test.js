import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import TrackingScreen from '../../src/screens/training/TrackingScreen';
import * as LocationService from '../../src/services/LocationService';
import { NotificationContext } from '../../src/contexts/NotificationContext';
import { AuthContext } from '../../src/contexts/AuthContext';

// Mock de los servicios de ubicación
jest.mock('../../src/services/LocationService', () => ({
  requestLocationPermission: jest.fn(),
  getCurrentLocation: jest.fn(),
  startLocationTracking: jest.fn(),
  stopLocationTracking: jest.fn(),
  calculateDistance: jest.fn(),
  calculateSpeed: jest.fn(),
}));

// Mock de expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => 
    Promise.resolve({
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
    })
  ),
  watchPositionAsync: jest.fn(() => ({
    remove: jest.fn()
  })),
}));

// Mock de react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Marker: View,
    Polyline: View,
  };
});

// Mock de navegación
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      activityType: 'running'
    },
  }),
}));

describe('TrackingScreen', () => {
  // Configuración de los mocks para los contextos
  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();
  const mockUser = { id: 1, username: 'testuser' };
  
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Configurar los mocks de LocationService
    LocationService.requestLocationPermission.mockResolvedValue(true);
    LocationService.getCurrentLocation.mockResolvedValue({
      coords: {
        latitude: 40.416775,
        longitude: -3.703790,
      },
      timestamp: 1589072835000
    });
    LocationService.startLocationTracking.mockResolvedValue({
      remove: jest.fn()
    });
    LocationService.calculateDistance.mockReturnValue(100); // 100 metros
    LocationService.calculateSpeed.mockReturnValue(10); // 10 km/h
    
    // Configurar el wrapper con los contextos necesarios
    wrapper = ({ children }) => (
      <AuthContext.Provider value={{ user: mockUser }}>
        <NotificationContext.Provider 
          value={{ 
            showSuccess: mockShowSuccess, 
            showError: mockShowError 
          }}
        >
          {children}
        </NotificationContext.Provider>
      </AuthContext.Provider>
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('solicita permisos de ubicación al montar el componente', async () => {
    await act(async () => {
      render(<TrackingScreen />, { wrapper });
    });
    
    expect(LocationService.requestLocationPermission).toHaveBeenCalled();
  });

  it('muestra un error si no se conceden los permisos de ubicación', async () => {
    // Configurar el mock para denegar los permisos
    LocationService.requestLocationPermission.mockResolvedValueOnce(false);
    
    await act(async () => {
      render(<TrackingScreen />, { wrapper });
    });
    
    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining('permisos de ubicación')
    );
  });

  it('inicia el seguimiento cuando se presiona el botón de inicio', async () => {
    const { getByText } = render(<TrackingScreen />, { wrapper });
    
    // Presionar el botón de inicio
    await act(async () => {
      fireEvent.press(getByText('Iniciar'));
    });
    
    // Verificar que se inició el seguimiento
    expect(LocationService.startLocationTracking).toHaveBeenCalled();
  });

  it('detiene el seguimiento cuando se presiona el botón de detener', async () => {
    const { getByText } = render(<TrackingScreen />, { wrapper });
    
    // Primero iniciamos el seguimiento
    await act(async () => {
      fireEvent.press(getByText('Iniciar'));
    });
    
    // Luego lo detenemos
    await act(async () => {
      fireEvent.press(getByText('Detener'));
    });
    
    // Verificar que se detuvo el seguimiento
    expect(LocationService.stopLocationTracking).toHaveBeenCalled();
  });

  it('actualiza las estadísticas durante el seguimiento', async () => {
    const { getByText, getByTestId } = render(<TrackingScreen />, { wrapper });
    
    // Iniciar el seguimiento
    await act(async () => {
      fireEvent.press(getByText('Iniciar'));
    });
    
    // Simular una actualización de ubicación
    const mockCallback = LocationService.startLocationTracking.mock.calls[0][0];
    
    await act(async () => {
      mockCallback({
        coords: {
          latitude: 40.417775, // Ligeramente diferente
          longitude: -3.704790, // Ligeramente diferente
          speed: 2.7 // ~10 km/h
        },
        timestamp: 1589072840000 // 5 segundos después
      });
    });
    
    // Avanzar el tiempo para que se actualicen las estadísticas
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    // Verificar que se actualizaron las estadísticas
    expect(getByTestId('distance-value').props.children).toContain('0.1'); // 100 metros = 0.1 km
    expect(getByTestId('speed-value').props.children).toContain('10.0'); // 10 km/h
  });

  it('guarda el entrenamiento cuando se presiona el botón de guardar', async () => {
    global.fetch = jest.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1 }),
        status: 201
      })
    );
    
    const { getByText } = render(<TrackingScreen />, { wrapper });
    
    // Iniciar el seguimiento
    await act(async () => {
      fireEvent.press(getByText('Iniciar'));
    });
    
    // Simular una actualización de ubicación
    const mockCallback = LocationService.startLocationTracking.mock.calls[0][0];
    
    await act(async () => {
      mockCallback({
        coords: {
          latitude: 40.417775,
          longitude: -3.704790,
          speed: 2.7
        },
        timestamp: 1589072840000
      });
    });
    
    // Detener el seguimiento
    await act(async () => {
      fireEvent.press(getByText('Detener'));
    });
    
    // Guardar el entrenamiento
    await act(async () => {
      fireEvent.press(getByText('Guardar'));
    });
    
    // Verificar que se llamó a fetch para guardar el entrenamiento
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/trainings/trainings/'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
        body: expect.any(String)
      })
    );
    
    // Verificar que se mostró un mensaje de éxito
    expect(mockShowSuccess).toHaveBeenCalledWith(
      expect.stringContaining('guardado correctamente')
    );
  });

  it('muestra un error si falla al guardar el entrenamiento', async () => {
    global.fetch = jest.fn(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ detail: 'Error al guardar' }),
        status: 400
      })
    );
    
    const { getByText } = render(<TrackingScreen />, { wrapper });
    
    // Iniciar el seguimiento
    await act(async () => {
      fireEvent.press(getByText('Iniciar'));
    });
    
    // Detener el seguimiento
    await act(async () => {
      fireEvent.press(getByText('Detener'));
    });
    
    // Guardar el entrenamiento
    await act(async () => {
      fireEvent.press(getByText('Guardar'));
    });
    
    // Verificar que se mostró un mensaje de error
    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining('Error al guardar')
    );
  });
});
