import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { Chat } from '@/services/chatService';
import { TrashIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface GroupedChats {
  [key: string]: Chat[];
}

export const ChatHistory = () => {
  const { chats, currentChat, loading, switchChat, deleteChat } = useChat();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSwitchChat = (chat: Chat) => {
    switchChat(chat.id);
  };

  const handleDeleteChat = async (chatId: string) => {
    setIsDeleting(chatId);
    try {
      await deleteChat(chatId);
    } finally {
      setIsDeleting(null);
    }
  };

  // 按日期分组聊天记录
  const groupedChats = chats.reduce<GroupedChats>((groups, chat) => {
    let groupKey: string;
    const date = new Date(chat.created_at);

    if (isToday(date)) {
      groupKey = '今天';
    } else if (isYesterday(date)) {
      groupKey = '昨天';
    } else if (isThisWeek(date)) {
      groupKey = '7天内';
    } else if (isThisMonth(date)) {
      groupKey = '30天内';
    } else if (isThisYear(date)) {
      groupKey = format(date, 'yyyy-MM', { locale: zhCN });
    } else {
      groupKey = format(date, 'yyyy', { locale: zhCN });
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(chat);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4">
      <AnimatePresence>
        {Object.entries(groupedChats).map(([group, groupChats]) => (
          <motion.div
            key={group}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <h3 className="text-xs font-medium text-gray-500 mb-2 px-2">
              {group}
            </h3>
            <div className="space-y-1">
              {groupChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  onClick={() => handleSwitchChat(chat)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                    currentChat?.id === chat.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{chat.title}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {chat.messages[0]?.content || '暂无消息'}
                      </div>
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                      className={`ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200 cursor-pointer ${
                        isDeleting === chat.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isDeleting === chat.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {chats.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
          <p className="text-sm">暂无聊天记录</p>
        </div>
      )}
    </div>
  );
};
