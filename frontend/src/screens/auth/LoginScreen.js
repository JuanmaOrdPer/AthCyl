// src/screens/auth/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Button, Title, Text, Surface, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import FormField from '../../components/common/FormField';
import { loginScreenStyles as styles, commonStyles } from '../../styles';

/**
 * Pantalla de inicio de sesión
 * Mejorada para comunicarse con el backend JWT y con textos en español
 */
const LoginScreen = ({ navigation }) => {
  const { login, error: authError, loading } = useContext(AuthContext);
  const theme = useTheme();
  
  // Estado para campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePass, setHidePass] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  
  /**
   * Valida el formulario antes de enviar
   * @returns {boolean} - true si el formulario es válido
   */
  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = 'El correo electrónico es obligatorio';
    }
    
    if (!password) {
      errors.password = 'La contraseña es obligatoria';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  /**
   * Maneja el envío del formulario de login
   */
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      await login(email, password);
      // La redirección la maneja el AppNavigator
    } catch (error) {
      Alert.alert(
        'Error de inicio de sesión',
        error.message || 'No se pudo iniciar sesión. Verifica tus credenciales.'
      );
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.surface}>
        {/* Logo y título */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/icon.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Title style={styles.title}>AthCyl</Title>
          <Text style={styles.subtitle}>Gestión de Entrenamientos Deportivos</Text>
        </View>
        
        {/* Formulario de login */}
        <FormField
          label="Correo electrónico o usuario"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={formErrors.email}
          touched={!!email}
          left={<Ionicons name="mail-outline" size={24} color={theme.colors.primary} />}
        />
        
        <View style={styles.passwordContainer}>
          <FormField
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={hidePass}
            error={formErrors.password}
            touched={!!password}
            style={styles.passwordField}
            left={<Ionicons name="lock-closed-outline" size={24} color={theme.colors.primary} />}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setHidePass(!hidePass)}
          >
            <Ionicons 
              name={hidePass ? "eye-outline" : "eye-off-outline"} 
              size={24} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Mensaje de error de autenticación */}
        {authError && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {authError}
          </Text>
        )}
        
        {/* Botón de inicio de sesión */}
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Iniciar Sesión
        </Button>
        
        {/* Enlace a registro */}
        <View style={styles.registerContainer}>
          <Text>¿No tienes una cuenta?</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            Regístrate
          </Button>
        </View>
      </Surface>
    </ScrollView>
  );
};

export default LoginScreen;