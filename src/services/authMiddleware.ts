import { authService } from './authService';

export class AuthMiddleware {
  private static instance: AuthMiddleware;

  public static getInstance(): AuthMiddleware {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  public async checkAuth(): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      return !!user;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }
}
