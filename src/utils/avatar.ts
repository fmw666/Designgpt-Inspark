import { User } from '@/services/authService';

/**
 * 获取用户头像显示文本
 * @param user 用户对象
 * @returns 头像显示文本（首字母）
 */
export const getAvatarText = (user: User | null): string => {
  if (!user) return '?';
  
  // 优先使用 username
  const displayName = user.username;
  if (displayName) {
    return displayName.charAt(0).toUpperCase();
  }
  
  // 如果没有 username，使用邮箱首字母
  return user.email.split('@')[0].charAt(0).toUpperCase();
};

/**
 * 获取用户头像样式类
 * @returns 头像样式类
 */
export const getAvatarClasses = (): string => {
  return 'rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium shadow-lg';
};

/**
 * 获取用户头像尺寸类
 * @param size 尺寸类型：'sm' | 'md' | 'lg'
 * @returns 尺寸类
 */
export const getAvatarSizeClasses = (size: 'sm' | 'md' | 'lg' = 'md'): string => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-24 h-24 text-4xl'
  };
  return sizes[size];
};
