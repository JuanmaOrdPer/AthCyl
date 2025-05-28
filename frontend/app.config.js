/**
 * Configuración de la aplicación Expo para AthCyl
 * 
 * Este archivo define la configuración principal de la aplicación:
 * - Información básica (nombre, versión, descripción)
 * - Configuración de iconos y splash screen
 * - Orientación de pantalla
 * - Configuración de plataformas (Android/iOS)
 * - URL de la API backend
 */

export default {
    expo: {
      // Información básica de la aplicación
      name: "AthCyl",
      slug: "athcyl",
      version: "1.0.0",
      description: "Aplicación para gestión de entrenamientos deportivos",
      
      // Configuración de orientación (solo vertical)
      orientation: "portrait",
      
      // Icono de la aplicación (debe estar en assets/icon.png)
      icon: "./assets/icon.png",
      
      // Configuración de la pantalla de carga
      splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      
      // Configuración para iOS
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.athcyl.app"
      },
      
      // Configuración para Android
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/icon.png",
          backgroundColor: "#2E7D32"  // Verde principal
        },
        package: "com.athcyl.app"
      },
      
      // Configuración para Web (opcional)
      web: {
        favicon: "./assets/icon.png"
      },
      
      // Variables de configuración extra para la app
      extra: {
        // URL del backend - CAMBIAR POR LA IP DE TU SERVIDOR
        apiUrl: "http://127.0.0.1:8000",  // Cambia esta IP
        
        // Configuración de desarrollo
        isDevelopment: true,
        
        // Versión de la API
        apiVersion: "v1"
      }
    }
  };