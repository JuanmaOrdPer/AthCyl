// Este archivo proporciona una implementación de reemplazo para @react-native/normalize-colors
// que es requerido por react-native-web pero no está disponible directamente

// Exportamos las funciones necesarias para normalizar colores
export function normalizeColor(color) {
  return color;
}

export function rgba(r, g, b, a) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function hsla(h, s, l, a) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

export default {
  normalizeColor,
  rgba,
  hsla
};
