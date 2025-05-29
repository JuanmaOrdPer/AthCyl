/**
 * Componente para probar la conexión con el backend
 * Úsalo temporalmente en tu App.js para diagnosticar
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { testConnection } from '../config/api';
import authService from '../services/authService';

const ConnectionTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workingUrl, setWorkingUrl] = useState(null);
  const [loginTest, setLoginTest] = useState(null);

  const runConnectionTest = async () => {
    setIsLoading(true);
    setTestResults([]);
    setWorkingUrl(null);
    
    const urls = [
      'http://192.168.0.7:8000',      // Android Emulator
      'http://localhost:8000',      // iOS Simulator  
    ];
    
    console.log('🔍 Iniciando pruebas de conexión...');
    
    for (const url of urls) {
      try {
        setTestResults(prev => [...prev, { url, status: 'testing', message: 'Probando...' }]);
        
        const startTime = Date.now();
        const response = await fetch(`${url}/admin/`, {
          method: 'GET',
          timeout: 5000,
        });
        const endTime = Date.now();
        
        if (response.ok) {
          const message = `✅ FUNCIONA (${endTime - startTime}ms)`;
          setTestResults(prev => 
            prev.map(result => 
              result.url === url 
                ? { ...result, status: 'success', message }
                : result
            )
          );
          
          if (!workingUrl) {
            setWorkingUrl(url);
          }
        } else {
          setTestResults(prev => 
            prev.map(result => 
              result.url === url 
                ? { ...result, status: 'error', message: `❌ Error ${response.status}` }
                : result
            )
          );
        }
      } catch (error) {
        const message = `❌ Error: ${error.message}`;
        setTestResults(prev => 
          prev.map(result => 
            result.url === url 
              ? { ...result, status: 'error', message }
              : result
          )
        );
      }
    }
    
    setIsLoading(false);
  };

  const testLogin = async () => {
    try {
      setLoginTest({ status: 'testing', message: 'Probando login con datos de prueba...' });
      
      // Intentar login con credenciales de prueba
      const result = await authService.login('test@test.com', 'testpassword123');
      
      if (result.success) {
        setLoginTest({ 
          status: 'success', 
          message: '✅ Login funcionando correctamente',
          details: `Usuario: ${result.user?.email}`
        });
      } else {
        setLoginTest({ 
          status: 'warning', 
          message: '⚠️ Conexión OK, pero credenciales incorrectas (esto es normal)',
          details: result.error
        });
      }
    } catch (error) {
      setLoginTest({ 
        status: 'error', 
        message: '❌ Error en prueba de login',
        details: error.message
      });
    }
  };

  useEffect(() => {
    runConnectionTest();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Test de Conexión AthCyl</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={runConnectionTest}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Probando...' : 'Probar Conexiones'}
        </Text>
      </TouchableOpacity>

      {workingUrl && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            ✅ URL que funciona: {workingUrl}
          </Text>
          <Text style={styles.instructionText}>
            Django está corriendo correctamente
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.loginButton]} 
            onPress={testLogin}
          >
            <Text style={styles.buttonText}>Probar API de Login</Text>
          </TouchableOpacity>
        </View>
      )}

      {loginTest && (
        <View style={[
          styles.testResult,
          { backgroundColor: 
            loginTest.status === 'success' ? '#d4edda' : 
            loginTest.status === 'warning' ? '#fff3cd' : '#f8d7da'
          }
        ]}>
          <Text style={styles.testMessage}>{loginTest.message}</Text>
          {loginTest.details && (
            <Text style={styles.testDetails}>{loginTest.details}</Text>
          )}
        </View>
      )}

      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.urlText}>{result.url}</Text>
            <Text style={[
              styles.statusText,
              { color: result.status === 'success' ? 'green' : result.status === 'error' ? 'red' : 'orange' }
            ]}>
              {result.message}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>💡 Información del Dispositivo:</Text>
        <Text style={styles.infoText}>Plataforma: {Platform.OS}</Text>
        <Text style={styles.infoText}>Modo Debug: {__DEV__ ? 'Sí' : 'No'}</Text>
        
        <Text style={styles.infoTitle}>🔧 Si no funciona:</Text>
        <Text style={styles.infoText}>1. Detén Django (Ctrl+C)</Text>
        <Text style={styles.infoText}>2. Ejecuta: python manage.py runserver 0.0.0.0:8000</Text>
        <Text style={styles.infoText}>3. Agrega 'rest_framework_simplejwt.token_blacklist' a INSTALLED_APPS</Text>
        <Text style={styles.infoText}>4. Ejecuta: python manage.py migrate</Text>
        <Text style={styles.infoText}>5. Reinicia el emulador</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#28a745',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    backgroundColor: '#d4edda',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  successText: {
    color: '#155724',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  instructionText: {
    color: '#155724',
    fontSize: 12,
  },
  testResult: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  testMessage: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  testDetails: {
    fontSize: 12,
  },
  resultsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  urlText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 12,
  },
  infoContainer: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 8,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 5,
  },
});

export default ConnectionTest;