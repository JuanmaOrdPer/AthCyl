import React from 'react';
import { View, Text } from 'react-native';
import Icon, { IconNames } from './common/Icon';
import styles from './ActivitySummary.styles';

const ActivitySummary = ({ duration, distance, speed, calories }) => {
  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Icon name={IconNames.time} size={24} color="#666" />
        <Text style={styles.statValue}>{duration}</Text>
        <Text style={styles.statLabel}>Duration</Text>
      </View>
      
      <View style={styles.statItem}>
        <Icon name={IconNames.distance} size={24} color="#666" />
        <Text style={styles.statValue}>{distance}</Text>
        <Text style={styles.statLabel}>Distance</Text>
      </View>
      
      <View style={styles.statItem}>
        <Icon name={IconNames.speed} size={24} color="#666" />
        <Text style={styles.statValue}>{speed}</Text>
        <Text style={styles.statLabel}>Speed</Text>
      </View>
      
      <View style={styles.statItem}>
        <Icon name={IconNames.flame} size={24} color="#666" />
        <Text style={styles.statValue}>{calories}</Text>
        <Text style={styles.statLabel}>Calories</Text>
      </View>
    </View>
  );
};

export default ActivitySummary;
