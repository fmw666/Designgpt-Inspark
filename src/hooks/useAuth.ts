import { useState, useEffect } from 'react';
import { AuthService } from '@/services/auth';
import type { User, AuthError } from '@/services/supabase';
import { supabase } from '@/services/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const authService = AuthService.getInstance();

  // 检查用户登录状态
  useEffect(() => {
    checkUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
          last_sign_in_at: session.user.last_sign_in_at || null,
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setUser(user);
    } catch (err) {
      setError(err as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (email: string) => {
    try {
      setError(null);
      await authService.sendEmailVerification(email);
    } catch (err) {
      setError(err as AuthError);
      throw err;
    }
  };

  const verifyCode = async (email: string, code: string) => {
    try {
      setError(null);
      const user = await authService.verifyEmailCode(email, code);
      setUser(user);
      return user;
    } catch (err) {
      setError(err as AuthError);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (err) {
      setError(err as AuthError);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    sendVerificationCode,
    verifyCode,
    signOut,
  };
};
