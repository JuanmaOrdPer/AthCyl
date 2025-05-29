/**
 * Configuración de la aplicación Expo para AthCyl
 */

export default {
  expo: {
    name: "AthCyl",
    slug: "athcyl",
    version: "1.0.0",
    description: "Aplicación para gestión de entrenamientos deportivos",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain", 
      backgroundColor: "#2E7D32"
    },
    
    assetBundlePatterns: [
      "**/*"
    ],
    
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.athcyl.app"
    },
    
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#2E7D32"
      },
      package: "com.athcyl.app"
    },
    
    web: {
      favicon: "./assets/favicon.png"
    },
    
    // CONFIGURACIÓN DINÁMICA DE API
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000"
    }
  }
};