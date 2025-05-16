import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Title, Text, Card, Button, Divider, useTheme, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import ActivitySummary from '../../components/ActivitySummary';
import TrainingCard from '../../components/TrainingCard';
import GoalCard from '../../components/GoalCard';
import AchievementCard from '../../components/AchievementCard';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const notification = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentTrainings, setRecentTrainings] = useState([]);
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [activitySummary, setActivitySummary] = useState(null);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas
      const statsResponse = await api.get('/api/stats/user-stats/summary/');
      setStats(statsResponse.data);
      
      // Cargar entrenamientos recientes
      const trainingsResponse = await api.get('/api/trainings/trainings/?limit=5');
      setRecentTrainings(trainingsResponse.data.results || []);
      
      // Cargar objetivos activos
      const goalsResponse = await api.get('/api/trainings/goals/active/');
      // Asegurarse de que goals sea siempre un array
      const goalsData = Array.isArray(goalsResponse?.data) ? goalsResponse.data : [];
      setGoals(goalsData);
      
      // Cargar logros recientes
      const achievementsResponse = await api.get('/api/stats/achievements/recent/?limit=3');
      // Asegurarse de que achievements sea siempre un array
      const achievementsData = Array.isArray(achievementsResponse?.data) ? achievementsResponse.data : [];
      setAchievements(achievementsData);
      
      // Cargar resumen de actividad semanal
      const summaryResponse = await api.get('/api/stats/user-stats/weekly_summary/');
      setActivitySummary(summaryResponse.data);
      
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      notification.showError('Error al cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.welcomeText}>¡Hola, {user?.first_name || user?.username}!</Title>
        <Text style={styles.dateText}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </View>
      
      {/* Resumen de actividad semanal */}
      {activitySummary && (
        <ActivitySummary 
          data={activitySummary} 
          period="week" 
          goals={Array.isArray(goals) ? goals.reduce((acc, goal) => {
            if (goal && goal.goal_type) {
              acc[goal.goal_type] = goal;
            }
            return acc;
          }, {}) : {}} 
        />
      )}
      
      {/* Entrenamientos recientes */}
      <Card style={styles.card}>
        <Card.Title title="Entrenamientos Recientes" />
        <Card.Content>
          {recentTrainings.length > 0 ? (
            recentTrainings.map((training) => (
              <TrainingCard
                key={training.id}
                training={training}
                onPress={() => navigation.navigate('Trainings', { 
                  screen: 'TrainingDetail', 
                  params: { trainingId: training.id } 
                })}
                compact
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No hay entrenamientos recientes</Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('Trainings')}>Ver Todos</Button>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Trainings', { screen: 'AddTraining' })}
            icon="plus"
          >
            Nuevo Entrenamiento
          </Button>
        </Card.Actions>
      </Card>
      
      {/* Objetivos activos */}
      <Card style={styles.card}>
        <Card.Title title="Mis Objetivos" />
        <Card.Content>
          {goals.length > 0 ? (
            goals.slice(0, 3).map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onPress={() => navigation.navigate('Stats', { 
                  screen: 'Goals', 
                  params: { goalId: goal.id } 
                })}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No hay objetivos activos</Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('Stats', { screen: 'Goals' })}>
            Ver Todos
          </Button>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Stats', { 
              screen: 'Goals', 
              params: { action: 'create' } 
            })}
            icon="flag"
          >
            Nuevo Objetivo
          </Button>
        </Card.Actions>
      </Card>
      
      {/* Logros recientes */}
      <Card style={styles.card}>
        <Card.Title title="Logros Recientes" />
        <Card.Content>
          {Array.isArray(achievements) && achievements.length > 0 ? (
            achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                unlocked={true}
                onPress={() => navigation.navigate('Stats', { 
                  screen: 'Achievements', 
                  params: { achievementId: achievement.id } 
                })}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No hay logros recientes</Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Button 
            onPress={() => navigation.navigate('Stats', { screen: 'Achievements' })}
            icon="trophy"
          >
            Ver Todos los Logros
          </Button>
        </Card.Actions>
      </Card>
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
  header: {
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  trainingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  trainingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trainingDate: {
    fontSize: 14,
    color: '#666',
  },
  trainingDistance: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  trainingType: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalType: {
    fontSize: 14,
    color: '#666',
  },
  goalProgress: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  goalValue: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  divider: {
    marginVertical: 4,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
    paddingVertical: 16,
  },
});

export default HomeScreen;
