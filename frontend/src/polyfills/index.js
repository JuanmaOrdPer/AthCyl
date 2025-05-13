// Este archivo proporciona polyfills para módulos faltantes en react-native-web
// Centraliza todas las implementaciones de reemplazo

// Exportamos normalizeColor para react-native-web
export const normalizeColor = (color) => {
  if (typeof color === 'string') {
    if (color.startsWith('#')) {
      return color;
    }
    if (color.startsWith('rgb')) {
      return color;
    }
    // Colores básicos
    const colors = {
      black: '#000000',
      white: '#FFFFFF',
      red: '#FF0000',
      green: '#00FF00',
      blue: '#0000FF',
      yellow: '#FFFF00',
      transparent: 'transparent',
    };
    return colors[color.toLowerCase()] || color;
  }
  return color;
};

// Funciones auxiliares para colores
export const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;
export const hsla = (h, s, l, a) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

// Exportación por defecto para normalizeColor
const normalizeColorExport = {
  default: normalizeColor,
  normalizeColor,
  rgba,
  hsla
};

// Registro de assets
export const registry = {
  getAssetByID: () => null,
  registerAsset: () => 1,
  getAssetByPath: () => null,
};

// Soporte de rutas para assets
export const pathSupport = {
  getAndroidResourceFolderName: () => 'drawable',
  getAndroidResourceIdentifier: () => null,
  getBasePath: () => '',
};

// Exportaciones para otros módulos faltantes
export const virtualizedLists = {
  VirtualizedList: () => null,
  VirtualizedSectionList: () => null,
};

// Objeto para exportaciones múltiples
const polyfills = {
  normalizeColor: normalizeColorExport,
  registry,
  pathSupport,
  virtualizedLists,
};

export default polyfills;
