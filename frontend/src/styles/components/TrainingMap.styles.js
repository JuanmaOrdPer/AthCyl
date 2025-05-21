// src/styles/components/TrainingMap.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 16,
  },
});