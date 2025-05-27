import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import FormInput from '@/components/common/FormInput';
import { FormikProps } from 'formik';

// Esquema de validación con Yup
const registerValidationSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede tener más de 30 caracteres')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'Solo se permiten letras, números y guiones bajos (_)'
    )
    .required('El nombre de usuario es requerido'),
  email: Yup.string()
    .email('Ingresa un correo electrónico válido')
    .required('El correo electrónico es requerido'),
  name: Yup.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .required('El nombre es requerido'),
  password: Yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .required('La contraseña es requerida'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});

const RegisterScreen = ({ navigation }: { navigation: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async (values: {
    username: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    try {
      const result = await register({
        username: values.username,
        name: values.name,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword
      });
      
      if (result.success) {
        Alert.alert(
          'Registro exitoso', 
          '¡Tu cuenta ha sido creada con éxito! Por favor inicia sesión.',
          [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
        );
      } else {
        Alert.alert('Error', result.error || 'Error al registrar el usuario');
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Error', 'Ocurrió un error al intentar registrarte');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Crear Cuenta</Text>
        
        <Formik
          initialValues={{
            username: '',
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={registerValidationSchema}
          onSubmit={handleRegister}
        >
          {(formik) => (
            <View style={styles.formContainer}>
              <FormInput
                label="Nombre de Usuario"
                placeholder="usuario123"
                onChangeText={formik.handleChange('username')}
                onBlur={formik.handleBlur('username')}
                value={formik.values.username}
                autoCapitalize="none"
                autoCorrect={false}
                error={formik.touched.username && formik.errors.username ? formik.errors.username : undefined}
                touched={!!formik.touched.username}
              />
              
              <FormInput
                label="Nombre Completo"
                placeholder="Tu nombre"
                onChangeText={formik.handleChange('name')}
                onBlur={formik.handleBlur('name')}
                value={formik.values.name}
                autoCapitalize="words"
                error={formik.touched.name && formik.errors.name ? formik.errors.name : undefined}
                touched={!!formik.touched.name}
              />
              
              <FormInput
                label="Correo Electrónico"
                placeholder="tu@email.com"
                onChangeText={formik.handleChange('email')}
                onBlur={formik.handleBlur('email')}
                value={formik.values.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
                touched={!!formik.touched.email}
              />
              
              <FormInput
                label="Contraseña"
                placeholder="••••••••"
                onChangeText={formik.handleChange('password')}
                onBlur={formik.handleBlur('password')}
                value={formik.values.password}
                secureTextEntry
                error={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
                touched={!!formik.touched.password}
              />
              
              <FormInput
                label="Confirmar Contraseña"
                placeholder="••••••••"
                onChangeText={formik.handleChange('confirmPassword')}
                onBlur={formik.handleBlur('confirmPassword')}
                value={formik.values.confirmPassword}
                secureTextEntry
                error={formik.touched.confirmPassword && formik.errors.confirmPassword ? formik.errors.confirmPassword : undefined}
                touched={!!formik.touched.confirmPassword}
              />
              
              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={() => formik.handleSubmit()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Registrarse</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.footer}>
                <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerLink}>Iniciar Sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    minHeight: '100%',
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A7E5B9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  footerText: {
    color: '#666',
  },
  footerLink: {
    color: '#34C759',
    fontWeight: '600',
  },
});

export default RegisterScreen;
