export default {
  name: 'AthCyl',
  slug: 'athcyl',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
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
    // Configuración para la API
    apiUrl: 'https://127.0.0.1:8000',
    // Usar autenticación básica en lugar de JWT
    useBasicAuth: true
  }
};
