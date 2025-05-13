// Implementación básica del registro de assets para react-native-web
const registry = {
  getAssetByID: () => null,
  registerAsset: () => 1,
  getAssetByPath: () => null,
};

// Exportar como módulo CommonJS para compatibilidad con require()
module.exports = registry;
module.exports.default = registry;
