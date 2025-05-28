/**
 * Pantalla de Estadísticas para AthCyl
 * 
 * Esta pantalla muestra las estadísticas detalladas del usuario:
 * - Resumen general de entrenamientos
 * - Gráficos de progreso
 * - Estadísticas por período
 * - Récords personales
 * 
 * Características:
 * - Datos actualizados en tiempo real
 * - Filtros por período (semanal, mensual, anual)
 * - Visualización de tendencias
 * - Exportación de estadísticas
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
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

// Importar estilos y colores
import { Colors } from '../../config/colors';
import { globalStyles } from '../../styles/globalStyles';

const { width } = Dimensions.get('window');

const StatsScreen = ({ user }) => {
  // Estados para datos
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState({ datos: [] });
  const [selectedPeriod, setSelectedPeriod] = useState('mensual');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Opciones de período
  const periodOptions = [
    { key: 'semanal', label: 'Semanal' },
    { key: 'mensual', label: 'Mensual' },
    { key: 'anual', label: 'Anual' }
  ];
  
  /**
   * Cargar todos los datos de estadísticas
   */
  const loadStatsData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    
    try {
      console.log('📊 Cargando estadísticas completas...');
      
      // Cargar estadísticas y tendencias en paralelo
      const [statsResult, trendsResult] = await Promise.all([
        statsService.getUserStats(true), // Forzar actualización
        statsService.getTrends(selectedPeriod)
      ]);
      
      // Actualizar estadísticas
      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        console.warn('⚠️ Error cargando estadísticas:', statsResult.error);
      }
      
      // Actualizar tendencias
      if (trendsResult.success) {
        setTrends(trendsResult.data);
      } else {
        console.warn('⚠️ Error cargando tendencias:', trendsResult.error);
      }
      
    } catch (error) {
      console.error('❌ Error cargando datos de estadísticas:', error);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  /**
   * Cargar datos cuando la pantalla recibe foco
   */
  useFocusEffect(
    useCallback(() => {
      loadStatsData();
    }, [selectedPeriod])
  );
  
  /**
   * Manejar pull-to-refresh
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStatsData(false);
  };
  
  /**
   * Cambiar período de tendencias
   */
  const changePeriod = (period) => {
    setSelectedPeriod(period);
  };
  
  /**
   * Exportar estadísticas (placeholder)
   */
  const exportStats = () => {
    Alert.alert(
      'Exportar Estadísticas',
      '¿En qué formato quieres exportar tus estadísticas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'PDF', onPress: () => Alert.alert('Info', 'Función de exportación próximamente') },
        { text: 'CSV', onPress: () => Alert.alert('Info', 'Función de exportación próximamente') }
      ]
    );
  };
  
  /**
   * Renderizar estadísticas generales
   */
  const renderGeneralStats = () => {
    if (!stats || stats.total_trainings === 0) {
      return (
        <Card title="Estadísticas Generales" icon="stats-chart-outline">
          <View style={styles.noDataContainer}>
            <Ionicons name="stats-chart-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.noDataText}>
              Aún no tienes estadísticas
            </Text>
            <Text style={styles.noDataSubtext}>
              Crea algunos entrenamientos para ver tus estadísticas aquí
            </Text>
          </View>
        </Card>
      );
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas Generales</Text>
        
        <View style={styles.statsGrid}>
          {/* Primera fila */}
          <StatCard
            label="Total Entrenamientos"
            value={stats.total_trainings}
            icon="fitness-outline"
            color={Colors.primary}
            style={styles.statCard}
          />
          
          <StatCard
            label="Distancia Total"
            value={stats.total_distance?.toFixed(1) || '0'}
            unit="km"
            icon="location-outline"
            color={Colors.success}
            style={styles.statCard}
          />
          
          {/* Segunda fila */}
          <StatCard
            label="Tiempo Total"
            value={stats.totalDurationDisplay || '0h'}
            icon="time-outline"
            color={Colors.info}
            style={styles.statCard}
          />
          
          <StatCard
            label="Calorías Totales"
            value={stats.total_calories || '0'}
            unit="kcal"
            icon="flame-outline"
            color={Colors.warning}
            style={styles.statCard}
          />
        </View>
      </View>
    );
  };
  
  /**
   * Renderizar promedios
   */
  const renderAverages = () => {
    if (!stats || stats.total_trainings === 0) {
      return null;
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Promedios</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            label="Distancia Promedio"
            value={stats.avg_distance_per_training?.toFixed(1) || '0'}
            unit="km"
            icon="trending-up-outline"
            color={Colors.primary}
            style={styles.statCard}
          />
          
          <StatCard
            label="Velocidad Promedio"
            value={stats.avg_speed?.toFixed(1) || '0'}
            unit="km/h"
            icon="speedometer-outline"
            color={Colors.success}
            style={styles.statCard}
          />
          
          <StatCard
            label="Duración Promedio"
            value={stats.avgDurationDisplay || '0h'}
            icon="timer-outline"
            color={Colors.info}
            style={styles.statCard}
          />
          
          <StatCard
            label="Ritmo Cardíaco"
            value={stats.avg_heart_rate ? Math.round(stats.avg_heart_rate) : '0'}
            unit="bpm"
            icon="heart-outline"
            color={Colors.error}
            style={styles.statCard}
          />
        </View>
      </View>
    );
  };
  
  /**
   * Renderizar récords personales
   */
  const renderRecords = () => {
    if (!stats || stats.total_trainings === 0) {
      return null;
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Récords Personales</Text>
        
        <Card>
          <View style={styles.recordsContainer}>
            <View style={styles.recordItem}>
              <Ionicons name="trophy-outline" size={24} color={Colors.warning} />
              <View style={styles.recordText}>
                <Text style={styles.recordLabel}>Mayor Distancia</Text>
                <Text style={styles.recordValue}>
                  {stats.longest_distance?.toFixed(2) || '0'} km
                </Text>
              </View>
            </View>
            
            <View style={styles.recordItem}>
              <Ionicons name="time-outline" size={24} color={Colors.info} />
              <View style={styles.recordText}>
                <Text style={styles.recordLabel}>Mayor Duración</Text>
                <Text style={styles.recordValue}>
                  {stats.longestDurationDisplay || '0h'}
                </Text>
              </View>
            </View>
            
            <View style={styles.recordItem}>
              <Ionicons name="speedometer-outline" size={24} color={Colors.success} />
              <View style={styles.recordText}>
                <Text style={styles.recordLabel}>Velocidad Máxima</Text>
                <Text style={styles.recordValue}>
                  {stats.highest_speed?.toFixed(1) || '0'} km/h
                </Text>
              </View>
            </View>
            
            <View style={styles.recordItem}>
              <Ionicons name="trending-up-outline" size={24} color={Colors.primary} />
              <View style={styles.recordText}>
                <Text style={styles.recordLabel}>Mayor Desnivel</Text>
                <Text style={styles.recordValue}>
                  {stats.highest_elevation_gain?.toFixed(0) || '0'} m
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </View>
    );
  };
  
  /**
   * Renderizar selector de período
   */
  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {periodOptions.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.periodButton,
            selectedPeriod === option.key && styles.periodButtonActive
          ]}
          onPress={() => changePeriod(option.key)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === option.key && styles.periodButtonTextActive
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  /**
   * Renderizar tendencias
   */
  const renderTrends = () => {
    if (!trends.datos || trends.datos.length === 0) {
      return (
        <Card title="Tendencias" icon="analytics-outline">
          <Text style={styles.noDataText}>
            No hay suficientes datos para mostrar tendencias
          </Text>
        </Card>
      );
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tendencias por {selectedPeriod}</Text>
        
        {renderPeriodSelector()}
        
        <Card>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.trendsContainer}>
              {trends.datos.slice(-6).map((item, index) => (
                <View key={index} style={styles.trendItem}>
                  <Text style={styles.trendPeriod}>{item.periodo}</Text>
                  <View style={styles.trendStats}>
                    <Text style={styles.trendValue}>
                      {item.entrenamientos} 🏃
                    </Text>
                    <Text style={styles.trendValue}>
                      {item.distanciaTotal?.toFixed(1)} km
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </Card>
      </View>
    );
  };
  
  /**
   * Renderizar botones de acción
   */
  const renderActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Acciones</Text>
      
      <Button
        title="Exportar Estadísticas"
        icon="download-outline"
        variant="outline"
        onPress={exportStats}
        style={styles.actionButton}
      />
    </View>
  );
  
  // Mostrar spinner de carga
  if (isLoading) {
    return <FullScreenSpinner text="Cargando estadísticas..." />;
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
        {/* Estadísticas generales */}
        {renderGeneralStats()}
        
        {/* Promedios */}
        {renderAverages()}
        
        {/* Récords personales */}
        {renderRecords()}
        
        {/* Tendencias */}
        {renderTrends()}
        
        {/* Acciones */}
        {renderActions()}
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
    paddingBottom: 100,
  },
  
  section: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  
  // Estadísticas en grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  statCard: {
    width: (width - 52) / 2,
    marginBottom: 12,
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
  
  // Récords personales
  recordsContainer: {
    paddingVertical: 8,
  },
  
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  
  recordText: {
    marginLeft: 16,
    flex: 1,
  },
  
  recordLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  
  recordValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  
  // Selector de período
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  
  periodButtonTextActive: {
    color: Colors.white,
  },
  
  // Tendencias
  trendsContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  
  trendItem: {
    alignItems: 'center',
    marginRight: 24,
    minWidth: 80,
  },
  
  trendPeriod: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  trendStats: {
    alignItems: 'center',
  },
  
  trendValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  
  // Acciones
  actionButton: {
    marginBottom: 12,
  },
});

export default StatsScreen;