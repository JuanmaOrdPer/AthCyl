// src/styles/components/ActivitySummary.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  statsContainer: {
    marginBottom: 8,
  },
  statItem: {
    marginBottom: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statIcon: {
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalText: {
    fontSize: 12,
    color: '#666',
  },
  additionalInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});