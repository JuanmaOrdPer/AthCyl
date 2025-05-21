// src/styles/components/GoalCard.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
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
  statusChip: {
    height: 26,
  },
  dateContainer: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  currentValue: {
    fontWeight: 'bold',
  },
  targetValue: {
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontWeight: 'bold',
    fontSize: 12,
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  activityIcon: {
    marginRight: 4,
  },
  activityText: {
    fontSize: 12,
    color: '#666',
  },
});