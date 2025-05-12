import { FC, ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import { ChevronLeftIcon, ChevronRightIcon, BeakerIcon } from '@heroicons/react/24/outline';

interface ChatLayoutProps {
  children: ReactNode;
}

const ChatLayout: FC<ChatLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } bg-white/80 backdrop-blur-sm border-r border-primary-100 flex-shrink-0 transition-all duration-300 relative shadow-md`}
      >
        <Sidebar />
        
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-primary-200 rounded-full p-1.5 hover:bg-primary-50 transition-colors shadow-sm"
        >
          {isSidebarCollapsed ? (
            <ChevronRightIcon className="h-4 w-4 text-primary-500" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4 text-primary-500" />
          )}
        </button>

        {/* Test Page Link */}
        <Link
          to="/test"
          className="absolute bottom-20 left-0 right-0 p-4 flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <BeakerIcon className="h-5 w-5" />
          {!isSidebarCollapsed && <span>测试页面</span>}
        </Link>

        {/* User Info at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-100 bg-white/50 backdrop-blur-sm">
          <UserMenu isCollapsed={isSidebarCollapsed} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Content */}
        <main className="flex-1 overflow-hidden bg-white/50 backdrop-blur-sm">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ChatLayout; 