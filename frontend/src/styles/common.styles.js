// src/styles/common.styles.js
import { StyleSheet } from 'react-native';
import theme from './theme/index';

/**
 * Estilos comunes reutilizables en toda la aplicación
 */
export default StyleSheet.create({
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  contentContainer: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.sizes.borderRadius.md,
    backgroundColor: theme.colors.background.card,
    ...theme.shadows.sm,
  },
  
  // Elementos de carga
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    ...theme.textStyles.body2,
    color: theme.colors.text.secondary,
  },
  
  // Mensajes vacíos
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.textStyles.h4,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    ...theme.textStyles.body2,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  
  // Tipografía
  title: {
    ...theme.textStyles.h1,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.textStyles.h3,
    marginBottom: theme.spacing.sm,
  },
  text: {
    ...theme.textStyles.body1,
    color: theme.colors.text.primary,
  },
  textMuted: {
    ...theme.textStyles.body2,
    color: theme.colors.text.secondary,
  },
  
  // Formularios
  input: {
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  errorText: {
    color: theme.colors.error,
    ...theme.textStyles.caption,
    marginTop: -theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  
  // Botones y acciones
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  button: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.md,
    right: 0,
    bottom: 0,
  },
  
  // Divisores
  divider: {
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.divider,
    height: theme.sizes.borderWidth.thin,
  },
  
  // Filtros y chips
  filterContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.paper,
    ...theme.shadows.sm,
  },
  filterChip: {
    marginRight: theme.spacing.sm,
  },
  
  // Secciones
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.textStyles.h3,
    marginBottom: theme.spacing.sm,
  },
  
  // Listas
  list: {
    paddingVertical: theme.spacing.sm,
  },
  listItem: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: theme.sizes.borderWidth.thin,
    borderBottomColor: theme.colors.divider,
  },
  
  // Badges
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.sizes.borderRadius.sm,
    backgroundColor: theme.colors.primary,
  },
  badgeText: {
    color: theme.colors.text.inverse,
    ...theme.textStyles.caption,
    fontWeight: theme.fontWeight.bold,
  },
});