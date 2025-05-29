/**
 * Pantalla de Crear/Editar Entrenamiento para AthCyl - COMPLETO CON SOPORTE GPX/TCX
 * 
 * Esta pantalla permite a los usuarios:
 * - Crear entrenamientos manualmente
 * - Importar entrenamientos desde archivos GPX/TCX/FIT
 * - Editar entrenamientos existentes
 * - Auto-completar campos desde archivos GPS
 * 
 * Características:
 * - Formulario completo para entrenamientos
 * - Selector de archivos GPX/TCX/FIT
 * - Procesamiento automático de archivos
 * - Auto-llenado de campos desde archivo
 * - Validación de campos y archivos
 * - Indicadores visuales de progreso
 * - Manejo de errores completo
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
import * as DocumentPicker from 'expo-document-picker';

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
  
  // Estados para archivos GPX/TCX
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileProcessed, setFileProcessed] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [processingFile, setProcessingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  /**
   * Seleccionar archivo GPX/TCX/FIT
   */
  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'], // Permitir todos los tipos por compatibilidad
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Verificar extensión del archivo
        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.gpx') && !fileName.endsWith('.tcx') && !fileName.endsWith('.fit')) {
          Alert.alert(
            'Archivo no válido',
            'Por favor selecciona un archivo GPX, TCX o FIT.\n\n' +
            'Estos archivos los puedes obtener de aplicaciones como Strava, Garmin Connect, o tu dispositivo GPS.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        // Verificar tamaño del archivo (máximo 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB en bytes
        if (file.size > maxSize) {
          Alert.alert(
            'Archivo demasiado grande',
            `El archivo es demasiado grande (${(file.size / (1024 * 1024)).toFixed(1)} MB).\n\nTamaño máximo permitido: 50 MB.`,
            [{ text: 'OK' }]
          );
          return;
        }
        
        console.log('📁 Archivo seleccionado:', file.name, `(${(file.size / 1024).toFixed(1)} KB)`);
        setSelectedFile(file);
        
        // Procesar archivo automáticamente
        await processFile(file);
      }
    } catch (error) {
      console.error('❌ Error seleccionando archivo:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };
  
  /**
   * Procesar archivo GPX/TCX para extraer datos
   */
  const processFile = async (file) => {
    setProcessingFile(true);
    setUploadProgress(0);
    
    try {
      console.log('🔄 Procesando archivo:', file.name);
      
      const result = await trainingService.uploadAndProcessFile(file);
      
      if (result.success) {
        const data = result.data;
        
        if (data.file_processed && data.extracted_data) {
          // Actualizar formulario con datos extraídos
          const extracted = data.extracted_data;
          
          setFormData(prev => ({
            ...prev,
            title: extracted.title || prev.title,
            activityType: extracted.activity_type || prev.activityType,
            date: extracted.date || prev.date,
            startTime: extracted.start_time ? extracted.start_time.substring(0, 5) : prev.startTime,
            duration: extracted.duration || prev.duration,
            distance: extracted.distance?.toString() || prev.distance,
            calories: extracted.calories?.toString() || prev.calories,
            avgSpeed: extracted.avg_speed?.toString() || prev.avgSpeed,
            maxSpeed: extracted.max_speed?.toString() || prev.maxSpeed,
            avgHeartRate: extracted.avg_heart_rate?.toString() || prev.avgHeartRate,
            maxHeartRate: extracted.max_heart_rate?.toString() || prev.maxHeartRate,
            elevationGain: extracted.elevation_gain?.toString() || prev.elevationGain,
          }));
          
          setExtractedData(data);
          setFileProcessed(true);
          
          Alert.alert(
            '¡Archivo procesado exitosamente!',
            `${data.message}\n\n` +
            `📊 Datos extraídos:\n` +
            `• Distancia: ${extracted.distance ? extracted.distance.toFixed(2) + ' km' : 'N/A'}\n` +
            `• Duración: ${extracted.duration || 'N/A'}\n` +
            `• Velocidad promedio: ${extracted.avg_speed ? extracted.avg_speed.toFixed(1) + ' km/h' : 'N/A'}\n\n` +
            `Los campos del formulario se han completado automáticamente. Puedes editarlos si es necesario.`,
            [{ text: 'Continuar' }]
          );
        } else {
          Alert.alert('Error', 'No se pudieron extraer datos del archivo');
        }
      } else {
        Alert.alert('Error procesando archivo', result.error || 'Error inesperado procesando el archivo');
      }
    } catch (error) {
      console.error('❌ Error procesando archivo:', error);
      Alert.alert('Error', 'Error inesperado procesando el archivo');
    } finally {
      setProcessingFile(false);
      setUploadProgress(0);
    }
  };
  
  /**
   * Limpiar archivo seleccionado
   */
  const clearFile = () => {
    Alert.alert(
      'Limpiar archivo',
      '¿Quieres quitar el archivo seleccionado?\n\nLos datos extraídos se mantendrán en el formulario.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          onPress: () => {
            setSelectedFile(null);
            setFileProcessed(false);
            setExtractedData(null);
          }
        }
      ]
    );
  };
  
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
    
    // Calcular velocidad promedio automáticamente (solo si no viene de archivo)
    if ((field === 'distance' || field === 'duration') && !fileProcessed) {
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
    
    // Validar que velocidad máxima >= velocidad promedio
    if (formData.avgSpeed && formData.maxSpeed) {
      const avgSpeed = parseFloat(formData.avgSpeed);
      const maxSpeed = parseFloat(formData.maxSpeed);
      if (maxSpeed < avgSpeed) {
        newErrors.maxSpeed = 'La velocidad máxima debe ser mayor o igual a la promedio';
      }
    }
    
    // Validar que ritmo cardíaco máximo >= promedio
    if (formData.avgHeartRate && formData.maxHeartRate) {
      const avgHR = parseFloat(formData.avgHeartRate);
      const maxHR = parseFloat(formData.maxHeartRate);
      if (maxHR < avgHR) {
        newErrors.maxHeartRate = 'El ritmo cardíaco máximo debe ser mayor o igual al promedio';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Errores en el formulario',
        'Por favor corrige los errores antes de continuar.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('💾 Guardando entrenamiento...');
      
      let result;
      
      if (isEditing) {
        // Actualizar entrenamiento existente
        result = await trainingService.updateTraining(editingTraining.id, formData);
      } else if (fileProcessed && extractedData) {
        // Crear desde datos procesados de archivo
        result = await trainingService.createTrainingFromProcessedData({
          ...formData,
          activity_type: formData.activityType,
          start_time: formData.startTime,
          avg_speed: formData.avgSpeed ? parseFloat(formData.avgSpeed) : null,
          max_speed: formData.maxSpeed ? parseFloat(formData.maxSpeed) : null,
          avg_heart_rate: formData.avgHeartRate ? parseFloat(formData.avgHeartRate) : null,
          max_heart_rate: formData.maxHeartRate ? parseFloat(formData.maxHeartRate) : null,
          elevation_gain: formData.elevationGain ? parseFloat(formData.elevationGain) : null,
          distance: formData.distance ? parseFloat(formData.distance) : null,
          calories: formData.calories ? parseInt(formData.calories) : null,
        });
      } else {
        // Crear entrenamiento manual o con archivo
        result = selectedFile 
          ? await trainingService.createTrainingWithFile(formData, selectedFile)
          : await trainingService.createTraining(formData);
      }
      
      if (result.success) {
        const message = isEditing 
          ? 'Entrenamiento actualizado correctamente' 
          : result.fileProcessed 
            ? 'Entrenamiento creado exitosamente desde archivo'
            : 'Entrenamiento creado correctamente';
            
        Alert.alert(
          'Éxito',
          message,
          [
            {
              text: 'Ver Entrenamientos',
              onPress: () => {
                navigation.goBack();
                // Opcional: navegar a la lista de entrenamientos
                // navigation.navigate('TrainingList');
              }
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
   * Confirmar cancelación
   */
  const handleCancel = () => {
    if (selectedFile || Object.values(formData).some(value => value && value !== '')) {
      Alert.alert(
        'Cancelar',
        '¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { 
            text: 'Cancelar', 
            style: 'destructive',
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };
  
  /**
   * Renderizar sección de archivo GPX/TCX
   */
  const renderFileSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        📎 Importar desde Archivo GPS
      </Text>
      
      {!selectedFile ? (
        <TouchableOpacity 
          style={styles.fileButton}
          onPress={selectFile}
          disabled={isEditing} // No permitir en edición
        >
          <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
          <Text style={styles.fileButtonTitle}>Seleccionar archivo GPX/TCX/FIT</Text>
          <Text style={styles.fileButtonSubtitle}>
            Importa datos automáticamente desde tu dispositivo GPS o aplicaciones como Strava, Garmin Connect, etc.
          </Text>
          <View style={styles.supportedFormats}>
            <Text style={styles.supportedFormatsText}>
              Formatos compatibles: GPX, TCX, FIT
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={[styles.fileInfo, fileProcessed && styles.fileInfoProcessed]}>
          <View style={styles.fileInfoHeader}>
            <Ionicons 
              name={fileProcessed ? "checkmark-circle" : "document-outline"} 
              size={24} 
              color={fileProcessed ? Colors.success : Colors.primary} 
            />
            <View style={styles.fileInfoText}>
              <Text style={styles.fileName}>{selectedFile.name}</Text>
              <Text style={styles.fileSize}>
                {extractedData?.file_info ? 
                  `${extractedData.file_info.size_mb} ${extractedData.file_info.size_unit} • ${extractedData.file_info.type}` :
                  `${(selectedFile.size / 1024).toFixed(1)} KB`
                }
              </Text>
            </View>
            <TouchableOpacity onPress={clearFile}>
              <Ionicons name="close-circle" size={24} color={Colors.error} />
            </TouchableOpacity>
          </View>
          
          {processingFile && (
            <View style={styles.processingContainer}>
              <LoadingSpinner size="small" />
              <Text style={styles.processingText}>Procesando archivo...</Text>
            </View>
          )}
          
          {fileProcessed && extractedData && (
            <View style={styles.extractedInfo}>
              <Text style={styles.extractedTitle}>✅ Datos extraídos automáticamente:</Text>
              <Text style={styles.extractedText}>
                • Distancia: {extractedData.extracted_data.distance ? 
                  `${extractedData.extracted_data.distance.toFixed(2)} km` : 'N/A'}
              </Text>
              <Text style={styles.extractedText}>
                • Duración: {extractedData.extracted_data.duration || 'N/A'}
              </Text>
              <Text style={styles.extractedText}>
                • Velocidad promedio: {extractedData.extracted_data.avg_speed ? 
                  `${extractedData.extracted_data.avg_speed.toFixed(1)} km/h` : 'N/A'}
              </Text>
              {extractedData.extracted_data.avg_heart_rate && (
                <Text style={styles.extractedText}>
                  • Ritmo cardíaco promedio: {Math.round(extractedData.extracted_data.avg_heart_rate)} bpm
                </Text>
              )}
              {extractedData.extracted_data.elevation_gain && (
                <Text style={styles.extractedText}>
                  • Ganancia de elevación: {Math.round(extractedData.extracted_data.elevation_gain)} m
                </Text>
              )}
            </View>
          )}
        </View>
      )}
      
      {isEditing && (
        <View style={styles.editingNote}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
          <Text style={styles.editingNoteText}>
            La importación de archivos no está disponible al editar entrenamientos existentes.
          </Text>
        </View>
      )}
    </View>
  );
  
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
        onBack={handleCancel}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de archivo GPX/TCX */}
        {!isEditing && renderFileSection()}
        
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
                editable={!fileProcessed} // No editable si viene de archivo procesado
                style={fileProcessed && styles.readOnlyInput}
              />
              {fileProcessed && (
                <Text style={styles.autoCalculatedText}>
                  📊 Calculado automáticamente desde archivo
                </Text>
              )}
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
            disabled={isLoading || processingFile}
          />
          
          <Button
            title="Cancelar"
            variant="outline"
            onPress={handleCancel}
            disabled={isLoading || processingFile}
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
      
      {/* Modal selector de actividad */}
      {renderActivityPicker()}
      
      {/* Overlay de carga */}
      {(isLoading || processingFile) && (
        <LoadingSpinner
          overlay={true}
          text={processingFile ? 'Procesando archivo...' : isEditing ? 'Actualizando...' : 'Creando entrenamiento...'}
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
  
  // Estilos para archivos GPX/TCX
  fileButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: Colors.primaryAlpha10,
  },
  
  fileButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  
  fileButtonSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  supportedFormats: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
  },
  
  supportedFormatsText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  
  fileInfo: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.backgroundLight,
  },
  
  fileInfoProcessed: {
    borderColor: Colors.success,
    backgroundColor: Colors.successAlpha10,
  },
  
  fileInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  fileInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  
  fileSize: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  
  processingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  
  extractedInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.successAlpha20,
    borderRadius: 8,
  },
  
  extractedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    marginBottom: 8,
  },
  
  extractedText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  
  editingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.infoAlpha10,
    borderRadius: 8,
  },
  
  editingNoteText: {
    flex: 1,
    fontSize: 14,
    color: Colors.info,
    marginLeft: 8,
    lineHeight: 20,
  },
  
  readOnlyInput: {
    opacity: 0.7,
    backgroundColor: Colors.backgroundLight,
  },
  
  autoCalculatedText: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 4,
    fontStyle: 'italic',
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