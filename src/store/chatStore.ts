import { create } from 'zustand';
import { chatService } from '@/services/chatService';
import type { Chat, Message, ChatWithMessages } from '@/services/chatService';

interface ChatState {
  chats: Chat[];
  currentChat: ChatWithMessages | null;
  isLoading: boolean;
  isInitialized: boolean;
  shouldScrollToBottom: boolean;
  setChats: (chats: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  setCurrentChat: (chat: ChatWithMessages | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setShouldScrollToBottom: (should: boolean) => void;
  initialize: () => Promise<void>;
  createNewChat: (title?: string) => Promise<ChatWithMessages | null>;
  addMessage: (chatId: string, message: Message) => Promise<void>;
  updateMessageResults: (chatId: string, messageId: string, results: Message['results'], updateInDatabase?: boolean) => Promise<void>;
  switchChat: (chatId: string | null) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  loadChatMessages: (chatId: string) => Promise<void>;
  unAuthenticate: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  isLoading: false,
  isInitialized: false,
  shouldScrollToBottom: false,
  setChats: (chats) => set({ 
    chats: typeof chats === 'function' ? chats(get().chats) : chats 
  }),
  setCurrentChat: (currentChat) => set({ currentChat }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  setShouldScrollToBottom: (should) => set({ shouldScrollToBottom: should }),

  initialize: async () => {
    const { isInitialized } = get();
    
    if (isInitialized || get().isLoading) {
      return;
    }

    try {
      set(state => ({
        ...state,
        isLoading: true
      }));

      const userChats = await chatService.getUserChats();

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

  createNewChat: async (title: string = '新对话') => {
    const { setChats, setCurrentChat } = get();
    try {
      const newChat = await chatService.createChat(title);
      setChats(prev => [newChat, ...prev]);
      
      // 创建新聊天时，直接设置消息
      const chatWithMessages: ChatWithMessages = {
        ...newChat,
        messages: []
      };
      setCurrentChat(chatWithMessages);
      return chatWithMessages;
    } catch (error) {
      console.error('Error creating new chat:', error);
      return null;
    }
  },

  addMessage: async (chatId: string, message: Message) => {
    const { currentChat, setCurrentChat, chats } = get();
    if (!currentChat) return;

    try {
      const chat = chats.find(c => c.uuid === chatId);
      if (!chat) return;

      // 更新当前聊天的消息列表
      setCurrentChat({
        ...currentChat,
        messages: [...(currentChat.messages || []), message]
      });
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  },

  updateMessageResults: async (chatId: string, messageId: string, results: Message['results'], updateInDatabase: boolean = false) => {
    const { currentChat, setCurrentChat } = get();
    if (!currentChat) return;

    try {
      if (chatId !== currentChat.uuid) return;

      // 1. 更新本地状态
      const updatedMessages = currentChat.messages?.map(msg => 
        msg.uuid === messageId ? { ...msg, results } : msg
      );

      // 2. 创建更新后的聊天对象
      const updatedChat = {
        ...currentChat,
        messages: updatedMessages
      };

      // 3. 更新本地状态
      setCurrentChat(updatedChat);

      // 4. 如果需要，更新数据库中的消息
      if (updateInDatabase) {
        // 这里应该调用一个新的 API 端点来更新消息结果
        await chatService.updateMessageResults(messageId, results);
      }
    } catch (error) {
      console.error('Error updating message results:', error);
    }
  },

  switchChat: async (chatId: string | null) => {
    const { chats, setCurrentChat, setIsLoading } = get();
    setIsLoading(true);

    try {
      if (chatId === null) {
        setCurrentChat(null);
      } else {
        const chat = chats.find(c => c.uuid === chatId);
        if (chat) {
          // 先设置基本信息，不包含消息
          setCurrentChat(chat as ChatWithMessages);

          // 异步加载消息，但不等待它完成
          chatService.getChatMessages(chatId).then(messages => {
            if (messages) {
              // 获取最新的 currentChat
              const currentChat = get().currentChat;
              if (currentChat && currentChat.uuid === chatId) {
                const updatedChat: ChatWithMessages = {
                  ...currentChat,
                  messages
                };
                setCurrentChat(updatedChat);
              }
            }
          }).catch(error => {
            console.error('Error loading messages:', error);
          });
        } else {
          setCurrentChat(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  },

  loadChatMessages: async (chatId: string) => {
    const { currentChat, setCurrentChat } = get();
    if (!currentChat || currentChat.uuid !== chatId) return;

    try {
      const messages = await chatService.getChatMessages(chatId);
      setCurrentChat({
        ...currentChat,
        messages
      });
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  },

  deleteChat: async (chatId: string) => {
    const { chats, currentChat, setChats, setCurrentChat } = get();
    try {
      await chatService.deleteChat(chatId);
      setChats(prev => prev.filter(chat => chat.uuid !== chatId));
      if (currentChat?.uuid === chatId) {
        setCurrentChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  },

  unAuthenticate: () => {
    set({ chats: [], currentChat: null, isLoading: false, isInitialized: false });
  }
}));
