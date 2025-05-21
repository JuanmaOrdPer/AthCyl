// src/components/TrainingCard.js
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatDuration, getActivityIcon, getActivityName } from '../utils/helpers';
import styles from '../styles/components/TrainingCard.styles';

/**
 * Componente para mostrar un entrenamiento en formato de tarjeta
 * Optimizado y con textos en español
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.training - Datos del entrenamiento del backend
 * @param {Function} props.onPress - Función a ejecutar al presionar la tarjeta
 * @param {boolean} props.compact - Si se debe mostrar en modo compacto
 */
const TrainingCard = ({ training, onPress, compact = false }) => {
  // Si no hay datos de entrenamiento, no renderizamos nada
  if (!training) return null;
  
  const theme = useTheme();
  
  // Componente de estadística individual optimizado con React.memo
  const StatItem = React.memo(({ icon, label, value }) => (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={16} color="#666" />
      <Text style={styles.statValue}>
        {value}
        {label && <Text style={styles.statLabel}> {label}</Text>}
      </Text>
    </View>
  ));
  
  return (
    <Card 
      style={[styles.card, compact && styles.compactCard]} 
      onPress={onPress}
    >
      <Card.Content>
        {/* Encabezado con tipo de actividad y fecha */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons 
              name={getActivityIcon(training.activity_type)} 
              size={20} 
              color={theme.colors.primary} 
              style={styles.icon} 
            />
            <Text style={styles.title} numberOfLines={1}>
              {training.title || getActivityName(training.activity_type)}
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(training.date)}</Text>
        </View>
        
        {/* Estadísticas del entrenamiento */}
        <View style={styles.statsContainer}>
          <StatItem 
            icon="speedometer" 
            value={training.distance ? `${training.distance.toFixed(2)} km` : 'N/A'} 
          />
          <StatItem 
            icon="time" 
            value={training.duration ? formatDuration(training.duration) : 'N/A'} 
          />
          <StatItem 
            icon="flash" 
            value={training.avg_speed ? `${training.avg_speed.toFixed(1)}` : 'N/A'}
            label="km/h" 
          />
        </View>
        
        {/* Estadísticas adicionales (solo en modo no compacto) */}
        {!compact && (
          <View style={styles.additionalStats}>
            {training.calories && (
              <StatItem 
                icon="flame" 
                value={`${training.calories} kcal`} 
              />
            )}
            {training.avg_heart_rate && (
              <StatItem 
                icon="heart" 
                value={`${Math.round(training.avg_heart_rate)} ppm`} 
              />
            )}
          </View>
        )}
        
        {/* Notas (solo en modo no compacto) */}
        {!compact && training.description && (
          <Text style={styles.notes} numberOfLines={2}>
            {training.description}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

// Exportamos con React.memo para evitar renderizados innecesarios
export default React.memo(TrainingCard);