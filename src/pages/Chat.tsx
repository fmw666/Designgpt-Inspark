import { FC } from 'react';
import { useParams } from 'react-router-dom';
import ChatLayout from '@/components/layout/ChatLayout';
import ChatInterface from '@/components/chat/ChatInterface';

const Chat: FC = () => {
  const { chatId } = useParams();

  return (
    <ChatLayout>
      <ChatInterface chatId={ chatId } />
    </ChatLayout>
  );
};

export default Chat;
