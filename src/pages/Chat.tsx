import { FC, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatLayout from '@/components/layout/ChatLayout';
import ChatInterface from '@/components/chat/ChatInterface';
import { useChat } from '@/hooks/useChat';

const Chat: FC = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { loadChat, currentChat } = useChat();

  useEffect(() => {
    const handleChatLoad = async () => {
      if (chatId === 'new') {
        // 如果是新聊天，清空当前聊天
        loadChat(null);
      } else if (chatId) {
        // 尝试加载指定的聊天
        const chat = await loadChat(chatId);
        if (!chat) {
          // 如果聊天不存在，重定向到新聊天
          navigate('/chat/new', { replace: true });
        }
      }
    };

    handleChatLoad();
  }, [chatId, loadChat, navigate]);

  // 修改条件渲染逻辑
  const renderContent = () => {
    if (!chatId || chatId === 'new') {
      return <ChatInterface isNewChat={ true } />;
    }
    return <ChatInterface />;
  };

  return (
    <ChatLayout>
      {renderContent()}
    </ChatLayout>
  );
};

export default Chat; 