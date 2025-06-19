import { FC, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from './ChatMessage';
import { NewChatGuide } from './NewChatGuide';
import { getAvatarText } from '@/utils/avatar';

export const ChatMessages: FC = () => {
  const { t } = useTranslation();
  const { currentChat, shouldScrollToBottom, setShouldScrollToBottom } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const [showLoading, setShowLoading] = useState(false);
  const loadingDebounceRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    // 如果 消息为 undefined 则等待
    if (currentChat?.messages === undefined) {
      return;
    }
    if (!currentChat || !currentChat.messages || currentChat.messages.length === 0) {
      setIsScrolling(false);
      setIsLoadingTimeout(false);
      return;
    }

    setIsScrolling(true);
    setIsLoadingTimeout(false);

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoadingTimeout(true);
    }, 10000);

    const images = currentChat.messages.flatMap(msg => 
      Object.values(msg.results?.images || {}).flat()
    ).filter(img => img?.url) || [];

    if (images.length === 0) {
      setIsScrolling(false);
      setIsLoadingTimeout(false);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      return;
    }

    Promise.all(
      images.map(img => {
        if (!img.url) return Promise.resolve();
        return new Promise((resolve) => {
          const image = new Image();
          image.onload = resolve;
          image.onerror = resolve;
          image.src = img.url as string;
        });
      })
    ).then(() => {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            setIsScrolling(false);
            setIsLoadingTimeout(false);
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
            setShouldScrollToBottom(false);
          }, 500);
        }
      }, 100);
    });
  };

  const handleRefresh = () => {
    setIsLoadingTimeout(false);
    scrollToBottom();
  };

  useEffect(() => {
    if (!currentChat?.messages) {
      // 使用 1000ms 的延迟来显示 loading 状态
      loadingDebounceRef.current = setTimeout(() => {
        setShowLoading(true);
      }, 1000);
    } else {
      setShowLoading(false);
      if (loadingDebounceRef.current) {
        clearTimeout(loadingDebounceRef.current);
      }
    }

    return () => {
      if (loadingDebounceRef.current) {
        clearTimeout(loadingDebounceRef.current);
      }
    };
  }, [currentChat?.messages]);

  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [shouldScrollToBottom]);
  
  useEffect(() => {
    if (currentChat?.messages === undefined) {
      return;
    }
    scrollToBottom();
  }, [currentChat?.messages]);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.uuid]);

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // 如果用户不存在，或者当前聊天不存在，则显示新聊天引导
  if (!user || !currentChat) {
    return <NewChatGuide />;
  }

  // 如果消息正在加载中，显示加载状态
  if (currentChat.messages === undefined) {
    return (
      <div className="flex-1 overflow-y-auto p-4 relative bg-gray-50 dark:bg-gray-800">
        <div className="fixed inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-200 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600 dark:text-gray-200">{t('chat.loading.loadingMessages')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 relative bg-gray-50 dark:bg-gray-800">
      {isScrolling && (
        <div className="fixed inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-200 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600 dark:text-gray-200">{t('chat.loading.loadingMessages')}</span>
            {isLoadingTimeout && (
              <button
                onClick={handleRefresh}
                className="mt-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-400 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors duration-200 flex items-center gap-2 animate-fadeIn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('chat.loading.refresh')}
              </button>
            )}
          </div>
        </div>
      )}

      {currentChat.messages.length > 0 ? (
        currentChat.messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            message={message} 
            userAvatar={getAvatarText(user)}
            user={user}
          />
        ))
      ) : (
        <NewChatGuide />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
