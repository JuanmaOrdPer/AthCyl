import React from 'react';
import { View, TextInput, Text, TextInputProps, StyleSheet } from 'react-native';

type FormInputProps = TextInputProps & {
  label: string;
  error?: string;
  touched?: boolean;
};

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  touched,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          touched && error ? styles.inputError : {},
          props.multiline ? styles.multiline : {},
        ]}
        placeholderTextColor="#999"
        {...props}
      />
      {touched && error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default FormInput;
