/**
 * Pantalla de Crear/Editar Entrenamiento para AthCyl
 * 
 * Esta pantalla permite a los usuarios crear nuevos entrenamientos manualmente.
 * Incluye todos los campos necesarios con validación.
 * 
 * Características:
 * - Formulario completo para entrenamientos
 * - Validación de campos
 * - Selector de tipo de actividad
 * - Selector de fecha y hora
 * - Cálculos automáticos (velocidad promedio)
 * - Manejo de errores
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importar componentes
import Input from '../../components/Input';
import Button from '../../components/Button';
import Header, { BackHeader } from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';

// Importar servicios
import trainingService, { ACTIVITY_TYPES } from '../../services/trainingService';

// Importar estilos y colores
import { Colors } from '../../config/colors';
import { globalStyles } from '../../styles/globalStyles';

const TrainingScreen = ({ navigation, route }) => {
  // Obtener datos si es edición
  const editingTraining = route?.params?.training;
  const isEditing = !!editingTraining;
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    title: editingTraining?.title || '',
    description: editingTraining?.description || '',
    activityType: editingTraining?.activity_type || 'running',
    date: editingTraining?.date || new Date().toISOString().split('T')[0],
    startTime: editingTraining?.start_time || '08:00',
    duration: editingTraining?.duration || '',
    distance: editingTraining?.distance?.toString() || '',
    calories: editingTraining?.calories?.toString() || '',
    avgSpeed: editingTraining?.avg_speed?.toString() || '',
    maxSpeed: editingTraining?.max_speed?.toString() || '',
    avgHeartRate: editingTraining?.avg_heart_rate?.toString() || '',
    maxHeartRate: editingTraining?.max_heart_rate?.toString() || '',
    elevationGain: editingTraining?.elevation_gain?.toString() || '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  
  /**
   * Actualizar datos del formulario
   */
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
    
    // Calcular velocidad promedio automáticamente
    if (field === 'distance' || field === 'duration') {
      calculateAvgSpeed(
        field === 'distance' ? value : formData.distance,
        field === 'duration' ? value : formData.duration
      );
    }
  };
  
  /**
   * Calcular velocidad promedio basada en distancia y duración
   */
  const calculateAvgSpeed = (distance, duration) => {
    if (distance && duration) {
      const distanceNum = parseFloat(distance);
      const durationParts = duration.split(':');
      
      if (durationParts.length >= 2) {
        const hours = parseInt(durationParts[0]) || 0;
        const minutes = parseInt(durationParts[1]) || 0;
        const seconds = parseInt(durationParts[2]) || 0;
        const totalHours = hours + (minutes / 60) + (seconds / 3600);
        
        if (totalHours > 0 && distanceNum > 0) {
          const avgSpeed = distanceNum / totalHours;
          setFormData(prev => ({
            ...prev,
            avgSpeed: avgSpeed.toFixed(1)
          }));
        }
      }
    }
  };
  
  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Campos obligatorios
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'La hora de inicio es requerida';
    }
    
    // Validar formato de duración
    if (formData.duration) {
      const durationRegex = /^\d{1,2}:\d{2}(:\d{2})?$/;
      if (!durationRegex.test(formData.duration)) {
        newErrors.duration = 'Formato: HH:MM o HH:MM:SS';
      }
    }
    
    // Validar números positivos
    const numericFields = ['distance', 'calories', 'avgSpeed', 'maxSpeed', 'avgHeartRate', 'maxHeartRate', 'elevationGain'];
    numericFields.forEach(field => {
      if (formData[field] && parseFloat(formData[field]) <= 0) {
        newErrors[field] = 'Debe ser un número positivo';
      }
    });
    
    // Validar ritmo cardíaco
    if (formData.avgHeartRate && (parseFloat(formData.avgHeartRate) < 40 || parseFloat(formData.avgHeartRate) > 220)) {
      newErrors.avgHeartRate = 'Valor entre 40 y 220 bpm';
    }
    
    if (formData.maxHeartRate && (parseFloat(formData.maxHeartRate) < 40 || parseFloat(formData.maxHeartRate) > 220)) {
      newErrors.maxHeartRate = 'Valor entre 40 y 220 bpm';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('💾 Guardando entrenamiento...');
      
      const result = isEditing 
        ? await trainingService.updateTraining(editingTraining.id, formData)
        : await trainingService.createTraining(formData);
      
      if (result.success) {
        Alert.alert(
          'Éxito',
          isEditing ? 'Entrenamiento actualizado correctamente' : 'Entrenamiento creado correctamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          result.error || 'No se pudo guardar el entrenamiento',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('❌ Error guardando entrenamiento:', error);
      Alert.alert(
        'Error',
        'Ha ocurrido un error inesperado',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Renderizar selector de tipo de actividad
   */
  const renderActivityPicker = () => (
    <Modal
      visible={showActivityPicker}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tipo de Actividad</Text>
            <TouchableOpacity onPress={() => setShowActivityPicker(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            {Object.entries(ACTIVITY_TYPES).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.activityOption,
                  formData.activityType === key && styles.activityOptionSelected
                ]}
                onPress={() => {
                  updateFormData('activityType', key);
                  setShowActivityPicker(false);
                }}
              >
                <Text style={[
                  styles.activityOptionText,
                  formData.activityType === key && styles.activityOptionTextSelected
                ]}>
                  {label}
                </Text>
                {formData.activityType === key && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  
  return (
    <View style={globalStyles.container}>
      <BackHeader 
        title={isEditing ? 'Editar Entrenamiento' : 'Nuevo Entrenamiento'}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <Input
            label="Título del Entrenamiento"
            placeholder="Ej: Carrera matutina en el parque"
            value={formData.title}
            onChangeText={(value) => updateFormData('title', value)}
            error={errors.title}
            icon="create-outline"
          />
          
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowActivityPicker(true)}
          >
            <Text style={styles.pickerLabel}>Tipo de Actividad</Text>
            <View style={styles.pickerValue}>
              <Text style={styles.pickerValueText}>
                {ACTIVITY_TYPES[formData.activityType]}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
          
          <Input
            label="Descripción (Opcional)"
            placeholder="Añade detalles sobre tu entrenamiento..."
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            multiline={true}
          />
        </View>
        
        {/* Fecha y hora */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fecha y Hora</Text>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Fecha"
                placeholder="YYYY-MM-DD"
                value={formData.date}
                onChangeText={(value) => updateFormData('date', value)}
                error={errors.date}
                icon="calendar-outline"
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Input
                label="Hora de Inicio"
                placeholder="HH:MM"
                value={formData.startTime}
                onChangeText={(value) => updateFormData('startTime', value)}
                error={errors.startTime}
                icon="time-outline"
              />
            </View>
          </View>
          
          <Input
            label="Duración"
            placeholder="HH:MM:SS (ej: 1:30:00)"
            value={formData.duration}
            onChangeText={(value) => updateFormData('duration', value)}
            error={errors.duration}
            icon="timer-outline"
          />
        </View>
        
        {/* Métricas básicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métricas Básicas</Text>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Distancia (km)"
                placeholder="0.0"
                value={formData.distance}
                onChangeText={(value) => updateFormData('distance', value)}
                error={errors.distance}
                keyboardType="numeric"
                icon="location-outline"
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Input
                label="Calorías"
                placeholder="0"
                value={formData.calories}
                onChangeText={(value) => updateFormData('calories', value)}
                error={errors.calories}
                keyboardType="numeric"
                icon="flame-outline"
              />
            </View>
          </View>
        </View>
        
        {/* Velocidad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Velocidad (km/h)</Text>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Velocidad Promedio"
                placeholder="0.0"
                value={formData.avgSpeed}
                onChangeText={(value) => updateFormData('avgSpeed', value)}
                error={errors.avgSpeed}
                keyboardType="numeric"
                icon="speedometer-outline"
                editable={!formData.distance || !formData.duration} // Auto-calculado si hay distancia y duración
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Input
                label="Velocidad Máxima"
                placeholder="0.0"
                value={formData.maxSpeed}
                onChangeText={(value) => updateFormData('maxSpeed', value)}
                error={errors.maxSpeed}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
        
        {/* Ritmo cardíaco */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ritmo Cardíaco (bpm)</Text>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Promedio"
                placeholder="0"
                value={formData.avgHeartRate}
                onChangeText={(value) => updateFormData('avgHeartRate', value)}
                error={errors.avgHeartRate}
                keyboardType="numeric"
                icon="heart-outline"
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Input
                label="Máximo"
                placeholder="0"
                value={formData.maxHeartRate}
                onChangeText={(value) => updateFormData('maxHeartRate', value)}
                error={errors.maxHeartRate}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
        
        {/* Elevación */}
        <View style={styles.section}>
          <Input
            label="Ganancia de Elevación (m)"
            placeholder="0"
            value={formData.elevationGain}
            onChangeText={(value) => updateFormData('elevationGain', value)}
            error={errors.elevationGain}
            keyboardType="numeric"
            icon="trending-up-outline"
          />
        </View>
        
        {/* Botones */}
        <View style={styles.buttonContainer}>
          <Button
            title={isEditing ? 'Actualizar Entrenamiento' : 'Crear Entrenamiento'}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
          />
          
          <Button
            title="Cancelar"
            variant="outline"
            onPress={() => navigation.goBack()}
            disabled={isLoading}
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
      
      {/* Modal selector de actividad */}
      {renderActivityPicker()}
      
      {/* Overlay de carga */}
      {isLoading && (
        <LoadingSpinner
          overlay={true}
          text={isEditing ? 'Actualizando...' : 'Creando entrenamiento...'}
        />
      )}
    </View>
  );
};

// ===== ESTILOS DE LA PANTALLA =====
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  
  section: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  halfWidth: {
    width: '48%',
  },
  
  // Picker de actividad
  pickerButton: {
    marginBottom: 16,
  },
  
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  
  pickerValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
  
  pickerValueText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  
  activityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  
  activityOptionSelected: {
    backgroundColor: Colors.primaryAlpha10,
  },
  
  activityOptionText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  
  activityOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  
  // Botones
  buttonContainer: {
    marginTop: 24,
  },
  
  cancelButton: {
    marginTop: 12,
  },
});

export default TrainingScreen;