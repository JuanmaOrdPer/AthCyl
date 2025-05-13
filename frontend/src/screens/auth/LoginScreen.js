import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { TextInput, Button, Title, Text, Surface, useTheme } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login, error } = useContext(AuthContext);
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const handleLogin = async () => {
    // Validación básica
    if (!email || !password) {
      setLocalError('Por favor, completa todos los campos');
      return;
    }
    
    try {
      setLoading(true);
      setLocalError('');
      await login(email, password);
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setLocalError(error.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
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
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        
        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />
        
        {(localError || error) && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {localError || error}
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
  input: {
    marginBottom: 12,
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
