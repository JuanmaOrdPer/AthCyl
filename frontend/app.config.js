export default {
  name: 'AthCyl',
  slug: 'athcyl',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: {
    image: null,  // Deshabilitar temporalmente el splash screen
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    '**/*'
  ],
  platforms: ['ios', 'android'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.juanma.athcyl'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF'
    },
    package: 'com.juanma.athcyl'
  },
  extra: {
    // Configuración para la API - Usa tu IP local
    // Ejemplo: 'http://192.168.1.100:8000' (sin HTTPS para desarrollo)
    apiUrl: 'http://192.168.0.7:8000',
    // Usar autenticación básica en lugar de JWT
    useBasicAuth: true
  }
};
