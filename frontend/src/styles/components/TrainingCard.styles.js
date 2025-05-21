// src/styles/components/TrainingCard.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
  additionalStats: {
    flexDirection: 'row',
    marginTop: 4,
    justifyContent: 'flex-start',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statValue: {
    marginLeft: 4,
    fontSize: 14,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  notes: {
    marginTop: 8,
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
});