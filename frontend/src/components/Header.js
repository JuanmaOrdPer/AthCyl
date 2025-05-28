/**
 * Componente Header reutilizable para AthCyl
 * 
 * Cabecera personalizada para pantallas que proporciona navegación
 * y acciones consistentes en toda la aplicación.
 * 
 * Props disponibles:
 * - title: Título de la pantalla
 * - subtitle: Subtítulo opcional
 * - showBack: Si mostrar botón de retroceso
 * - onBack: Función al presionar botón de retroceso
 * - rightIcon: Icono derecho
 * - onRightPress: Función al presionar icono derecho
 * - backgroundColor: Color de fondo del header
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importar sistema de colores
import { Colors } from '../config/colors';

const Header = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  backgroundColor = Colors.surface,
  textColor = Colors.textPrimary,
  style,
  titleStyle,
  ...otherProps
}) => {
  
  // Obtener insets para manejar safe area
  const insets = useSafeAreaInsets();
  
  /**
   * Manejar presión del botón de retroceso
   */
  const handleBackPress = () => {
    if (onBack) {
      onBack();
    }
  };
  
  /**
   * Renderizar botón izquierdo
   */
  const renderLeftButton = () => {
    if (showBack) {
      return (
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
            size={24}
            color={textColor}
          />
        </TouchableOpacity>
      );
    }
    
    if (leftIcon) {
      return (
        <TouchableOpacity
          onPress={onLeftPress}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={leftIcon}
            size={24}
            color={textColor}
          />
        </TouchableOpacity>
      );
    }
    
    // Espacio vacío para mantener centrado el título
    return <View style={styles.iconButton} />;
  };
  
  /**
   * Renderizar botón derecho
   */
  const renderRightButton = () => {
    if (rightIcon) {
      return (
        <TouchableOpacity
          onPress={onRightPress}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={rightIcon}
            size={24}
            color={textColor}
          />
        </TouchableOpacity>
      );
    }
    
    // Espacio vacío para mantener centrado el título
    return <View style={styles.iconButton} />;
  };
  
  /**
   * Renderizar contenido del título
   */
  const renderTitle = () => {
    return (
      <View style={styles.titleContainer}>
        <Text
          style={[styles.title, { color: textColor }, titleStyle]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.subtitle, { color: textColor }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  };
  
  return (
    <View
      style={[
        styles.container,
        { backgroundColor, paddingTop: insets.top },
        style
      ]}
      {...otherProps}
    >
      {/* StatusBar para Android */}
      {Platform.OS === 'android' && (
        <StatusBar
          backgroundColor={backgroundColor}
          barStyle={textColor === Colors.white ? 'light-content' : 'dark-content'}
        />
      )}
      
      {/* Contenido del header */}
      <View style={styles.content}>
        {/* Botón izquierdo */}
        {renderLeftButton()}
        
        {/* Título */}
        {renderTitle()}
        
        {/* Botón derecho */}
        {renderRightButton()}
      </View>
    </View>
  );
};

// ===== COMPONENTES ESPECIALIZADOS =====

/**
 * Header simple con solo título
 */
export const SimpleHeader = ({ title, ...props }) => (
  <Header
    title={title}
    {...props}
  />
);

/**
 * Header con botón de retroceso
 */
export const BackHeader = ({ title, onBack, ...props }) => (
  <Header
    title={title}
    showBack={true}
    onBack={onBack}
    {...props}
  />
);

/**
 * Header con logo de la app
 */
export const LogoHeader = ({ rightIcon, onRightPress, ...props }) => (
  <Header
    title="AthCyl"
    titleStyle={styles.logoTitle}
    rightIcon={rightIcon}
    onRightPress={onRightPress}
    {...props}
  />
);

// ===== ESTILOS DEL COMPONENTE =====
const styles = StyleSheet.create({
  container: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 2,
  },
  
  logoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

export default Header;