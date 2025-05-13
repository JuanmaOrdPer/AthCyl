import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Contexto de autenticación
import { AuthContext } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

// Pantallas de autenticación
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Pantallas principales
import HomeScreen from '../screens/main/HomeScreen';
import TrainingsScreen from '../screens/main/TrainingsScreen';
import TrainingDetailScreen from '../screens/main/TrainingDetailScreen';
import AddTrainingScreen from '../screens/main/AddTrainingScreen';
import StatsScreen from '../screens/main/StatsScreen';
import GoalsScreen from '../screens/main/GoalsScreen';
import AchievementsScreen from '../screens/main/AchievementsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navegador para las pantallas de autenticación
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Navegador para las pantallas de entrenamientos
const TrainingsNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TrainingsList" component={TrainingsScreen} options={{ title: 'Mis Entrenamientos' }} />
      <Stack.Screen name="TrainingDetail" component={TrainingDetailScreen} options={{ title: 'Detalle de Entrenamiento' }} />
      <Stack.Screen name="AddTraining" component={AddTrainingScreen} options={{ title: 'Nuevo Entrenamiento' }} />
    </Stack.Navigator>
  );
};

// Navegador para las pantallas de estadísticas
const StatsNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="StatsDashboard" component={StatsScreen} options={{ title: 'Estadísticas' }} />
      <Stack.Screen name="Goals" component={GoalsScreen} options={{ title: 'Mis Objetivos' }} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ title: 'Logros y Medallas' }} />
    </Stack.Navigator>
  );
};

// Navegador principal con tabs
const MainNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Trainings') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Trainings" component={TrainingsNavigator} options={{ title: 'Entrenamientos' }} />
      <Tab.Screen name="Stats" component={StatsNavigator} options={{ title: 'Estadísticas' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
};

// Navegador principal que decide entre Auth y Main según el estado de autenticación
const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);
  
  // Si está cargando, podríamos mostrar una pantalla de splash o un spinner
  if (loading) {
    return null; // O un componente de carga
  }
  
  return (
    <NotificationProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NotificationProvider>
  );
};

export default AppNavigator;
