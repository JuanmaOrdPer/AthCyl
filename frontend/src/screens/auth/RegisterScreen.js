import React, { useState, useContext } from 'react';
import { View, ScrollView } from 'react-native';
import { TextInput, Button, Title, Text, Surface, useTheme } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import { registerScreenStyles as styles, commonStyles } from '../../styles';

const RegisterScreen = ({ navigation }) => {
  const { register } = useContext(AuthContext);
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleRegister = async () => {
    // Validación básica
    if (!email || !username || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos obligatorios');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await register({
        email,
        username,
        password,
        password_confirm: confirmPassword,
        first_name: firstName,
        last_name: lastName,
      });
      
      // Redirigir a la pantalla de inicio de sesión
      navigation.navigate('Login');
      
      // Mostrar mensaje de éxito
      alert('Registro exitoso. Por favor, inicia sesión.');
    } catch (error) {
      console.error('Error de registro:', error);
      setError(error.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.surface}>
        <Title style={styles.title}>Crear Cuenta</Title>
        
        <TextInput
          label="Email *"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        
        <TextInput
          label="Nombre de usuario *"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          autoCapitalize="none"
          style={styles.input}
        />
        
        <View style={styles.row}>
          <TextInput
            label="Nombre"
            value={firstName}
            onChangeText={setFirstName}
            mode="outlined"
            style={[styles.input, styles.halfInput]}
          />
          
          <TextInput
            label="Apellido"
            value={lastName}
            onChangeText={setLastName}
            mode="outlined"
            style={[styles.input, styles.halfInput]}
          />
        </View>
        
        <TextInput
          label="Contraseña *"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />
        
        <TextInput
          label="Confirmar Contraseña *"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />
        
        {error && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}
        
        <Text style={styles.requiredText}>* Campos obligatorios</Text>
        
        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Registrarse
        </Button>
        
        <View style={styles.loginContainer}>
          <Text>¿Ya tienes una cuenta?</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            Iniciar Sesión
          </Button>
        </View>
      </Surface>
    </ScrollView>
  );
};

export default RegisterScreen;
