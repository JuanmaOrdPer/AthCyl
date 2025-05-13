// Configuración global para Jest
import { NativeModules as RNNativeModules } from 'react-native';

// Mock para Expo Location
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
  startLocationUpdatesAsync: jest.fn(),
  stopLocationUpdatesAsync: jest.fn(),
}));

// Mock para AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock para fetch
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    headers: {
      get: jest.fn()
    }
  })
);

// Evitar advertencias de animaciones en los tests
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock para React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Configuración para evitar errores con NativeModules
RNNativeModules.UIManager = RNNativeModules.UIManager || {};
RNNativeModules.UIManager.RCTView = RNNativeModules.UIManager.RCTView || {};
RNNativeModules.RNGestureHandlerModule = RNNativeModules.RNGestureHandlerModule || {
  State: { BEGAN: 'BEGAN', FAILED: 'FAILED', ACTIVE: 'ACTIVE', END: 'END' },
  attachGestureHandler: jest.fn(),
  createGestureHandler: jest.fn(),
  dropGestureHandler: jest.fn(),
  updateGestureHandler: jest.fn(),
};

// Silenciar advertencias específicas
jest.spyOn(console, 'warn').mockImplementation((message) => {
  if (message.includes('componentWillReceiveProps') || 
      message.includes('componentWillMount') ||
      message.includes('componentWillUpdate')) {
    return;
  }
  console.warn(message);
});
