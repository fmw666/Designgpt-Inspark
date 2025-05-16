import { supabase } from './supabase';

interface Model {
  id: string;
  name: string;
  count: number;
}

interface ImageResult {
  url: string | null;
  error: string | null;
  errorMessage: string;
}

interface Results {
  images: {
    [key: string]: ImageResult[];
  };
  content: string;
}

export interface Message {
  id: string;
  models: Model[];
  content: string;
  results: Results;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  user_id: string;
}

export class ChatService {
  private static instance: ChatService;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // 获取用户的所有聊天记录
  async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const { data, error } = await supabase
        .from('chat_msg')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      console.log(data);
      console.log(error);

      if (error) throw error;

      return data.map(chat => ({
        ...chat,
        messages: chat.messages || []
      }));
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  }

  // 创建新聊天
  async createChat(userId: string, title: string = '新对话'): Promise<Chat> {
    try {
      const { data, error } = await supabase
        .from('chat_msg')
        .insert([{
          user_id: userId,
          title,
          messages: []
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        messages: data.messages || []
      };
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  // 更新聊天记录
  async updateChat(chatId: string, updates: Partial<Chat>): Promise<Chat> {
    try {
      const { data, error } = await supabase
        .from('chat_msg')
        .update(updates)
        .eq('id', chatId)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        messages: data.messages || []
      };
    } catch (error) {
      console.error('Error updating chat:', error);
      throw error;
    }
  }

  // 添加消息到聊天
  async addMessage(chatId: string, message: Message): Promise<Chat> {
    try {
      // 先获取当前聊天
      const { data: currentChat, error: fetchError } = await supabase
        .from('chat_msg')
        .select('*')
        .eq('id', chatId)
        .single();

      if (fetchError) throw fetchError;

      // 更新消息数组
      const updatedMessages = [...(currentChat.messages || []), message];
      
      // 如果是第一条消息，使用消息内容作为标题
      const title = currentChat.messages?.length === 0 
        ? message.content.slice(0, 30) 
        : currentChat.title;

      // 更新聊天记录
      const { data, error } = await supabase
        .from('chat_msg')
        .update({
          messages: updatedMessages,
          title
        })
        .eq('id', chatId)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        messages: data.messages || []
      };
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  // 删除聊天
  async deleteChat(chatId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_msg')
        .delete()
        .eq('id', chatId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const chatService = ChatService.getInstance();
