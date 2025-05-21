// src/styles/screens/main/StatsScreen.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 8,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  periodChip: {
    marginRight: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recordLabel: {
    fontSize: 14,
  },
  recordValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  goalsButton: {
    marginTop: 8,
  },
});