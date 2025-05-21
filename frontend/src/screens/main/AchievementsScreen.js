import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, FlatList } from 'react-native';
import { Text, ActivityIndicator, useTheme, Chip, Divider, FAB, Modal, Portal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import AchievementCard from '../../components/AchievementCard';
import { useNotification } from '../../contexts/NotificationContext';
import styles from '../../styles/screens/auth/main/AchievementsScreen.styles';

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

export default AchievementsScreen;
