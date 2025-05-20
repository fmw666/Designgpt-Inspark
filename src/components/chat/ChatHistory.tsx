import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { chats, currentChat, isLoading, deleteChat } = useChat();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // 使用 useMemo 缓存分组结果
  const groupedChats = useMemo(() => {
    if (!chats.length) return {};

    return chats.reduce<GroupedChats>((groups, chat) => {
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
  }, [chats]);

  // 使用 useMemo 缓存排序后的分组键
  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedChats).sort((a, b) => {
      if (a === '今天') return -1;
      if (b === '今天') return 1;
      if (a === '昨天') return -1;
      if (b === '昨天') return 1;
      if (a === '7天内') return -1;
      if (b === '7天内') return 1;
      if (a === '30天内') return -1;
      if (b === '30天内') return 1;
      return b.localeCompare(a);
    });
  }, [groupedChats]);

  const handleChatClick = (chat: Chat) => {
    navigate(`/chat/${chat.id}`);
  };

  const handleDeleteChat = async (chatId: string) => {
    setIsDeleting(chatId);
    try {
      await deleteChat(chatId);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 聊天历史列表 - 使用新的滚动条样式 */}
      <div className="h-[calc(100%-80px)] overflow-y-auto pl-4 pr-2 scrollbar-custom">
        <AnimatePresence>
          {sortedGroupKeys.map((groupKey) => (
            <motion.div
              key={groupKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <h3 className="text-xs font-medium text-gray-500 mb-3 px-2 sticky top-0 bg-white py-1.5 z-10 border-b border-gray-100">
                {groupKey}
              </h3>
              <div className="space-y-1">
                {groupedChats[groupKey].map((chat) => (
                  <motion.div
                    key={chat.id}
                    onClick={() => handleChatClick(chat)}
                    className={`group relative w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      currentChat?.id === chat.id
                        ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {chat.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {chat.messages[0]?.content || '暂无消息'}
                        </div>
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className={`ml-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors duration-200 cursor-pointer rounded-lg ${
                          isDeleting === chat.id ? 'opacity-50 cursor-not-allowed' : ''
                        } ${currentChat?.id === chat.id ? 'group-hover:bg-white/50' : 'group-hover:bg-gray-100'}`}
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
    </div>
  );
};
 