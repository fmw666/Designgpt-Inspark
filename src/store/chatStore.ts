import { create } from 'zustand';
import { chatService } from '@/services/chatService';
import type { Chat, Message } from '@/services/chatService';

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  isInitialized: boolean;
  setChats: (chats: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  setCurrentChat: (chat: Chat | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  initialize: () => Promise<void>;
  createNewChat: (title?: string, initialMessages?: Message[]) => Promise<Chat | null>;
  addMessage: (content: string, models: { id: string; name: string; count: number }[], initialResults?: Message['results']) => Promise<Message | null>;
  updateMessageResults: (messageId: string, results: Message['results']) => Promise<void>;
  switchChat: (chatId: string | null) => void;
  deleteChat: (chatId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  isLoading: false,
  isInitialized: false,
  setChats: (chats) => set({ 
    chats: typeof chats === 'function' ? chats(get().chats) : chats 
  }),
  setCurrentChat: (currentChat) => set({ currentChat }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),

  initialize: async () => {
    const { isInitialized } = get();
    
    if (isInitialized || get().isLoading) {
      console.log('Chat store already initialized or loading, skipping...');
      return;
    }

    console.log('Starting chat store initialization...');
    
    try {
      set(state => ({
        ...state,
        isLoading: true
      }));

      const userChats = await chatService.getUserChats();
      console.log('Chats retrieved:', userChats.length);

      set(state => ({
        ...state,
        chats: userChats,
        isLoading: false,
        isInitialized: true
      }));
    } catch (error) {
      console.error('Error initializing chats:', error);
      set(state => ({
        ...state,
        chats: [],
        isLoading: false,
        isInitialized: true
      }));
    }
  },

  createNewChat: async (title: string = '新对话', initialMessages: Message[] = []) => {
    const { setChats, setCurrentChat } = get();
    try {
      const newChat = await chatService.createChat(title, initialMessages);
      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      return newChat;
    } catch (error) {
      console.error('Error creating new chat:', error);
      return null;
    }
  },

  addMessage: async (content: string, models: { id: string; name: string; count: number }[], initialResults?: Message['results']) => {
    const { currentChat, setCurrentChat, setChats } = get();
    if (!currentChat) return null;

    try {
      const message: Message = {
        id: `msg_${Date.now()}`,
        content,
        models,
        results: initialResults || {
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
      setChats(prev => prev.map(chat => 
        chat.id === currentChat.id ? updatedChat : chat
      ));
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
 