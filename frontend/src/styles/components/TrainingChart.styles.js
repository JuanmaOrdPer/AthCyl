// src/styles/components/TrainingChart.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 16,
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 8,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
});