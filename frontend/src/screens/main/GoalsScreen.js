import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Card, Title, Text, Button, FAB, Divider, ActivityIndicator, useTheme, ProgressBar, Modal, Portal, TextInput, Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../services/api';

const GoalsScreen = () => {
  const theme = useTheme();
  
  const [activeGoals, setActiveGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [goalTypeMenuVisible, setGoalTypeMenuVisible] = useState(false);
  const [periodMenuVisible, setPeriodMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState('');
  
  // Estado para el formulario de nuevo objetivo
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: 'distance',
    target_value: '',
    period: 'weekly',
    start_date: new Date(),
    end_date: null,
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const goalTypes = [
    { value: 'distance', label: 'Distancia', unit: 'km' },
    { value: 'duration', label: 'Duración', unit: 'minutos' },
    { value: 'frequency', label: 'Frecuencia', unit: 'entrenamientos' },
    { value: 'speed', label: 'Velocidad', unit: 'km/h' },
  ];
  
  const periods = [
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'yearly', label: 'Anual' },
    { value: 'custom', label: 'Personalizado' },
  ];
  
  const getGoalTypeLabel = (value) => {
    const goalType = goalTypes.find(t => t.value === value);
    return goalType ? goalType.label : 'Seleccionar';
  };
  
  const getGoalTypeUnit = (value) => {
    const goalType = goalTypes.find(t => t.value === value);
    return goalType ? goalType.unit : '';
  };
  
  const getPeriodLabel = (value) => {
    const period = periods.find(p => p.value === value);
    return period ? period.label : 'Seleccionar';
  };
  
  useEffect(() => {
    loadGoals();
  }, []);
  
  const loadGoals = async () => {
    try {
      setLoading(true);
      
      // Cargar objetivos activos
      const activeResponse = await api.get('/api/trainings/goals/active/');
      setActiveGoals(activeResponse.data || []);
      
      // Cargar objetivos completados
      const completedResponse = await api.get('/api/trainings/goals/completed/');
      setCompletedGoals(completedResponse.data || []);
      
    } catch (error) {
      console.error('Error al cargar objetivos:', error);
      Alert.alert('Error', 'No se pudieron cargar los objetivos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    loadGoals();
  };
  
  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Limpiar error al modificar el campo
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };
  
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange(datePickerField, selectedDate);
    }
  };
  
  const showDatePickerFor = (field) => {
    setDatePickerField(field);
    setShowDatePicker(true);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if (!formData.target_value.trim()) {
      newErrors.target_value = 'El valor objetivo es obligatorio';
    } else if (isNaN(parseFloat(formData.target_value)) || parseFloat(formData.target_value) <= 0) {
      newErrors.target_value = 'El valor objetivo debe ser un número positivo';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'La fecha de inicio es obligatoria';
    }
    
    if (formData.period === 'custom' && !formData.end_date) {
      newErrors.end_date = 'La fecha de fin es obligatoria para un período personalizado';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleCreateGoal = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Preparar datos para enviar
      const data = {
        title: formData.title,
        description: formData.description,
        goal_type: formData.goal_type,
        target_value: parseFloat(formData.target_value),
        period: formData.period,
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : null,
        is_active: true,
      };
      
      // Enviar datos al servidor
      await api.post('/api/trainings/goals/', data);
      
      // Cerrar modal y recargar objetivos
      setModalVisible(false);
      resetForm();
      loadGoals();
      
      Alert.alert('Éxito', 'Objetivo creado correctamente');
    } catch (error) {
      console.error('Error al crear objetivo:', error);
      Alert.alert('Error', 'No se pudo crear el objetivo');
    } finally {
      setSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      goal_type: 'distance',
      target_value: '',
      period: 'weekly',
      start_date: new Date(),
      end_date: null,
    });
    setFormErrors({});
  };
  
  const handleCompleteGoal = async (goalId) => {
    try {
      await api.patch(`/api/trainings/goals/${goalId}/`, {
        is_completed: true,
      });
      
      loadGoals();
      Alert.alert('Éxito', 'Objetivo marcado como completado');
    } catch (error) {
      console.error('Error al completar objetivo:', error);
      Alert.alert('Error', 'No se pudo completar el objetivo');
    }
  };
  
  const handleDeleteGoal = (goalId) => {
    Alert.alert(
      'Eliminar Objetivo',
      '¿Estás seguro de que quieres eliminar este objetivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          onPress: async () => {
            try {
              await api.delete(`/api/trainings/goals/${goalId}/`);
              loadGoals();
              Alert.alert('Éxito', 'Objetivo eliminado correctamente');
            } catch (error) {
              console.error('Error al eliminar objetivo:', error);
              Alert.alert('Error', 'No se pudo eliminar el objetivo');
            }
          },
          style: 'destructive' 
        },
      ]
    );
  };
  
  // Renderizar un objetivo
  const renderGoal = (goal, isActive = true) => {
    const progress = goal.progress?.percent || 0;
    const progressColor = progress >= 100 
      ? theme.colors.success 
      : progress >= 50 
        ? theme.colors.primary 
        : theme.colors.warning;
    
    return (
      <Card key={goal.id} style={styles.goalCard}>
        <Card.Content>
          <View style={styles.goalHeader}>
            <Title style={styles.goalTitle}>{goal.title}</Title>
            {isActive && (
              <Menu
                visible={goal.menuVisible}
                onDismiss={() => {
                  const updatedGoals = activeGoals.map(g => ({
                    ...g,
                    menuVisible: g.id === goal.id ? false : g.menuVisible,
                  }));
                  setActiveGoals(updatedGoals);
                }}
                anchor={
                  <Button
                    icon="dots-vertical"
                    onPress={() => {
                      const updatedGoals = activeGoals.map(g => ({
                        ...g,
                        menuVisible: g.id === goal.id ? true : false,
                      }));
                      setActiveGoals(updatedGoals);
                    }}
                  />
                }
              >
                <Menu.Item onPress={() => handleCompleteGoal(goal.id)} title="Marcar como completado" />
                <Menu.Item onPress={() => handleDeleteGoal(goal.id)} title="Eliminar" />
              </Menu>
            )}
          </View>
          
          <View style={styles.goalInfo}>
            <Text style={styles.goalType}>
              {getGoalTypeLabel(goal.goal_type)} • {getPeriodLabel(goal.period)}
            </Text>
            <Text style={styles.goalDates}>
              {new Date(goal.start_date).toLocaleDateString()}
              {goal.end_date && ` - ${new Date(goal.end_date).toLocaleDateString()}`}
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {goal.progress?.current_value.toFixed(1)} / {goal.target_value.toFixed(1)} {getGoalTypeUnit(goal.goal_type)}
              </Text>
              <Text style={styles.progressPercent}>{Math.min(100, progress.toFixed(0))}%</Text>
            </View>
            <ProgressBar
              progress={progress / 100}
              color={progressColor}
              style={styles.progressBar}
            />
          </View>
          
          {goal.description && (
            <Text style={styles.description}>{goal.description}</Text>
          )}
        </Card.Content>
      </Card>
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando objetivos...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Title style={styles.title}>Mis Objetivos</Title>
        
        {/* Objetivos activos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objetivos Activos</Text>
          
          {activeGoals.length > 0 ? (
            activeGoals.map(goal => renderGoal(goal))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <View style={styles.emptyContainer}>
                  <Ionicons name="flag-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No tienes objetivos activos</Text>
                  <Text style={styles.emptySubtext}>
                    Crea un nuevo objetivo para hacer seguimiento de tu progreso
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}
        </View>
        
        {/* Objetivos completados */}
        {completedGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Objetivos Completados</Text>
            
            {completedGoals.map(goal => renderGoal(goal, false))}
          </View>
        )}
      </ScrollView>
      
      {/* FAB para añadir nuevo objetivo */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => setModalVisible(true)}
      />
      
      {/* Modal para crear nuevo objetivo */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            resetForm();
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>Nuevo Objetivo</Title>
            
            <TextInput
              label="Título *"
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              mode="outlined"
              style={styles.input}
              error={!!formErrors.title}
            />
            {formErrors.title && <Text style={styles.errorText}>{formErrors.title}</Text>}
            
            <TextInput
              label="Descripción"
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Tipo de Objetivo *</Text>
                <Menu
                  visible={goalTypeMenuVisible}
                  onDismiss={() => setGoalTypeMenuVisible(false)}
                  anchor={
                    <Button 
                      mode="outlined" 
                      onPress={() => setGoalTypeMenuVisible(true)}
                      style={styles.dropdown}
                      icon="chevron-down"
                      contentStyle={styles.dropdownContent}
                    >
                      {getGoalTypeLabel(formData.goal_type)}
                    </Button>
                  }
                >
                  {goalTypes.map((type) => (
                    <Menu.Item
                      key={type.value}
                      onPress={() => {
                        handleInputChange('goal_type', type.value);
                        setGoalTypeMenuVisible(false);
                      }}
                      title={type.label}
                    />
                  ))}
                </Menu>
              </View>
              
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Valor Objetivo *</Text>
                <TextInput
                  label={getGoalTypeUnit(formData.goal_type)}
                  value={formData.target_value}
                  onChangeText={(text) => handleInputChange('target_value', text)}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                  error={!!formErrors.target_value}
                />
                {formErrors.target_value && <Text style={styles.errorText}>{formErrors.target_value}</Text>}
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Período *</Text>
                <Menu
                  visible={periodMenuVisible}
                  onDismiss={() => setPeriodMenuVisible(false)}
                  anchor={
                    <Button 
                      mode="outlined" 
                      onPress={() => setPeriodMenuVisible(true)}
                      style={styles.dropdown}
                      icon="chevron-down"
                      contentStyle={styles.dropdownContent}
                    >
                      {getPeriodLabel(formData.period)}
                    </Button>
                  }
                >
                  {periods.map((period) => (
                    <Menu.Item
                      key={period.value}
                      onPress={() => {
                        handleInputChange('period', period.value);
                        setPeriodMenuVisible(false);
                      }}
                      title={period.label}
                    />
                  ))}
                </Menu>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Fecha de Inicio *</Text>
                <Button 
                  mode="outlined" 
                  onPress={() => showDatePickerFor('start_date')}
                  style={styles.dateButton}
                  icon="calendar"
                >
                  {formData.start_date ? formData.start_date.toLocaleDateString() : 'Seleccionar'}
                </Button>
                {formErrors.start_date && <Text style={styles.errorText}>{formErrors.start_date}</Text>}
              </View>
              
              {formData.period === 'custom' && (
                <View style={styles.formColumn}>
                  <Text style={styles.inputLabel}>Fecha de Fin *</Text>
                  <Button 
                    mode="outlined" 
                    onPress={() => showDatePickerFor('end_date')}
                    style={styles.dateButton}
                    icon="calendar"
                  >
                    {formData.end_date ? formData.end_date.toLocaleDateString() : 'Seleccionar'}
                  </Button>
                  {formErrors.end_date && <Text style={styles.errorText}>{formErrors.end_date}</Text>}
                </View>
              )}
            </View>
            
            {showDatePicker && (
              <DateTimePicker
                value={formData[datePickerField] || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            
            <View style={styles.modalButtons}>
              <Button 
                mode="outlined" 
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                style={styles.cancelButton}
                disabled={submitting}
              >
                Cancelar
              </Button>
              
              <Button 
                mode="contained" 
                onPress={handleCreateGoal}
                style={styles.createButton}
                loading={submitting}
                disabled={submitting}
              >
                Crear
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Espacio para el FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  goalCard: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalTitle: {
    fontSize: 18,
    flex: 1,
  },
  goalInfo: {
    marginBottom: 12,
  },
  goalType: {
    fontSize: 14,
    color: '#666',
  },
  goalDates: {
    fontSize: 12,
    color: '#888',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyCard: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  formColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dropdown: {
    width: '100%',
  },
  dropdownContent: {
    justifyContent: 'flex-start',
  },
  dateButton: {
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  createButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default GoalsScreen;
