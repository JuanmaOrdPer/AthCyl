// src/components/common/DatePickerField.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, HelperText } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { datePickerFieldStyles as styles, commonStyles } from '../../styles';

/**
 * Componente para selección de fechas
 * @param {Object} props - Propiedades del componente
 */
const DatePickerField = ({ 
  label, 
  value, 
  onChange, 
  error,
  touched,
  minimumDate,
  maximumDate,
  style = {} 
}) => {
  const [showPicker, setShowPicker] = useState(false);
  
  const handleChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <Button 
        mode="outlined" 
        onPress={() => setShowPicker(true)}
        style={styles.button}
        icon="calendar"
      >
        {value ? value.toLocaleDateString() : 'Seleccionar fecha'}
      </Button>
      
      {touched && error && <HelperText type="error">{error}</HelperText>}
      
      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
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
  },
});

export default React.memo(DatePickerField);