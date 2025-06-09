import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase, AuthError } from './supabase';
import type { User } from './supabase';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // 获取 session
  public async getSession(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    return {
      id: session.user.id,
      email: session.user.email!,
      created_at: session.user.created_at,
      last_sign_in_at: session.user.last_sign_in_at || null,
      user_metadata: session.user.user_metadata
    };
  }

  // 更新用户元数据
  async updateUserMetadata(metadata: { [key: string]: any }): Promise<User> {
    const { data: { user }, error } = await supabase.auth.updateUser({
      data: metadata
    });

    if (error) throw error;
    if (!user) throw new Error('User not found');

    return {
      id: user.id,
      email: user.email!,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at || null,
      user_metadata: user.user_metadata
    };
  }

  // 监听 session 变化
  public onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): void {
    supabase.auth.onAuthStateChange(callback);
  }

  // 发送邮箱验证码
  public async sendEmailVerification(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw this.handleError(error);
    }
  }

  // 验证邮箱验证码
  public async verifyEmailCode(email: string, code: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (error) throw error;

      if (!data || !data.user) {
        throw new Error('No user data returned');
      }

      this.currentUser = {
        id: data.user.id,
        email: data.user.email!,
        created_at: data.user.created_at,
        last_sign_in_at: data.user.last_sign_in_at || null,
        user_metadata: data.user.user_metadata
      };

      return this.currentUser;
    } catch (error) {
      console.error('Error verifying email code:', error);
      throw this.handleError(error);
    }
  }

  // 获取当前用户
  public async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!user || error) {
        this.currentUser = null;
        return null;
      }

      this.currentUser = {
        id: user.id,
        email: user.email!,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || null,
        user_metadata: user.user_metadata
      };

      return this.currentUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw this.handleError(error);
    }
  }

  // 登出
  public async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      this.currentUser = null;
    } catch (error) {
      console.error('Error signing out:', error);
      throw this.handleError(error);
    }
  }

  // 处理错误
  private handleError(error: any): AuthError {
    if (error instanceof Error) {
      return {
        message: error.message,
      };
    }
    return {
      message: 'An unexpected error occurred',
    };
  }

  // 获取当前用户（同步方法）
  public getCurrentUserSync(): User | null {
    return this.currentUser;
  }
}

// 导出单例实例
export const authService = AuthService.getInstance();
 