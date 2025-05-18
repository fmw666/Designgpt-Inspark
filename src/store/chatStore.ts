import { create } from 'zustand';
import { chatService } from '@/services/chatService';
import type { Chat, Message } from '@/services/chatService';

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  isInitialized: boolean;
  setChats: (chats: Chat[]) => void;
  setCurrentChat: (chat: Chat | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  initialize: () => Promise<void>;
  createNewChat: () => Promise<Chat | null>;
  addMessage: (content: string, models: { id: string; name: string; count: number }[]) => Promise<Message | null>;
  updateMessageResults: (messageId: string, results: Message['results']) => Promise<void>;
  switchChat: (chatId: string | null) => void;
  deleteChat: (chatId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  isLoading: false,
  isInitialized: false,
  setChats: (chats) => set({ chats }),
  setCurrentChat: (currentChat) => set({ currentChat }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),

  initialize: async () => {
    const { isInitialized, setIsLoading, setChats, setIsInitialized } = get();
    if (isInitialized) return;

    try {
      setIsLoading(true);
      const userChats = await chatService.getUserChats();
      setChats(userChats);
    } catch (error) {
      console.error('Error initializing chats:', error);
      setChats([]);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  },

  createNewChat: async () => {
    const { setChats, setCurrentChat } = get();
    try {
      const newChat = await chatService.createChat();
      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      return newChat;
    } catch (error) {
      console.error('Error creating new chat:', error);
      return null;
    }
  },

  addMessage: async (content: string, models: { id: string; name: string; count: number }[]) => {
    const { currentChat, setCurrentChat, setChats } = get();
    if (!currentChat) return null;

    try {
      const message: Message = {
        id: `msg_${Date.now()}`,
        role: 'user',
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
  },

  updateMessageResults: async (messageId: string, results: Message['results']) => {
    const { currentChat, setCurrentChat, setChats } = get();
    if (!currentChat) return;

    try {
      const updatedMessages = currentChat.messages.map(msg => 
        msg.id === messageId ? { ...msg, results } : msg
      );

      const updatedChat = await chatService.updateChat(currentChat.id, {
        messages: updatedMessages
      });

      setCurrentChat(updatedChat);
    //   setChats(prev => prev.map(chat => 
    //     chat.id === currentChat.id ? updatedChat : chat
    //   ));
    } catch (error) {
      console.error('Error updating message results:', error);
    }
  },

  switchChat: (chatId: string | null) => {
    const { chats, setCurrentChat } = get();
    if (chatId === null) {
      setCurrentChat(null);
    } else {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setCurrentChat(chat);
      }
    }
  },

  deleteChat: async (chatId: string) => {
    const { chats, currentChat, setChats, setCurrentChat } = get();
    try {
      await chatService.deleteChat(chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (currentChat?.id === chatId) {
        setCurrentChat(chats.find(chat => chat.id !== chatId) || null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }
}));
