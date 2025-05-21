// src/styles/components/NotificationBanner.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: 8,
  },
  banner: {
    borderRadius: 8,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  icon: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});