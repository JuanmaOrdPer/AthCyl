const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
      'react-native-web': path.resolve(__dirname, 'node_modules/react-native-web'),
      '@expo/vector-icons': 'react-native-vector-icons',
      // Alias para componentes específicos de react-native
      'react-native/Libraries/Components/View/View': 'react-native-web/dist/exports/View',
      'react-native/Libraries/Components/Text/Text': 'react-native-web/dist/exports/Text',
      'react-native/Libraries/StyleSheet/StyleSheet': 'react-native-web/dist/exports/StyleSheet',
      'react-native/Libraries/Image/Image': 'react-native-web/dist/exports/Image',
    },
    extensions: [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.json',
    ],
    fallback: {
      ...config.resolve.fallback,
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "fs": false,
      "net": false,
      "tls": false,
    },
  };

  // Configuración para manejar archivos de fuentes
  config.module.rules.push({
    test: /\.(woff|woff2|eot|ttf|otf)$/,
    type: 'asset/resource',
    include: [
      path.resolve(__dirname, './node_modules/react-native-vector-icons'),
    ],
  });

  // Añadir soporte para fuentes de react-native-vector-icons
  config.module.rules.push({
    test: /\.ttf$/,
    loader: 'file-loader',
    include: path.resolve(__dirname, 'node_modules/react-native-vector-icons'),
    options: {
      name: '[name].[ext]',
    },
  });

  return config;
}; 