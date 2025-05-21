// src/styles/common.styles.js
import { StyleSheet } from 'react-native';
import { theme } from './theme';

/**
 * Estilos comunes reutilizables en toda la aplicación
 */
export default StyleSheet.create({
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  
  // Elementos de carga
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  
  // Mensajes vacíos
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Tipografía
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#212121',
  },
  textMuted: {
    fontSize: 14,
    color: '#666',
  },
  
  // Formularios
  input: {
    marginBottom: 12,
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
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  
  // Botones y acciones
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  
  // Divisores
  divider: {
    marginVertical: 8,
  },
  
  // Filtros y chips
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  filterChip: {
    marginRight: 8,
  },
});