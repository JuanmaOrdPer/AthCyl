module.exports = {
  name: 'AthCyl',
  displayName: 'AthCyl',
  expo: {
    name: 'AthCyl',
    slug: 'athcyl',
    version: '1.0.0',
    platforms: ['web'],
    assetBundlePatterns: ['**/*'],
    web: {
      favicon: './assets/favicon.png',
      build: {
        babel: {
          include: [
            '@expo/vector-icons',
            'react-native-paper',
            'react-native-safe-area-context',
            'react-native-vector-icons',
            'react-native-reanimated',
          ],
        },
      },
    },
  },
}; 