import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const {
    user,
    isInitialized,
    initialize,
    isLoading,
    signIn,
    signOut,
    sendVerificationCode,
    verifyCode
  } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [user, isInitialized]);

  return {
    user,
    isLoading,
    signIn,
    signOut,
    sendVerificationCode,
    verifyCode
  };
};
