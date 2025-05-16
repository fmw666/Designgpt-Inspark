import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { chatService, type Message, type Chat } from '@/services/chatService';

// 全局初始化标志
let isChatInitialized = false;

export const useChat = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 使用 useCallback 缓存 loadUserChats 函数
  const loadUserChats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userChats = await chatService.getUserChats(user.id);
      console.log('userChats', userChats);
      setChats(userChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // 只依赖 user.id 而不是整个 user 对象

  // 使用 useCallback 缓存其他函数
  const createNewChat = useCallback(async () => {
    if (!user) return;

    try {
      const newChat = await chatService.createChat(user.id);
      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      return newChat;
    } catch (error) {
      console.error('Error creating new chat:', error);
      return null;
    }
  }, [user?.id]);

  const addMessage = useCallback(async (content: string, models: { id: string; name: string; count: number }[]) => {
    if (!currentChat) return;

    try {
      const message: Message = {
        id: `msg_${Date.now()}`,
        content,
        models,
        results: {
          images: {},
          content: ''
        },
        createdAt: new Date().toISOString()
      };

      const updatedChat = await chatService.addMessage(currentChat.id, message);
      setCurrentChat(updatedChat);
      setChats(prev => prev.map(chat => 
        chat.id === currentChat.id ? updatedChat : chat
      ));

      return message;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  }, [currentChat?.id]);

  const updateMessageResults = useCallback(async (messageId: string, results: Message['results']) => {
    if (!currentChat) return;

    try {
      const updatedMessages = currentChat.messages.map(msg => 
        msg.id === messageId ? { ...msg, results } : msg
      );

      const updatedChat = await chatService.updateChat(currentChat.id, {
        messages: updatedMessages
      });

      setCurrentChat(updatedChat);
      setChats(prev => prev.map(chat => 
        chat.id === currentChat.id ? updatedChat : chat
      ));
    } catch (error) {
      console.error('Error updating message results:', error);
    }
  }, [currentChat?.id]);

  const switchChat = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
    }
  }, [chats]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await chatService.deleteChat(chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (currentChat?.id === chatId) {
        setCurrentChat(chats.find(chat => chat.id !== chatId) || null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }, [currentChat?.id, chats]);

  // 使用 useEffect 加载聊天记录
  useEffect(() => {
    let mounted = true;

    const initializeChats = async () => {
      // 只在未初始化时执行初始化
      if (!isChatInitialized && mounted && user?.id) {
        isChatInitialized = true;
        await loadUserChats();
      } else if (!user?.id) {
        setChats([]);
        setCurrentChat(null);
        // 当用户登出时，重置初始化标志
        isChatInitialized = false;
      }
    };

    initializeChats();

    return () => {
      mounted = false;
    };
  }, [user?.id, loadUserChats]);

  return {
    chats,
    currentChat,
    loading,
    createNewChat,
    addMessage,
    updateMessageResults,
    switchChat,
    deleteChat
  };
};
