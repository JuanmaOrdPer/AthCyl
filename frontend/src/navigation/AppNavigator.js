/**
 * Navegador Principal de la Aplicación AthCyl
 * 
 * Este navegador maneja la lógica principal de navegación:
 * - Muestra AuthNavigator si el usuario no está autenticado
 * - Muestra MainNavigator si el usuario está autenticado
 * - Gestiona las transiciones entre estados de autenticación
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';

// Importar navegadores
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Importar colores
import { Colors } from '../config/colors';
import { globalStyles } from '../styles/globalStyles';

const AppNavigator = ({ isAuthenticated, user, onLogin, onLogout }) => {
  
  /**
   * Mostrar navegador según estado de autenticación
   */
  if (isAuthenticated === null) {
    // Estado de carga inicial
    return (
      <View style={[globalStyles.container, globalStyles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  if (isAuthenticated && user) {
    // Usuario autenticado - mostrar app principal
    return (
      <MainNavigator 
        user={user}
        onLogout={onLogout}
      />
    );
  } else {
    // Usuario no autenticado - mostrar pantallas de auth
    return (
      <AuthNavigator 
        onLogin={onLogin}
      />
    );
  }
};

export default AppNavigator;