// src/styles/components/TrainingStats.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  compactCard: {
    marginBottom: 8,
  },
  statsContainer: {
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  statItem: {
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    marginVertical: 8,
  },
});