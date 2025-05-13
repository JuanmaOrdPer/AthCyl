const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Configuración para resolver módulos faltantes
  config.resolve.alias = {
    ...config.resolve.alias,
    // Alias básicos
    'react-native$': 'react-native-web',
    '@react-native': 'react-native-web',
    
    // Alias para módulos problemáticos
    '@react-native/normalize-colors': path.resolve(__dirname, './src/polyfills/normalizeColor.js'),
    '@react-native/assets-registry/registry': path.resolve(__dirname, './src/polyfills/assetsRegistry.js'),
    '@react-native/assets-registry/path-support': path.resolve(__dirname, './src/polyfills/pathSupport.js'),
    '@react-native/virtualized-lists': path.resolve(__dirname, './src/polyfills/virtualizedLists.js'),
    '../Utilities/Platform': path.resolve(__dirname, './src/polyfills/platform.js'),
    '../StyleSheet/normalizeColor': path.resolve(__dirname, './src/polyfills/normalizeColor.js'),
    '../StyleSheet/PlatformColorValueTypes': path.resolve(__dirname, './src/polyfills/platformColorValueTypes.js'),
    '../Components/View/View': path.resolve(__dirname, './src/polyfills/view.js'),
    '../Text/Text': path.resolve(__dirname, './src/polyfills/text.js'),
    '../StyleSheet/StyleSheet': path.resolve(__dirname, './src/polyfills/styleSheet.js'),
    '../ReactNative/UIManager': path.resolve(__dirname, './src/polyfills/uiManager.js'),
    '../Components/Sound/SoundManager': path.resolve(__dirname, './src/polyfills/soundManager.js'),
    '../BugReporting/BugReporting': path.resolve(__dirname, './src/polyfills/bugReporting.js'),
    '../Blob/BlobManager': path.resolve(__dirname, './src/polyfills/blobManager.js'),
    '../Blob/Blob': path.resolve(__dirname, './src/polyfills/blob.js'),
    './RCTAlertManager': path.resolve(__dirname, './src/polyfills/alertManager.js'),
    './Platform': path.resolve(__dirname, './src/polyfills/platform.js'),
  };

  // Configuración para ignorar módulos que no son necesarios en web
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'react-native-web/dist/exports/NativeModules': false,
    'react-native-web/dist/exports/UIManager': false,
    'react-native-web/dist/exports/BackHandler': false,
  };

  return config;
};
