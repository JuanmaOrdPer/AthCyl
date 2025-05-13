import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { NotificationProvider, useNotification } from '../../src/contexts/NotificationContext';

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('proporciona un estado inicial correcto', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: NotificationProvider
    });

    expect(result.current.visible).toBe(false);
    expect(result.current.message).toBe('');
    expect(result.current.type).toBe('info');
    expect(typeof result.current.showSuccess).toBe('function');
    expect(typeof result.current.showError).toBe('function');
    expect(typeof result.current.showWarning).toBe('function');
    expect(typeof result.current.showInfo).toBe('function');
    expect(typeof result.current.hideNotification).toBe('function');
  });

  it('muestra una notificación de éxito correctamente', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: NotificationProvider
    });

    act(() => {
      result.current.showSuccess('Operación exitosa');
    });

    expect(result.current.visible).toBe(true);
    expect(result.current.message).toBe('Operación exitosa');
    expect(result.current.type).toBe('success');
  });

  it('muestra una notificación de error correctamente', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: NotificationProvider
    });

    act(() => {
      result.current.showError('Ha ocurrido un error');
    });

    expect(result.current.visible).toBe(true);
    expect(result.current.message).toBe('Ha ocurrido un error');
    expect(result.current.type).toBe('error');
  });

  it('muestra una notificación de advertencia correctamente', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: NotificationProvider
    });

    act(() => {
      result.current.showWarning('Advertencia importante');
    });

    expect(result.current.visible).toBe(true);
    expect(result.current.message).toBe('Advertencia importante');
    expect(result.current.type).toBe('warning');
  });

  it('muestra una notificación de información correctamente', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: NotificationProvider
    });

    act(() => {
      result.current.showInfo('Información útil');
    });

    expect(result.current.visible).toBe(true);
    expect(result.current.message).toBe('Información útil');
    expect(result.current.type).toBe('info');
  });

  it('oculta la notificación correctamente', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: NotificationProvider
    });

    // Primero mostramos una notificación
    act(() => {
      result.current.showInfo('Información útil');
    });

    expect(result.current.visible).toBe(true);

    // Luego la ocultamos
    act(() => {
      result.current.hideNotification();
    });

    expect(result.current.visible).toBe(false);
  });

  it('permite configurar una duración personalizada', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: NotificationProvider
    });

    // Mostramos una notificación con duración personalizada
    act(() => {
      result.current.showInfo('Información útil', { duration: 5000 });
    });

    expect(result.current.visible).toBe(true);
    expect(result.current.duration).toBe(5000);
  });

  it('permite configurar una acción al presionar', () => {
    const mockOnPress = jest.fn();
    const { result } = renderHook(() => useNotification(), {
      wrapper: NotificationProvider
    });

    // Mostramos una notificación con acción al presionar
    act(() => {
      result.current.showInfo('Información útil', { onPress: mockOnPress });
    });

    expect(result.current.visible).toBe(true);
    expect(result.current.onPress).toBe(mockOnPress);
  });

  it('cierra automáticamente la notificación después de la duración', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: NotificationProvider
    });

    // Mostramos una notificación con duración de 3 segundos
    act(() => {
      result.current.showInfo('Información útil', { duration: 3000 });
    });

    expect(result.current.visible).toBe(true);

    // Avanzamos el tiempo para que se cierre automáticamente
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.visible).toBe(false);
  });
});
