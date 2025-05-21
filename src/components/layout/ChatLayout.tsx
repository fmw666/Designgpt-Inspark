import { FC, ReactNode, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import { SignInModal } from '@/components/auth/SignInModal';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';
// import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ChatLayoutProps {
  children: ReactNode;
}

const ChatLayout: FC<ChatLayoutProps> = ({ children }) => {
  // const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isMobileWidth, setIsMobileWidth] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobileWidth(window.innerWidth < 768);
    };
    // 初始化时执行一次
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 移动端菜单按钮 - 在 md 断点以下显示，与标题垂直居中对齐 */}
      <div className="fixed top-0 left-0 h-14 z-40 md:hidden flex items-center px-4">
        <button
          type="button"
          className="group relative rounded-lg bg-white/80 backdrop-blur-sm p-2 text-gray-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md border border-gray-200/50 hover:border-indigo-200"
          onClick={() => setIsMobileSidebarOpen(true)}
        >
          <span className="sr-only">打开侧边栏</span>
          <Bars3Icon 
            className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" 
            aria-hidden="true" 
          />
          {/* 悬停时的光晕效果 */}
          <span className="absolute inset-0 rounded-lg bg-indigo-50/0 group-hover:bg-indigo-50/50 transition-colors duration-200" />
        </button>
      </div>

      {/* 移动端侧边栏遮罩层 */}
      <Transition
        show={isMobileSidebarOpen}
        enter="transition-opacity ease-linear duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* 侧边栏 - 根据屏幕宽度决定定位方式 */}
      <Transition
        show={isMobileWidth ? isMobileSidebarOpen : true}
        enter="transition ease-in-out duration-300 transform"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transition ease-in-out duration-300 transform"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
        className={`${
          isMobileWidth 
            ? 'fixed inset-y-0 left-0 z-50' 
            : 'relative'
        }`}
      >
        <div className="w-64 h-full bg-white/80 backdrop-blur-sm border-r border-primary-100 flex-shrink-0 transition-all duration-300 relative shadow-md">
          <Sidebar />
          
          {/* Collapse Toggle Button */}
          {/* <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-primary-200 rounded-full p-1.5 hover:bg-primary-50 transition-colors shadow-sm"
          >
            {isSidebarCollapsed ? (
              <ChevronRightIcon className="h-4 w-4 text-primary-500" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4 text-primary-500" />
            )}
          </button> */}

          {/* User Info at Bottom - 使用 fixed 定位确保在最上层 */}
          <div className={`${
            isMobileWidth 
              ? 'fixed bottom-0 left-0' 
              : 'absolute bottom-0 left-0'
          } w-64 p-4 border-t border-r border-gray-200 bg-white/50 backdrop-blur-sm z-[9999]`}>
            <UserMenu 
              // isCollapsed={isSidebarCollapsed} 
              onSignInClick={() => setIsSignInModalOpen(true)}
            />
          </div>
        </div>
      </Transition>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </div>
  );
};

export default ChatLayout;
