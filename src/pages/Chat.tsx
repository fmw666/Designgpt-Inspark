import { FC } from 'react';
import ChatLayout from '@/components/layout/ChatLayout';
import ChatInterface from '@/components/chat/ChatInterface';

const Chat: FC = () => {
  return (
    <ChatLayout>
      <ChatInterface />
    </ChatLayout>
  );
};

export default Chat; 