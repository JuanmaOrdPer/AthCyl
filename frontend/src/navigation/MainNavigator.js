/**
 * Navegador Principal para AthCyl
 * 
 * Este navegador maneja las pantallas principales de la aplicación
 * utilizando Tab Navigator para la navegación inferior.
 * 
 * Pestañas incluidas:
 * - Home: Dashboard principal
 * - Entrenamientos: Gestión de entrenamientos
 * - Estadísticas: Métricas y gráficos
 * - Perfil: Configuración y perfil de usuario
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Importar pantallas principales
import HomeScreen from '../screens/main/HomeScreen';
import TrainingScreen from '../screens/main/TrainingScreen';
import TrainingListScreen from '../screens/main/TrainingListScreen';
import StatsScreen from '../screens/main/StatsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Importar colores
import { Colors } from '../config/colors';

// Crear navegadores
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/**
 * Stack Navigator para Entrenamientos
 * Incluye la lista y el formulario de creación
 */
const TrainingStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="TrainingList" 
        component={TrainingListScreen}
      />
      <Stack.Screen 
        name="CreateTraining" 
        component={TrainingScreen}
        options={{
          headerShown: true,
          title: 'Nuevo Entrenamiento',
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.textPrimary,
          },
          headerTintColor: Colors.primary,
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Navegador Principal con Tabs
 */
const MainNavigator = ({ user, onLogout }) => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        // Configurar iconos de las pestañas
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
              iconName = 'help-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        
        // Configuración visual de las pestañas
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        
        // Configuración del header
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: Colors.primary,
        },
        headerTitleAlign: 'center',
      })}
    >
      {/* Pestaña Home */}
      <Tab.Screen
        name="Home"
        options={{
          title: 'Inicio',
          headerTitle: 'AthCyl',
        }}
      >
        {(props) => (
          <HomeScreen 
            {...props}
            user={user}
          />
        )}
      </Tab.Screen>
      
      {/* Pestaña Entrenamientos */}
      <Tab.Screen
        name="Trainings"
        component={TrainingStackNavigator}
        options={{
          title: 'Entrenamientos',
          headerShown: false, // El stack interno maneja el header
        }}
      />
      
      {/* Pestaña Estadísticas */}
      <Tab.Screen
        name="Stats"
        options={{
          title: 'Estadísticas',
          headerTitle: 'Mis Estadísticas',
        }}
      >
        {(props) => (
          <StatsScreen 
            {...props}
            user={user}
          />
        )}
      </Tab.Screen>
      
      {/* Pestaña Perfil */}
      <Tab.Screen
        name="Profile"
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil',
        }}
      >
        {(props) => (
          <ProfileScreen 
            {...props}
            user={user}
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainNavigator;