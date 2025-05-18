import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { ModelDrawer } from './ModelDrawer';
import { NewChatGuide } from '@/components/chat/NewChatGuide';
import { getAllModels, ImageModel } from '@/services/modelService';
import { serviceManager } from '@/services/serviceManager';
import { StandardResponse } from '@/services/libs/baseService';
import { useChat } from '@/hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { ChatMessage } from './ChatMessage';

// 默认图片数组
const DEFAULT_IMAGES = [
  'https://picsum.photos/400/400?random=1',
  'https://picsum.photos/400/400?random=2',
  'https://picsum.photos/400/400?random=3',
  'https://picsum.photos/400/400?random=4',
];

interface SelectedModel {
  id: string;
  name: string;
  category: string;
  count: number;
}

interface ChatInterfaceProps {
  onSendMessage?: (message: string, models: SelectedModel[]) => void;
  chatId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, chatId }) => {
  const [input, setInput] = useState('');
  const [selectedModels, setSelectedModels] = useState<SelectedModel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [models, setModels] = useState<ImageModel[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const { 
    chats, 
    currentChat, 
    switchChat, 
    isLoading,
    addMessage,
    updateMessageResults 
  } = useChat();

  useEffect(() => {
    if (chats.length === 0) {
      return;
    }

    let currentChatId = null;
    if (!chatId || chatId === 'new') {
      // 如果是新聊天，清空当前聊天
      currentChatId = null;
    } else {
      // 切换到指定的聊天
      currentChatId = chatId;
    }

    console.log('currentChatId', currentChatId);

    if (currentChatId) {
      const chat = chats.find(chat => chat.id === currentChatId);
      if (chat) {
        switchChat(chat.id);
      } else {
        // 跳转到路由 /chat/new
        navigate('/chat/new');
      }
    } else {
      switchChat(null);
    }

  }, [chats, currentChat, isLoading, chatId]);

  console.log('\n\n\n000000000000000000000000000000');
  console.log('currentChat', currentChat);
  console.log('chats', chats);
  console.log('isLoading', isLoading);
  console.log('000000000000000000000000000000\n\n\n');

  useEffect(() => {
    const allModels = getAllModels();
    setModels(allModels);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  // 自动调整文本框高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && selectedModels.length > 0) {
      setIsGenerating(true);

      try {
        // 1. 添加用户消息到数据库
        const message = await addMessage(input, selectedModels);
        if (!message) {
          throw new Error('Failed to add message');
        }

        // 2. 为每个选中的模型生成图片
        const imagePromises = selectedModels.map(async ({ id, count, category }) => {
          const model = models.find(m => m.id === id);
          
          try {
            let response;
            // 根据模型类别调用不同的服务
            if (category === '豆包') {
              response = await serviceManager.generateImageWithDoubao({
                prompt: input,
                count: count,
                model: id as any,
              });
            } else if (category === 'OpenAI') {
              response = await serviceManager.generateImageWithGPT4o({
                prompt: input,
                model: id as any,
                count: count,
              });
            } else {
              // 其他模型使用默认图片
              const urls = Array(count).fill(null).map((_, index) =>
                DEFAULT_IMAGES[index % DEFAULT_IMAGES.length]
              );
              response = {
                results: urls.map(url => ({
                  success: true,
                  imageUrl: url,
                })) as StandardResponse[],
              };
            }

            return {
              modelId: model?.name || id,
              results: response.results.map(result => ({
                url: result.imageUrl,
                error: !result.success,
                errorMessage: result.error || ''
              }))
            };
          } catch (error) {
            console.error(`Error generating images for model ${id}:`, error);
            return {
              modelId: model?.name || id,
              results: [{
                url: null,
                error: true,
                errorMessage: error instanceof Error ? error.message : '生成失败'
              }]
            };
          }
        });

        // 3. 等待所有图片生成完成
        const responses = await Promise.all(imagePromises);

        // 4. 更新消息结果
        const results = {
          content: '✅ 图片生成完成！',
          images: responses.reduce((acc, response) => ({
            ...acc,
            [response.modelId]: response.results
          }), {})
        };

        // 5. 更新数据库中的消息
        await updateMessageResults(message.id, results);

        // 6. 调用外部回调
        onSendMessage?.(input, selectedModels);

      } catch (error) {
        console.error('Error in handleSubmit:', error);
      } finally {
        setIsGenerating(false);
        setInput('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 如果按下 Ctrl + Enter，则提交表单
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white/50 backdrop-blur-sm">
        <div className="relative w-16 h-16">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-pulse"></div>

          {/* Spinning inner ring */}
          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>

          {/* Center sparkle icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-indigo-600 animate-bounce" />
          </div>
        </div>

        <p className="mt-4 text-lg font-medium text-gray-600">
          正在加载对话...
        </p>
        <p className="mt-2 text-sm text-gray-500">
          请稍候片刻
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Title - 只在有标题时显示 */}
      {currentChat?.title && (
        <div className="h-14 border-b border-gray-200 bg-white/50 backdrop-blur-sm flex items-center px-6 justify-center">
          <h1 className="text-lg font-medium text-gray-900">
            {currentChat.title}
          </h1>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {!currentChat || !currentChat!.messages!.length ? (
          <NewChatGuide />
        ) : (
          <>
            {currentChat?.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-primary-100 bg-white/50 backdrop-blur-sm p-4">
        <ModelDrawer
          selectedModels={selectedModels}
          onModelChange={setSelectedModels}
        />
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="relative flex items-center">
            {/* 输入框容器 */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入提示词... (Enter 换行）"
                className="w-full max-h-[200px] py-3 pl-4 pr-12 text-sm text-gray-900 placeholder-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none overflow-hidden transition-all duration-200 ease-in-out"
                rows={1}
              />
              {/* 发送按钮 */}
              <button
                type="submit"
                disabled={!input.trim() || selectedModels.length === 0 || isGenerating}
                className="absolute right-2 bottom-2 p-2 text-gray-400 hover:text-indigo-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-200 rounded-lg hover:bg-gray-100 disabled:hover:bg-transparent"
              >
                {isGenerating ? (
                  <SparklesIcon className="h-5 w-5 animate-pulse text-indigo-500" />
                ) : (
                  <PaperAirplaneIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* 底部提示 */}
          <div className="mt-2 flex items-center justify-between px-2">
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ctrl + Enter 发送
              </span>
              <span className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Enter 换行
              </span>
              {selectedModels.length > 0 && (
                <span className="flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  已选择 {selectedModels.length} 个模型
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {input.length > 0 && `${input.length} 字符`}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
