/**
 * Sistema de colores centralizado para AthCyl
 * 
 * Este archivo contiene todos los colores utilizados en la aplicación.
 * Para cambiar el tema de colores, solo necesitas modificar este archivo
 * y todos los componentes se actualizarán automáticamente.
 * 
 * Colores actuales: Tema Verde (Deporte/Naturaleza)
 * Para cambiar a otro color: modifica las variables 'primary' por el color deseado
 */

// ===== COLORES PRINCIPALES =====
// Cambia estos valores para cambiar el tema completo de la app
const PRIMARY_COLOR = '#2E7D32';      // Verde principal (Material Green 800)
const PRIMARY_LIGHT = '#4CAF50';      // Verde claro (Material Green 500)
const PRIMARY_DARK = '#1B5E20';       // Verde oscuro (Material Green 900)
const PRIMARY_ACCENT = '#81C784';     // Verde accent (Material Green 300)

// ===== SISTEMA DE COLORES COMPLETO =====
export const Colors = {
  // Colores primarios (tema principal)
  primary: PRIMARY_COLOR,
  primaryLight: PRIMARY_LIGHT,
  primaryDark: PRIMARY_DARK,
  primaryAccent: PRIMARY_ACCENT,
  
  // Variaciones del color principal con transparencia
  primaryAlpha10: PRIMARY_COLOR + '1A',  // 10% opacidad
  primaryAlpha20: PRIMARY_COLOR + '33',  // 20% opacidad
  primaryAlpha50: PRIMARY_COLOR + '80',  // 50% opacidad
  
  // Colores de estado (semáforo)
  success: '#4CAF50',       // Verde éxito
  warning: '#FF9800',       // Naranja advertencia
  error: '#F44336',         // Rojo error
  info: '#2196F3',          // Azul información
  
  // Colores neutros (base)
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Escala de grises
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Colores de texto
  textPrimary: '#212121',       // Texto principal (oscuro)
  textSecondary: '#757575',     // Texto secundario (gris)
  textLight: '#FFFFFF',         // Texto claro (para fondos oscuros)
  textMuted: '#9E9E9E',         // Texto deshabilitado
  
  // Colores de fondo
  background: '#FFFFFF',        // Fondo principal
  backgroundLight: '#FAFAFA',   // Fondo claro
  backgroundDark: '#F5F5F5',    // Fondo oscuro
  
  // Colores de superficie (tarjetas, modales, etc.)
  surface: '#FFFFFF',
  surfaceLight: '#F8F9FA',
  
  // Colores de borde
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  borderDark: '#BDBDBD',
  
  // Colores específicos para deportes (opcional)
  running: PRIMARY_COLOR,       // Correr
  cycling: '#1976D2',           // Ciclismo (azul)
  swimming: '#0288D1',          // Natación (azul claro)
  walking: '#689F38',           // Caminar (verde claro)
  hiking: '#5D4037',            // Senderismo (marrón)
  other: '#757575',             // Otros deportes (gris)
};

// ===== TEMAS PREDEFINIDOS =====
// Para futuras implementaciones de temas múltiples
export const Themes = {
  // Tema actual (Verde)
  green: {
    primary: '#2E7D32',
    primaryLight: '#4CAF50',
    primaryDark: '#1B5E20',
    primaryAccent: '#81C784',
  },
  
  // Tema alternativo (Azul) - para cambio rápido
  blue: {
    primary: '#1976D2',
    primaryLight: '#2196F3',
    primaryDark: '#0D47A1',
    primaryAccent: '#64B5F6',
  },
  
  // Tema alternativo (Naranja) - para cambio rápido
  orange: {
    primary: '#F57C00',
    primaryLight: '#FF9800',
    primaryDark: '#E65100',
    primaryAccent: '#FFB74D',
  }
};

// ===== FUNCIÓN PARA CAMBIAR TEMA =====
// Función utilitaria para cambiar el tema completo
export const applyTheme = (themeName) => {
  const theme = Themes[themeName];
  if (theme) {
    Colors.primary = theme.primary;
    Colors.primaryLight = theme.primaryLight;
    Colors.primaryDark = theme.primaryDark;
    Colors.primaryAccent = theme.primaryAccent;
  }
};

// ===== COLORES POR DEFECTO =====
// Exportar colores individuales para uso directo
export const {
  primary,
  primaryLight,
  primaryDark,
  primaryAccent,
  success,
  warning,
  error,
  info,
  white,
  black,
  textPrimary,
  textSecondary,
  background,
  surface
} = Colors;