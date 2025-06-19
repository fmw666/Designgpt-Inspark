import { FC, useEffect, useState } from 'react';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import ChatLayout from '@/components/layout/ChatLayout';
import BaseSidebar from '@/components/layout/BaseSidebar';
import ChatTitle from '@/components/chat/ChatTitle';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useNavigate, useParams } from 'react-router-dom';

const Chat: FC = () => {

  const { chatId } = useParams();
  const { user, isInitialized: isUserInitialized, isLoading: isUserLoading } = useAuth();
  const { currentChat, isInitialized: isChatInitialized, isLoading: isChatLoading, chats, setChats, switchChat } = useChat();
  const navigate = useNavigate();
  
  // 检查用户认证状态和路由
  useEffect(() => {
    if (!isUserInitialized) {
      return;
    }
    if (isUserLoading) {
      return;
    }
    if (!user) {
      // 未登录时，清空当前聊天并重定向到 /chat/new
      switchChat(null);
      if (chatId && chatId !== 'new') {
        navigate('/chat/new');
      }
    }
  }, [user, chatId, isUserLoading]);
  // 根据路由更改状态 
  useEffect(() => {
    if (!isChatInitialized) return;
    if (isChatLoading) return;
    if (chats.length === 0) return;
    if (currentChat && currentChat.uuid === chatId) return;

    // 如果是新聊天，清空当前聊天，否则切换到指定的聊天
    let currentChatId = null;
    if (!chatId || chatId === 'new') {
      currentChatId = null;
    } else {
      currentChatId = chatId;
    }

    // 立即执行异步函数
    (async () => {
      if (currentChatId) {
        await switchChat(currentChatId);
      } else {
        await switchChat(null);
        navigate('/chat/new');
      }
    })();
  }, [chats, currentChat, isChatLoading, chatId]);

  return (
    <ChatLayout>
      {/* 侧边栏 */}
      <BaseSidebar type="chat" />

      {/* 主聊天区域 */}
      <main className="flex flex-col w-full h-full">
        {/* 标题 */}
        <ChatTitle />

        {/* 消息区域 */}
        <ChatMessages />

        {/* 输入区域 */}
        <ChatInput
        />
      </main>
    </ChatLayout>
  );
};

export default Chat;
