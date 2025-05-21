import React, { useState } from 'react';
import { View, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Title, Text, Card, useTheme, HelperText, Menu, Divider, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../services/api';
import { addTrainingScreenStyles as styles, commonStyles } from '../../styles';

const AddTrainingScreen = ({ navigation }) => {
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_type: 'running',
    date: new Date(),
    start_time: new Date(),
    duration: '',
    distance: '',
    avg_speed: '',
    max_speed: '',
    avg_heart_rate: '',
    max_heart_rate: '',
    elevation_gain: '',
    calories: '',
  });
  
  const [gpxFile, setGpxFile] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activityMenuVisible, setActivityMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const activityTypes = [
    { value: 'running', label: 'Correr' },
    { value: 'cycling', label: 'Ciclismo' },
    { value: 'swimming', label: 'Natación' },
    { value: 'walking', label: 'Caminar' },
    { value: 'hiking', label: 'Senderismo' },
    { value: 'other', label: 'Otro' },
  ];
  
  const getActivityLabel = (value) => {
    const activity = activityTypes.find(a => a.value === value);
    return activity ? activity.label : 'Seleccionar';
  };
  
  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Limpiar error al modificar el campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };
  
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('date', selectedDate);
    }
  };
  
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      handleInputChange('start_time', selectedTime);
    }
  };
  
  const handleSelectActivity = (activity) => {
    handleInputChange('activity_type', activity);
    setActivityMenuVisible(false);
  };
  
  const handlePickGpxFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/gpx+xml', 'application/xml', 'text/xml'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      const fileUri = result.assets[0].uri;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (fileInfo.size > 10 * 1024 * 1024) {
        Alert.alert('Error', 'El archivo es demasiado grande. El tamaño máximo es de 10MB.');
        return;
      }
      
      setGpxFile({
        uri: fileUri,
        name: result.assets[0].name,
        type: 'application/gpx+xml',
      });
      
      Alert.alert('Éxito', 'Archivo GPX seleccionado correctamente');
    } catch (error) {
      console.error('Error al seleccionar archivo GPX:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo GPX');
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria';
    }
    
    if (!formData.start_time) {
      newErrors.start_time = 'La hora de inicio es obligatoria';
    }
    
    if (formData.distance && isNaN(parseFloat(formData.distance))) {
      newErrors.distance = 'La distancia debe ser un número';
    }
    
    if (formData.duration) {
      // Validar formato de duración (HH:MM:SS o MM:SS)
      const durationRegex = /^(\d+:)?[0-5]?\d:[0-5]\d$/;
      if (!durationRegex.test(formData.duration)) {
        newErrors.duration = 'Formato inválido. Use HH:MM:SS o MM:SS';
      }
    }
    
    if (formData.avg_speed && isNaN(parseFloat(formData.avg_speed))) {
      newErrors.avg_speed = 'La velocidad promedio debe ser un número';
    }
    
    if (formData.max_speed && isNaN(parseFloat(formData.max_speed))) {
      newErrors.max_speed = 'La velocidad máxima debe ser un número';
    }
    
    if (formData.avg_heart_rate && isNaN(parseInt(formData.avg_heart_rate))) {
      newErrors.avg_heart_rate = 'El ritmo cardíaco promedio debe ser un número entero';
    }
    
    if (formData.max_heart_rate && isNaN(parseInt(formData.max_heart_rate))) {
      newErrors.max_heart_rate = 'El ritmo cardíaco máximo debe ser un número entero';
    }
    
    if (formData.elevation_gain && isNaN(parseFloat(formData.elevation_gain))) {
      newErrors.elevation_gain = 'El desnivel debe ser un número';
    }
    
    if (formData.calories && isNaN(parseInt(formData.calories))) {
      newErrors.calories = 'Las calorías deben ser un número entero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor, corrige los errores en el formulario');
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar datos para enviar
      const data = new FormData();
      
      // Añadir campos de texto
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('activity_type', formData.activity_type);
      data.append('date', formData.date.toISOString().split('T')[0]);
      
      // Formatear hora
      const hours = formData.start_time.getHours().toString().padStart(2, '0');
      const minutes = formData.start_time.getMinutes().toString().padStart(2, '0');
      data.append('start_time', `${hours}:${minutes}:00`);
      
      // Añadir campos numéricos si tienen valor
      if (formData.duration) data.append('duration', formData.duration);
      if (formData.distance) data.append('distance', formData.distance);
      if (formData.avg_speed) data.append('avg_speed', formData.avg_speed);
      if (formData.max_speed) data.append('max_speed', formData.max_speed);
      if (formData.avg_heart_rate) data.append('avg_heart_rate', formData.avg_heart_rate);
      if (formData.max_heart_rate) data.append('max_heart_rate', formData.max_heart_rate);
      if (formData.elevation_gain) data.append('elevation_gain', formData.elevation_gain);
      if (formData.calories) data.append('calories', formData.calories);
      
      // Añadir archivo GPX si existe
      if (gpxFile) {
        data.append('gpx_file', gpxFile);
      }
      
      // Enviar datos al servidor
      const response = await api.post('/api/trainings/trainings/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      Alert.alert('Éxito', 'Entrenamiento guardado correctamente');
      
      // Navegar a la pantalla de detalle del nuevo entrenamiento
      navigation.replace('TrainingDetail', { trainingId: response.data.id });
      
    } catch (error) {
      console.error('Error al guardar entrenamiento:', error);
      Alert.alert('Error', 'No se pudo guardar el entrenamiento');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Title style={styles.title}>Nuevo Entrenamiento</Title>
      
      {/* Información básica */}
      <Card style={styles.card}>
        <Card.Title title="Información Básica" />
        <Card.Content>
          <TextInput
            label="Título *"
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            mode="outlined"
            style={styles.input}
            error={!!errors.title}
          />
          {errors.title && <HelperText type="error">{errors.title}</HelperText>}
          
          <TextInput
            label="Descripción"
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          
          <View style={styles.menuContainer}>
            <Text style={styles.inputLabel}>Tipo de Actividad *</Text>
            <Menu
              visible={activityMenuVisible}
              onDismiss={() => setActivityMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setActivityMenuVisible(true)}
                  style={styles.dropdown}
                  icon="chevron-down"
                  contentStyle={styles.dropdownContent}
                >
                  {getActivityLabel(formData.activity_type)}
                </Button>
              }
            >
              {activityTypes.map((activity) => (
                <Menu.Item
                  key={activity.value}
                  onPress={() => handleSelectActivity(activity.value)}
                  title={activity.label}
                />
              ))}
            </Menu>
          </View>
          
          <View style={styles.dateContainer}>
            <View style={styles.dateField}>
              <Text style={styles.inputLabel}>Fecha *</Text>
              <Button 
                mode="outlined" 
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
                icon="calendar"
              >
                {formData.date.toLocaleDateString()}
              </Button>
              {errors.date && <HelperText type="error">{errors.date}</HelperText>}
            </View>
            
            <View style={styles.dateField}>
              <Text style={styles.inputLabel}>Hora de Inicio *</Text>
              <Button 
                mode="outlined" 
                onPress={() => setShowTimePicker(true)}
                style={styles.dateButton}
                icon="clock-outline"
              >
                {formData.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Button>
              {errors.start_time && <HelperText type="error">{errors.start_time}</HelperText>}
            </View>
          </View>
          
          {showDatePicker && (
            <DateTimePicker
              value={formData.date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          
          {showTimePicker && (
            <DateTimePicker
              value={formData.start_time}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </Card.Content>
      </Card>
      
      {/* Archivo GPX */}
      <Card style={styles.card}>
        <Card.Title title="Archivo GPX" />
        <Card.Content>
          <Text style={styles.gpxText}>
            Puedes subir un archivo GPX para importar automáticamente los datos de tu entrenamiento.
          </Text>
          
          <Button 
            mode="contained" 
            onPress={handlePickGpxFile}
            icon="file-upload-outline"
            style={styles.gpxButton}
          >
            Seleccionar Archivo GPX
          </Button>
          
          {gpxFile && (
            <View style={styles.fileInfo}>
              <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.fileName}>{gpxFile.name}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
      
      {/* Métricas manuales */}
      <Card style={styles.card}>
        <Card.Title title="Métricas Manuales" subtitle="Opcional si subes un archivo GPX" />
        <Card.Content>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <TextInput
                label="Duración (HH:MM:SS)"
                value={formData.duration}
                onChangeText={(text) => handleInputChange('duration', text)}
                mode="outlined"
                style={styles.input}
                error={!!errors.duration}
                keyboardType="default"
              />
              {errors.duration && <HelperText type="error">{errors.duration}</HelperText>}
            </View>
            
            <View style={styles.halfInput}>
              <TextInput
                label="Distancia (km)"
                value={formData.distance}
                onChangeText={(text) => handleInputChange('distance', text)}
                mode="outlined"
                style={styles.input}
                error={!!errors.distance}
                keyboardType="decimal-pad"
              />
              {errors.distance && <HelperText type="error">{errors.distance}</HelperText>}
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <TextInput
                label="Velocidad Media (km/h)"
                value={formData.avg_speed}
                onChangeText={(text) => handleInputChange('avg_speed', text)}
                mode="outlined"
                style={styles.input}
                error={!!errors.avg_speed}
                keyboardType="decimal-pad"
              />
              {errors.avg_speed && <HelperText type="error">{errors.avg_speed}</HelperText>}
            </View>
            
            <View style={styles.halfInput}>
              <TextInput
                label="Velocidad Máxima (km/h)"
                value={formData.max_speed}
                onChangeText={(text) => handleInputChange('max_speed', text)}
                mode="outlined"
                style={styles.input}
                error={!!errors.max_speed}
                keyboardType="decimal-pad"
              />
              {errors.max_speed && <HelperText type="error">{errors.max_speed}</HelperText>}
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <TextInput
                label="FC Media (ppm)"
                value={formData.avg_heart_rate}
                onChangeText={(text) => handleInputChange('avg_heart_rate', text)}
                mode="outlined"
                style={styles.input}
                error={!!errors.avg_heart_rate}
                keyboardType="number-pad"
              />
              {errors.avg_heart_rate && <HelperText type="error">{errors.avg_heart_rate}</HelperText>}
            </View>
            
            <View style={styles.halfInput}>
              <TextInput
                label="FC Máxima (ppm)"
                value={formData.max_heart_rate}
                onChangeText={(text) => handleInputChange('max_heart_rate', text)}
                mode="outlined"
                style={styles.input}
                error={!!errors.max_heart_rate}
                keyboardType="number-pad"
              />
              {errors.max_heart_rate && <HelperText type="error">{errors.max_heart_rate}</HelperText>}
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <TextInput
                label="Desnivel (m)"
                value={formData.elevation_gain}
                onChangeText={(text) => handleInputChange('elevation_gain', text)}
                mode="outlined"
                style={styles.input}
                error={!!errors.elevation_gain}
                keyboardType="decimal-pad"
              />
              {errors.elevation_gain && <HelperText type="error">{errors.elevation_gain}</HelperText>}
            </View>
            
            <View style={styles.halfInput}>
              <TextInput
                label="Calorías (kcal)"
                value={formData.calories}
                onChangeText={(text) => handleInputChange('calories', text)}
                mode="outlined"
                style={styles.input}
                error={!!errors.calories}
                keyboardType="number-pad"
              />
              {errors.calories && <HelperText type="error">{errors.calories}</HelperText>}
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="outlined" 
          onPress={() => navigation.goBack()}
          style={[styles.button, styles.cancelButton]}
          disabled={loading}
        >
          Cancelar
        </Button>
        
        <Button 
          mode="contained" 
          onPress={handleSubmit}
          style={[styles.button, styles.saveButton]}
          loading={loading}
          disabled={loading}
        >
          Guardar
        </Button>
      </View>
    </ScrollView>
  );
};

export default AddTrainingScreen;
