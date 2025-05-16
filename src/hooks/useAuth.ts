import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/services/auth';
import type { User, AuthError } from '@/services/supabase';
import { supabase } from '@/services/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

// 全局初始化标志
let isInitialized = false;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const authService = AuthService.getInstance();

  // 使用 useCallback 缓存 checkUser 函数
  const checkUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      setUser(user);
      console.log('user', user);
    } catch (err) {
      setError(err as AuthError);
    } finally {
      setLoading(false);
    }
  }, []); // 空依赖数组，因为这个函数不依赖任何外部变量

  // 检查用户登录状态
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // 只在未初始化时执行初始化
      if (!isInitialized && mounted) {
        isInitialized = true;
        await checkUser();
      }
    };

    initializeAuth();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;

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
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkUser]); // 只依赖 checkUser 函数

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
      // 重置初始化标志，允许重新初始化
      isInitialized = false;
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
