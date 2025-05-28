/**
 * Componente Button reutilizable para AthCyl
 * 
 * Botón personalizado que mantiene consistencia en toda la aplicación.
 * Soporta diferentes variantes, tamaños y estados.
 * 
 * Props disponibles:
 * - title: Texto del botón
 * - onPress: Función a ejecutar al presionar
 * - variant: Tipo de botón (primary, secondary, outline)
 * - size: Tamaño del botón (small, medium, large)
 * - disabled: Si el botón está deshabilitado
 * - loading: Si muestra indicador de carga
 * - icon: Icono a mostrar (opcional)
 * - style: Estilos adicionales
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importar sistema de colores y estilos
import { Colors } from '../config/colors';
import { globalStyles } from '../styles/globalStyles';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  ...otherProps
}) => {
  
  /**
   * Obtener estilos del contenedor según la variante
   */
  const getContainerStyle = () => {
    let baseStyle = [styles.baseButton];
    
    // Estilos según variante
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButton);
        break;
      case 'danger':
        baseStyle.push(styles.dangerButton);
        break;
      case 'success':
        baseStyle.push(styles.successButton);
        break;
      default:
        baseStyle.push(styles.primaryButton);
    }
    
    // Estilos según tamaño
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallButton);
        break;
      case 'large':
        baseStyle.push(styles.largeButton);
        break;
      default:
        baseStyle.push(styles.mediumButton);
    }
    
    // Estado deshabilitado
    if (disabled || loading) {
      baseStyle.push(styles.disabledButton);
    }
    
    // Estilos personalizados
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };
  
  /**
   * Obtener estilos del texto según la variante
   */
  const getTextStyle = () => {
    let baseStyle = [styles.baseText];
    
    // Color del texto según variante
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryText);
        break;
      case 'outline':
        baseStyle.push(styles.outlineText);
        break;
      case 'danger':
        baseStyle.push(styles.dangerText);
        break;
      case 'success':
        baseStyle.push(styles.successText);
        break;
      default:
        baseStyle.push(styles.primaryText);
    }
    
    // Tamaño del texto
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallText);
        break;
      case 'large':
        baseStyle.push(styles.largeText);
        break;
      default:
        baseStyle.push(styles.mediumText);
    }
    
    // Estado deshabilitado
    if (disabled || loading) {
      baseStyle.push(styles.disabledText);
    }
    
    // Estilos personalizados del texto
    if (textStyle) {
      baseStyle.push(textStyle);
    }
    
    return baseStyle;
  };
  
  /**
   * Obtener color del indicador de carga
   */
  const getLoadingColor = () => {
    switch (variant) {
      case 'outline':
      case 'secondary':
        return Colors.primary;
      default:
        return Colors.white;
    }
  };
  
  /**
   * Renderizar contenido del botón
   */
  const renderContent = () => {
    // Si está cargando, mostrar indicador
    if (loading) {
      return (
        <View style={styles.contentContainer}>
          <ActivityIndicator 
            size="small" 
            color={getLoadingColor()} 
            style={{ marginRight: title ? 8 : 0 }}
          />
          {title && (
            <Text style={getTextStyle()}>
              {title}
            </Text>
          )}
        </View>
      );
    }
    
    // Contenido normal con icono (si existe)
    return (
      <View style={styles.contentContainer}>
        {/* Icono a la izquierda */}
        {icon && iconPosition === 'left' && (
          <Ionicons 
            name={icon} 
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
            color={getTextStyle()[0].color || Colors.white}
            style={{ marginRight: title ? 8 : 0 }}
          />
        )}
        
        {/* Texto del botón */}
        {title && (
          <Text style={getTextStyle()}>
            {title}
          </Text>
        )}
        
        {/* Icono a la derecha */}
        {icon && iconPosition === 'right' && (
          <Ionicons 
            name={icon} 
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
            color={getTextStyle()[0].color || Colors.white}
            style={{ marginLeft: title ? 8 : 0 }}
          />
        )}
      </View>
    );
  };
  
  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...otherProps}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// ===== ESTILOS DEL COMPONENTE =====
const styles = StyleSheet.create({
  // Estilos base
  baseButton: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Variantes de botón
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  
  secondaryButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  
  dangerButton: {
    backgroundColor: Colors.error,
  },
  
  successButton: {
    backgroundColor: Colors.success,
  },
  
  disabledButton: {
    backgroundColor: Colors.gray400,
    borderColor: Colors.gray400,
  },
  
  // Tamaños
  smallButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  
  mediumButton: {
    height: 50,
    paddingHorizontal: 16,
  },
  
  largeButton: {
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  
  // Estilos de texto por variante
  primaryText: {
    color: Colors.white,
  },
  
  secondaryText: {
    color: Colors.textPrimary,
  },
  
  outlineText: {
    color: Colors.primary,
  },
  
  dangerText: {
    color: Colors.white,
  },
  
  successText: {
    color: Colors.white,
  },
  
  disabledText: {
    color: Colors.textMuted,
  },
  
  // Tamaños de texto
  smallText: {
    fontSize: 14,
  },
  
  mediumText: {
    fontSize: 16,
  },
  
  largeText: {
    fontSize: 18,
  },
});

export default Button;