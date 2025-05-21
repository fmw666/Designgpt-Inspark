import { createContext, useEffect, useState } from 'react';
import { User } from '@/services/supabase';
import { SignInModal } from './SignInModal';
import { eventBus } from '@/utils/eventBus';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const { user } = useAuth();

  // 监听用户状态变化
  useEffect(() => {
    if (user) {
      setShowSignInModal(false);
    }
  }, [user]);

  // 处理登录事件
  useEffect(() => {
    const handleNeedSignIn = () => {
      if (!user) {
        setShowSignInModal(true);
      }
    };

    eventBus.on('needSignIn', handleNeedSignIn);

    return () => {
      eventBus.off('needSignIn', handleNeedSignIn);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSuccess={() => {
          // 登录成功后的处理
          setShowSignInModal(false);
        }}
      />
    </AuthContext.Provider>
  );
};
