import { useEffect } from 'react';
import { useThemeStore } from '@/styles/theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useThemeStore();

  useEffect(() => {
    // 更新 HTML 根元素的 class
    const root = window.document.documentElement;
    
    // 移除所有主题相关的类
    root.classList.remove('light', 'dark');
    
    // 添加当前主题类
    root.classList.add(theme);
    
    // 添加过渡类（分别添加每个类）
    root.classList.add('transition-colors');
    root.classList.add('duration-200');
    root.classList.add('ease-in-out');
  }, [theme]);

  return <>{children}</>;
};
