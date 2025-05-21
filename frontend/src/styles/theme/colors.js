// src/styles/theme/colors.js

// Paleta de colores principal
const palette = {
    // Colores primarios
    blue: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#1E88E5', // Color primario actual
      600: '#1976d2',
      700: '#1565c0',
      800: '#0d47a1',
      900: '#0a2351',
    },
    
    // Colores secundarios
    cyan: {
      500: '#00acc1',
      600: '#0097a7',
    },
    
    // Colores de acento
    orange: {
      500: '#ff9800',
      600: '#fb8c00',
    },
    
    // Escala de grises
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    
    // Colores de estado
    success: {
      light: '#81c784',
      main: '#4CAF50',
      dark: '#388e3c',
    },
    error: {
      light: '#e57373',
      main: '#D32F2F',
      dark: '#c62828',
    },
    warning: {
      light: '#ffb74d',
      main: '#FFC107',
      dark: '#f57c00',
    },
    info: {
      light: '#64b5f6',
      main: '#2196F3',
      dark: '#1976d2',
    },
    
    // Básicos
    common: {
      black: '#000000',
      white: '#FFFFFF',
      transparent: 'transparent',
    },
  };
  
  // Colores semánticos (nombres funcionales)
  const colors = {
    primary: palette.blue[500],
    primaryLight: palette.blue[300],
    primaryDark: palette.blue[700],
    
    secondary: palette.cyan[500],
    secondaryDark: palette.cyan[600],
    
    accent: palette.orange[500],
    accentDark: palette.orange[600],
    
    // Fondos
    background: {
      default: palette.grey[100],
      paper: palette.common.white,
      card: palette.common.white,
      modal: palette.common.white,
    },
    
    // Texto
    text: {
      primary: palette.grey[900],
      secondary: palette.grey[600],
      disabled: palette.grey[500],
      hint: palette.grey[500],
      inverse: palette.common.white,
    },
    
    // Estados
    success: palette.success.main,
    error: palette.error.main,
    warning: palette.warning.main,
    info: palette.info.main,
    
    // Otros
    divider: palette.grey[300],
    border: palette.grey[300],
    placeholder: palette.grey[400],
    icon: palette.grey[600],
  };
  
  export { palette, colors };