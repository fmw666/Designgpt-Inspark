import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useNavigate, useParams } from 'react-router-dom';

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface GroupedChats {
  [key: string]: Chat[];
}

export const ChatHistory = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const navigate = useNavigate();
  const { chatId } = useParams();

  // 模拟获取聊天历史
  useEffect(() => {
    // TODO: 从后端获取聊天历史
    const mockChats: Chat[] = [
      {
        id: '1',
        title: '设计一个登录页面',
        lastMessage: '好的，我来帮你设计一个现代风格的登录页面...',
        timestamp: new Date(),
      },
      {
        id: '2',
        title: '优化移动端布局',
        lastMessage: '让我们来优化一下移动端的响应式布局...',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨天
      },
      // 添加更多模拟数据...
    ];
    setChats(mockChats);
  }, []);

  // 按日期分组聊天记录
  const groupedChats = chats.reduce<GroupedChats>((groups, chat) => {
    let groupKey: string;
    const date = chat.timestamp;

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

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

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
                <motion.button
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                    chatId === chat.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="font-medium truncate">{chat.title}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {chat.lastMessage}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}; 