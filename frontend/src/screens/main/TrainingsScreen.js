// src/screens/main/TrainingsScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, FAB, Chip, ActivityIndicator, useTheme, Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import TrainingCard from '../../components/TrainingCard';
import { trainingsScreenStyles as styles, commonStyles } from '../../styles';

/**
 * Pantalla de listado de entrenamientos
 * Mejorada para comunicación con el backend y textos en español
 */
const TrainingsScreen = ({ navigation }) => {
  const theme = useTheme();
  
  // Estados
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Lista de tipos de actividad para los filtros - memoizada para evitar recreaciones
  const activityTypes = useMemo(() => [
    { id: 'all', label: 'Todos' },
    { id: 'running', label: 'Correr' },
    { id: 'cycling', label: 'Ciclismo' },
    { id: 'swimming', label: 'Natación' },
    { id: 'walking', label: 'Caminar' },
    { id: 'hiking', label: 'Senderismo' },
    { id: 'other', label: 'Otro' }
  ], []);
  
  /**
   * Carga los entrenamientos desde la API
   */
  const loadTrainings = useCallback(async () => {
    try {
      setLoading(true);
      // Usar la ruta correcta del backend
      const response = await api.get('/api/entrenamientos/trainings/');
      
      // El backend devuelve los resultados en response.data.results
      setTrainings(response.data.results || []);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los entrenamientos');
      console.error('Error cargando entrenamientos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  // Cargar entrenamientos al montar el componente
  useEffect(() => {
    loadTrainings();
  }, [loadTrainings]);
  
  /**
   * Filtra los entrenamientos según la búsqueda y el filtro seleccionado
   */
  const filteredTrainings = useMemo(() => {
    return trainings.filter(training => {
      // Filtrar por texto de búsqueda (título o descripción)
      const matchesSearch = searchQuery === '' || 
        (training.title && training.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (training.description && training.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filtrar por tipo de actividad
      const matchesFilter = filter === 'all' || training.activity_type === filter;
      
      return matchesSearch && matchesFilter;
    });
  }, [trainings, searchQuery, filter]);
  
  // Handlers
  const handleSearch = useCallback((query) => setSearchQuery(query), []);
  const handleFilter = useCallback((newFilter) => setFilter(newFilter), []);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadTrainings();
  }, [loadTrainings]);
  
  const handleNavigateToDetail = useCallback((trainingId) => {
    navigation.navigate('TrainingDetail', { trainingId });
  }, [navigation]);
  
  const navigateToAddTraining = useCallback(() => {
    navigation.navigate('AddTraining');
  }, [navigation]);
  
  // Renderizado de componentes
  const renderTraining = useCallback(({ item }) => (
    <TrainingCard
      training={item}
      onPress={() => handleNavigateToDetail(item.id)}
    />
  ), [handleNavigateToDetail]);
  
  const renderFilterChip = useCallback(({ item }) => (
    <Chip 
      selected={filter === item.id} 
      onPress={() => handleFilter(item.id)}
      style={styles.filterChip}
    >
      {item.label}
    </Chip>
  ), [filter, handleFilter]);
  
  // Componente para cuando no hay entrenamientos
  const EmptyListMessage = React.memo(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="fitness-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No hay entrenamientos disponibles</Text>
      <Text style={styles.emptySubtext}>
        Comienza a registrar tus actividades deportivas
      </Text>
    </View>
  ));
  
  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <Searchbar
        placeholder="Buscar entrenamientos"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      {/* Filtros de actividad */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={activityTypes}
          keyExtractor={(item) => item.id}
          renderItem={renderFilterChip}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      
      {/* Lista de entrenamientos */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loaderText}>Cargando entrenamientos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrainings}
          renderItem={renderTraining}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh} 
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={<EmptyListMessage />}
        />
      )}
      
      {/* Botón para añadir nuevo entrenamiento */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={navigateToAddTraining}
        label="Nuevo"
        small
      />
    </View>
  );
};

// Memo para evitar renderizados innecesarios
export default React.memo(TrainingsScreen);