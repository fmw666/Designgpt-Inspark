import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useChatStore } from '@/store/chatStore';
import type { Chat, Message } from '@/services/chatService';

export const useChat = () => {
  const { user } = useAuth();
  const {
    chats,
    currentChat,
    isLoading,
    isInitialized,
    setChats,
    setCurrentChat,
    setIsInitialized,
    initialize,
    createNewChat,
    addMessage,
    updateMessageResults,
    switchChat,
    deleteChat
  } = useChatStore();

  useEffect(() => {
    if (user && !isInitialized) {
      initialize();
    } else if (!user) {
      setChats([]);
      setCurrentChat(null);
      setIsInitialized(false);
    }
  }, [user, isInitialized]);

  return {
    chats,
    currentChat,
    isLoading,
    isInitialized,
    setChats,
    setCurrentChat,
    createNewChat: user ? createNewChat : async () => null,
    addMessage: user ? addMessage : async () => null,
    updateMessageResults: user ? updateMessageResults : async () => {},
    switchChat: user ? switchChat : () => {},
    deleteChat: user ? deleteChat : async () => {},
    initialize
  };
};
 