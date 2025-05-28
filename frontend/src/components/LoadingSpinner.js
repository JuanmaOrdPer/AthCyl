/**
 * Componente LoadingSpinner para AthCyl
 * 
 * Indicador de carga reutilizable que se puede usar en toda la aplicación.
 * Proporciona feedback visual cuando se están cargando datos.
 * 
 * Props disponibles:
 * - size: Tamaño del spinner (small, large)
 * - color: Color del spinner
 * - text: Texto a mostrar debajo del spinner
 * - overlay: Si debe mostrar un overlay de fondo
 * - style: Estilos adicionales
 */

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal
} from 'react-native';

// Importar sistema de colores
import { Colors } from '../config/colors';

const LoadingSpinner = ({
  size = 'large',
  color = Colors.primary,
  text = 'Cargando...',
  overlay = false,
  visible = true,
  style,
  textStyle
}) => {
  
  /**
   * Renderizar el contenido del spinner
   */
  const renderSpinner = () => (
    <View style={[styles.container, style]}>
      <ActivityIndicator 
        size={size} 
        color={color}
      />
      {text && (
        <Text style={[styles.text, textStyle]}>
          {text}
        </Text>
      )}
    </View>
  );
  
  /**
   * Si es overlay, mostrar en Modal
   */
  if (overlay) {
    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
      >
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            {renderSpinner()}
          </View>
        </View>
      </Modal>
    );
  }
  
  /**
   * Spinner normal
   */
  if (!visible) {
    return null;
  }
  
  return renderSpinner();
};

// ===== COMPONENTES ESPECIALIZADOS =====

/**
 * Spinner para pantalla completa
 */
export const FullScreenSpinner = ({ text = 'Cargando...', ...props }) => (
  <View style={styles.fullScreen}>
    <LoadingSpinner 
      text={text}
      {...props}
    />
  </View>
);

/**
 * Spinner pequeño para botones
 */
export const ButtonSpinner = ({ color = Colors.white, ...props }) => (
  <ActivityIndicator 
    size="small" 
    color={color}
    {...props}
  />
);

/**
 * Spinner inline para listas
 */
export const InlineSpinner = ({ text = 'Cargando más...', ...props }) => (
  <View style={styles.inline}>
    <ActivityIndicator 
      size="small" 
      color={Colors.primary}
      style={styles.inlineSpinner}
    />
    {text && (
      <Text style={styles.inlineText}>
        {text}
      </Text>
    )}
  </View>
);

// ===== ESTILOS DEL COMPONENTE =====
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  text: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  overlayContent: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    minWidth: 120,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Pantalla completa
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  
  // Inline
  inline: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  
  inlineSpinner: {
    marginRight: 8,
  },
  
  inlineText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default LoadingSpinner;