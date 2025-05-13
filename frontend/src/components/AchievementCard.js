import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../utils/helpers';

/**
 * Componente para mostrar un logro o medalla
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.achievement - Datos del logro
 * @param {Function} props.onPress - Función a ejecutar al presionar la tarjeta
 * @param {boolean} props.unlocked - Si el logro está desbloqueado
 */
const AchievementCard = ({ achievement, onPress, unlocked = false }) => {
  const theme = useTheme();
  
  if (!achievement) return null;
  
  // Determinar el color según si está desbloqueado o no
  const getColor = () => {
    if (unlocked) {
      return achievement.color || theme.colors.primary;
    }
    return '#9E9E9E'; // Gris para logros bloqueados
  };
  
  // Determinar el icono según el tipo de logro
  const getIcon = () => {
    if (!unlocked) return 'lock-closed';
    
    switch (achievement.type) {
      case 'distance':
        return 'speedometer';
      case 'duration':
        return 'time';
      case 'calories':
        return 'flame';
      case 'elevation':
        return 'trending-up';
      case 'count':
        return 'fitness';
      case 'streak':
        return 'calendar';
      case 'speed':
        return 'flash';
      default:
        return 'trophy';
    }
  };
  
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Surface style={[styles.card, { borderColor: getColor() }]}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: getColor() }]}>
            <Ionicons name={getIcon()} size={24} color="#fff" />
          </View>
          
          <View style={styles.details}>
            <Text style={styles.title} numberOfLines={1}>
              {achievement.title}
            </Text>
            
            <Text style={styles.description} numberOfLines={2}>
              {unlocked ? achievement.description : 'Logro bloqueado'}
            </Text>
            
            {unlocked && achievement.unlocked_date && (
              <Text style={styles.date}>
                Conseguido el {formatDate(achievement.unlocked_date)}
              </Text>
            )}
          </View>
          
          {unlocked && (
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { backgroundColor: getColor() }]}>
                <Text style={styles.badgeText}>{achievement.level || ''}</Text>
              </View>
            </View>
          )}
        </View>
        
        {unlocked && achievement.progress && (
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${Math.min(achievement.progress * 100, 100)}%`,
                  backgroundColor: getColor(),
                }
              ]} 
            />
            <Text style={styles.progressText}>
              {`${Math.round(achievement.progress * 100)}%`}
            </Text>
          </View>
        )}
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  badgeContainer: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    position: 'absolute',
    right: 4,
    top: -18,
    fontSize: 10,
    color: '#666',
  },
});

export default AchievementCard;
