// src/styles/theme/typography.js

// Familia de fuentes
const fontFamily = {
    primary: 'System',  // Usa la fuente del sistema o reemplaza con tu fuente personalizada
    secondary: 'System',
    monospace: 'monospace',
  };
  
  // Pesos de fuente
  const fontWeight = {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  };
  
  // Tamaños de fuente
  const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 32,
  };
  
  // Altura de línea
  const lineHeight = {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  };
  
  // Estilos de texto predefinidos
  const textStyles = {
    // Encabezados
    h1: {
      fontFamily: fontFamily.primary,
      fontSize: fontSize.display,
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
    },
    h2: {
      fontFamily: fontFamily.primary,
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
    },
    h3: {
      fontFamily: fontFamily.primary,
      fontSize: fontSize.xl,
      fontWeight: fontWeight.semiBold,
      lineHeight: lineHeight.tight,
    },
    h4: {
      fontFamily: fontFamily.primary,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semiBold,
      lineHeight: lineHeight.tight,
    },
    
    // Cuerpo de texto
    body1: {
      fontFamily: fontFamily.primary,
      fontSize: fontSize.md,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal,
    },
    body2: {
      fontFamily: fontFamily.primary,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal,
    },
    
    // Otros estilos
    caption: {
      fontFamily: fontFamily.primary,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal,
    },
    button: {
      fontFamily: fontFamily.primary,
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
    },
    label: {
      fontFamily: fontFamily.primary,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
    },
  };
  
  export { fontFamily, fontWeight, fontSize, lineHeight, textStyles };