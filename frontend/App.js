/**
 * Componente principal de la aplicación AthCyl
 * 
 * Este es el punto de entrada de la aplicación. Se encarga de:
 * - Configurar la navegación principal
 * - Manejar el estado de autenticación
 * - Mostrar splash screen mientras se carga
 * - Configurar el StatusBar
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// Importar navegadores
import AppNavigator from './src/navigation/AppNavigator';

// Importar servicios
import authService from './src/services/authService';

// Importar estilos y colores
import { Colors } from './src/config/colors';
import { globalStyles } from './src/styles/globalStyles';

export default function App() {
  // Estados para manejar la carga y autenticación
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // TEMPORAL - Para debugging
useEffect(() => {
  const testAPI = async () => {
    try {
      console.log('Testing API connection...');
      const response = await fetch('http://TU_IP:8000/admin/');
      console.log('API Response status:', response.status);
    } catch (error) {
      console.log('API Error:', error.message);
    }
  };
  testAPI();
}, []);
  
  /**
   * Verificar estado de autenticación al iniciar la app
   */
  useEffect(() => {
    checkAuthState();
  }, []);
  
  /**
   * Función para verificar si el usuario está autenticado
   */
  const checkAuthState = async () => {
    try {
      console.log('🔍 Verificando estado de autenticación...');
      
      // Verificar si hay una sesión válida
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        // Verificar que el token sea válido
        const isTokenValid = await authService.validateToken();
        
        if (isTokenValid) {
          // Obtener datos del usuario
          const userData = await authService.getCurrentUser();
          
          setIsAuthenticated(true);
          setUser(userData);
          
          console.log('✅ Usuario autenticado:', userData?.email);
        } else {
          // Token inválido, limpiar sesión
          await authService.logout();
          setIsAuthenticated(false);
          setUser(null);
          
          console.log('⚠️ Token inválido, sesión limpiada');
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        
        console.log('ℹ️ Usuario no autenticado');
      }
      
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      
      // En caso de error, asumir no autenticado
      setIsAuthenticated(false);
      setUser(null);
      
    } finally {
      // Ocultar splash screen
      setIsLoading(false);
    }
  };
  
  /**
   * Función para manejar login exitoso
   * @param {object} userData - Datos del usuario logueado
   */
  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    
    console.log('✅ Login exitoso en App.js');
  };
  
  /**
   * Función para manejar logout
   */
  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      
      console.log('✅ Logout exitoso en App.js');
      
    } catch (error) {
      console.error('❌ Error en logout:', error);
    }
  };
  
  /**
   * Mostrar pantalla de carga mientras se verifica autenticación
   */
  if (isLoading) {
    return (
      <View style={[globalStyles.container, globalStyles.centerContent]}>
        <StatusBar style="auto" />
        
        {/* Logo o imagen de la app (opcional) */}
        <Text style={[globalStyles.title, { color: Colors.primary }]}>
          AthCyl
        </Text>
        
        {/* Indicador de carga */}
        <ActivityIndicator 
          size="large" 
          color={Colors.primary} 
          style={{ marginTop: 20 }}
        />
        
        <Text style={[globalStyles.textSecondary, { marginTop: 10 }]}>
          Cargando aplicación...
        </Text>
      </View>
    );
  }
  
  /**
   * Renderizar aplicación principal
   */
  return (
    <NavigationContainer>
      {/* Configurar StatusBar */}
      <StatusBar 
        style="dark" 
        backgroundColor={Colors.background}
        translucent={false}
      />
      
      {/* Navegador principal */}
      <AppNavigator 
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </NavigationContainer>
  );
}