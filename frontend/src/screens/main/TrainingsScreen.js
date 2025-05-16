import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Text, FAB, Chip, ActivityIndicator, useTheme, Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const TrainingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  
  const loadTrainings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/trainings/trainings/');
      setTrainings(response.data.results || []);
    } catch (error) {
      console.error('Error al cargar entrenamientos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadTrainings();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    loadTrainings();
  };
  
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
  const handleFilter = (newFilter) => {
    setFilter(newFilter);
  };
  
  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'running':
        return 'run';
      case 'cycling':
        return 'bicycle';
      case 'swimming':
        return 'water';
      case 'walking':
        return 'walk';
      case 'hiking':
        return 'trending-up';
      default:
        return 'fitness';
    }
  };
  
  const formatDuration = (durationString) => {
    if (!durationString) return 'N/A';
    
    // Formato esperado: "HH:MM:SS"
    const parts = durationString.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  // Filtrar entrenamientos
  const filteredTrainings = trainings.filter(training => {
    // Filtrar por búsqueda
    const matchesSearch = 
      training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (training.description && training.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filtrar por tipo de actividad
    const matchesFilter = filter === 'all' || training.activity_type === filter;
    
    return matchesSearch && matchesFilter;
  });
  
  // Renderizar un entrenamiento
  const renderTraining = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('TrainingDetail', { trainingId: item.id })}
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Ionicons 
                name={getActivityIcon(item.activity_type)} 
                size={24} 
                color={theme.colors.primary} 
                style={styles.activityIcon}
              />
              <Title>{item.title}</Title>
            </View>
            <Chip mode="outlined">{item.activity_type}</Chip>
          </View>
          
          <Paragraph style={styles.date}>
            {new Date(item.date).toLocaleDateString()} - {item.start_time}
          </Paragraph>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="speedometer-outline" size={18} color="#666" />
              <Text style={styles.statValue}>
                {item.distance ? `${item.distance.toFixed(2)} km` : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color="#666" />
              <Text style={styles.statValue}>
                {formatDuration(item.duration)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="trending-up-outline" size={18} color="#666" />
              <Text style={styles.statValue}>
                {item.avg_speed ? `${item.avg_speed.toFixed(1)} km/h` : 'N/A'}
              </Text>
            </View>
          </View>
          
          {item.description && (
            <Paragraph numberOfLines={2} style={styles.description}>
              {item.description}
            </Paragraph>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
  
  // Renderizar los filtros
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip 
          selected={filter === 'all'} 
          onPress={() => handleFilter('all')}
          style={styles.filterChip}
        >
          Todos
        </Chip>
        <Chip 
          selected={filter === 'running'} 
          onPress={() => handleFilter('running')}
          style={styles.filterChip}
        >
          Correr
        </Chip>
        <Chip 
          selected={filter === 'cycling'} 
          onPress={() => handleFilter('cycling')}
          style={styles.filterChip}
        >
          Ciclismo
        </Chip>
        <Chip 
          selected={filter === 'swimming'} 
          onPress={() => handleFilter('swimming')}
          style={styles.filterChip}
        >
          Natación
        </Chip>
        <Chip 
          selected={filter === 'walking'} 
          onPress={() => handleFilter('walking')}
          style={styles.filterChip}
        >
          Caminar
        </Chip>
        <Chip 
          selected={filter === 'hiking'} 
          onPress={() => handleFilter('hiking')}
          style={styles.filterChip}
        >
          Senderismo
        </Chip>
        <Chip 
          selected={filter === 'other'} 
          onPress={() => handleFilter('other')}
          style={styles.filterChip}
        >
          Otro
        </Chip>
      </ScrollView>
    </View>
  );
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando entrenamientos...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar entrenamientos"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      {renderFilters()}
      
      <FlatList
        data={filteredTrainings}
        renderItem={renderTraining}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay entrenamientos disponibles</Text>
            <Text style={styles.emptySubtext}>
              Comienza a registrar tus actividades deportivas
            </Text>
          </View>
        }
      />
      
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate('AddTraining')}
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
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    marginRight: 8,
  },
  date: {
    color: '#666',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statValue: {
    marginLeft: 4,
    fontWeight: '500',
  },
  description: {
    marginTop: 8,
    color: '#666',
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

export default TrainingsScreen;
