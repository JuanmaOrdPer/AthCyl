/**
 * Componente Card reutilizable para AthCyl
 * 
 * Tarjeta personalizada para mostrar información de manera consistente.
 * Útil para entrenamientos, estadísticas y otros contenidos.
 * 
 * Props disponibles:
 * - title: Título de la tarjeta
 * - subtitle: Subtítulo opcional
 * - children: Contenido de la tarjeta
 * - onPress: Función al presionar (hace la tarjeta presionable)
 * - variant: Tipo de tarjeta (default, outlined, elevated)
 * - showHeader: Si mostrar header con título
 * - headerStyle: Estilos personalizados del header
 * - style: Estilos adicionales del contenedor
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importar sistema de colores
import { Colors } from '../config/colors';

const Card = ({
  title,
  subtitle,
  children,
  onPress,
  variant = 'default',
  showHeader = true,
  headerStyle,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  ...otherProps
}) => {
  
  /**
   * Obtener estilos del contenedor según la variante
   */
  const getContainerStyle = () => {
    let containerStyle = [styles.baseCard];
    
    switch (variant) {
      case 'outlined':
        containerStyle.push(styles.outlinedCard);
        break;
      case 'elevated':
        containerStyle.push(styles.elevatedCard);
        break;
      case 'flat':
        containerStyle.push(styles.flatCard);
        break;
      default:
        containerStyle.push(styles.defaultCard);
    }
    
    // Si es presionable, añadir estilo
    if (onPress) {
      containerStyle.push(styles.pressableCard);
    }
    
    // Estilos personalizados
    if (style) {
      containerStyle.push(style);
    }
    
    return containerStyle;
  };
  
  /**
   * Renderizar header de la tarjeta
   */
  const renderHeader = () => {
    if (!showHeader || (!title && !subtitle && !icon)) {
      return null;
    }
    
    return (
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerLeft}>
          {/* Icono del header */}
          {icon && (
            <Ionicons 
              name={icon} 
              size={24} 
              color={Colors.primary}
              style={styles.headerIcon}
            />
          )}
          
          {/* Títulos */}
          <View style={styles.headerText}>
            {title && (
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        
        {/* Icono derecho */}
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={rightIcon} 
              size={20} 
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  /**
   * Renderizar contenido de la tarjeta
   */
  const renderContent = () => {
    return (
      <View style={styles.content}>
        {children}
      </View>
    );
  };
  
  /**
   * Si la tarjeta es presionable, usar TouchableOpacity
   */
  if (onPress) {
    return (
      <TouchableOpacity
        style={getContainerStyle()}
        onPress={onPress}
        activeOpacity={0.7}
        {...otherProps}
      >
        {renderHeader()}
        {renderContent()}
      </TouchableOpacity>
    );
  }
  
  /**
   * Tarjeta normal (no presionable)
   */
  return (
    <View style={getContainerStyle()} {...otherProps}>
      {renderHeader()}
      {renderContent()}
    </View>
  );
};

// ===== COMPONENTES ESPECIALIZADOS =====

/**
 * Card para mostrar estadísticas
 */
export const StatCard = ({ label, value, unit, icon, color = Colors.primary, ...props }) => (
  <Card variant="default" showHeader={false} style={styles.statCard} {...props}>
    <View style={styles.statContent}>
      {icon && (
        <Ionicons 
          name={icon} 
          size={24} 
          color={color}
          style={styles.statIcon}
        />
      )}
      <View style={styles.statText}>
        <Text style={[styles.statValue, { color }]}>
          {value}
          {unit && <Text style={styles.statUnit}> {unit}</Text>}
        </Text>
        <Text style={styles.statLabel} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </View>
  </Card>
);

/**
 * Card para entrenamientos
 */
export const TrainingCard = ({ 
  training, 
  onPress, 
  showDate = true, 
  showStats = true,
  ...props 
}) => (
  <Card
    title={training.title}
    subtitle={showDate ? training.dateDisplay : training.activityTypeDisplay}
    icon="fitness-outline"
    rightIcon="chevron-forward-outline"
    onPress={onPress}
    {...props}
  >
    {showStats && (
      <View style={styles.trainingStats}>
        {training.distance && (
          <View style={styles.trainingStat}>
            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.trainingStatText}>{training.distanceDisplay}</Text>
          </View>
        )}
        {training.duration && (
          <View style={styles.trainingStat}>
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.trainingStatText}>{training.durationDisplay}</Text>
          </View>
        )}
        {training.calories && (
          <View style={styles.trainingStat}>
            <Ionicons name="flame-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.trainingStatText}>{training.calories} kcal</Text>
          </View>
        )}
      </View>
    )}
  </Card>
);

// ===== ESTILOS DEL COMPONENTE =====
const styles = StyleSheet.create({
  // Estilos base
  baseCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  
  defaultCard: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  outlinedCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  elevatedCard: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  
  flatCard: {
    backgroundColor: Colors.surface,
  },
  
  pressableCard: {
    // Estilos adicionales para tarjetas presionables
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  headerIcon: {
    marginRight: 12,
  },
  
  headerText: {
    flex: 1,
  },
  
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  
  rightIconButton: {
    padding: 4,
  },
  
  // Contenido
  content: {
    padding: 16,
  },
  
  // Estilos para StatCard
  statCard: {
    minHeight: 80,
  },
  
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statIcon: {
    marginRight: 12,
  },
  
  statText: {
    flex: 1,
  },
  
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  
  statUnit: {
    fontSize: 16,
    fontWeight: 'normal',
    color: Colors.textSecondary,
  },
  
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  
  // Estilos para TrainingCard
  trainingStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  
  trainingStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  
  trainingStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
});

export default Card;