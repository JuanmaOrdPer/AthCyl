// Implementación básica de normalizeColor para react-native-web
function normalizeColor(color) {
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
}

// Funciones auxiliares para colores
function rgba(r, g, b, a) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function hsla(h, s, l, a) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

// Exportar como módulo CommonJS para compatibilidad con require()
module.exports = normalizeColor;
module.exports.default = normalizeColor;
module.exports.rgba = rgba;
module.exports.hsla = hsla;
