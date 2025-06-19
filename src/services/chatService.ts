import axiosInstance, { PaginationResponse } from './axios';

interface Model {
  id: string;
  name: string;
  count: number;
}

export interface ImageResult {
  uuid: string;
  url: string | null;
  text: string | null;
  error: string | null;
  errorMessage: string | null;
  isGenerating?: boolean;
}

export interface Results {
  images: {
    [key: string]: ImageResult[];
  };
  status: {
    failed: number;
    success: number;
    total: number;
    generating: number;
  };
}

export interface Message {
  uuid?: string;
  models?: Model[] | null;
  content?: string;
  results?: Results | null;
  createdAt?: string;
  userImage?: {
    url: string | null;
    alt?: string;
    referenceMessageId: string | null;
    referenceResultId: string | null;
  };
}

export interface Chat {
  uuid: string;
  title: string;
  description: string | null;
  created_at: string;
}

export interface ChatWithMessages extends Chat {
  messages?: Message[];
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
  async getUserChats(): Promise<Chat[]> {
    try {
      const response = await axiosInstance.get<PaginationResponse<Chat>>('/chats');
      return response.items;
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  }

  // 创建新聊天
  async createChat(title: string = '新对话'): Promise<Chat> {
    try {
      const data = await axiosInstance.post<Chat>('/chats', {
        title,
      });

      return {
        ...data,
      };
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  // 更新聊天记录
  async updateChat(chatId: string, updates: Partial<Chat>): Promise<Chat> {
    try {
      const data = await axiosInstance.put<Chat>(`/chats/${chatId}`, updates);

      return {
        ...data,
      };
    } catch (error) {
      console.error('Error updating chat:', error);
      throw error;
    }
  }

  // 添加消息到聊天
  async addMessage(chat_id: string, message: Message): Promise<Chat> {
    try {
      // 如果是第一条消息，使用消息内容作为标题
      const title = message.content!.slice(0, 30)
        ? message.content!.slice(0, 30) 
        : '';

      const data = await axiosInstance.post<Chat>(`/chats/${chat_id}/messages`, {
        message,
        title
      });

      return {
        ...data,
      };
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  // 删除聊天
  async deleteChat(chatId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/chats/${chatId}`);
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }

  async getChat(chatId: string): Promise<Chat | null> {
    try {
      const data = await axiosInstance.get<Chat>(`/chats/${chatId}`);
      return data;
    } catch (error) {
      console.error('Error getting chat:', error);
      return null;
    }
  }

  // 获取聊天的消息列表
  async getChatMessages(chatId: string): Promise<Message[]> {
    try {
      const response = await axiosInstance.get<PaginationResponse<Message>>(`/chats/${chatId}/messages`);
      return response.items;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  // 更新消息结果
  async updateMessageResults(messageId: string, results: Message['results']): Promise<void> {
    try {
      await axiosInstance.put(`/messages/${messageId}/results`, { results });
    } catch (error) {
      console.error('Error updating message results:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const chatService = ChatService.getInstance();
 