/**
 * Pantalla de Lista de Entrenamientos para AthCyl
 * 
 * Esta pantalla muestra todos los entrenamientos del usuario en una lista.
 * Incluye funcionalidades de búsqueda, filtrado y navegación a detalles.
 * 
 * Características:
 * - Lista de todos los entrenamientos
 * - Pull-to-refresh para actualizar
 * - Búsqueda por título
 * - Filtro por tipo de actividad
 * - Navegación a crear/editar entrenamientos
 * - Paginación (si es necesaria)
 * - Estados de carga y error
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  StyleSheet
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Importar componentes
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card, { TrainingCard } from '../../components/Card';
import Header from '../../components/Header';
import LoadingSpinner, { FullScreenSpinner, InlineSpinner } from '../../components/LoadingSpinner';

// Importar servicios
import trainingService, { ACTIVITY_TYPES } from '../../services/trainingService';

// Importar estilos y colores
import { Colors } from '../../config/colors';
import { globalStyles } from '../../styles/globalStyles';

const TrainingListScreen = ({ navigation }) => {
  // Estados para los datos
  const [trainings, setTrainings] = useState([]);
  const [filteredTrainings, setFilteredTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  /**
   * Cargar entrenamientos
   */
  const loadTrainings = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setIsLoading(true);
    }
    
    try {
      console.log('📊 Cargando entrenamientos...');
      
      const result = await trainingService.getTrainings();
      
      if (result.success) {
        setTrainings(result.data);
        setError(null);
        console.log(`✅ ${result.data.length} entrenamientos cargados`);
      } else {
        setError(result.error);
        console.warn('⚠️ Error cargando entrenamientos:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Error inesperado cargando entrenamientos:', error);
      setError('Error de conexión. Por favor, inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  /**
   * Filtrar entrenamientos según búsqueda y filtros
   */
  const filterTrainings = useCallback(() => {
    let filtered = [...trainings];
    
    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(training =>
        training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        training.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtrar por tipo de actividad
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(training => training.activity_type === selectedFilter);
    }
    
    setFilteredTrainings(filtered);
  }, [trainings, searchQuery, selectedFilter]);
  
  /**
   * Cargar datos cuando la pantalla recibe foco
   */
  useFocusEffect(
    useCallback(() => {
      loadTrainings();
    }, [])
  );
  
  /**
   * Aplicar filtros cuando cambien los criterios
   */
  useEffect(() => {
    filterTrainings();
  }, [filterTrainings]);
  
  /**
   * Manejar pull-to-refresh
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTrainings(false);
  };
  
  /**
   * Manejar búsqueda
   */
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
  /**
   * Aplicar filtro de actividad
   */
  const applyFilter = (filter) => {
    setSelectedFilter(filter);
    setShowFilterModal(false);
  };
  
  /**
   * Navegar a crear entrenamiento
   */
  const goToCreateTraining = () => {
    navigation.navigate('CreateTraining');
  };
  
  /**
   * Navegar a detalles de entrenamiento
   */
  const goToTrainingDetails = (training) => {
    // Aquí podrías navegar a una pantalla de detalles
    // Por ahora, mostrar un alert con la información
    Alert.alert(
      training.title,
      `Fecha: ${training.dateDisplay}\nTipo: ${training.activityTypeDisplay}\nDistancia: ${training.distanceDisplay}\nDuración: ${training.durationDisplay}`,
      [
        { text: 'Cerrar' },
        { 
          text: 'Editar', 
          onPress: () => navigation.navigate('CreateTraining', { training })
        }
      ]
    );
  };
  
  /**
   * Eliminar entrenamiento
   */
  const deleteTraining = (training) => {
    Alert.alert(
      'Eliminar Entrenamiento',
      `¿Estás seguro de que quieres eliminar "${training.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await trainingService.deleteTraining(training.id);
              
              if (result.success) {
                // Actualizar lista local
                setTrainings(prev => prev.filter(t => t.id !== training.id));
                Alert.alert('Éxito', 'Entrenamiento eliminado correctamente');
              } else {
                Alert.alert('Error', result.error || 'No se pudo eliminar el entrenamiento');
              }
            } catch (error) {
              Alert.alert('Error', 'Ha ocurrido un error inesperado');
            }
          }
        }
      ]
    );
  };
  
  /**
   * Renderizar header con búsqueda y filtros
   */
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Header 
        title="Mis Entrenamientos"
        rightIcon="add-circle-outline"
        onRightPress={goToCreateTraining}
      />
      
      <View style={styles.searchContainer}>
        <Input
          placeholder="Buscar entrenamientos..."
          value={searchQuery}
          onChangeText={handleSearch}
          icon="search-outline"
          style={styles.searchInput}
        />
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons 
            name="filter-outline" 
            size={24} 
            color={selectedFilter === 'all' ? Colors.textSecondary : Colors.primary} 
          />
          {selectedFilter !== 'all' && <View style={styles.filterIndicator} />}
        </TouchableOpacity>
      </View>
    </View>
  );
  
  /**
   * Renderizar modal de filtros
   */
  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar por Actividad</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[
              styles.filterOption,
              selectedFilter === 'all' && styles.filterOptionSelected
            ]}
            onPress={() => applyFilter('all')}
          >
            <Text style={[
              styles.filterOptionText,
              selectedFilter === 'all' && styles.filterOptionTextSelected
            ]}>
              Todas las actividades
            </Text>
            {selectedFilter === 'all' && (
              <Ionicons name="checkmark" size={20} color={Colors.primary} />
            )}
          </TouchableOpacity>
          
          {Object.entries(ACTIVITY_TYPES).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterOption,
                selectedFilter === key && styles.filterOptionSelected
              ]}
              onPress={() => applyFilter(key)}
            >
              <Text style={[
                styles.filterOptionText,
                selectedFilter === key && styles.filterOptionTextSelected
              ]}>
                {label}
              </Text>
              {selectedFilter === key && (
                <Ionicons name="checkmark" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
  
  /**
   * Renderizar ítem de entrenamiento
   */
  const renderTrainingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.trainingItem}
      onPress={() => goToTrainingDetails(item)}
      onLongPress={() => deleteTraining(item)}
    >
      <View style={styles.trainingIcon}>
        <Ionicons 
          name="fitness" 
          size={24} 
          color={Colors.primary} 
        />
      </View>
      
      <View style={styles.trainingContent}>
        <View style={styles.trainingHeader}>
          <Text style={styles.trainingTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.trainingDate}>
            {item.dateDisplay}
          </Text>
        </View>
        
        <Text style={styles.trainingType}>
          {item.activityTypeDisplay}
        </Text>
        
        <View style={styles.trainingStats}>
          {item.distance && (
            <View style={styles.trainingStat}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.trainingStatText}>{item.distanceDisplay}</Text>
            </View>
          )}
          
          {item.duration && (
            <View style={styles.trainingStat}>
              <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.trainingStatText}>{item.durationDisplay}</Text>
            </View>
          )}
          
          {item.calories && (
            <View style={styles.trainingStat}>
              <Ionicons name="flame-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.trainingStatText}>{item.calories} kcal</Text>
            </View>
          )}
        </View>
      </View>
      
      <Ionicons 
        name="chevron-forward-outline" 
        size={20} 
        color={Colors.textSecondary} 
      />
    </TouchableOpacity>
  );
  
  /**
   * Renderizar estado vacío
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="fitness-outline" 
        size={64} 
        color={Colors.textMuted} 
      />
      <Text style={styles.emptyTitle}>
        {searchQuery || selectedFilter !== 'all' 
          ? 'No se encontraron entrenamientos'
          : 'No tienes entrenamientos registrados'
        }
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedFilter !== 'all'
          ? 'Prueba con otros términos de búsqueda o filtros'
          : 'Crea tu primer entrenamiento para comenzar'
        }
      </Text>
      
      {!searchQuery && selectedFilter === 'all' && (
        <Button
          title="Crear Primer Entrenamiento"
          onPress={goToCreateTraining}
          style={styles.emptyButton}
        />
      )}
    </View>
  );
  
  /**
   * Renderizar estado de error
   */
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons 
        name="alert-circle-outline" 
        size={64} 
        color={Colors.error} 
      />
      <Text style={styles.errorTitle}>Error al cargar entrenamientos</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <Button
        title="Reintentar"
        onPress={() => loadTrainings()}
        style={styles.retryButton}
      />
    </View>
  );
  
  // Mostrar pantalla de carga inicial
  if (isLoading) {
    return <FullScreenSpinner text="Cargando entrenamientos..." />;
  }
  
  // Mostrar estado de error
  if (error && trainings.length === 0) {
    return (
      <View style={globalStyles.container}>
        {renderHeader()}
        {renderErrorState()}
        {renderFilterModal()}
      </View>
    );
  }
  
  return (
    <View style={globalStyles.container}>
      {renderHeader()}
      
      <FlatList
        data={filteredTrainings}
        renderItem={renderTrainingItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          filteredTrainings.length === 0 && styles.listContainerEmpty
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      
      {/* Modal de filtros */}
      {renderFilterModal()}
      
      {/* Botón flotante para crear entrenamiento */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={goToCreateTraining}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

// ===== ESTILOS DE LA PANTALLA =====
const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.surface,
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  
  searchInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 12,
  },
  
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  filterIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  
  // Lista
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Espacio para el botón flotante
  },
  
  listContainerEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  
  separator: {
    height: 12,
  },
  
  // Item de entrenamiento
  trainingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  trainingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryAlpha10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  trainingContent: {
    flex: 1,
  },
  
  trainingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  
  trainingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  
  trainingDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  
  trainingType: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  
  trainingStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  trainingStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 2,
  },
  
  trainingStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
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
  
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  
  filterOptionSelected: {
    backgroundColor: Colors.primaryAlpha10,
  },
  
  filterOptionText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  
  filterOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  
  // Estados vacío y error
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  
  emptyButton: {
    marginHorizontal: 40,
  },
  
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  
  errorTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  
  errorMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  
  retryButton: {
    marginHorizontal: 40,
  },
  
  // Botón flotante
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 100, // Espacio para el tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default TrainingListScreen;