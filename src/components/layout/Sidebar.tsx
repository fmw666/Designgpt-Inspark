import { FC } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { ChatHistory } from '../chat/ChatHistory';
import { useAuth } from '@/hooks/useAuth';
import { eventBus } from '@/utils/eventBus';

const Sidebar: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNewChat = () => {
    if (!user) {
      eventBus.emit('needSignIn');
      return;
    }
    navigate('/chat/new');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <Logo />

      {/* 新建聊天按钮 */}
      <div className="px-4 mb-4">
        <motion.button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm hover:shadow-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-medium">New Chat</span>
        </motion.button>
      </div>

      {/* 聊天历史 */}
      <div className="flex-1 overflow-hidden">
        <ChatHistory />
      </div>
    </div>
  );
};

export default Sidebar; 
