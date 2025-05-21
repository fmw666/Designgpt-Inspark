import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const {
    user,
    isInitialized,
    initialize,
    isLoading,
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
    isInitialized,
    signOut,
    sendVerificationCode,
    verifyCode
  };
};
