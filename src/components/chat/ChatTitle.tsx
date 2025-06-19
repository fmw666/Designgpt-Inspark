import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { chatService } from '@/services/chatService';
import { CheckIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const ChatTitle = () => {

  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentChat, setCurrentChat, chats, setChats } = useChat();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  
  // 当进入编辑模式时，自动聚焦输入框
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // 监听 currentChat 变化，如果变化则取消编辑状态
  useEffect(() => {
    if (isEditingTitle) {
      setIsEditingTitle(false);
      setEditedTitle('');
    }
  }, [currentChat?.uuid]);
  
  // 处理标题编辑
  const handleTitleEdit = () => {
    if (currentChat) {
      setEditedTitle(currentChat.title);
      setIsEditingTitle(true);
    }
  };

  // 处理标题输入变化
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 13) {
      setEditedTitle(value);
    }
  };

  
  // 保存标题
  const handleTitleSave = async () => {
    if (!currentChat || !editedTitle.trim()) return;

    // 如果标题没有变化，直接关闭编辑状态
    if (editedTitle.trim() === currentChat.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const updatedChat = await chatService.updateChat(currentChat.uuid, {
        title: editedTitle.trim()
      });
      
      if (updatedChat) {
        // 更新本地状态
        const updatedChats = chats.map(chat => 
          chat.uuid === currentChat.uuid ? updatedChat : chat
        );
        setChats(
          updatedChats.map(chat => ({
            ...chat,
            title: chat.title
          }))
        );
        setCurrentChat({
          ...currentChat,
          title: updatedChat.title
        });
      }
    } catch (error) {
      console.error('Error updating chat title:', error);
      // 发生错误时恢复原标题
      setEditedTitle(currentChat.title);
    } finally {
      setIsEditingTitle(false);
    }
  };

  // 取消编辑
  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  // 处理按键事件
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  return (
    <>
      {/* Chat Title */}
      {user && currentChat?.title && (
        <div className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800 backdrop-blur-sm flex items-center px-6 justify-center group">
          <div className="relative w-full max-w-md">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 animate-fadeIn">
                <div className="flex-1 relative">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editedTitle}
                    onChange={handleTitleChange}
                    onKeyDown={handleTitleKeyDown}
                    className="w-full px-2 py-1 text-lg font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={t('chat.title.placeholder')}
                    maxLength={13}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 transition-opacity duration-200">
                    {t('chat.title.characterCount', { count: editedTitle.length })}
                  </div>
                </div>
                <button
                  onClick={handleTitleSave}
                  className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-500 transition-colors hover:bg-green-50 dark:hover:bg-green-900 rounded-lg"
                  title={t('common.save')}
                >
                  <CheckIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleTitleCancel}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg"
                  title={t('common.cancel')}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-lg">
                <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {currentChat.title}
                </h1>
                <button
                  onClick={handleTitleEdit}
                  className="p-1 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
                  title={t('chat.title.edit')}
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatTitle;
