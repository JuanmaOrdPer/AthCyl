// src/styles/screens/auth/RegisterScreen.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  surface: {
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
    color: 'red',
  },
  requiredText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
});