import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import ChatMessage, { Message, MessageImage } from './ChatMessage';
import { ModelDrawer } from './ModelDrawer';
import { getAllModels, ImageModel } from '@/services/modelService';
import { serviceManager } from '@/services/serviceManager';
import { StandardResponse } from '@/services/libs/baseService';

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
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModels, setSelectedModels] = useState<SelectedModel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [models, setModels] = useState<ImageModel[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-primary-100 bg-white/50 backdrop-blur-sm p-4">
        <ModelDrawer
          selectedModels={selectedModels}
          onModelChange={setSelectedModels}
        />
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入提示词... (Enter 换行，Ctrl + Enter 发送)"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none min-h-[40px] overflow-hidden"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 text-xs text-gray-400">
              Ctrl + Enter 发送
            </div>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || selectedModels.length === 0 || isGenerating}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <SparklesIcon className="h-5 w-5 animate-pulse" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
