// src/styles/components/AchievementCard.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  card: {
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  badgeContainer: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    position: 'absolute',
    right: 4,
    top: -18,
    fontSize: 10,
    color: '#666',
  },
});