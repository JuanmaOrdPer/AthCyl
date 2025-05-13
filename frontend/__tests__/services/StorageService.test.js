import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  storeData, 
  getData, 
  removeData, 
  clearStorage,
  storeSecureData,
  getSecureData,
  removeSecureData
} from '../../src/services/StorageService';

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock de expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

describe('StorageService', () => {
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
  });

  describe('storeData', () => {
    it('almacena datos correctamente en AsyncStorage', async () => {
      // Datos de prueba
      const key = 'testKey';
      const value = { id: 1, name: 'Test' };
      
      // Llamar a la función
      await storeData(key, value);
      
      // Verificar que se llamó a setItem con los parámetros correctos
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        key,
        JSON.stringify(value)
      );
    });

    it('maneja errores al almacenar datos', async () => {
      // Configurar el mock para lanzar un error
      const error = new Error('Error al almacenar datos');
      AsyncStorage.setItem.mockRejectedValueOnce(error);
      
      // Datos de prueba
      const key = 'testKey';
      const value = { id: 1, name: 'Test' };
      
      // Llamar a la función y esperar que lance un error
      await expect(storeData(key, value)).rejects.toThrow('Error al almacenar datos');
    });
  });

  describe('getData', () => {
    it('recupera datos correctamente de AsyncStorage', async () => {
      // Datos de prueba
      const key = 'testKey';
      const value = { id: 1, name: 'Test' };
      
      // Configurar el mock para devolver datos
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(value));
      
      // Llamar a la función
      const result = await getData(key);
      
      // Verificar que se llamó a getItem con la clave correcta
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
      
      // Verificar que el resultado es el valor esperado
      expect(result).toEqual(value);
    });

    it('devuelve null si no hay datos almacenados', async () => {
      // Configurar el mock para devolver null
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      
      // Llamar a la función
      const result = await getData('nonExistentKey');
      
      // Verificar que el resultado es null
      expect(result).toBeNull();
    });

    it('maneja errores al recuperar datos', async () => {
      // Configurar el mock para lanzar un error
      const error = new Error('Error al recuperar datos');
      AsyncStorage.getItem.mockRejectedValueOnce(error);
      
      // Llamar a la función y esperar que lance un error
      await expect(getData('testKey')).rejects.toThrow('Error al recuperar datos');
    });
  });

  describe('removeData', () => {
    it('elimina datos correctamente de AsyncStorage', async () => {
      // Clave de prueba
      const key = 'testKey';
      
      // Llamar a la función
      await removeData(key);
      
      // Verificar que se llamó a removeItem con la clave correcta
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
    });

    it('maneja errores al eliminar datos', async () => {
      // Configurar el mock para lanzar un error
      const error = new Error('Error al eliminar datos');
      AsyncStorage.removeItem.mockRejectedValueOnce(error);
      
      // Llamar a la función y esperar que lance un error
      await expect(removeData('testKey')).rejects.toThrow('Error al eliminar datos');
    });
  });

  describe('clearStorage', () => {
    it('limpia todo el almacenamiento correctamente', async () => {
      // Llamar a la función
      await clearStorage();
      
      // Verificar que se llamó a clear
      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('maneja errores al limpiar el almacenamiento', async () => {
      // Configurar el mock para lanzar un error
      const error = new Error('Error al limpiar el almacenamiento');
      AsyncStorage.clear.mockRejectedValueOnce(error);
      
      // Llamar a la función y esperar que lance un error
      await expect(clearStorage()).rejects.toThrow('Error al limpiar el almacenamiento');
    });
  });

  describe('Almacenamiento seguro', () => {
    const SecureStore = require('expo-secure-store');
    
    describe('storeSecureData', () => {
      it('almacena datos de forma segura', async () => {
        // Datos de prueba
        const key = 'secureKey';
        const value = 'secureValue';
        
        // Configurar el mock para indicar que el almacenamiento seguro está disponible
        SecureStore.isAvailableAsync.mockResolvedValueOnce(true);
        
        // Llamar a la función
        await storeSecureData(key, value);
        
        // Verificar que se llamó a setItemAsync con los parámetros correctos
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith(key, value);
      });

      it('usa AsyncStorage como fallback si el almacenamiento seguro no está disponible', async () => {
        // Datos de prueba
        const key = 'secureKey';
        const value = 'secureValue';
        
        // Configurar el mock para indicar que el almacenamiento seguro no está disponible
        SecureStore.isAvailableAsync.mockResolvedValueOnce(false);
        
        // Llamar a la función
        await storeSecureData(key, value);
        
        // Verificar que se llamó a AsyncStorage.setItem como fallback
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, value);
      });
    });

    describe('getSecureData', () => {
      it('recupera datos seguros correctamente', async () => {
        // Datos de prueba
        const key = 'secureKey';
        const value = 'secureValue';
        
        // Configurar el mock para indicar que el almacenamiento seguro está disponible
        SecureStore.isAvailableAsync.mockResolvedValueOnce(true);
        SecureStore.getItemAsync.mockResolvedValueOnce(value);
        
        // Llamar a la función
        const result = await getSecureData(key);
        
        // Verificar que se llamó a getItemAsync con la clave correcta
        expect(SecureStore.getItemAsync).toHaveBeenCalledWith(key);
        
        // Verificar que el resultado es el valor esperado
        expect(result).toBe(value);
      });

      it('usa AsyncStorage como fallback para recuperar datos', async () => {
        // Datos de prueba
        const key = 'secureKey';
        const value = 'secureValue';
        
        // Configurar el mock para indicar que el almacenamiento seguro no está disponible
        SecureStore.isAvailableAsync.mockResolvedValueOnce(false);
        AsyncStorage.getItem.mockResolvedValueOnce(value);
        
        // Llamar a la función
        const result = await getSecureData(key);
        
        // Verificar que se llamó a AsyncStorage.getItem como fallback
        expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
        
        // Verificar que el resultado es el valor esperado
        expect(result).toBe(value);
      });
    });

    describe('removeSecureData', () => {
      it('elimina datos seguros correctamente', async () => {
        // Clave de prueba
        const key = 'secureKey';
        
        // Configurar el mock para indicar que el almacenamiento seguro está disponible
        SecureStore.isAvailableAsync.mockResolvedValueOnce(true);
        
        // Llamar a la función
        await removeSecureData(key);
        
        // Verificar que se llamó a deleteItemAsync con la clave correcta
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(key);
      });

      it('usa AsyncStorage como fallback para eliminar datos', async () => {
        // Clave de prueba
        const key = 'secureKey';
        
        // Configurar el mock para indicar que el almacenamiento seguro no está disponible
        SecureStore.isAvailableAsync.mockResolvedValueOnce(false);
        
        // Llamar a la función
        await removeSecureData(key);
        
        // Verificar que se llamó a AsyncStorage.removeItem como fallback
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
      });
    });
  });
});
