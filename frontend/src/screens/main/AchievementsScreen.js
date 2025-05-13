import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList } from 'react-native';
import { Text, ActivityIndicator, useTheme, Chip, Divider, FAB, Modal, Portal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import AchievementCard from '../../components/AchievementCard';
import { useNotification } from '../../contexts/NotificationContext';

const AchievementsScreen = ({ navigation }) => {
  const theme = useTheme();
  const notification = useNotification();
  
  const [achievements, setAchievements] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [lockedAchievements, setLockedAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Cargar logros
  const loadAchievements = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/api/stats/achievements/');
      setAchievements(response.data || []);
      
      // Separar logros desbloqueados y bloqueados
      const unlocked = response.data.filter(a => a.unlocked) || [];
      const locked = response.data.filter(a => !a.unlocked) || [];
      
      setUnlockedAchievements(unlocked);
      setLockedAchievements(locked);
      
    } catch (error) {
      console.error('Error al cargar logros:', error);
      notification.showError('Error al cargar logros');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadAchievements();
  }, []);
  
  // Manejar refresco
  const onRefresh = () => {
    setRefreshing(true);
    loadAchievements();
  };
  
  // Filtrar logros según el filtro seleccionado
  const getFilteredAchievements = () => {
    switch (filter) {
      case 'unlocked':
        return unlockedAchievements;
      case 'locked':
        return lockedAchievements;
      case 'all':
      default:
        return [...unlockedAchievements, ...lockedAchievements];
    }
  };
  
  // Mostrar detalles de un logro
  const showAchievementDetails = (achievement) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };
  
  // Renderizar un logro
  const renderAchievement = ({ item }) => (
    <AchievementCard 
      achievement={item} 
      unlocked={item.unlocked} 
      onPress={() => showAchievementDetails(item)}
    />
  );
  
  // Renderizar el modal de detalles
  const renderDetailsModal = () => {
    if (!selectedAchievement) return null;
    
    return (
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View 
                style={[
                  styles.modalIconContainer, 
                  { 
                    backgroundColor: selectedAchievement.unlocked 
                      ? (selectedAchievement.color || theme.colors.primary) 
                      : '#9E9E9E' 
                  }
                ]}
              >
                <Ionicons 
                  name={selectedAchievement.unlocked ? (selectedAchievement.icon || 'trophy') : 'lock-closed'} 
                  size={32} 
                  color="#fff" 
                />
              </View>
              
              <Text style={styles.modalTitle}>{selectedAchievement.title}</Text>
              
              {selectedAchievement.unlocked && selectedAchievement.level && (
                <Chip style={styles.levelChip}>Nivel {selectedAchievement.level}</Chip>
              )}
            </View>
            
            <Divider style={styles.divider} />
            
            <Text style={styles.modalDescription}>
              {selectedAchievement.unlocked 
                ? selectedAchievement.description 
                : 'Este logro aún está bloqueado. ¡Sigue entrenando para desbloquearlo!'}
            </Text>
            
            {selectedAchievement.unlocked && selectedAchievement.unlocked_date && (
              <Text style={styles.modalDate}>
                Conseguido el {new Date(selectedAchievement.unlocked_date).toLocaleDateString('es-ES')}
              </Text>
            )}
            
            {!selectedAchievement.unlocked && selectedAchievement.requirements && (
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Requisitos:</Text>
                <Text style={styles.requirements}>{selectedAchievement.requirements}</Text>
              </View>
            )}
            
            {selectedAchievement.progress !== undefined && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressTitle}>Progreso:</Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${Math.min(selectedAchievement.progress * 100, 100)}%`,
                        backgroundColor: selectedAchievement.unlocked 
                          ? (selectedAchievement.color || theme.colors.primary) 
                          : '#9E9E9E'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {`${Math.round(selectedAchievement.progress * 100)}%`}
                </Text>
              </View>
            )}
          </View>
        </Modal>
      </Portal>
    );
  };
  
  return (
    <View style={styles.container}>
      {renderDetailsModal()}
      
      <View style={styles.filterContainer}>
        <Chip 
          selected={filter === 'all'} 
          onPress={() => setFilter('all')} 
          style={styles.filterChip}
        >
          Todos
        </Chip>
        <Chip 
          selected={filter === 'unlocked'} 
          onPress={() => setFilter('unlocked')} 
          style={styles.filterChip}
        >
          Desbloqueados
        </Chip>
        <Chip 
          selected={filter === 'locked'} 
          onPress={() => setFilter('locked')} 
          style={styles.filterChip}
        >
          Bloqueados
        </Chip>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando logros...</Text>
        </View>
      ) : (
        <>
          {getFilteredAchievements().length > 0 ? (
            <FlatList
              data={getFilteredAchievements()}
              renderItem={renderAchievement}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          ) : (
            <ScrollView
              contentContainerStyle={styles.emptyContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <Ionicons name="trophy" size={64} color="#BDBDBD" />
              <Text style={styles.emptyText}>
                {filter === 'unlocked' 
                  ? 'Aún no has desbloqueado ningún logro' 
                  : filter === 'locked' 
                    ? 'No hay más logros por desbloquear' 
                    : 'No hay logros disponibles'}
              </Text>
              <Text style={styles.emptySubtext}>
                {filter === 'unlocked' 
                  ? '¡Sigue entrenando para conseguir logros!' 
                  : filter === 'locked' 
                    ? '¡Felicidades! Has desbloqueado todos los logros' 
                    : 'Vuelve más tarde'}
              </Text>
            </ScrollView>
          )}
        </>
      )}
      
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="refresh"
        onPress={onRefresh}
        disabled={refreshing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  filterChip: {
    marginRight: 8,
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
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
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
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  levelChip: {
    marginLeft: 8,
  },
  divider: {
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  modalDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  requirementsContainer: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  requirements: {
    fontSize: 14,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'right',
  },
});

export default AchievementsScreen;
