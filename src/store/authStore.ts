import { create } from 'zustand';
import { authService, User } from '@/services/authService';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isInitialized: boolean;
  setIsInitialized: (isInitialized: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  unAuthenticate: () => void;
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
      return;
    }

    try {
      set(state => ({
        ...state,
        isLoading: true
      }));

      const user = await authService.getCurrentUser();
      
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
  },

  signOut: async () => {
    const { setUser } = get();
    try {
      await authService.signOut();
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
    const { setUser } = get();
    try {
      const user = await authService.verifyEmailCode(email, code);
      setUser(user);
    } catch (error) {
      console.error('Error verifying code:', error);
      throw error;
    }
  },

  updateDisplayName: async (displayName: string) => {
    const { user, setUser } = get();
    try {
      await authService.updateUserMetadata({ username: displayName });
      const newUser = {
        ...user as User,
        username: displayName
      };
      setUser(newUser);
    } catch (error) {
      console.error('Error updating display name:', error);
      throw error;
    }
  },
  
  unAuthenticate: () => {
    set({ user: null, isInitialized: false, isLoading: false });
  }
}));
