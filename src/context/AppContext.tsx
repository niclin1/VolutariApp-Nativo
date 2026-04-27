import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Vaga, UserRole, User } from '../types';
import { api } from '../services/api';
import { saveToken, getToken, deleteToken } from '../services/tokenStorage';

interface AppContextType {
  selectedVaga: Vaga | null;
  setSelectedVaga: (v: Vaga | null) => void;
  userType: 'volunteer' | 'ong';
  setUserType: (t: 'volunteer' | 'ong') => void;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  token: string | null;
  isLoadingAuth: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null);
  const [userType, setUserType] = useState<'volunteer' | 'ong'>('volunteer');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('guest');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          setToken(storedToken);
          const user = await api.getMe();
          setCurrentUser(user as User);
          setCurrentUserRole(user.role as UserRole);
        }
      } catch {
        // Token may be expired; clear it
        await deleteToken();
      } finally {
        setIsLoadingAuth(false);
      }
    };
    loadSession();
  }, []);

  const signIn = async (newToken: string, user: User) => {
    await saveToken(newToken);
    setToken(newToken);
    setCurrentUser(user);
    setCurrentUserRole(user.role as UserRole);
  };

  const signOut = async () => {
    try {
      await api.logout();
    } catch {
      // ignore logout API errors
    }
    await deleteToken();
    setToken(null);
    setCurrentUser(null);
    setCurrentUserRole('guest');
  };

  return (
    <AppContext.Provider
      value={{
        selectedVaga,
        setSelectedVaga,
        userType,
        setUserType,
        currentUserRole,
        setCurrentUserRole,
        currentUser,
        setCurrentUser,
        token,
        isLoadingAuth,
        signIn,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
