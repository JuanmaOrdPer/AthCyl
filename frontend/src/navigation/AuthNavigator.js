/**
 * Navegador de Autenticación para AthCyl
 * 
 * Este navegador maneja las pantallas relacionadas con autenticación:
 * - Pantalla de Login
 * - Pantalla de Registro
 * 
 * Utiliza Stack Navigator para permitir navegación entre estas pantallas.
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Importar pantallas de autenticación
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Importar colores para el tema
import { Colors } from '../config/colors';

// Crear stack navigator
const Stack = createStackNavigator();

const AuthNavigator = ({ onLogin }) => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false, // Sin header por defecto
        gestureEnabled: true, // Permitir gestos de navegación
        cardStyle: { backgroundColor: Colors.background },
        
        // Configuración de transiciones
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      {/* Pantalla de Login */}
      <Stack.Screen 
        name="Login"
        options={{
          title: 'Iniciar Sesión',
        }}
      >
        {(props) => (
          <LoginScreen 
            {...props}
            onLogin={onLogin}
          />
        )}
      </Stack.Screen>
      
      {/* Pantalla de Registro */}
      <Stack.Screen 
        name="Register"
        options={{
          title: 'Registrarse',
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.textPrimary,
          },
          headerTintColor: Colors.primary,
          headerBackTitleVisible: false,
        }}
      >
        {(props) => (
          <RegisterScreen 
            {...props}
            onLogin={onLogin}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AuthNavigator;