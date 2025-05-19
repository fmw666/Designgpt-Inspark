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

  // 单独处理登录事件监听
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
  }, [user]); // 只在 user 状态变化时更新事件监听器


  return (
    <AuthContext.Provider value={{ user }}>
      {children}
      {/* 登录模态框 */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSuccess={() => setShowSignInModal(false)}
      />
    </AuthContext.Provider>
  );
};
