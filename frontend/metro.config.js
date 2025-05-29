// Configuración básica de Metro para Expo 49
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'svg', 'json'],
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bin', 'txt', 'json', 'mp4', 'ttf'],
  },
};