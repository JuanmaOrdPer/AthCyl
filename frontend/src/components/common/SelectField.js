// src/components/common/SelectField.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Menu, HelperText } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente de selección desplegable
 * @param {Object} props - Propiedades del componente
 */
const SelectField = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  error,
  touched,
  iconName,
  style = {} 
}) => {
  const [visible, setVisible] = useState(false);
  
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  
  const handleSelect = (option) => {
    onChange(option.value);
    closeMenu();
  };
  
  // Encontrar la opción seleccionada
  const selectedOption = options.find(opt => opt.value === value) || { label: 'Seleccionar' };
  
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button 
            mode="outlined" 
            onPress={openMenu}
            style={styles.button}
            icon={() => iconName ? (
              <Ionicons name={iconName} size={20} color="#666" />
            ) : null}
          >
            {selectedOption.label}
          </Button>
        }
      >
        {options.map((option) => (
          <Menu.Item
            key={option.value}
            onPress={() => handleSelect(option)}
            title={option.label}
            leadingIcon={option.icon}
          />
        ))}
      </Menu>
      
      {touched && error && <HelperText type="error">{error}</HelperText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  button: {
    width: '100%',
    justifyContent: 'flex-start',
  },
});

export default React.memo(SelectField);