// src/styles/screens/main/HomeScreen.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  trainingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  trainingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trainingDate: {
    fontSize: 14,
    color: '#666',
  },
  trainingDistance: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  trainingType: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalType: {
    fontSize: 14,
    color: '#666',
  },
  goalProgress: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  goalValue: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  divider: {
    marginVertical: 4,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
    paddingVertical: 16,
  },
});