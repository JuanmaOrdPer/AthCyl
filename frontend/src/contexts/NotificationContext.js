import React, { createContext, useState, useContext } from 'react';
import NotificationBanner from '../components/NotificationBanner';

// Crear el contexto
const NotificationContext = createContext();

/**
 * Proveedor del contexto de notificaciones
 * Permite mostrar notificaciones desde cualquier componente de la aplicación
 */
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
    onPress: null,
  });

  // Mostrar una notificación
  const showNotification = ({
    message,
    type = 'info',
    duration = 3000,
    onPress = null,
  }) => {
    setNotification({
      visible: true,
      message,
      type,
      duration,
      onPress,
    });
  };

  // Ocultar la notificación actual
  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      visible: false,
    }));
  };

  // Métodos de conveniencia para diferentes tipos de notificaciones
  const showSuccess = (message, options = {}) => {
    showNotification({ message, type: 'success', ...options });
  };

  const showError = (message, options = {}) => {
    showNotification({ message, type: 'error', ...options });
  };

  const showWarning = (message, options = {}) => {
    showNotification({ message, type: 'warning', ...options });
  };

  const showInfo = (message, options = {}) => {
    showNotification({ message, type: 'info', ...options });
  };

  return (
    <NotificationContext.Provider
      value={{
        ...notification, // Expose the current notification state
        showNotification,
        hideNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <NotificationBanner
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        duration={notification.duration}
        onDismiss={hideNotification}
        onPress={notification.onPress}
      />
    </NotificationContext.Provider>
  );
};

// Hook personalizado para usar el contexto de notificaciones
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  return context;
};
