// src/components/TrainingCard.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatDuration, getActivityIcon, getActivityName } from '../utils/helpers';

/**
 * Componente para mostrar un entrenamiento en formato de tarjeta
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.training - Datos del entrenamiento
 * @param {Function} props.onPress - Función a ejecutar al presionar la tarjeta
 * @param {boolean} props.compact - Si se debe mostrar en modo compacto
 */
const TrainingCard = ({ training, onPress, compact = false }) => {
  const theme = useTheme();
  
  if (!training) return null;
  
  // Componente de estadística individual
  const StatItem = React.memo(({ icon, value }) => (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={16} color="#666" />
      <Text style={styles.statValue}>{value}</Text>
    </View>
  ));
  
  return (
    <Card 
      style={[styles.card, compact && styles.compactCard]} 
      onPress={onPress}
    >
      <Card.Content>
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
            value={training.avg_speed ? `${training.avg_speed.toFixed(1)} km/h` : 'N/A'} 
          />
        </View>
        
        {!compact && training.notes && (
          <Text style={styles.notes} numberOfLines={2}>{training.notes}</Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  compactCard: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    marginLeft: 4,
    fontSize: 14,
  },
  notes: {
    marginTop: 8,
    color: '#666',
  },
});

export default React.memo(TrainingCard);