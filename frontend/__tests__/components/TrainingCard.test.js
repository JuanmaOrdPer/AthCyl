import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TrainingCard from '../../src/components/training/TrainingCard';

// Mock de navegación
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('TrainingCard', () => {
  // Datos de prueba para un entrenamiento
  const mockTraining = {
    id: 1,
    title: 'Entrenamiento de prueba',
    description: 'Esta es una descripción de prueba',
    activity_type: 'running',
    date: '2025-05-13',
    start_time: '08:00:00',
    duration: '00:30:00',
    distance: 5.0,
    avg_speed: 10.0,
    max_speed: 12.0,
    calories: 300
  };

  // Mock para las funciones de callback
  const mockOnPress = jest.fn();
  const mockOnDelete = jest.fn();

  it('renderiza correctamente con todos los datos del entrenamiento', () => {
    const { getByText, getByTestId } = render(
      <TrainingCard 
        training={mockTraining} 
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );
    
    // Verificar que los elementos principales están presentes
    expect(getByText('Entrenamiento de prueba')).toBeTruthy();
    expect(getByText('Esta es una descripción de prueba')).toBeTruthy();
    expect(getByText('13/05/2025')).toBeTruthy(); // Formato de fecha localizado
    expect(getByText('5.0 km')).toBeTruthy();
    expect(getByText('30 min')).toBeTruthy();
    expect(getByText('300 kcal')).toBeTruthy();
  });

  it('llama a onPress cuando se presiona la tarjeta', () => {
    const { getByTestId } = render(
      <TrainingCard 
        training={mockTraining} 
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );
    
    // Obtener el contenedor principal y presionarlo
    const cardContainer = getByTestId('training-card-container');
    fireEvent.press(cardContainer);
    
    // Verificar que se llamó a la función onPress con el entrenamiento correcto
    expect(mockOnPress).toHaveBeenCalledWith(mockTraining);
  });

  it('llama a onDelete cuando se presiona el botón de eliminar', () => {
    const { getByTestId } = render(
      <TrainingCard 
        training={mockTraining} 
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );
    
    // Obtener el botón de eliminar y presionarlo
    const deleteButton = getByTestId('delete-button');
    fireEvent.press(deleteButton);
    
    // Verificar que se llamó a la función onDelete con el ID correcto
    expect(mockOnDelete).toHaveBeenCalledWith(mockTraining.id);
  });

  it('muestra el icono correcto según el tipo de actividad', () => {
    // Renderizar con diferentes tipos de actividad
    const activities = [
      { type: 'running', iconName: 'run' },
      { type: 'cycling', iconName: 'bike' },
      { type: 'swimming', iconName: 'swim' },
      { type: 'walking', iconName: 'walk' },
      { type: 'other', iconName: 'dumbbell' }
    ];
    
    activities.forEach(activity => {
      const trainingWithActivity = { ...mockTraining, activity_type: activity.type };
      const { getByTestId } = render(
        <TrainingCard 
          training={trainingWithActivity} 
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );
      
      // Verificar que se muestra el icono correcto
      const activityIcon = getByTestId('activity-icon');
      expect(activityIcon.props.name).toBe(activity.iconName);
    });
  });

  it('formatea correctamente la duración', () => {
    // Probar diferentes formatos de duración
    const durations = [
      { value: '00:30:00', expected: '30 min' },
      { value: '01:15:00', expected: '1h 15min' },
      { value: '02:00:00', expected: '2h' }
    ];
    
    durations.forEach(duration => {
      const trainingWithDuration = { ...mockTraining, duration: duration.value };
      const { getByText } = render(
        <TrainingCard 
          training={trainingWithDuration} 
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );
      
      // Verificar que se muestra la duración formateada correctamente
      expect(getByText(duration.expected)).toBeTruthy();
    });
  });
});
