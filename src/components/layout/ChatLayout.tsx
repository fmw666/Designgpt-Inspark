import { FC, ReactNode } from 'react';

interface ChatLayoutProps {
  children: ReactNode;
}

const ChatLayout: FC<ChatLayoutProps> = ({ children }) => {

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
};

export default ChatLayout;
