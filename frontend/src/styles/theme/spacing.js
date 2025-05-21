// src/styles/theme/spacing.js

// Unidad base para todo el espaciado
const BASE_UNIT = 4;

// Sistema de espaciado (para márgenes, padding, etc.)
const spacing = {
  xs: BASE_UNIT, // 4
  sm: BASE_UNIT * 2, // 8
  md: BASE_UNIT * 4, // 16
  lg: BASE_UNIT * 6, // 24
  xl: BASE_UNIT * 8, // 32
  xxl: BASE_UNIT * 12, // 48
};

// Para crear arrays de espaciado (ej: [0, 8, 16, 24])
const createSpacing = (multiplier) => BASE_UNIT * multiplier;

// Dimensiones comunes
const sizes = {
  // Alturas de componentes
  inputHeight: BASE_UNIT * 12, // 48
  buttonHeight: BASE_UNIT * 11, // 44
  iconButtonSize: BASE_UNIT * 10, // 40
  avatarSize: BASE_UNIT * 10, // 40
  avatarSizeLarge: BASE_UNIT * 15, // 60
  
  // Bordes
  borderRadius: {
    xs: BASE_UNIT / 2, // 2
    sm: BASE_UNIT, // 4
    md: BASE_UNIT * 2, // 8
    lg: BASE_UNIT * 4, // 16
    xl: BASE_UNIT * 6, // 24
    round: 9999, // Para elementos circulares
  },
  
  // Bordes
  borderWidth: {
    thin: 1,
    standard: 1.5,
    thick: 2,
  },
};

export { spacing, createSpacing, sizes, BASE_UNIT };