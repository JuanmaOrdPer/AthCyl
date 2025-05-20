// src/screens/main/TrainingsScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, Chip, ActivityIndicator, useTheme, Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import TrainingCard from '../../components/TrainingCard';
import { useNotification } from '../../contexts/NotificationContext';

/**
 * Pantalla de listado de entrenamientos
 */
const TrainingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const notification = useNotification();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Lista de tipos de actividad para los filtros - useMemo para evitar recreaciones
  const activityTypes = useMemo(() => [
    { id: 'all', label: 'Todos' },
    { id: 'running', label: 'Correr' },
    { id: 'cycling', label: 'Ciclismo' },
    { id: 'swimming', label: 'Natación' },
    { id: 'walking', label: 'Caminar' },
    { id: 'hiking', label: 'Senderismo' },
    { id: 'other', label: 'Otro' }
  ], []);
  
  // Cargar entrenamientos - useCallback para evitar recreaciones
  const loadTrainings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/trainings/trainings/');
      setTrainings(response.data.results || []);
    } catch (error) {
      notification.showError('Error al cargar entrenamientos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notification]);
  
  // Efecto para cargar datos al montar
  useEffect(() => {
    loadTrainings();
  }, [loadTrainings]);
  
  // Filtrar entrenamientos - useMemo para evitar recálculos innecesarios
  const filteredTrainings = useMemo(() => {
    return trainings.filter(training => {
      const matchesSearch = searchQuery === '' || 
        training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (training.description && training.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = filter === 'all' || training.activity_type === filter;
      
      return matchesSearch && matchesFilter;
    });
  }, [trainings, searchQuery, filter]);
  
  // Manejar búsqueda - useCallback para memoizar la función
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);
  
  // Manejar filtro - useCallback para memoizar la función
  const handleFilter = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);
  
  // Manejar refresco - useCallback para memoizar la función
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadTrainings();
  }, [loadTrainings]);
  
  // Manejar navegación a detalle - useCallback para memoizar la función
  const handleNavigateToDetail = useCallback((trainingId) => {
    navigation.navigate('TrainingDetail', { trainingId });
  }, [navigation]);
  
  // Renderizar un entrenamiento - useCallback para memoizar la función
  const renderTraining = useCallback(({ item }) => (
    <TrainingCard
      training={item}
      onPress={() => handleNavigateToDetail(item.id)}
    />
  ), [handleNavigateToDetail]);
  
  // Renderizar mensaje cuando no hay entrenamientos
  const EmptyListMessage = React.memo(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="fitness-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No hay entrenamientos disponibles</Text>
      <Text style={styles.emptySubtext}>
        Comienza a registrar tus actividades deportivas
      </Text>
    </View>
  ));
  
  // Renderizar chip de filtro - useCallback para memoizar la función
  const renderFilterChip = useCallback(({ item }) => (
    <Chip 
      selected={filter === item.id} 
      onPress={() => handleFilter(item.id)}
      style={styles.filterChip}
    >
      {item.label}
    </Chip>
  ), [filter, handleFilter]);
  
  // Navegación a añadir entrenamiento - useCallback para memoizar la función
  const navigateToAddTraining = useCallback(() => {
    navigation.navigate('AddTraining');
  }, [navigation]);
  
  return (
    <View style={styles.container}>
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
      
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
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
            />
          }
          ListEmptyComponent={<EmptyListMessage />}
        />
      )}
      
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={navigateToAddTraining}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    elevation: 4,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default React.memo(TrainingsScreen);