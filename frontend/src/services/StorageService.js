import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Almacena datos en AsyncStorage
 * @param {string} key - Clave para almacenar los datos
 * @param {any} value - Valor a almacenar (se convertirá a JSON)
 * @returns {Promise<void>}
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error al almacenar datos:', error);
    throw error;
  }
};

/**
 * Recupera datos de AsyncStorage
 * @param {string} key - Clave de los datos a recuperar
 * @returns {Promise<any>} - Datos recuperados (parseados de JSON)
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error al recuperar datos:', error);
    throw error;
  }
};

/**
 * Elimina datos de AsyncStorage
 * @param {string} key - Clave de los datos a eliminar
 * @returns {Promise<void>}
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error al eliminar datos:', error);
    throw error;
  }
};

/**
 * Limpia todo el almacenamiento
 * @returns {Promise<void>}
 */
export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error al limpiar el almacenamiento:', error);
    throw error;
  }
};

/**
 * Verifica si el almacenamiento seguro está disponible
 * @returns {Promise<boolean>}
 */
export const isSecureStoreAvailable = async () => {
  return await SecureStore.isAvailableAsync();
};

/**
 * Almacena datos de forma segura
 * @param {string} key - Clave para almacenar los datos
 * @param {string} value - Valor a almacenar (debe ser string)
 * @returns {Promise<void>}
 */
export const storeSecureData = async (key, value) => {
  try {
    // Verificar si el almacenamiento seguro está disponible
    const isAvailable = await isSecureStoreAvailable();
    
    if (isAvailable) {
      // Usar SecureStore si está disponible
      await SecureStore.setItemAsync(key, value);
    } else {
      // Usar AsyncStorage como fallback
      await AsyncStorage.setItem(key, value);
    }
  } catch (error) {
    console.error('Error al almacenar datos seguros:', error);
    throw error;
  }
};

/**
 * Recupera datos almacenados de forma segura
 * @param {string} key - Clave de los datos a recuperar
 * @returns {Promise<string|null>} - Datos recuperados
 */
export const getSecureData = async (key) => {
  try {
    // Verificar si el almacenamiento seguro está disponible
    const isAvailable = await isSecureStoreAvailable();
    
    if (isAvailable) {
      // Usar SecureStore si está disponible
      return await SecureStore.getItemAsync(key);
    } else {
      // Usar AsyncStorage como fallback
      return await AsyncStorage.getItem(key);
    }
  } catch (error) {
    console.error('Error al recuperar datos seguros:', error);
    throw error;
  }
};

/**
 * Elimina datos almacenados de forma segura
 * @param {string} key - Clave de los datos a eliminar
 * @returns {Promise<void>}
 */
export const removeSecureData = async (key) => {
  try {
    // Verificar si el almacenamiento seguro está disponible
    const isAvailable = await isSecureStoreAvailable();
    
    if (isAvailable) {
      // Usar SecureStore si está disponible
      await SecureStore.deleteItemAsync(key);
    } else {
      // Usar AsyncStorage como fallback
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error al eliminar datos seguros:', error);
    throw error;
  }
};

export default {
  storeData,
  getData,
  removeData,
  clearStorage,
  storeSecureData,
  getSecureData,
  removeSecureData,
  isSecureStoreAvailable
};
