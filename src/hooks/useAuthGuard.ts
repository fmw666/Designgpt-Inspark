import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export const useAuthGuard = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, signOut } = useAuth();

  const checkAuth = useCallback(async () => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  }, [user]);

  const handleAuthError = useCallback(async (error: Error) => {
    if (error.message === 'AUTH_REQUIRED') {
      await signOut();
      setShowLoginModal(true);
      return false;
    }
    return true;
  }, [signOut]);

  return {
    showLoginModal,
    setShowLoginModal,
    checkAuth,
    handleAuthError,
  };
};
