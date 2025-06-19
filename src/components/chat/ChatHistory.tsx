import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/hooks/useChat';
import { Chat } from '@/services/chatService';
import { TrashIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toast } from 'react-hot-toast';

// 添加一个判断是否在最近 7 天内的函数
const isWithinLast7Days = (date: Date) => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};

// 添加一个判断是否在最近 30 天内的函数
const isWithinLast30Days = (date: Date) => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30;
};

interface GroupedChats {
  [key: string]: Chat[];
}

const ChatHistory = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { chats, currentChat, isLoading, deleteChat, switchChat } = useChat();
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // 获取当前语言的 date-fns locale
  const dateLocale = i18n.language === 'zh' ? zhCN : enUS;

  // 使用 useMemo 缓存分组结果
  const groupedChats = useMemo(() => {
    if (!chats.length) return {};

    return chats.reduce<GroupedChats>((groups, chat) => {
      let groupKey: string;
      const date = new Date(chat.created_at);

      if (isToday(date)) {
        groupKey = t('history.today');
      } else if (isYesterday(date)) {
        groupKey = t('history.yesterday');
      } else if (isWithinLast7Days(date)) {
        groupKey = t('history.inSevenDays');
      } else if (isWithinLast30Days(date)) {
        groupKey = t('history.inThirtyDays');
      } else if (isThisYear(date)) {
        groupKey = format(date, 'yyyy-MM', { locale: dateLocale });
      } else {
        groupKey = format(date, 'yyyy', { locale: dateLocale });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(chat);
      return groups;
    }, {});
  }, [chats, t, dateLocale]);

  // 使用 useMemo 缓存排序后的分组键
  const sortedGroupKeys = useMemo(() => {
    const today = t('history.today');
    const yesterday = t('history.yesterday');
    const sevenDays = t('history.inSevenDays');
    const thirtyDays = t('history.inThirtyDays');

    return Object.keys(groupedChats).sort((a, b) => {
      if (a === today) return -1;
      if (b === today) return 1;
      if (a === yesterday) return -1;
      if (b === yesterday) return 1;
      if (a === sevenDays) return -1;
      if (b === sevenDays) return 1;
      if (a === thirtyDays) return -1;
      if (b === thirtyDays) return 1;
      return b.localeCompare(a);
    });
  }, [groupedChats, t]);

  const handleChatClick = (chatId: string) => {
    if (currentChat?.uuid === chatId) return;
    switchChat(chatId);
    navigate(`/chat/${chatId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setChatToDelete(chatId);
  };

  const handleConfirmDelete = async () => {
    if (!chatToDelete) return;

    setIsDeleting(chatToDelete);
    try {
      await deleteChat(chatToDelete);
      toast.success(t('history.deleteSuccess'));
      
      // 如果删除的是当前聊天，切换到首页
      if (currentChat?.uuid === chatToDelete) {
        navigate('/chat/new');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error(t('history.deleteError'));
    } finally {
      setIsDeleting(null);
      setChatToDelete(null);
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
      {/* 聊天历史列表 - 使用新的滚动条样式，添加底部padding避免被用户菜单遮挡 */}
      <div className="h-[calc(100%-80px)] overflow-y-auto pl-4 pr-2">
        <AnimatePresence>
          {sortedGroupKeys.map((groupKey) => (
            <motion.div
              key={groupKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <h3 className="text-xs font-medium text-gray-500 mb-3 px-2 sticky top-0 bg-white dark:bg-gray-900 py-1.5 z-10 border-b border-gray-100 dark:border-gray-800">
                {groupKey}
              </h3>
              <div className="space-y-1">
                {groupedChats[groupKey].map((chat) => (
                  <motion.div
                    key={chat.uuid}
                    onClick={() => handleChatClick(chat.uuid)}
                    className={`group relative w-full text-left px-3 py-2.5 rounded-xl cursor-pointer ${
                      currentChat?.uuid === chat.uuid
                        ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-900 dark:text-indigo-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
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
                          {chat.description}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteClick(e, chat.uuid)}
                        className={`ml-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors duration-200 cursor-pointer rounded-lg ${
                          isDeleting === chat.uuid ? 'opacity-50 cursor-not-allowed' : ''
                        } ${currentChat?.uuid === chat.uuid ? 'group-hover:bg-white/50 dark:group-hover:bg-gray-900/50' : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-800'}`}
                        disabled={isDeleting === chat.uuid}
                      >
                        {isDeleting === chat.uuid ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <TrashIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {chats.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <p className="text-sm">{t('history.noChats')}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!chatToDelete}
        onClose={() => setChatToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('history.deleteTitle')}
        message={t('history.deleteMessage')}
        confirmText={t('history.delete')}
        cancelText={t('common.cancel')}
        type="danger"
        maxWidth="md"
      />
    </div>
  );
};

export default ChatHistory;
