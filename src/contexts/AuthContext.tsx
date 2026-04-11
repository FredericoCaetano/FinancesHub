import { createContext, useState, useEffect, useRef, useContext } from "react";
import type { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  email: string | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  login: (
    email: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const hasCheckedOnce = useRef(false);

  useEffect(() => {
    const loadSession = async () => {
      setIsLoadingSession(true);
      try {
        const storedEmail = await AsyncStorage.getItem('email');
        const storedToken = await AsyncStorage.getItem('auth_token');

        if (storedEmail && storedToken) {
          setEmail(storedEmail);
          setSessionToken(storedToken);
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
      } finally {
        setIsLoadingSession(false);
      }
    };

    loadSession();
  }, []);

  useEffect(() => {
    if (email && !hasCheckedOnce.current) {
      hasCheckedOnce.current = true;
      checkSession();
    }
  }, [email]);

  const login = async (email: string) => {
    setEmail(email);
    const token = `mock_${Date.now()}`;
    setSessionToken(token);
    await AsyncStorage.setItem('email', email);
    await AsyncStorage.setItem('auth_token', token);
    console.log('Login com:', email);
  };

  const logout = async () => {
    setEmail(null);
    setSessionToken(null);
    hasCheckedOnce.current = false;
    await AsyncStorage.multiRemove([
      'email',
      'auth_token',
    ]);
  };

  const checkSession = async () => {
    if (!email || !sessionToken || isCheckingSession) return;
    setIsCheckingSession(true);

    setTimeout(() => {
      setIsCheckingSession(false);
    }, 300);
  };

  const isAuthenticated = Boolean(email && sessionToken);

  return (
    <AuthContext.Provider
      value={{
        email,
        isAuthenticated,
        isLoadingSession,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
