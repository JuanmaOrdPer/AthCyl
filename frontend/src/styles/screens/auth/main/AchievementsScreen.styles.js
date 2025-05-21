// src/styles/screens/main/AchievementsScreen.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  filterChip: {
    marginRight: 8,
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
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  levelChip: {
    marginLeft: 8,
  },
  divider: {
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  modalDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  requirementsContainer: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  requirements: {
    fontSize: 14,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'right',
  },
});