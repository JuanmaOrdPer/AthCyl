// src/components/common/FormField.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { formFieldStyles as styles, commonStyles } from '../../styles';

/**
 * Componente de campo de formulario reutilizable
 * @param {Object} props - Propiedades del componente
 */
const FormField = ({ 
  label, 
  value, 
  onChangeText, 
  error, 
  touched,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  style = {},
  ...props 
}) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        secureTextEntry={secureTextEntry}
        error={touched && !!error}
        {...props}
      />
      {touched && error && <HelperText type="error">{error}</HelperText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
});

export default React.memo(FormField);