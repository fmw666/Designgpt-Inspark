import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useChatStore } from '@/store/chatStore';

export const useChat = () => {
  const { user } = useAuth();
  const {
    chats,
    currentChat,
    isLoading,
    isInitialized,
    shouldScrollToBottom,
    setChats,
    setCurrentChat,
    setIsLoading,
    setIsInitialized,
    setShouldScrollToBottom,
    initialize,
    createNewChat,
    addMessage,
    updateMessageResults,
    switchChat,
    deleteChat,
    loadChatMessages,
    unAuthenticate
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
    shouldScrollToBottom,
    setChats,
    setCurrentChat,
    setIsLoading,
    setIsInitialized,
    setShouldScrollToBottom,
    initialize,
    createNewChat: user ? createNewChat : async () => null,
    addMessage: user ? addMessage : async () => null,
    updateMessageResults: user ? updateMessageResults : async () => {},
    switchChat: user ? switchChat : () => {},
    deleteChat: user ? deleteChat : async () => {},
    loadChatMessages,
    unAuthenticate: user ? unAuthenticate : () => {}
  };
};
