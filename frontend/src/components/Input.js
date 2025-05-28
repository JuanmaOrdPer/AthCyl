/**
 * Componente Input reutilizable para AthCyl
 * 
 * Campo de entrada personalizado que mantiene consistencia en toda la aplicación.
 * Soporta diferentes tipos de entrada, validación y estados.
 * 
 * Props disponibles:
 * - label: Etiqueta del campo
 * - placeholder: Texto de placeholder
 * - value: Valor actual del input
 * - onChangeText: Función al cambiar el texto
 * - error: Mensaje de error a mostrar
 * - secureTextEntry: Para campos de contraseña
 * - keyboardType: Tipo de teclado
 * - multiline: Si es un textarea
 * - editable: Si se puede editar
 * - icon: Icono a mostrar
 * - maxLength: Longitud máxima
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importar sistema de colores
import { Colors } from '../config/colors';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  editable = true,
  icon,
  maxLength,
  autoCapitalize = 'none',
  autoCorrect = false,
  returnKeyType = 'done',
  onSubmitEditing,
  style,
  inputStyle,
  ...otherProps
}) => {
  
  // Estado para manejar el foco del input
  const [isFocused, setIsFocused] = useState(false);
  
  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);
  
  /**
   * Manejar cuando el input recibe foco
   */
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  /**
   * Manejar cuando el input pierde foco
   */
  const handleBlur = () => {
    setIsFocused(false);
  };
  
  /**
   * Alternar visibilidad de la contraseña
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  /**
   * Obtener estilos del contenedor del input
   */
  const getInputContainerStyle = () => {
    let containerStyle = [styles.inputContainer];
    
    // Estado enfocado
    if (isFocused) {
      containerStyle.push(styles.inputFocused);
    }
    
    // Estado de error
    if (error) {
      containerStyle.push(styles.inputError);
    }
    
    // Estado deshabilitado
    if (!editable) {
      containerStyle.push(styles.inputDisabled);
    }
    
    // Si es multiline, ajustar altura
    if (multiline) {
      containerStyle.push(styles.inputMultiline);
    }
    
    return containerStyle;
  };
  
  /**
   * Obtener estilos del TextInput
   */
  const getTextInputStyle = () => {
    let textStyle = [styles.textInput];
    
    // Si tiene icono, ajustar padding
    if (icon) {
      textStyle.push(styles.textInputWithIcon);
    }
    
    // Si es multiline, ajustar alignment
    if (multiline) {
      textStyle.push(styles.textInputMultiline);
    }
    
    // Estilos personalizados
    if (inputStyle) {
      textStyle.push(inputStyle);
    }
    
    return textStyle;
  };
  
  return (
    <View style={[styles.container, style]}>
      {/* Etiqueta del campo */}
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      
      {/* Contenedor del input */}
      <View style={getInputContainerStyle()}>
        {/* Icono izquierdo */}
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isFocused ? Colors.primary : Colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        
        {/* Campo de texto */}
        <TextInput
          style={getTextInputStyle()}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          editable={editable}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          {...otherProps}
        />
        
        {/* Botón para mostrar/ocultar contraseña */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.passwordToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Mensaje de error */}
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
      
      {/* Contador de caracteres (si hay maxLength) */}
      {maxLength && value && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

// ===== ESTILOS DEL COMPONENTE =====
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
    minHeight: 50,
  },
  
  inputFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  
  inputDisabled: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray300,
  },
  
  inputMultiline: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  textInputWithIcon: {
    paddingLeft: 8,
  },
  
  textInputMultiline: {
    textAlignVertical: 'top',
    minHeight: 76,
  },
  
  leftIcon: {
    marginLeft: 16,
  },
  
  passwordToggle: {
    padding: 16,
  },
  
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    marginHorizontal: 4,
  },
  
  characterCount: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
    marginHorizontal: 4,
  },
});

export default Input;