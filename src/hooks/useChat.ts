import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useChatStore } from '@/store/chatStore';

export const useChat = () => {
  const { isInitialized: isAuthInitialized } = useAuth();
  const {
    chats,
    currentChat,
    isLoading,
    isInitialized,
    initialize,
    createNewChat,
    addMessage,
    updateMessageResults,
    switchChat,
    deleteChat
  } = useChatStore();

  useEffect(() => {
    if (isAuthInitialized && !isInitialized) {
      initialize();
    }
  }, [isAuthInitialized, isInitialized, initialize]);

  return {
    chats,
    currentChat,
    isLoading: isLoading || !isAuthInitialized,
    createNewChat,
    addMessage,
    updateMessageResults,
    switchChat,
    deleteChat
  };
};
