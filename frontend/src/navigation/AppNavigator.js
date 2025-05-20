// src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
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

// Configuración de navegadores
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Navegador para las pantallas de autenticación (login/registro)
 */
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

/**
 * Navegador para la sección de entrenamientos
 */
const TrainingsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="TrainingsList" 
      component={TrainingsScreen} 
      options={{ title: 'Mis Entrenamientos' }} 
    />
    <Stack.Screen 
      name="TrainingDetail" 
      component={TrainingDetailScreen} 
      options={{ title: 'Detalle de Entrenamiento' }} 
    />
    <Stack.Screen 
      name="AddTraining" 
      component={AddTrainingScreen} 
      options={{ title: 'Nuevo Entrenamiento' }} 
    />
  </Stack.Navigator>
);

/**
 * Navegador para la sección de estadísticas
 */
const StatsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="StatsDashboard" 
      component={StatsScreen} 
      options={{ title: 'Estadísticas' }} 
    />
    <Stack.Screen 
      name="Goals" 
      component={GoalsScreen} 
      options={{ title: 'Mis Objetivos' }} 
    />
    <Stack.Screen 
      name="Achievements" 
      component={AchievementsScreen} 
      options={{ title: 'Logros y Medallas' }} 
    />
  </Stack.Navigator>
);

/**
 * Navegador principal con tabs para usuarios autenticados
 * Con etiquetas e iconos en español
 */
const MainNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Trainings':
              iconName = focused ? 'fitness' : 'fitness-outline';
              break;
            case 'Stats':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Inicio' }} 
      />
      <Tab.Screen 
        name="Trainings" 
        component={TrainingsNavigator} 
        options={{ title: 'Entrenamientos' }} 
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsNavigator} 
        options={{ title: 'Estadísticas' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Perfil' }} 
      />
    </Tab.Navigator>
  );
};

/**
 * Componente de pantalla de carga
 */
const LoadingScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff' 
  }}>
    <ActivityIndicator size="large" color="#1E88E5" />
    <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
      Cargando...
    </Text>
  </View>
);

/**
 * Navegador principal de la aplicación
 * Decide entre mostrar auth o main según el estado de autenticación
 */
const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);
  
  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <NotificationProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Usuario autenticado - mostrar navegación principal
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // Usuario no autenticado - mostrar pantallas de login/registro
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NotificationProvider>
  );
};

export default AppNavigator;