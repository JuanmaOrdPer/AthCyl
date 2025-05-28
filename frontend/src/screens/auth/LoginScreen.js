/**
 * Pantalla de Login para AthCyl
 * 
 * Esta pantalla permite a los usuarios iniciar sesión en la aplicación
 * usando su email o nombre de usuario junto con su contraseña.
 * 
 * Características:
 * - Login con email o username
 * - Validación de campos
 * - Manejo de errores
 * - Navegación a registro
 * - Estados de carga
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Importar componentes
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

// Importar servicios y utilidades
import authService from '../../services/authService';
import { Colors } from '../../config/colors';
import { globalStyles } from '../../styles/globalStyles';

const LoginScreen = ({ navigation, onLogin }) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Actualizar datos del formulario
   */
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };
  
  /**
   * Validar formulario antes de enviar
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Validar email/username
    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Email o usuario es requerido';
    }
    
    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'Contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Manejar envío del formulario de login
   */
  const handleLogin = async () => {
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔐 Intentando login...');
      
      // Llamar al servicio de autenticación
      const result = await authService.login(
        formData.usernameOrEmail.trim(),
        formData.password
      );
      
      if (result.success) {
        console.log('✅ Login exitoso');
        
        // Llamar callback de login exitoso
        if (onLogin) {
          onLogin(result.user);
        }
        
      } else {
        console.log('❌ Login fallido:', result.error);
        
        // Mostrar error
        Alert.alert(
          'Error de Autenticación',
          result.error || 'No se pudo iniciar sesión. Verifica tus credenciales.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('❌ Error inesperado en login:', error);
      
      Alert.alert(
        'Error',
        'Ha ocurrido un error inesperado. Por favor, inténtalo nuevamente.',
        [{ text: 'OK' }]
      );
      
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Navegar a pantalla de registro
   */
  const goToRegister = () => {
    navigation.navigate('Register');
  };
  
  /**
   * Manejar "Olvidé mi contraseña" (placeholder)
   */
  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Contraseña',
      'Esta funcionalidad estará disponible próximamente.',
      [{ text: 'OK' }]
    );
  };
  
  return (
    <KeyboardAvoidingView 
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header con logo */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Ionicons 
              name="fitness" 
              size={60} 
              color={Colors.primary} 
            />
            <Text style={styles.logoText}>AthCyl</Text>
            <Text style={styles.tagline}>
              Tu compañero de entrenamientos
            </Text>
          </View>
        </View>
        
        {/* Formulario de login */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Iniciar Sesión</Text>
          <Text style={styles.formSubtitle}>
            Accede a tu cuenta para continuar
          </Text>
          
          {/* Campo Email/Usuario */}
          <Input
            label="Email o Usuario"
            placeholder="Introduce tu email o nombre de usuario"
            value={formData.usernameOrEmail}
            onChangeText={(value) => updateFormData('usernameOrEmail', value)}
            error={errors.usernameOrEmail}
            icon="person-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {/* Campo Contraseña */}
          <Input
            label="Contraseña"
            placeholder="Introduce tu contraseña"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            error={errors.password}
            icon="lock-closed-outline"
            secureTextEntry={true}
          />
          
          {/* Enlace "Olvidé mi contraseña" */}
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
          
          {/* Botón de login */}
          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
          />
          
          {/* Divisor */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O</Text>
            <View style={styles.dividerLine} />
          </View>
          
          {/* Enlace a registro */}
          <TouchableOpacity 
            style={styles.registerLink}
            onPress={goToRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerText}>
              ¿No tienes cuenta?{' '}
              <Text style={styles.registerTextHighlight}>
                Regístrate aquí
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Overlay de carga */}
      {isLoading && (
        <LoadingSpinner
          overlay={true}
          text="Iniciando sesión..."
        />
      )}
    </KeyboardAvoidingView>
  );
};

// ===== ESTILOS DE LA PANTALLA =====
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  logoContainer: {
    alignItems: 'center',
  },
  
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 12,
  },
  
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  
  formContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  formSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  
  loginButton: {
    marginBottom: 24,
  },
  
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  
  dividerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginHorizontal: 16,
  },
  
  registerLink: {
    alignItems: 'center',
  },
  
  registerText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  registerTextHighlight: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;