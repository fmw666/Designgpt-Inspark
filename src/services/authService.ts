import axiosInstance from './axios';

export interface User {
  uuid: string;
  email: string;
  username: string;
  created_at: string;
  last_login_at: string | null;
  meta_data: Record<string, any>;
}

interface LoginResponse {
  access_token: string;
}

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
      await axiosInstance.post('/auth/email/otp', { email });
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  // 验证邮箱验证码并登录
  public async verifyEmailCode(email: string, code: string): Promise<User> {
    try {
      const response: LoginResponse = await axiosInstance.post('/auth/email/login', { email, code });
      const { access_token } = response;
      
      // 保存 token
      localStorage.setItem('access_token', access_token);
      
      // 获取用户信息
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('Failed to get user info after login');
      }
      
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Error verifying email code:', error);
      throw error;
    }
  }

  // 获取当前用户
  public async getCurrentUser(): Promise<User | null> {
    try {
      const response: User = await axiosInstance.get('/auth/me');
      this.currentUser = response;
      return this.currentUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      this.currentUser = null;
      return null;
    }
  }

  // 登出
  public async signOut(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
      localStorage.removeItem('access_token');
      this.currentUser = null;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // 更新用户元数据
  public async updateUserMetadata(metadata: Record<string, any>): Promise<User> {
    try {
      const response = await axiosInstance.put<User>('/auth/me', metadata);
      this.currentUser = response;
      return this.currentUser;
    } catch (error) {
      console.error('Error updating user metadata:', error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance();
 