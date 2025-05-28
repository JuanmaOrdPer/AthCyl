/**
 * Estilos globales para AthCyl
 * 
 * Este archivo contiene todos los estilos que se reutilizan en toda la aplicación.
 * Utiliza el sistema de colores centralizado para mantener consistencia.
 * 
 * Categorías de estilos:
 * - Contenedores y layouts
 * - Tipografía
 * - Formularios
 * - Botones
 * - Tarjetas
 * - Utilidades
 */

import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../config/colors';

// Obtener dimensiones de la pantalla
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ===== ESTILOS GLOBALES =====
export const globalStyles = StyleSheet.create({
  
  // ===== CONTENEDORES Y LAYOUTS =====
  
  // Contenedor principal para pantallas
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Contenedor con padding estándar
  containerPadded: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  
  // Contenedor centrado
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Contenedor para scrollview con padding
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  
  // Contenedor de fila
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Contenedor de fila con espacio entre elementos
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Contenedor de columna
  column: {
    flexDirection: 'column',
  },
  
  // ===== TIPOGRAFÍA =====
  
  // Título principal
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  
  // Subtítulo
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  
  // Título de sección
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  
  // Texto principal
  text: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  
  // Texto secundario
  textSecondary: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  // Texto pequeño
  textSmall: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  
  // Texto silenciado
  textMuted: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  
  // Texto en color primario
  textPrimary: {
    color: Colors.primary,
    fontWeight: '600',
  },
  
  // Texto de éxito
  textSuccess: {
    color: Colors.success,
    fontWeight: '500',
  },
  
  // Texto de error
  textError: {
    color: Colors.error,
    fontWeight: '500',
  },
  
  // Texto centrado
  textCenter: {
    textAlign: 'center',
  },
  
  // ===== FORMULARIOS =====
  
  // Contenedor de campo de formulario
  formField: {
    marginBottom: 16,
  },
  
  // Etiqueta de campo
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  
  // Input básico
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
    color: Colors.textPrimary,
  },
  
  // Input enfocado
  inputFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  
  // Input con error
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  
  // Textarea
  textarea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  
  // Mensaje de error de campo
  fieldError: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
  
  // ===== BOTONES =====
  
  // Botón principal
  button: {
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  // Botón secundario
  buttonSecondary: {
    height: 50,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  // Botón de contorno
  buttonOutline: {
    height: 50,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  // Botón pequeño
  buttonSmall: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  
  // Botón deshabilitado
  buttonDisabled: {
    backgroundColor: Colors.gray400,
  },
  
  // Texto de botón
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  
  // Texto de botón secundario
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  
  // Texto de botón pequeño
  buttonTextSmall: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // ===== TARJETAS =====
  
  // Tarjeta básica
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Tarjeta sin sombra
  cardFlat: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  
  // Header de tarjeta
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: 12,
    marginBottom: 12,
  },
  
  // Título de tarjeta
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  
  // Subtítulo de tarjeta
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  
  // ===== LISTAS =====
  
  // Ítem de lista
  listItem: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  
  // Último ítem de lista (sin borde)
  listItemLast: {
    borderBottomWidth: 0,
  },
  
  // Título de ítem de lista
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  
  // Subtítulo de ítem de lista
  listItemSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  
  // ===== INDICADORES Y ESTADOS =====
  
  // Contenedor de indicador de carga
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  // Badge básico
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  
  // Texto de badge
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  
  // Separador
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 16,
  },
  
  // ===== ESPACIADO =====
  
  // Márgenes
  marginTop: {
    marginTop: 16,
  },
  
  marginBottom: {
    marginBottom: 16,
  },
  
  marginHorizontal: {
    marginHorizontal: 16,
  },
  
  marginVertical: {
    marginVertical: 16,
  },
  
  // Padding
  paddingTop: {
    paddingTop: 16,
  },
  
  paddingBottom: {
    paddingBottom: 16,
  },
  
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  
  paddingVertical: {
    paddingVertical: 16,
  },
  
  // ===== UTILIDADES =====
  
  // Flex
  flex1: {
    flex: 1,
  },
  
  // Ocultar
  hidden: {
    display: 'none',
  },
  
  // Absoluto
  absolute: {
    position: 'absolute',
  },
  
  // Ancho completo
  fullWidth: {
    width: '100%',
  },
  
  // Shadow suave
  shadowSoft: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // Shadow media
  shadowMedium: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // ===== ESTILOS ESPECÍFICOS DE PLATAFORMA =====
  
  // Header de navegación
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  
  // Contenedor de tab
  tabContainer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  
  // ===== RESPONSIVE =====
  
  // Para pantallas pequeñas
  ...(screenWidth < 350 && {
    containerPadded: {
      padding: 16,
    },
    scrollContainer: {
      padding: 16,
    },
    title: {
      fontSize: 24,
    },
    subtitle: {
      fontSize: 20,
    }
  }),
});

// ===== DIMENSIONES ÚTILES =====
export const dimensions = {
  screenWidth,
  screenHeight,
  isSmallScreen: screenWidth < 350,
  isMediumScreen: screenWidth >= 350 && screenWidth < 400,
  isLargeScreen: screenWidth >= 400,
};

// ===== ESPACIADO ESTÁNDAR =====
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ===== BORDES Y RADIOS =====
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export default globalStyles;