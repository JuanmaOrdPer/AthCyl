// src/styles/theme/index.js
import { palette, colors } from './colors';
import { spacing, createSpacing, sizes, BASE_UNIT } from './spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, textStyles } from './typography';
import { shadows } from './shadows';

// Exportar todo el sistema de diseño
const theme = {
  colors,
  palette,
  spacing,
  createSpacing,
  sizes,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  textStyles,
  shadows,
  // Añadir la configuración base para la interfaz
  roundness: sizes.borderRadius.md,
  BASE_UNIT,
};

export default theme;