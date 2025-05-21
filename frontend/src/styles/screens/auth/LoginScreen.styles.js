// src/styles/screens/auth/LoginScreen.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  surface: {
    padding: 24,
    borderRadius: 12,
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  passwordField: {
    flex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 20,
    zIndex: 1,
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
});