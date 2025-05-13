import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, Divider, Chip, useTheme, Menu, Switch } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { getActivityName, getActivityIcon } from '../utils/helpers';

/**
 * Componente de formulario para crear o editar entrenamientos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.initialValues - Valores iniciales del formulario (para edición)
 * @param {Function} props.onSubmit - Función a ejecutar al enviar el formulario
 * @param {Function} props.onCancel - Función a ejecutar al cancelar
 * @param {boolean} props.isEdit - Indica si es una edición o creación
 */
const TrainingForm = ({ initialValues = {}, onSubmit, onCancel, isEdit = false }) => {
  const theme = useTheme();
  
  // Estado del formulario
  const [title, setTitle] = useState(initialValues.title || '');
  const [activityType, setActivityType] = useState(initialValues.activity_type || 'running');
  const [date, setDate] = useState(
    initialValues.date ? new Date(initialValues.date) : new Date()
  );
  const [distance, setDistance] = useState(
    initialValues.distance ? initialValues.distance.toString() : ''
  );
  const [duration, setDuration] = useState(initialValues.duration || '00:30:00');
  const [calories, setCalories] = useState(
    initialValues.calories ? initialValues.calories.toString() : ''
  );
  const [elevationGain, setElevationGain] = useState(
    initialValues.elevation_gain ? initialValues.elevation_gain.toString() : ''
  );
  const [avgHeartRate, setAvgHeartRate] = useState(
    initialValues.avg_heart_rate ? initialValues.avg_heart_rate.toString() : ''
  );
  const [maxHeartRate, setMaxHeartRate] = useState(
    initialValues.max_heart_rate ? initialValues.max_heart_rate.toString() : ''
  );
  const [notes, setNotes] = useState(initialValues.notes || '');
  const [gpxFile, setGpxFile] = useState(null);
  
  // Estado para los pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [activityTypeMenuVisible, setActivityTypeMenuVisible] = useState(false);
  
  // Estado para la duración (horas, minutos, segundos)
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);
  
  // Validación
  const [errors, setErrors] = useState({});
  
  // Opciones para los tipos de actividad
  const activityTypeOptions = [
    { value: 'running', label: 'Correr', icon: 'run' },
    { value: 'cycling', label: 'Ciclismo', icon: 'bicycle' },
    { value: 'swimming', label: 'Natación', icon: 'water' },
    { value: 'walking', label: 'Caminar', icon: 'walk' },
    { value: 'hiking', label: 'Senderismo', icon: 'trending-up' },
    { value: 'other', label: 'Otro', icon: 'fitness' },
  ];
  
  // Inicializar la duración al cargar el componente
  useEffect(() => {
    if (initialValues.duration) {
      const parts = initialValues.duration.split(':');
      setHours(parseInt(parts[0]) || 0);
      setMinutes(parseInt(parts[1]) || 0);
      setSeconds(parseInt(parts[2]) || 0);
    }
  }, [initialValues]);
  
  // Actualizar la duración cuando cambien las horas, minutos o segundos
  useEffect(() => {
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    setDuration(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
  }, [hours, minutes, seconds]);
  
  // Manejar cambio de fecha
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  // Seleccionar archivo GPX
  const pickGpxFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/gpx+xml', 'application/xml', 'text/xml', '*/*'],
        copyToCacheDirectory: true,
      });
      
      if (result.type === 'success') {
        setGpxFile(result);
      }
    } catch (error) {
      console.error('Error al seleccionar el archivo GPX:', error);
    }
  };
  
  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!activityType) {
      newErrors.activityType = 'El tipo de actividad es obligatorio';
    }
    
    if (distance && (isNaN(parseFloat(distance)) || parseFloat(distance) <= 0)) {
      newErrors.distance = 'La distancia debe ser un número positivo';
    }
    
    if (!duration || duration === '00:00:00') {
      newErrors.duration = 'La duración es obligatoria';
    }
    
    if (calories && (isNaN(parseInt(calories)) || parseInt(calories) < 0)) {
      newErrors.calories = 'Las calorías deben ser un número positivo o cero';
    }
    
    if (elevationGain && (isNaN(parseInt(elevationGain)) || parseInt(elevationGain) < 0)) {
      newErrors.elevationGain = 'El desnivel debe ser un número positivo o cero';
    }
    
    if (avgHeartRate && (isNaN(parseInt(avgHeartRate)) || parseInt(avgHeartRate) <= 0 || parseInt(avgHeartRate) > 250)) {
      newErrors.avgHeartRate = 'La frecuencia cardíaca debe estar entre 1 y 250';
    }
    
    if (maxHeartRate && (isNaN(parseInt(maxHeartRate)) || parseInt(maxHeartRate) <= 0 || parseInt(maxHeartRate) > 250)) {
      newErrors.maxHeartRate = 'La frecuencia cardíaca máxima debe estar entre 1 y 250';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Manejar el envío del formulario
  const handleSubmit = () => {
    if (validateForm()) {
      const trainingData = {
        title,
        activity_type: activityType,
        date: date.toISOString().split('T')[0],
        duration,
        distance: distance ? parseFloat(distance) : null,
        calories: calories ? parseInt(calories) : null,
        elevation_gain: elevationGain ? parseInt(elevationGain) : null,
        avg_heart_rate: avgHeartRate ? parseInt(avgHeartRate) : null,
        max_heart_rate: maxHeartRate ? parseInt(maxHeartRate) : null,
        notes,
        gpx_file: gpxFile,
      };
      
      onSubmit(trainingData);
    }
  };
  
  // Renderizar el selector de duración
  const renderDurationPicker = () => {
    return (
      <View style={styles.durationPickerContainer}>
        <Text style={styles.durationPickerTitle}>Seleccionar duración</Text>
        
        <View style={styles.durationPickerControls}>
          <View style={styles.durationPickerItem}>
            <Text style={styles.durationPickerLabel}>Horas</Text>
            <View style={styles.durationPickerButtons}>
              <Button 
                mode="contained" 
                onPress={() => setHours(Math.max(0, hours - 1))}
                style={styles.durationButton}
                disabled={hours <= 0}
              >
                -
              </Button>
              <Text style={styles.durationValue}>{hours}</Text>
              <Button 
                mode="contained" 
                onPress={() => setHours(Math.min(99, hours + 1))}
                style={styles.durationButton}
                disabled={hours >= 99}
              >
                +
              </Button>
            </View>
          </View>
          
          <View style={styles.durationPickerItem}>
            <Text style={styles.durationPickerLabel}>Minutos</Text>
            <View style={styles.durationPickerButtons}>
              <Button 
                mode="contained" 
                onPress={() => setMinutes(Math.max(0, minutes - 1))}
                style={styles.durationButton}
                disabled={minutes <= 0}
              >
                -
              </Button>
              <Text style={styles.durationValue}>{minutes}</Text>
              <Button 
                mode="contained" 
                onPress={() => setMinutes(Math.min(59, minutes + 1))}
                style={styles.durationButton}
                disabled={minutes >= 59}
              >
                +
              </Button>
            </View>
          </View>
          
          <View style={styles.durationPickerItem}>
            <Text style={styles.durationPickerLabel}>Segundos</Text>
            <View style={styles.durationPickerButtons}>
              <Button 
                mode="contained" 
                onPress={() => setSeconds(Math.max(0, seconds - 1))}
                style={styles.durationButton}
                disabled={seconds <= 0}
              >
                -
              </Button>
              <Text style={styles.durationValue}>{seconds}</Text>
              <Button 
                mode="contained" 
                onPress={() => setSeconds(Math.min(59, seconds + 1))}
                style={styles.durationButton}
                disabled={seconds >= 59}
              >
                +
              </Button>
            </View>
          </View>
        </View>
        
        <Button 
          mode="contained" 
          onPress={() => setShowDurationPicker(false)}
          style={styles.durationDoneButton}
        >
          Aceptar
        </Button>
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{isEdit ? 'Editar Entrenamiento' : 'Nuevo Entrenamiento'}</Text>
      
      {/* Título */}
      <TextInput
        label="Título (opcional)"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        mode="outlined"
      />
      
      {/* Tipo de actividad */}
      <Text style={styles.label}>Tipo de actividad</Text>
      <View style={styles.menuContainer}>
        <Button 
          mode="outlined" 
          onPress={() => setActivityTypeMenuVisible(true)}
          style={styles.dropdown}
          icon={() => <Ionicons name={getActivityIcon(activityType)} size={20} color={theme.colors.primary} />}
          contentStyle={styles.dropdownContent}
        >
          {getActivityName(activityType)}
        </Button>
        
        <Menu
          visible={activityTypeMenuVisible}
          onDismiss={() => setActivityTypeMenuVisible(false)}
          anchor={{ x: 16, y: 200 }}
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
      
      {/* Fecha */}
      <Text style={styles.label}>Fecha</Text>
      <View style={styles.dateContainer}>
        <Button 
          mode="outlined" 
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
          icon="calendar"
        >
          {date.toLocaleDateString('es-ES')}
        </Button>
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
      
      {/* Duración */}
      <Text style={styles.label}>Duración</Text>
      <View style={styles.dateContainer}>
        <Button 
          mode="outlined" 
          onPress={() => setShowDurationPicker(true)}
          style={styles.dateButton}
          icon="clock"
        >
          {duration}
        </Button>
      </View>
      
      {showDurationPicker && renderDurationPicker()}
      
      {errors.duration && (
        <HelperText type="error" visible={!!errors.duration}>
          {errors.duration}
        </HelperText>
      )}
      
      {/* Distancia */}
      <TextInput
        label="Distancia (km)"
        value={distance}
        onChangeText={setDistance}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
        error={!!errors.distance}
      />
      {errors.distance && (
        <HelperText type="error" visible={!!errors.distance}>
          {errors.distance}
        </HelperText>
      )}
      
      {/* Calorías */}
      <TextInput
        label="Calorías (opcional)"
        value={calories}
        onChangeText={setCalories}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
        error={!!errors.calories}
      />
      {errors.calories && (
        <HelperText type="error" visible={!!errors.calories}>
          {errors.calories}
        </HelperText>
      )}
      
      {/* Desnivel */}
      <TextInput
        label="Desnivel (m) (opcional)"
        value={elevationGain}
        onChangeText={setElevationGain}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
        error={!!errors.elevationGain}
      />
      {errors.elevationGain && (
        <HelperText type="error" visible={!!errors.elevationGain}>
          {errors.elevationGain}
        </HelperText>
      )}
      
      {/* Frecuencia cardíaca media */}
      <TextInput
        label="Frecuencia cardíaca media (ppm) (opcional)"
        value={avgHeartRate}
        onChangeText={setAvgHeartRate}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
        error={!!errors.avgHeartRate}
      />
      {errors.avgHeartRate && (
        <HelperText type="error" visible={!!errors.avgHeartRate}>
          {errors.avgHeartRate}
        </HelperText>
      )}
      
      {/* Frecuencia cardíaca máxima */}
      <TextInput
        label="Frecuencia cardíaca máxima (ppm) (opcional)"
        value={maxHeartRate}
        onChangeText={setMaxHeartRate}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
        error={!!errors.maxHeartRate}
      />
      {errors.maxHeartRate && (
        <HelperText type="error" visible={!!errors.maxHeartRate}>
          {errors.maxHeartRate}
        </HelperText>
      )}
      
      {/* Notas */}
      <TextInput
        label="Notas (opcional)"
        value={notes}
        onChangeText={setNotes}
        style={styles.input}
        mode="outlined"
        multiline
        numberOfLines={4}
      />
      
      {/* Archivo GPX */}
      <Text style={styles.label}>Archivo GPX (opcional)</Text>
      <View style={styles.gpxContainer}>
        <Button 
          mode="outlined" 
          onPress={pickGpxFile}
          style={styles.gpxButton}
          icon="file-upload"
        >
          {gpxFile ? gpxFile.name : 'Seleccionar archivo GPX'}
        </Button>
        
        {gpxFile && (
          <Button 
            mode="text" 
            onPress={() => setGpxFile(null)}
            style={styles.clearButton}
            icon="close"
          >
            Quitar
          </Button>
        )}
      </View>
      
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
          {isEdit ? 'Guardar cambios' : 'Guardar entrenamiento'}
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
  durationPickerContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  durationPickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  durationPickerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  durationPickerItem: {
    alignItems: 'center',
    width: '30%',
  },
  durationPickerLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  durationPickerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationButton: {
    width: 36,
    height: 36,
  },
  durationValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
  },
  durationDoneButton: {
    marginTop: 8,
  },
  gpxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gpxButton: {
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: '#999',
  },
});

export default TrainingForm;
