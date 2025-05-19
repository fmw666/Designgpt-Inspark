import { create } from 'zustand';
import { authService } from '@/services/authService';
import { User } from '@/services/supabase';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isInitialized: boolean;
  setIsInitialized: (isInitialized: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  isInitialized: false,
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  initialize: async () => {
    const { isInitialized } = get();
    
    // 如果已经初始化过，直接返回
    if (isInitialized || get().isLoading) {
      console.log('Auth already initialized or loading, skipping...');
      return;
    }

    console.log('Starting auth initialization...');
    
    try {
      set(state => ({
        ...state,
        isLoading: true
      }));

      const user = await authService.getSession();
      console.log('Auth session retrieved:', user ? 'User found' : 'No user');
      
      set(state => ({
        ...state,
        user: user,
        isLoading: false,
        isInitialized: true
      }));
    } catch (error) {
      console.error('Error initializing auth:', error);
      set(state => ({
        ...state,
        user: null,
        isLoading: false,
        isInitialized: true
      }));
    }
    
    // 监听认证状态变化
    authService.onAuthStateChange((_event, session) => {
      if (session) {
        set(state => ({
          ...state,
          user: {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at || null,
          }
        }));
      } else {
        set(state => ({
          ...state,
          user: null
        }));
      }
    });
  },

  signOut: async () => {
    const { setUser } = get();
    try {
      await authService.signOut();
      
      // 清空用户状态
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  sendVerificationCode: async (email: string) => {
    try {
      await authService.sendEmailVerification(email);
    } catch (error) {
      console.error('Error sending verification code:', error);
      throw error;
    }
  },

  verifyCode: async (email: string, code: string) => {
    try {
      await authService.verifyEmailCode(email, code);
    } catch (error) {
      console.error('Error verifying code:', error);
      throw error;
    }
  },

}));
