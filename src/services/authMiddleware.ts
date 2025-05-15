import { supabase } from './supabase';
import { AuthService } from './auth';

export class AuthMiddleware {
  private static instance: AuthMiddleware;
  private authService: AuthService;

  private constructor() {
    this.authService = AuthService.getInstance();
  }

  public static getInstance(): AuthMiddleware {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  public async checkAuth(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        // 清除本地用户状态
        this.authService.signOut();
        return false;
      }

      // 验证 token 是否过期
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        // token 过期，清除本地用户状态
        this.authService.signOut();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }
}
