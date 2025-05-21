// src/styles/theme.js
import { DefaultTheme } from 'react-native-paper';
import theme from './theme/index';

// Actualiza el tema de react-native-paper con nuestro tema personalizado
export const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.primary,
    accent: theme.colors.secondary,
    background: theme.colors.background.default,
    surface: theme.colors.background.paper,
    text: theme.colors.text.primary,
    error: theme.colors.error,
    success: theme.colors.success,
    warning: theme.colors.warning,
    info: theme.colors.info,
  },
  roundness: theme.roundness,
};

// Exportar el tema personalizado
export { theme };