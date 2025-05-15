import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import ChatMessage, { Message, MessageImage } from './ChatMessage';
import { ModelDrawer } from './ModelDrawer';
import { NewChatGuide } from '@/components/chat/NewChatGuide';
import { getAllModels, ImageModel } from '@/services/modelService';
import { serviceManager } from '@/services/serviceManager';
import { StandardResponse } from '@/services/libs/baseService';
import { useChat } from '@/hooks/useChat';
import { useLocation } from 'react-router-dom';

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
  isNewChat?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, isNewChat = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModels, setSelectedModels] = useState<SelectedModel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [models, setModels] = useState<ImageModel[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentChat } = useChat();
  const location = useLocation();

  // 获取聊天标题
  const getChatTitle = () => {
    // 如果是 new 页面且没有消息，返回 null
    if (location.pathname === '/chat/new' && !currentChat?.messages?.length) {
      return null;
    }

    if (!currentChat?.messages?.length) return '新对话';
    const firstMessage = currentChat.messages[0];
    if (firstMessage.role === 'user') {
      // 如果消息太长，截取前30个字符
      return firstMessage.content.length > 30
        ? `${firstMessage.content.slice(0, 30)}...`
        : firstMessage.content;
    }
    return '新对话';
  };

  const title = getChatTitle();

  useEffect(() => {
    const allModels = getAllModels();
    setModels(allModels);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      // 添加用户消息
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
      };
      setMessages(prev => [...prev, userMessage]);

      // 创建预加载消息
      const preloadMessageId = (Date.now() + 1).toString();
      const preloadMessage: Message = {
        id: preloadMessageId,
        role: 'assistant',
        content: '正在生成图片...',
        images: selectedModels.map(({ id, count }) => {
          const model = models.find(m => m.id === id);
          return {
            modelId: id,
            modelName: model?.name || id,
            results: Array(count).fill(null) as StandardResponse[],
            isLoading: true,
          };
        }),
      };
      setMessages(prev => [...prev, preloadMessage]);

      try {
        // 为每个选中的模型生成图片
        const imagePromises = selectedModels.map(async ({ id, count, category }) => {
          const model = models.find(m => m.id === id);
          
          try {
            // 如果是豆包模型，调用豆包服务
            if (category === '豆包') {
              const response = await serviceManager.generateImageWithDoubao({
                prompt: input,
                count: count,
                model: id as any,
              });
              console.log(response);
              return {
                modelId: id,
                modelName: model?.name || id,
                results: response.results,
                error: false,
              } as MessageImage;
            } else if (category === 'OpenAI') {
              // 使用 Promise.all 生成多张图片
              const response = await serviceManager.generateImageWithGPT4o({
                prompt: input,
                model: id as any,
                count: count,
              })
              return {
                modelId: id,
                modelName: model?.name || id,
                results: response.results,
                error: false,
              } as MessageImage;

              // onContent: (content) => {
              //   if (content.type === 'image') {
              //     // 更新预加载消息中的图片URL
              //     setMessages(prev => prev.map(msg => {
              //       if (msg.id === preloadMessageId) {
              //         const updatedImages = msg.images?.map(img => {
              //           if (img.modelId === id) {
              //             const newUrls = [...img.urls];
              //             newUrls[index] = content.content;
              //             return { ...img, urls: newUrls };
              //           }
              //           return img;
              //         }) || [];
              //         return { ...msg, images: updatedImages };
              //       }
              //       return msg;
              //     }));
              //   }
              // }

              // // 收集所有图片URL和错误信息
              // const errors: string[] = [];
              // let hasError = false;

              // responses.forEach(response => {
              //   if (response.imageUrl) {
              //     urls.push(response.imageUrl);
              //   }
              //   if (response.error) {
              //     hasError = true;
              //     if (response.text) {
              //       errors.push(response.text);
              //     } else {
              //       errors.push(response.error);
              //     }
              //   }
              // });

              // // 如果有图片，返回图片
              // if (urls.length > 0) {
              //   return {
              //     modelId: id,
              //     modelName: model?.name || id,
              //     urls,
              //     error: hasError,
              //     errorMessage: errors.length > 0 ? errors.join('\n') : undefined
              //   };
              // }

              // // 如果没有图片但有错误信息，显示错误
              // if (errors.length > 0) {
              //   return {
              //     modelId: id,
              //     modelName: model?.name || id,
              //     urls: [],
              //     error: true,
              //     errorMessage: errors.join('\n')
              //   };
              // }

              // // 如果既没有图片也没有错误信息，显示默认错误
              // return {
              //   modelId: id,
              //   modelName: model?.name || id,
              //   urls: [],
              //   error: true,
              //   errorMessage: '生成失败'
              // };
            } else {
              // 其他模型使用默认图片
              const urls = Array(count).fill(null).map((_, index) => 
                DEFAULT_IMAGES[index % DEFAULT_IMAGES.length]
              );
              return {
                modelId: id,
                modelName: model?.name || id,
                results: urls.map(url => ({
                  success: true,
                  imageUrl: url,
                }) as StandardResponse),
                error: false,
              } as MessageImage;
            }
          } catch (error) {
            console.error(`Error generating images for model ${id}:`, error);
            return {
              modelId: id,
              modelName: id,
              results: [] as StandardResponse[],
              error: true,
            } as MessageImage;
          }
        });

        const responses = await Promise.all(imagePromises);

        // 检查是否有任何模型生成失败
        const hasErrors = responses.some(response => response.error);

        // 更新消息，替换预加载状态
        setMessages(prev => prev.map(msg => 
          msg.id === preloadMessageId
            ? {
              ...msg,
              content: hasErrors 
                ? '⚠️ 部分图片生成失败...' 
                : '✅ 图片生成完成！',
              images: responses,
            }
          : msg
        ));

        // 调用外部回调
        onSendMessage?.(input, selectedModels);
      } catch (error) {
        console.error('Error generating images:', error);
        // 更新错误消息
        setMessages(prev => prev.map(msg => 
          msg.id === preloadMessageId
            ? {
                ...msg,
                content: '❌ 生成图片时出错，已使用默认图片替代。',
                images: selectedModels.map(({ id, count, name }) => ({
                  modelId: id,
                  modelName: name,
                  results: Array(count).fill(null) as StandardResponse[],
                  error: true,
                })),
              }
            : msg
        ));
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

  return (
    <div className="flex flex-col h-full">
      {/* Chat Title - 只在有标题时显示 */}
      {title && (
        <div className="h-14 border-b border-gray-200 bg-white/50 backdrop-blur-sm flex items-center px-6 justify-center">
          <h1 className="text-lg font-medium text-gray-900">
            {title}
          </h1>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4">
        {isNewChat && !messages.length ? (
          <NewChatGuide />
        ) : (
          <>
            {messages.map((message) => (
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
