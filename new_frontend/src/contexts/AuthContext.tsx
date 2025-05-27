import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { isAuthenticated as checkAuth } from '../api/authService';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ 
    success: boolean; 
    error?: string; 
    token?: string;
    data?: any;
  }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authenticated = await checkAuth();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    const { login: loginService } = await import('../api/authService');
    const result = await loginService(email, password);
    
    if (result.success) {
      setIsAuthenticated(true);
      // Actualizar con los datos del usuario devueltos por el servidor si están disponibles
      setUser({
        id: result.user?.id?.toString() || '1',
        name: result.user?.name || email.split('@')[0],
        email: result.user?.email || email
      });
    }
    
    return result;
  };

  const register = async (userData: any) => {
    const { register: registerService } = await import('../api/authService');
    const result = await registerService(userData);
    
    if (result.success && result.token) {
      // Si el registro incluye un token, establecer el usuario como autenticado
      setIsAuthenticated(true);
      setUser({
        id: result.data?.usuario?.id?.toString() || '1',
        name: userData.name,
        email: userData.email
      });
    }
    
    return result;
  };

  const logout = async () => {
    const { logout: logoutService } = await import('../api/authService');
    await logoutService();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user,
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
