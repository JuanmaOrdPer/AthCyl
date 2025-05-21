import React from 'react';
import { View } from 'react-native';
import { Card, Text, ProgressBar, Chip, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, getActivityIcon, getActivityName } from '../utils/helpers';
import styles from '../styles/components/GoalCard.styles';

/**
 * Componente para mostrar un objetivo de entrenamiento
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.goal - Datos del objetivo
 * @param {Function} props.onPress - Función a ejecutar al presionar la tarjeta
 */
const GoalCard = ({ goal, onPress }) => {
  const theme = useTheme();
  
  if (!goal) return null;
  
  // Calcular progreso
  const progress = goal.current_value / goal.target_value;
  const progressPercent = Math.min(progress, 1);
  const progressText = `${Math.round(progress * 100)}%`;
  
  // Determinar color según el estado
  const getStatusColor = () => {
    if (goal.completed) return theme.colors.success || '#4CAF50';
    if (goal.expired) return theme.colors.error || '#F44336';
    return theme.colors.primary;
  };
  
  // Determinar icono según el tipo de objetivo
  const getGoalIcon = () => {
    switch (goal.goal_type) {
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
      default:
        return 'flag';
    }
  };
  
  // Formatear el valor del objetivo según su tipo
  const formatGoalValue = (value, type) => {
    switch (type) {
      case 'distance':
        return `${value.toFixed(1)} km`;
      case 'duration':
        // Convertir minutos a formato más legible
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      case 'calories':
        return `${value.toFixed(0)} kcal`;
      case 'elevation':
        return `${value.toFixed(0)} m`;
      case 'count':
        return `${value} sesiones`;
      default:
        return `${value}`;
    }
  };
  
  // Obtener descripción del objetivo
  const getGoalDescription = () => {
    const typeText = {
      distance: 'Distancia',
      duration: 'Tiempo',
      calories: 'Calorías',
      elevation: 'Desnivel',
      count: 'Sesiones',
    }[goal.goal_type] || 'Objetivo';
    
    const activityText = goal.activity_type ? getActivityName(goal.activity_type) : 'cualquier actividad';
    
    return `${typeText} en ${activityText}`;
  };
  
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name={getGoalIcon()} size={20} color={getStatusColor()} style={styles.icon} />
            <Text style={styles.title}>{goal.title || getGoalDescription()}</Text>
          </View>
          
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: getStatusColor() }]}
            textStyle={{ color: getStatusColor() }}
          >
            {goal.completed ? 'Completado' : goal.expired ? 'Expirado' : 'Activo'}
          </Chip>
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {goal.end_date ? `Hasta ${formatDate(goal.end_date)}` : 'Sin fecha límite'}
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressTextContainer}>
            <Text style={styles.currentValue}>
              {formatGoalValue(goal.current_value, goal.goal_type)}
            </Text>
            <Text style={styles.targetValue}>
              de {formatGoalValue(goal.target_value, goal.goal_type)}
            </Text>
          </View>
          
          <ProgressBar 
            progress={progressPercent} 
            color={getStatusColor()} 
            style={styles.progressBar} 
          />
          
          <Text style={[styles.progressText, { color: getStatusColor() }]}>
            {progressText}
          </Text>
        </View>
        
        {goal.activity_type && (
          <View style={styles.activityContainer}>
            <Ionicons 
              name={getActivityIcon(goal.activity_type)} 
              size={16} 
              color="#666" 
              style={styles.activityIcon} 
            />
            <Text style={styles.activityText}>{getActivityName(goal.activity_type)}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

export default GoalCard;
