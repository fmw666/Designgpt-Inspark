import { supabase, User, AuthError } from './supabase';

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

      if (error) throw error;

      if (!user) {
        this.currentUser = null;
        return null;
      }

      this.currentUser = {
        id: user.id,
        email: user.email!,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || null,
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
