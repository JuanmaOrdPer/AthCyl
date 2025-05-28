/**
 * Pantalla Home (Dashboard) para AthCyl
 * 
 * Esta es la pantalla principal que ven los usuarios después de iniciar sesión.
 * Muestra un resumen de sus estadísticas y accesos rápidos a funciones principales.
 * 
 * Características:
 * - Saludo personalizado al usuario
 * - Estadísticas básicas (entrenamientos, distancia, etc.)
 * - Actividad reciente
 * - Accesos rápidos a crear entrenamiento
 * - Gráfico simple de progreso
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Importar componentes
import Card, { StatCard } from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner, { FullScreenSpinner } from '../../components/LoadingSpinner';

// Importar servicios
import statsService from '../../services/statsService';
import trainingService from '../../services/trainingService';

// Importar estilos y colores
import { Colors } from '../../config/colors';
import { globalStyles } from '../../styles/globalStyles';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation, user }) => {
  // Estados para datos
  const [stats, setStats] = useState(null);
  const [recentTrainings, setRecentTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  /**
   * Cargar datos iniciales
   */
  const loadData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    
    try {
      console.log('🏠 Cargando datos del dashboard...');
      
      // Cargar estadísticas y entrenamientos recientes en paralelo
      const [statsResult, trainingsResult] = await Promise.all([
        statsService.getDashboardStats(),
        trainingService.getTrainings({ limit: 3 }) // Solo los 3 más recientes
      ]);
      
      // Actualizar estadísticas
      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        console.warn('⚠️ Error cargando estadísticas:', statsResult.error);
      }
      
      // Actualizar entrenamientos recientes
      if (trainingsResult.success) {
        setRecentTrainings(trainingsResult.data.slice(0, 3));
      } else {
        console.warn('⚠️ Error cargando entrenamientos:', trainingsResult.error);
      }
      
    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  /**
   * Recargar datos cuando la pantalla recibe foco
   */
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );
  
  /**
   * Manejar pull-to-refresh
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(false);
  };
  
  /**
   * Obtener saludo según la hora
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return 'Buenos días';
    } else if (hour < 18) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  };
  
  /**
   * Navegar a crear entrenamiento
   */
  const goToCreateTraining = () => {
    navigation.navigate('Trainings', { screen: 'CreateTraining' });
  };
  
  /**
   * Navegar a lista de entrenamientos
   */
  const goToTrainingsList = () => {
    navigation.navigate('Trainings', { screen: 'TrainingList' });
  };
  
  /**
   * Navegar a estadísticas
   */
  const goToStats = () => {
    navigation.navigate('Stats');
  };
  
  /**
   * Renderizar header con saludo
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>
          {getGreeting()},
        </Text>
        <Text style={styles.userName}>
          {user?.first_name || user?.username || 'Usuario'}!
        </Text>
      </View>
      
      <TouchableOpacity style={styles.profileButton}>
        <Ionicons 
          name="person-circle-outline" 
          size={40} 
          color={Colors.primary} 
        />
      </TouchableOpacity>
    </View>
  );
  
  /**
   * Renderizar estadísticas principales
   */
  const renderStats = () => {
    if (!stats) {
      return (
        <Card title="Estadísticas" icon="stats-chart-outline">
          <Text style={styles.noDataText}>
            Comienza a registrar entrenamientos para ver tus estadísticas
          </Text>
        </Card>
      );
    }
    
    return (
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Resumen General</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            label="Entrenamientos"
            value={stats.totalTrainings}
            icon="fitness-outline"
            color={Colors.primary}
            style={styles.statCard}
          />
          
          <StatCard
            label="Distancia Total"
            value={stats.totalDistance?.toFixed(1) || '0'}
            unit="km"
            icon="location-outline"
            color={Colors.success}
            style={styles.statCard}
          />
          
          <StatCard
            label="Este Mes"
            value={stats.trainingsThisMonth}
            icon="calendar-outline"
            color={Colors.info}
            style={styles.statCard}
          />
          
          <StatCard
            label="Velocidad Promedio"
            value={stats.avgSpeed?.toFixed(1) || '0'}
            unit="km/h"
            icon="speedometer-outline" 
            color={Colors.warning}
            style={styles.statCard}
          />
        </View>
      </View>
    );
  };
  
  /**
   * Renderizar entrenamientos recientes
   */
  const renderRecentTrainings = () => (
    <View style={styles.recentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Entrenamientos Recientes</Text>
        <TouchableOpacity onPress={goToTrainingsList}>
          <Text style={styles.seeAllText}>Ver todos</Text>
        </TouchableOpacity>
      </View>
      
      {recentTrainings.length > 0 ? (
        recentTrainings.map((training) => (
          <TouchableOpacity 
            key={training.id}
            style={styles.trainingItem}
            onPress={() => {/* Navegar a detalles */}}
          >
            <View style={styles.trainingIcon}>
              <Ionicons 
                name="fitness" 
                size={24} 
                color={Colors.primary} 
              />
            </View>
            
            <View style={styles.trainingInfo}>
              <Text style={styles.trainingTitle}>
                {training.title}
              </Text>
              <Text style={styles.trainingDate}>
                {training.dateDisplay}
              </Text>
            </View>
            
            <View style={styles.trainingStats}>
              {training.distance && (
                <Text style={styles.trainingStatText}>
                  {training.distanceDisplay}
                </Text>
              )}
              {training.duration && (
                <Text style={styles.trainingStatText}>
                  {training.durationDisplay}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Card>
          <View style={styles.noDataContainer}>
            <Ionicons 
              name="fitness-outline" 
              size={48} 
              color={Colors.textMuted} 
            />
            <Text style={styles.noDataText}>
              No tienes entrenamientos registrados
            </Text>
            <Text style={styles.noDataSubtext}>
              Crea tu primer entrenamiento para comenzar
            </Text>
          </View>
        </Card>
      )}
    </View>
  );
  
  /**
   * Renderizar acciones rápidas
   */
  const renderQuickActions = () => (
    <View style={styles.actionsContainer}>
      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
      
      <Button
        title="Nuevo Entrenamiento"
        icon="add-circle-outline"
        onPress={goToCreateTraining}
        style={styles.actionButton}
      />
      
      <View style={styles.actionRow}>
        <Button
          title="Ver Estadísticas"
          variant="outline"
          icon="stats-chart-outline"
          onPress={goToStats}
          style={styles.halfButton}
        />
        
        <Button
          title="Entrenamientos"
          variant="outline"
          icon="list-outline"
          onPress={goToTrainingsList}
          style={styles.halfButton}
        />
      </View>
    </View>
  );
  
  // Mostrar spinner mientras carga
  if (isLoading) {
    return (
      <FullScreenSpinner text="Cargando dashboard..." />
    );
  }
  
  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header con saludo */}
        {renderHeader()}
        
        {/* Estadísticas principales */}
        {renderStats()}
        
        {/* Entrenamientos recientes */}
        {renderRecentTrainings()}
        
        {/* Acciones rápidas */}
        {renderQuickActions()}
      </ScrollView>
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
    paddingBottom: 100, // Espacio extra para el tab bar
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  greetingContainer: {
    flex: 1,
  },
  
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  
  profileButton: {
    padding: 4,
  },
  
  // Secciones
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  
  // Estadísticas
  statsContainer: {
    marginBottom: 32,
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  statCard: {
    width: (width - 52) / 2,
    marginBottom: 12,
  },
  
  // Entrenamientos recientes
  recentContainer: {
    marginBottom: 32,
  },
  
  trainingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  
  trainingInfo: {
    flex: 1,
  },
  
  trainingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  
  trainingDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  
  trainingStats: {
    alignItems: 'flex-end',
  },
  
  trainingStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  
  // Acciones rápidas
  actionsContainer: {
    marginBottom: 32,
  },
  
  actionButton: {
    marginBottom: 12,
  },
  
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  halfButton: {
    width: (width - 52) / 2,
  },
  
  // Sin datos
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  
  noDataText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  
  noDataSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});

export default HomeScreen;