module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-clone-referenced-element|@react-navigation|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@sentry/.*)'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js'
  ],
  moduleNameMapper: {
    // Mocks para los polyfills
    '^@react-native/normalize-colors$': '<rootDir>/src/polyfills/normalizeColor.js',
    '^@react-native/assets-registry/registry$': '<rootDir>/src/polyfills/assetsRegistry.js',
    '^@react-native/assets-registry/path-support$': '<rootDir>/src/polyfills/pathSupport.js',
    '^@react-native/virtualized-lists$': '<rootDir>/src/polyfills/virtualizedLists.js'
  }
};
