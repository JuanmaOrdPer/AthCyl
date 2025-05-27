import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, Animated } from 'react-native';
import * as Animatable from 'react-native-animatable';

const LoadingScreen = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animatable.View 
        animation="pulse"
        iterationCount="infinite"
        style={styles.logoContainer}
      >
        <Image 
          source={require('../../../assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </Animatable.View>
      
      <Text style={styles.appName}>ATHCYL</Text>
      
      <View style={styles.loadingContainer}>
        <Text style={styles.text}>Cargando</Text>
        <Text style={styles.dots}>{dots}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoContainer: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 30,
    letterSpacing: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#666',
  },
  dots: {
    fontSize: 18,
    color: '#666',
    width: 30,
    textAlign: 'left',
  },
});

export default LoadingScreen;
