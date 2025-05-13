import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/auth/LoginScreen';
import { AuthContext } from '../../src/contexts/AuthContext';
import { NotificationContext } from '../../src/contexts/NotificationContext';

// Mock de los contextos
const mockLogin = jest.fn();
const mockShowError = jest.fn();
const mockShowSuccess = jest.fn();

// Mock de navegación
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('LoginScreen', () => {
  let wrapper;

  beforeEach(() => {
    // Resetear los mocks
    mockLogin.mockClear();
    mockShowError.mockClear();
    mockShowSuccess.mockClear();

    // Configurar el wrapper con los contextos necesarios
    wrapper = ({ children }) => (
      <AuthContext.Provider value={{ login: mockLogin }}>
        <NotificationContext.Provider 
          value={{ 
            showError: mockShowError, 
            showSuccess: mockShowSuccess 
          }}
        >
          {children}
        </NotificationContext.Provider>
      </AuthContext.Provider>
    );
  });

  it('renderiza correctamente', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />, { wrapper });
    
    // Verificar que los elementos principales están presentes
    expect(getByPlaceholderText('Usuario')).toBeTruthy();
    expect(getByPlaceholderText('Contraseña')).toBeTruthy();
    expect(getByText('Iniciar Sesión')).toBeTruthy();
  });

  it('maneja la entrada de usuario y contraseña', () => {
    const { getByPlaceholderText } = render(<LoginScreen />, { wrapper });
    
    // Obtener los campos de entrada
    const usernameInput = getByPlaceholderText('Usuario');
    const passwordInput = getByPlaceholderText('Contraseña');
    
    // Simular la entrada de texto
    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, 'password123');
    
    // Verificar que los valores se actualizaron
    expect(usernameInput.props.value).toBe('testuser');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('llama a login cuando se presiona el botón', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />, { wrapper });
    
    // Obtener los campos de entrada y el botón
    const usernameInput = getByPlaceholderText('Usuario');
    const passwordInput = getByPlaceholderText('Contraseña');
    const loginButton = getByText('Iniciar Sesión');
    
    // Simular la entrada de texto
    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, 'password123');
    
    // Simular presionar el botón
    fireEvent.press(loginButton);
    
    // Verificar que se llamó a la función login con los datos correctos
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('muestra un error cuando los campos están vacíos', () => {
    const { getByText } = render(<LoginScreen />, { wrapper });
    
    // Simular presionar el botón sin completar los campos
    fireEvent.press(getByText('Iniciar Sesión'));
    
    // Verificar que se muestra un mensaje de error
    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining('Usuario y contraseña son requeridos')
    );
  });
});
