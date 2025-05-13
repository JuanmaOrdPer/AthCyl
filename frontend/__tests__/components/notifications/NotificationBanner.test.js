import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NotificationBanner } from '../../../src/components/notifications/NotificationBanner';
import { Animated } from 'react-native';

// Mock de Animated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('NotificationBanner', () => {
  // Configurar el mock para Animated.timing
  beforeEach(() => {
    jest.useFakeTimers();
    
    // Mock para las animaciones
    Animated.timing = jest.fn().mockReturnValue({
      start: jest.fn(callback => callback && callback()),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renderiza correctamente con el tipo success', () => {
    const { getByText, getByTestId } = render(
      <NotificationBanner 
        visible={true}
        message="Operación exitosa"
        type="success"
        onDismiss={jest.fn()}
      />
    );
    
    // Verificar que el mensaje se muestra correctamente
    expect(getByText('Operación exitosa')).toBeTruthy();
    
    // Verificar que se usa el color correcto para success
    const container = getByTestId('notification-container');
    expect(container.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: expect.stringMatching(/green|#/i)
      })
    );
  });

  it('renderiza correctamente con el tipo error', () => {
    const { getByText, getByTestId } = render(
      <NotificationBanner 
        visible={true}
        message="Ha ocurrido un error"
        type="error"
        onDismiss={jest.fn()}
      />
    );
    
    // Verificar que el mensaje se muestra correctamente
    expect(getByText('Ha ocurrido un error')).toBeTruthy();
    
    // Verificar que se usa el color correcto para error
    const container = getByTestId('notification-container');
    expect(container.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: expect.stringMatching(/red|#/i)
      })
    );
  });

  it('renderiza correctamente con el tipo warning', () => {
    const { getByText, getByTestId } = render(
      <NotificationBanner 
        visible={true}
        message="Advertencia importante"
        type="warning"
        onDismiss={jest.fn()}
      />
    );
    
    // Verificar que el mensaje se muestra correctamente
    expect(getByText('Advertencia importante')).toBeTruthy();
    
    // Verificar que se usa el color correcto para warning
    const container = getByTestId('notification-container');
    expect(container.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: expect.stringMatching(/orange|yellow|#/i)
      })
    );
  });

  it('llama a onDismiss cuando se presiona el botón de cerrar', () => {
    const mockOnDismiss = jest.fn();
    const { getByTestId } = render(
      <NotificationBanner 
        visible={true}
        message="Mensaje de prueba"
        type="info"
        onDismiss={mockOnDismiss}
      />
    );
    
    // Obtener el botón de cerrar y presionarlo
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    // Verificar que se llamó a la función onDismiss
    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('se cierra automáticamente después del tiempo especificado', () => {
    const mockOnDismiss = jest.fn();
    render(
      <NotificationBanner 
        visible={true}
        message="Mensaje de prueba"
        type="info"
        duration={3000}
        onDismiss={mockOnDismiss}
      />
    );
    
    // Avanzar el tiempo para que se active el cierre automático
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // Verificar que se llamó a la función onDismiss
    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('ejecuta onPress cuando se presiona la notificación', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <NotificationBanner 
        visible={true}
        message="Mensaje de prueba"
        type="info"
        onDismiss={jest.fn()}
        onPress={mockOnPress}
      />
    );
    
    // Obtener el contenedor de la notificación y presionarlo
    const container = getByTestId('notification-container');
    fireEvent.press(container);
    
    // Verificar que se llamó a la función onPress
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('no se muestra cuando visible es false', () => {
    const { queryByText } = render(
      <NotificationBanner 
        visible={false}
        message="Mensaje de prueba"
        type="info"
        onDismiss={jest.fn()}
      />
    );
    
    // Verificar que el mensaje no se muestra
    expect(queryByText('Mensaje de prueba')).toBeNull();
  });
});
