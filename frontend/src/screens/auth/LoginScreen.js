// src/screens/auth/LoginScreen.js
import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Button, Title, Text, Surface, useTheme } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import useFormValidation from '../../hooks/useFormValidation';
import FormField from '../../components/common/FormField';

/**
 * Pantalla de inicio de sesión
 * @param {Object} props - Propiedades de navegación
 */
const LoginScreen = ({ navigation }) => {
  const { login, error: authError, loading } = useContext(AuthContext);
  const theme = useTheme();
  
  // Función de validación
  const validateLogin = (values) => {
    const errors = {};
    if (!values.email) {
      errors.email = 'El email es obligatorio';
    }
    if (!values.password) {
      errors.password = 'La contraseña es obligatoria';
    }
    return errors;
  };
  
  // Hook de formulario
  const { 
    values, 
    errors, 
    touched, 
    handleChange, 
    validateForm 
  } = useFormValidation(
    { email: '', password: '' },
    validateLogin
  );
  
  const handleLogin = async () => {
    if (validateForm()) {
      try {
        await login(values.email, values.password);
      } catch (error) {
        // Error ya manejado por el contexto
      }
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.surface}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/icon.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Title style={styles.title}>AthCyl</Title>
          <Text style={styles.subtitle}>Gestión de Entrenamientos Deportivos</Text>
        </View>
        
        <FormField
          label="Email"
          value={values.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          touched={touched.email}
        />
        
        <FormField
          label="Contraseña"
          value={values.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry
          error={errors.password}
          touched={touched.password}
        />
        
        {authError && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {authError}
          </Text>
        )}
        
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Iniciar Sesión
        </Button>
        
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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  surface: {
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
});

export default LoginScreen;