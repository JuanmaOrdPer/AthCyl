// src/styles/components/ErrorBoundary.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: 'red',
  },
  errorMessage: {
    marginBottom: 20,
    textAlign: 'center',
  },
});