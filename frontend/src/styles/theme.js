import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1E88E5',
    accent: '#42A5F5',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    error: '#D32F2F',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
  },
  roundness: 8,
};
