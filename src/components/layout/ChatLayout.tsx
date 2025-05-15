import { FC, ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import { SignInModal } from '@/components/auth/SignInModal';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ChatLayoutProps {
  children: ReactNode;
}

const ChatLayout: FC<ChatLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          } bg-white/80 backdrop-blur-sm border-r border-primary-100 flex-shrink-0 transition-all duration-300 relative shadow-md`}
        >
          <Sidebar />
          
          {/* Collapse Toggle Button */}
          {/* <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-primary-200 rounded-full p-1.5 hover:bg-primary-50 transition-colors shadow-sm"
          >
            {isSidebarCollapsed ? (
              <ChevronRightIcon className="h-4 w-4 text-primary-500" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4 text-primary-500" />
            )}
          </button> */}

          {/* User Info at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-100 bg-white/50 backdrop-blur-sm">
            <UserMenu 
              isCollapsed={isSidebarCollapsed} 
              onSignInClick={() => setIsSignInModalOpen(true)}
            />
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

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </>
  );
};

export default ChatLayout; 