import React, { useState, useEffect } from 'react';
import { View, Animated, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/components/NotificationBanner.styles';

/**
 * Componente para mostrar notificaciones y alertas dentro de la aplicación
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.message - Mensaje a mostrar
 * @param {string} props.type - Tipo de notificación ('success', 'error', 'warning', 'info')
 * @param {number} props.duration - Duración en ms (por defecto: 3000, 0 para no ocultar automáticamente)
 * @param {Function} props.onDismiss - Función a ejecutar al cerrar la notificación
 * @param {Function} props.onPress - Función a ejecutar al presionar la notificación
 * @param {boolean} props.visible - Si la notificación está visible
 */
const NotificationBanner = ({
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  onPress,
  visible = true,
}) => {
  const theme = useTheme();
  const [slideAnim] = useState(new Animated.Value(-100));
  const [opacity] = useState(new Animated.Value(0));
  const [isVisible, setIsVisible] = useState(visible);
  
  // Configuración según el tipo de notificación
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          icon: 'checkmark-circle',
          color: '#fff',
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
          icon: 'alert-circle',
          color: '#fff',
        };
      case 'warning':
        return {
          backgroundColor: '#FFC107',
          icon: 'warning',
          color: '#000',
        };
      case 'info':
      default:
        return {
          backgroundColor: theme.colors.primary,
          icon: 'information-circle',
          color: '#fff',
        };
    }
  };
  
  const config = getTypeConfig();
  
  // Mostrar la notificación
  const showNotification = () => {
    setIsVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Ocultar la notificación
  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      if (onDismiss) onDismiss();
    });
  };
  
  // Controlar la visibilidad
  useEffect(() => {
    if (visible) {
      showNotification();
      
      // Ocultar automáticamente después de la duración especificada
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideNotification();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      hideNotification();
    }
  }, [visible]);
  
  if (!isVisible && !visible) return null;
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity,
        },
      ]}
    >
      <Surface style={[styles.banner, { backgroundColor: config.backgroundColor }]}>
        <TouchableOpacity
          style={styles.content}
          onPress={() => {
            if (onPress) onPress();
            else hideNotification();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name={config.icon} size={24} color={config.color} style={styles.icon} />
          <Text style={[styles.message, { color: config.color }]}>{message}</Text>
          <TouchableOpacity onPress={hideNotification}>
            <Ionicons name="close" size={20} color={config.color} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Surface>
    </Animated.View>
  );
};

export default NotificationBanner;
