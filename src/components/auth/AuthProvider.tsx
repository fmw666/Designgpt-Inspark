import { createContext, useContext, ReactNode } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { SignInModal } from './SignInModal';

interface AuthContextType {
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  checkAuth: () => Promise<boolean>;
  handleAuthError: (error: Error) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const authGuard = useAuthGuard();

  return (
    <AuthContext.Provider value={authGuard}>
      {children}
      <SignInModal 
        isOpen={authGuard.showLoginModal} 
        onClose={() => authGuard.setShowLoginModal(false)} 
      />
    </AuthContext.Provider>
  );
};
