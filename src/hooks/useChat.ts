import { useState, useCallback } from 'react';

interface Chat {
  id: string;
  messages: any[]; // 根据你的消息类型定义
  // 其他聊天相关的属性
}

export const useChat = () => {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);

  const loadChat = useCallback(async (chatId: string | null) => {
    if (!chatId) {
      // 清空当前聊天
      setCurrentChat(null);
      return null;
    }

    try {
      // TODO: 从后端获取聊天记录
      // const response = await fetch(`/api/chats/${chatId}`);
      // const chat = await response.json();
      
      // 模拟数据
      const mockChat: Chat = {
        id: chatId,
        messages: [],
      };

      setCurrentChat(mockChat);
      return mockChat;
    } catch (error) {
      console.error('Failed to load chat:', error);
      return null;
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!currentChat) {
      // 如果是新聊天，创建一个新的聊天
      const newChat: Chat = {
        id: Date.now().toString(),
        messages: [{
          id: Date.now().toString(),
          role: 'user',
          content: message,
        }],
      };
      setCurrentChat(newChat);
      return newChat;
    }

    // 添加新消息到现有聊天
    const updatedChat = {
      ...currentChat,
      messages: [
        ...currentChat.messages,
        {
          id: Date.now().toString(),
          role: 'user',
          content: message,
        },
      ],
    };
    setCurrentChat(updatedChat);
    return updatedChat;
  }, [currentChat]);

  return {
    currentChat,
    loadChat,
    sendMessage,
  };
};
