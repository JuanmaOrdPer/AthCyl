// Implementación básica del soporte de rutas para assets
const pathSupport = {
  getAndroidResourceFolderName: () => 'drawable',
  getAndroidResourceIdentifier: () => null,
  getBasePath: () => '',
};

// Exportar como módulo CommonJS para compatibilidad con require()
module.exports = pathSupport;
module.exports.default = pathSupport;
