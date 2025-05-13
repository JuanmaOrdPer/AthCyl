import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatDuration, getActivityIcon, getActivityName } from '../utils/helpers';

/**
 * Componente para mostrar un entrenamiento en formato de tarjeta
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.training - Datos del entrenamiento
 * @param {Function} props.onPress - Función a ejecutar al presionar la tarjeta
 * @param {boolean} props.compact - Si se debe mostrar en modo compacto
 */
const TrainingCard = ({ training, onPress, compact = false }) => {
  const theme = useTheme();
  
  if (!training) return null;
  
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
          
          <Text style={styles.date}>
            {formatDate(training.date)}
          </Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="speedometer" size={16} color="#666" />
            <Text style={styles.statValue}>
              {training.distance ? `${training.distance.toFixed(2)} km` : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.statValue}>
              {training.duration ? formatDuration(training.duration) : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="flash" size={16} color="#666" />
            <Text style={styles.statValue}>
              {training.avg_speed ? `${training.avg_speed.toFixed(1)} km/h` : 'N/A'}
            </Text>
          </View>
        </View>
        
        {!compact && training.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {training.notes}
          </Text>
        )}
        
        {!compact && (
          <View style={styles.tagsContainer}>
            {training.has_gpx && (
              <Chip 
                style={styles.chip} 
                textStyle={styles.chipText}
                icon="map-marker-path"
                mode="outlined"
              >
                GPX
              </Chip>
            )}
            
            {training.has_heart_rate && (
              <Chip 
                style={styles.chip} 
                textStyle={styles.chipText}
                icon="heart-pulse"
                mode="outlined"
              >
                FC
              </Chip>
            )}
            
            {training.has_elevation && (
              <Chip 
                style={styles.chip} 
                textStyle={styles.chipText}
                icon="trending-up"
                mode="outlined"
              >
                Desnivel
              </Chip>
            )}
          </View>
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
    fontSize: 14,
    color: '#444',
    marginVertical: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
    height: 24,
  },
  chipText: {
    fontSize: 10,
  },
});

export default TrainingCard;
