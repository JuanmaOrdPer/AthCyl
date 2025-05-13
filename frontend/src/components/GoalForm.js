import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, Divider, Chip, useTheme, Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getActivityName, getActivityIcon } from '../utils/helpers';

/**
 * Componente de formulario para crear o editar objetivos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.initialValues - Valores iniciales del formulario (para edición)
 * @param {Function} props.onSubmit - Función a ejecutar al enviar el formulario
 * @param {Function} props.onCancel - Función a ejecutar al cancelar
 * @param {boolean} props.isEdit - Indica si es una edición o creación
 */
const GoalForm = ({ initialValues = {}, onSubmit, onCancel, isEdit = false }) => {
  const theme = useTheme();
  
  // Estado del formulario
  const [title, setTitle] = useState(initialValues.title || '');
  const [goalType, setGoalType] = useState(initialValues.goal_type || 'distance');
  const [activityType, setActivityType] = useState(initialValues.activity_type || '');
  const [targetValue, setTargetValue] = useState(
    initialValues.target_value ? initialValues.target_value.toString() : ''
  );
  const [endDate, setEndDate] = useState(
    initialValues.end_date ? new Date(initialValues.end_date) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Menús desplegables
  const [goalTypeMenuVisible, setGoalTypeMenuVisible] = useState(false);
  const [activityTypeMenuVisible, setActivityTypeMenuVisible] = useState(false);
  
  // Validación
  const [errors, setErrors] = useState({});
  
  // Opciones para los tipos de objetivo
  const goalTypeOptions = [
    { value: 'distance', label: 'Distancia (km)', icon: 'speedometer' },
    { value: 'duration', label: 'Tiempo (minutos)', icon: 'time' },
    { value: 'calories', label: 'Calorías', icon: 'flame' },
    { value: 'elevation', label: 'Desnivel (m)', icon: 'trending-up' },
    { value: 'count', label: 'Número de sesiones', icon: 'fitness' },
  ];
  
  // Opciones para los tipos de actividad
  const activityTypeOptions = [
    { value: '', label: 'Todas las actividades', icon: 'apps' },
    { value: 'running', label: 'Correr', icon: 'run' },
    { value: 'cycling', label: 'Ciclismo', icon: 'bicycle' },
    { value: 'swimming', label: 'Natación', icon: 'water' },
    { value: 'walking', label: 'Caminar', icon: 'walk' },
    { value: 'hiking', label: 'Senderismo', icon: 'trending-up' },
  ];
  
  // Obtener etiqueta para el tipo de objetivo seleccionado
  const getGoalTypeLabel = () => {
    const option = goalTypeOptions.find(opt => opt.value === goalType);
    return option ? option.label : 'Seleccionar tipo';
  };
  
  // Obtener etiqueta para el tipo de actividad seleccionado
  const getActivityTypeLabel = () => {
    if (!activityType) return 'Todas las actividades';
    return getActivityName(activityType);
  };
  
  // Obtener icono para el tipo de objetivo seleccionado
  const getGoalTypeIcon = () => {
    const option = goalTypeOptions.find(opt => opt.value === goalType);
    return option ? option.icon : 'help-circle';
  };
  
  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!targetValue) {
      newErrors.targetValue = 'El valor objetivo es obligatorio';
    } else if (isNaN(parseFloat(targetValue)) || parseFloat(targetValue) <= 0) {
      newErrors.targetValue = 'El valor debe ser un número positivo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Manejar el envío del formulario
  const handleSubmit = () => {
    if (validateForm()) {
      const goalData = {
        title,
        goal_type: goalType,
        activity_type: activityType || null,
        target_value: parseFloat(targetValue),
        end_date: endDate ? endDate.toISOString().split('T')[0] : null,
      };
      
      onSubmit(goalData);
    }
  };
  
  // Manejar cambio de fecha
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{isEdit ? 'Editar Objetivo' : 'Nuevo Objetivo'}</Text>
      
      {/* Título */}
      <TextInput
        label="Título (opcional)"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        mode="outlined"
      />
      
      {/* Tipo de objetivo */}
      <Text style={styles.label}>Tipo de objetivo</Text>
      <View style={styles.menuContainer}>
        <Button 
          mode="outlined" 
          onPress={() => setGoalTypeMenuVisible(true)}
          style={styles.dropdown}
          icon={() => <Ionicons name={getGoalTypeIcon()} size={20} color={theme.colors.primary} />}
          contentStyle={styles.dropdownContent}
        >
          {getGoalTypeLabel()}
        </Button>
        
        <Menu
          visible={goalTypeMenuVisible}
          onDismiss={() => setGoalTypeMenuVisible(false)}
          anchor={{ x: 16, y: 270 }}
        >
          {goalTypeOptions.map((option) => (
            <Menu.Item
              key={option.value}
              onPress={() => {
                setGoalType(option.value);
                setGoalTypeMenuVisible(false);
              }}
              title={option.label}
              leadingIcon={() => <Ionicons name={option.icon} size={20} color={theme.colors.primary} />}
            />
          ))}
        </Menu>
      </View>
      
      {/* Tipo de actividad */}
      <Text style={styles.label}>Tipo de actividad</Text>
      <View style={styles.menuContainer}>
        <Button 
          mode="outlined" 
          onPress={() => setActivityTypeMenuVisible(true)}
          style={styles.dropdown}
          icon={() => <Ionicons name={activityType ? getActivityIcon(activityType) : 'apps'} size={20} color={theme.colors.primary} />}
          contentStyle={styles.dropdownContent}
        >
          {getActivityTypeLabel()}
        </Button>
        
        <Menu
          visible={activityTypeMenuVisible}
          onDismiss={() => setActivityTypeMenuVisible(false)}
          anchor={{ x: 16, y: 340 }}
        >
          {activityTypeOptions.map((option) => (
            <Menu.Item
              key={option.value}
              onPress={() => {
                setActivityType(option.value);
                setActivityTypeMenuVisible(false);
              }}
              title={option.label}
              leadingIcon={() => <Ionicons name={option.icon} size={20} color={theme.colors.primary} />}
            />
          ))}
        </Menu>
      </View>
      
      {/* Valor objetivo */}
      <TextInput
        label={`Valor objetivo (${goalType === 'distance' ? 'km' : 
          goalType === 'duration' ? 'minutos' : 
          goalType === 'calories' ? 'kcal' : 
          goalType === 'elevation' ? 'm' : 
          'sesiones'})`}
        value={targetValue}
        onChangeText={setTargetValue}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
        error={!!errors.targetValue}
      />
      {errors.targetValue && (
        <HelperText type="error" visible={!!errors.targetValue}>
          {errors.targetValue}
        </HelperText>
      )}
      
      {/* Fecha límite */}
      <Text style={styles.label}>Fecha límite (opcional)</Text>
      <View style={styles.dateContainer}>
        <Button 
          mode="outlined" 
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
          icon="calendar"
        >
          {endDate ? endDate.toLocaleDateString('es-ES') : 'Sin fecha límite'}
        </Button>
        
        {endDate && (
          <Button 
            mode="text" 
            onPress={() => setEndDate(null)}
            style={styles.clearButton}
            icon="close"
          >
            Quitar
          </Button>
        )}
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
      
      <Divider style={styles.divider} />
      
      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        <Button 
          mode="outlined" 
          onPress={onCancel} 
          style={[styles.button, styles.cancelButton]}
        >
          Cancelar
        </Button>
        <Button 
          mode="contained" 
          onPress={handleSubmit} 
          style={styles.button}
        >
          {isEdit ? 'Guardar cambios' : 'Crear objetivo'}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  menuContainer: {
    marginBottom: 16,
  },
  dropdown: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  dropdownContent: {
    justifyContent: 'flex-start',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
  },
  clearButton: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: '#999',
  },
});

export default GoalForm;
