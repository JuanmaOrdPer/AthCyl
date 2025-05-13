import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Card, Title, Text, Button, ActivityIndicator, useTheme, Chip, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import api from '../../services/api';
import TrainingChart from '../../components/TrainingChart';
import { formatDuration, getActivityName, getRandomColor } from '../../utils/helpers';

const screenWidth = Dimensions.get('window').width - 32; // Ancho de pantalla menos márgenes

const StatsScreen = ({ navigation }) => {
  const theme = useTheme();
  
  const [stats, setStats] = useState(null);
  const [activityTrends, setActivityTrends] = useState([]);
  const [activityDistribution, setActivityDistribution] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas generales
      const statsResponse = await api.get('/api/stats/user-stats/summary/?update=true');
      setStats(statsResponse.data);
      
      // Cargar tendencias de actividad
      const trendsResponse = await api.get(`/api/stats/user-stats/activity_trends/?period=${period}`);
      setActivityTrends(trendsResponse.data || []);
      
      // Preparar distribución de actividades
      if (statsResponse.data && statsResponse.data.activity_distribution) {
        const distribution = statsResponse.data.activity_distribution;
        const data = [];
        
        // Colores para cada tipo de actividad
        const colors = {
          running: '#FF5722',
          cycling: '#2196F3',
          swimming: '#4CAF50',
          walking: '#9C27B0',
          hiking: '#FFC107',
          other: '#607D8B',
        };
        
        // Convertir a formato para PieChart
        Object.keys(distribution).forEach((key, index) => {
          data.push({
            name: getActivityName(key),
            count: distribution[key],
            color: colors[key] || getRandomColor(),
            legendFontColor: '#7F7F7F',
            legendFontSize: 12,
          });
        });
        
        setActivityDistribution(data);
      }
      
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, [period]);
  
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  // Preparar datos para el gráfico de tendencias
  const getTrendsChartData = (dataKey) => {
    if (!activityTrends || activityTrends.length === 0) return null;
    
    const labels = activityTrends.map(item => {
      // Simplificar etiquetas según el período
      if (period === 'weekly') {
        // Extraer número de semana
        return item.period.split('-')[1] || item.period;
      } else if (period === 'monthly') {
        // Extraer mes
        const date = new Date(item.period);
        return date.toLocaleDateString('es-ES', { month: 'short' });
      } else {
        return item.period;
      }
    });
    
    const data = activityTrends.map(item => {
      if (dataKey === 'distance') {
        return item.total_distance || 0;
      } else if (dataKey === 'count') {
        return item.training_count || 0;
      } else if (dataKey === 'calories') {
        return item.total_calories || 0;
      }
      return 0;
    });
    
    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => theme.colors.primary,
          strokeWidth: 2,
        }
      ],
    };
  };
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      ) : (
        <>
          {/* Resumen de estadísticas */}
          <Card style={styles.card}>
            <Card.Title title="Resumen de Actividad" />
            <Card.Content>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons name="fitness" size={24} color={theme.colors.primary} />
                  <Text style={styles.statValue}>{stats?.stats?.total_trainings || 0}</Text>
                  <Text style={styles.statLabel}>Entrenamientos</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Ionicons name="speedometer" size={24} color={theme.colors.primary} />
                  <Text style={styles.statValue}>{stats?.stats?.total_distance ? `${stats.stats.total_distance.toFixed(1)} km` : '0 km'}</Text>
                  <Text style={styles.statLabel}>Distancia</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Ionicons name="time" size={24} color={theme.colors.primary} />
                  <Text style={styles.statValue}>{stats?.stats?.total_duration ? formatDuration(stats.stats.total_duration) : '0h'}</Text>
                  <Text style={styles.statLabel}>Tiempo</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Ionicons name="flame" size={24} color={theme.colors.primary} />
                  <Text style={styles.statValue}>{stats?.stats?.total_calories ? `${stats.stats.total_calories.toFixed(0)}` : '0'}</Text>
                  <Text style={styles.statLabel}>Calorías</Text>
                </View>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons name="trending-up" size={24} color={theme.colors.primary} />
                  <Text style={styles.statValue}>{stats?.stats?.avg_elevation_gain ? `${stats.stats.avg_elevation_gain.toFixed(0)} m` : '0 m'}</Text>
                  <Text style={styles.statLabel}>Desnivel</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Ionicons name="pulse" size={24} color={theme.colors.primary} />
                  <Text style={styles.statValue}>{stats?.stats?.avg_heart_rate ? `${stats.stats.avg_heart_rate.toFixed(0)} ppm` : 'N/A'}</Text>
                  <Text style={styles.statLabel}>FC Media</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Ionicons name="flash" size={24} color={theme.colors.primary} />
                  <Text style={styles.statValue}>{stats?.stats?.avg_speed ? `${stats.stats.avg_speed.toFixed(1)} km/h` : '0 km/h'}</Text>
                  <Text style={styles.statLabel}>Vel. Media</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                  <Text style={styles.statValue}>{stats?.stats?.active_days || 0}</Text>
                  <Text style={styles.statLabel}>Días Activos</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          {/* Distribución de actividades */}
          <Card style={styles.card}>
            <Card.Title title="Distribución de Actividades" />
            <Card.Content>
              {activityDistribution.length > 0 ? (
                <View style={styles.chartContainer}>
                  <PieChart
                    data={activityDistribution}
                    width={screenWidth}
                    height={220}
                    chartConfig={{
                      backgroundColor: '#fff',
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="count"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay suficientes datos para mostrar la distribución</Text>
                </View>
              )}
            </Card.Content>
          </Card>
          
          {/* Tendencias */}
          <Card style={styles.card}>
            <Card.Title title="Tendencias" />
            <Card.Content>
              <View style={styles.periodSelector}>
                <Chip 
                  selected={period === 'weekly'} 
                  onPress={() => setPeriod('weekly')} 
                  style={styles.periodChip}
                >
                  Semanal
                </Chip>
                <Chip 
                  selected={period === 'monthly'} 
                  onPress={() => setPeriod('monthly')} 
                  style={styles.periodChip}
                >
                  Mensual
                </Chip>
                <Chip 
                  selected={period === 'yearly'} 
                  onPress={() => setPeriod('yearly')} 
                  style={styles.periodChip}
                >
                  Anual
                </Chip>
              </View>
              
              {activityTrends.length > 0 ? (
                <View>
                  {/* Gráfico de tendencias - Distancia */}
                  <Text style={styles.chartTitle}>Tendencia de Distancia</Text>
                  <TrainingChart
                    data={getTrendsChartData('distance')}
                    type="line"
                    yAxisSuffix=" km"
                    bezier={true}
                    height={220}
                  />
                  
                  {/* Gráfico de tendencias - Sesiones */}
                  <Text style={styles.chartTitle}>Sesiones por Período</Text>
                  <TrainingChart
                    data={getTrendsChartData('count')}
                    type="bar"
                    height={220}
                  />
                  
                  {/* Gráfico de tendencias - Calorías */}
                  <Text style={styles.chartTitle}>Tendencia de Calorías</Text>
                  <TrainingChart
                    data={getTrendsChartData('calories')}
                    type="line"
                    yAxisSuffix=" kcal"
                    height={220}
                  />
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay suficientes datos para mostrar tendencias</Text>
                </View>
              )}
            </Card.Content>
          </Card>
          
          {/* Récords personales */}
          <Card style={styles.card}>
            <Card.Title title="Récords Personales" />
            <Card.Content>
              <View style={styles.recordItem}>
                <Text style={styles.recordLabel}>Distancia más larga</Text>
                <Text style={styles.recordValue}>
                  {stats?.stats?.longest_distance ? `${stats.stats.longest_distance.toFixed(2)} km` : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.recordItem}>
                <Text style={styles.recordLabel}>Duración más larga</Text>
                <Text style={styles.recordValue}>
                  {stats?.stats?.longest_duration ? formatDuration(stats.stats.longest_duration) : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.recordItem}>
                <Text style={styles.recordLabel}>Velocidad más alta</Text>
                <Text style={styles.recordValue}>
                  {stats?.stats?.highest_speed ? `${stats.stats.highest_speed.toFixed(1)} km/h` : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.recordItem}>
                <Text style={styles.recordLabel}>Mayor desnivel</Text>
                <Text style={styles.recordValue}>
                  {stats?.stats?.highest_elevation_gain ? `${stats.stats.highest_elevation_gain.toFixed(0)} m` : 'N/A'}
                </Text>
              </View>
            </Card.Content>
          </Card>
          
          {/* Botón para ver objetivos */}
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Goals')}
            style={styles.goalsButton}
            icon="flag"
          >
            Ver Mis Objetivos
          </Button>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
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
  card: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 8,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  periodChip: {
    marginRight: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recordLabel: {
    fontSize: 14,
  },
  recordValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  goalsButton: {
    marginTop: 8,
  },
});

export default StatsScreen;
