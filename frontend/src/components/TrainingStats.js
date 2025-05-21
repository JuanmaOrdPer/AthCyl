import React from 'react';
import { View } from 'react-native';
import { Text, Card, Divider, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration, getActivityIcon, getActivityName } from '../utils/helpers';
import { trainingStatsStyles as styles, commonStyles } from '../styles';

/**
 * Componente para mostrar estadísticas detalladas de un entrenamiento
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.training - Datos del entrenamiento
 * @param {boolean} props.showHeader - Si se debe mostrar el encabezado con el tipo de actividad
 * @param {boolean} props.compact - Si se debe mostrar en modo compacto
 */
const TrainingStats = ({ training, showHeader = true, compact = false }) => {
  const theme = useTheme();
  
  if (!training) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text>No hay datos disponibles</Text>
        </Card.Content>
      </Card>
    );
  }
  
  return (
    <Card style={[styles.card, compact && styles.compactCard]}>
      {showHeader && (
        <Card.Title
          title={training.title || getActivityName(training.activity_type)}
          subtitle={training.date ? new Date(training.date).toLocaleDateString('es-ES') : ''}
          left={(props) => <Ionicons {...props} name={getActivityIcon(training.activity_type)} size={24} color={theme.colors.primary} />}
        />
      )}
      
      <Card.Content>
        <View style={styles.statsContainer}>
          {/* Fila 1 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="speedometer" size={20} color={theme.colors.primary} />
              <Text style={styles.statValue}>{training.distance ? `${training.distance.toFixed(2)} km` : 'N/A'}</Text>
              <Text style={styles.statLabel}>Distancia</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color={theme.colors.primary} />
              <Text style={styles.statValue}>{training.duration ? formatDuration(training.duration) : 'N/A'}</Text>
              <Text style={styles.statLabel}>Duración</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="flash" size={20} color={theme.colors.primary} />
              <Text style={styles.statValue}>{training.avg_speed ? `${training.avg_speed.toFixed(1)} km/h` : 'N/A'}</Text>
              <Text style={styles.statLabel}>Vel. Media</Text>
            </View>
          </View>
          
          {!compact && (
            <>
              <Divider style={styles.divider} />
              
              {/* Fila 2 */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="trending-up" size={20} color={theme.colors.primary} />
                  <Text style={styles.statValue}>{training.elevation_gain ? `${training.elevation_gain.toFixed(0)} m` : 'N/A'}</Text>
                  <Text style={styles.statLabel}>Desnivel</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Ionicons name="pulse" size={20} color={theme.colors.primary} />
                  <Text style={styles.statValue}>{training.avg_heart_rate ? `${training.avg_heart_rate.toFixed(0)} ppm` : 'N/A'}</Text>
                  <Text style={styles.statLabel}>FC Media</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Ionicons name="flame" size={20} color={theme.colors.primary} />
                  <Text style={styles.statValue}>{training.calories ? `${training.calories.toFixed(0)}` : 'N/A'}</Text>
                  <Text style={styles.statLabel}>Calorías</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

export default TrainingStats;
