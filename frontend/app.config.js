/**
 * Configuración de la aplicación Expo para AthCyl - VERSIÓN FINAL
 * Optimizada para IP: 192.168.1.137
 */

export default {
  expo: {
    name: "AthCyl",
    slug: "athcyl",
    version: "1.0.0",
    description: "Aplicación para gestión de entrenamientos deportivos",
    orientation: "portrait",
    icon: "./assets/icon.png",
    
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain", 
      backgroundColor: "#ffffff"
    },
    
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.athcyl.app"
    },
    
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#2E7D32"
      },
      package: "com.athcyl.app"
    },
    
    web: {
      favicon: "./assets/icon.png"
    },
    
    // Configuración de red específica para tu IP
    extra: {
      apiUrl: "http://192.168.1.137:8000",
      isDevelopment: true,
      apiVersion: "v1"
    }
  }
};