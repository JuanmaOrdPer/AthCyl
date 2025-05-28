/**
 * Pantalla de Registro para AthCyl
 * 
 * Esta pantalla permite a los usuarios crear una nueva cuenta en la aplicación.
 * Incluye validación de campos y manejo de errores.
 * 
 * Características:
 * - Registro con email, username y contraseña
 * - Validación de campos en tiempo real
 * - Confirmación de contraseña
 * - Manejo de errores del servidor
 * - Auto-login después del registro exitoso
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

// Importar componentes
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

// Importar servicios y utilidades
import authService from '../../services/authService';
import { Colors } from '../../config/colors';
import { globalStyles } from '../../styles/globalStyles';

const RegisterScreen = ({ navigation, onLogin }) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
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
   * Validar email
   */
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validar username
   */
  const isValidUsername = (username) => {
    // Solo letras, números y guiones bajos, mínimo 3 caracteres
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    return usernameRegex.test(username);
  };
  
  /**
   * Validar formulario antes de enviar
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Validar nombre
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    
    // Validar apellidos
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Los apellidos son requeridos';
    }
    
    // Validar username
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (!isValidUsername(formData.username)) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres y solo letras, números y guiones bajos';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }
    
    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    // Validar confirmación de contraseña
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Confirma tu contraseña';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Manejar envío del formulario de registro
   */
  const handleRegister = async () => {
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('📝 Intentando registro...');
      
      // Llamar al servicio de registro
      const result = await authService.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
      });
      
      if (result.success) {
        console.log('✅ Registro exitoso');
        
        // Mostrar mensaje de éxito
        Alert.alert(
          '¡Registro Exitoso!',
          'Tu cuenta ha sido creada correctamente.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Si incluye auto-login, ejecutar callback
                if (result.autoLogin && onLogin) {
                  onLogin(result.user);
                } else {
                  // Navegar de vuelta al login
                  navigation.goBack();
                }
              }
            }
          ]
        );
        
      } else {
        console.log('❌ Registro fallido:', result.error);
        
        // Mostrar error
        Alert.alert(
          'Error de Registro',
          result.error || 'No se pudo crear la cuenta. Por favor, inténtalo nuevamente.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('❌ Error inesperado en registro:', error);
      
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
   * Volver al login
   */
  const goToLogin = () => {
    navigation.goBack();
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
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>
            Únete a AthCyl y comienza a llevar el control de tus entrenamientos
          </Text>
        </View>
        
        {/* Formulario de registro */}
        <View style={styles.formContainer}>
          {/* Nombres */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Nombre"
                placeholder="Tu nombre"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                error={errors.firstName}
                icon="person-outline"
                autoCapitalize="words"
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Apellidos"
                placeholder="Tus apellidos"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                error={errors.lastName}
                autoCapitalize="words"
              />
            </View>
          </View>
          
          {/* Usuario */}
          <Input
            label="Nombre de Usuario"
            placeholder="Elige un nombre de usuario único"
            value={formData.username}
            onChangeText={(value) => updateFormData('username', value)}
            error={errors.username}
            icon="at-outline"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {/* Email */}
          <Input
            label="Email"
            placeholder="tu@email.com"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            error={errors.email}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {/* Contraseña */}
          <Input
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            error={errors.password}
            icon="lock-closed-outline"
            secureTextEntry={true}
          />
          
          {/* Confirmar contraseña */}
          <Input
            label="Confirmar Contraseña"
            placeholder="Repite tu contraseña"
            value={formData.passwordConfirm}
            onChangeText={(value) => updateFormData('passwordConfirm', value)}
            error={errors.passwordConfirm}
            icon="lock-closed-outline"
            secureTextEntry={true}
          />
          
          {/* Términos y condiciones */}
          <Text style={styles.termsText}>
            Al registrarte, aceptas nuestros{' '}
            <Text style={styles.termsLink}>Términos de Servicio</Text>
            {' '}y{' '}
            <Text style={styles.termsLink}>Política de Privacidad</Text>
          </Text>
          
          {/* Botón de registro */}
          <Button
            title="Crear Cuenta"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.registerButton}
          />
          
          {/* Enlace a login */}
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={goToLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginText}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.loginTextHighlight}>
                Inicia sesión
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Overlay de carga */}
      {isLoading && (
        <LoadingSpinner
          overlay={true}
          text="Creando cuenta..."
        />
      )}
    </KeyboardAvoidingView>
  );
};

// ===== ESTILOS DE LA PANTALLA =====
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
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
  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  halfWidth: {
    width: '48%',
  },
  
  termsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  
  termsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  
  registerButton: {
    marginBottom: 24,
  },
  
  loginLink: {
    alignItems: 'center',
  },
  
  loginText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  loginTextHighlight: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;