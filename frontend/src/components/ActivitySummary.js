import React from 'react';
import { View } from 'react-native';
import { Card, Text, ProgressBar, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../utils/helpers';
import styles from '../styles/components/ActivitySummary.styles';

/**
 * Componente para mostrar un resumen de actividad (semanal, mensual, etc.)
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.data - Datos del resumen
 * @param {string} props.period - Período del resumen ('week', 'month', 'year')
 * @param {Object} props.goals - Objetivos actuales (opcional)
 */
const ActivitySummary = ({ data, period = 'week', goals = null }) => {
  const theme = useTheme();
  
  if (!data) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text>No hay datos disponibles</Text>
        </Card.Content>
      </Card>
    );
  }
  
  // Obtener título según el período
  const getTitle = () => {
    switch (period) {
      case 'week':
        return 'Resumen Semanal';
      case 'month':
        return 'Resumen Mensual';
      case 'year':
        return 'Resumen Anual';
      default:
        return 'Resumen de Actividad';
    }
  };
  
  // Calcular progreso hacia los objetivos
  const calculateProgress = (value, goalType) => {
    if (!goals || !goals[goalType]) return null;
    
    const target = goals[goalType].target_value;
    const progress = value / target;
    
    return {
      value: Math.min(progress, 1),
      text: `${Math.round(progress * 100)}%`,
      target,
    };
  };
  
  // Progreso de distancia
  const distanceProgress = calculateProgress(data.total_distance, 'distance');
  
  // Progreso de tiempo
  const durationProgress = calculateProgress(
    // Convertir duración a minutos para comparar con el objetivo
    data.total_duration ? 
      parseInt(data.total_duration.split(':')[0]) * 60 + 
      parseInt(data.total_duration.split(':')[1]) 
      : 0, 
    'duration'
  );
  
  // Progreso de calorías
  const caloriesProgress = calculateProgress(data.total_calories, 'calories');
  
  // Progreso de sesiones
  const sessionsProgress = calculateProgress(data.training_count, 'count');
  
  return (
    <Card style={styles.card}>
      <Card.Title title={getTitle()} />
      <Card.Content>
        <View style={styles.statsContainer}>
          {/* Entrenamientos */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Ionicons name="fitness" size={20} color={theme.colors.primary} style={styles.statIcon} />
              <Text style={styles.statLabel}>Entrenamientos</Text>
            </View>
            <Text style={styles.statValue}>{data.training_count || 0}</Text>
            {sessionsProgress && (
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={sessionsProgress.value} 
                  color={theme.colors.primary} 
                  style={styles.progressBar} 
                />
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressText}>{sessionsProgress.text}</Text>
                  <Text style={styles.goalText}>Meta: {sessionsProgress.target}</Text>
                </View>
              </View>
            )}
          </View>
          
          {/* Distancia */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Ionicons name="speedometer" size={20} color={theme.colors.primary} style={styles.statIcon} />
              <Text style={styles.statLabel}>Distancia</Text>
            </View>
            <Text style={styles.statValue}>{data.total_distance ? `${data.total_distance.toFixed(1)} km` : '0 km'}</Text>
            {distanceProgress && (
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={distanceProgress.value} 
                  color={theme.colors.primary} 
                  style={styles.progressBar} 
                />
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressText}>{distanceProgress.text}</Text>
                  <Text style={styles.goalText}>Meta: {distanceProgress.target} km</Text>
                </View>
              </View>
            )}
          </View>
          
          {/* Tiempo */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Ionicons name="time" size={20} color={theme.colors.primary} style={styles.statIcon} />
              <Text style={styles.statLabel}>Tiempo</Text>
            </View>
            <Text style={styles.statValue}>{data.total_duration ? formatDuration(data.total_duration) : '0h'}</Text>
            {durationProgress && (
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={durationProgress.value} 
                  color={theme.colors.primary} 
                  style={styles.progressBar} 
                />
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressText}>{durationProgress.text}</Text>
                  <Text style={styles.goalText}>Meta: {Math.floor(durationProgress.target / 60)}h {durationProgress.target % 60}m</Text>
                </View>
              </View>
            )}
          </View>
          
          {/* Calorías */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Ionicons name="flame" size={20} color={theme.colors.primary} style={styles.statIcon} />
              <Text style={styles.statLabel}>Calorías</Text>
            </View>
            <Text style={styles.statValue}>{data.total_calories ? `${data.total_calories.toFixed(0)} kcal` : '0 kcal'}</Text>
            {caloriesProgress && (
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={caloriesProgress.value} 
                  color={theme.colors.primary} 
                  style={styles.progressBar} 
                />
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressText}>{caloriesProgress.text}</Text>
                  <Text style={styles.goalText}>Meta: {caloriesProgress.target} kcal</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        
        {/* Información adicional */}
        {data.avg_speed || data.avg_heart_rate ? (
          <View style={styles.additionalInfo}>
            {data.avg_speed && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Velocidad media:</Text>
                <Text style={styles.infoValue}>{data.avg_speed.toFixed(1)} km/h</Text>
              </View>
            )}
            
            {data.avg_heart_rate && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>FC media:</Text>
                <Text style={styles.infoValue}>{data.avg_heart_rate.toFixed(0)} ppm</Text>
              </View>
            )}
            
            {data.active_days && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Días activos:</Text>
                <Text style={styles.infoValue}>{data.active_days}</Text>
              </View>
            )}
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
};

export default ActivitySummary;
