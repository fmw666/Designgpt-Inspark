import { FC, useState } from 'react';
import { PlusIcon, ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ChatHistory {
  id: string;
  title: string;
  date: string;
}

const Sidebar: FC = () => {
  const [showModal, setShowModal] = useState(false);

  // Mock chat history data
  const chatHistory: ChatHistory[] = [
    {
      id: '1',
      title: 'Chat history 1',
      date: '2024-02-20',
    },
    {
      id: '2',
      title: 'Chat history 2',
      date: '2024-02-19',
    },
    // Add more history items as needed
  ];

  const handleNewChat = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {chatHistory.map((chat) => (
            <button
              key={chat.id}
              onClick={handleChatClick}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {chat.title}
                </p>
                <p className="text-xs text-gray-500">{chat.date}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂不支持</h3>
              <p className="text-sm text-gray-500">该功能正在开发中，敬请期待。</p>
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 