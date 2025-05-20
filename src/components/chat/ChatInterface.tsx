import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ModelDrawer } from './ModelDrawer';
import { NewChatGuide } from '@/components/chat/NewChatGuide';
import { getAllModels, ImageModel } from '@/services/modelService';
import { serviceManager } from '@/services/serviceManager';
import { StandardResponse } from '@/services/libs/baseService';
import { useChat } from '@/hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { ChatMessage, Message } from './ChatMessage';
import { chatService } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { eventBus } from '@/utils/eventBus';

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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const { 
    chats, 
    currentChat, 
    switchChat, 
    isLoading,
    addMessage,
    updateMessageResults,
    createNewChat,
    setChats,
    setCurrentChat
  } = useChat();

  // 检查用户认证状态和路由
  useEffect(() => {
    if (!user) {
      // 未登录时，清空当前聊天并重定向到 /chat/new
      switchChat(null);
      if (chatId && chatId !== 'new') {
        navigate('/chat/new');
      }
    }
  }, [user, chatId]);

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

  // 当进入编辑模式时，自动聚焦输入框
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // 监听 currentChat 变化，如果变化则取消编辑状态
  useEffect(() => {
    if (isEditingTitle) {
      setIsEditingTitle(false);
      setEditedTitle('');
    }
  }, [currentChat?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 处理提交前的认证检查
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 如果用户未登录，触发登录事件
    if (!user) {
      eventBus.emit('needSignIn');
      return;
    }

    if (input.trim() && selectedModels.length > 0) {
      setIsGenerating(true);
      const currentInput = input;
      setInput('');

      try {
        // 准备初始消息结果
        const initialResults = {
          content: '',
          images: selectedModels.reduce((acc, model) => ({
            ...acc,
            [model.name]: Array(model.count).fill({
              url: null,
              error: null,
              errorMessage: '',
              isGenerating: true
            })
          }), {})
        };

        // 准备消息对象
        const message: Message = {
          id: `msg_${Date.now()}`,
          content: currentInput,
          models: selectedModels,
          results: initialResults,
          createdAt: new Date().toISOString()
        };

        let currentMessageId: string;
        let chatId: string;

        // 如果没有当前聊天，创建新聊天
        if (!currentChat) {
          // 使用用户输入作为标题，限制10个字符
          const title = currentInput.length > 10 ? `${currentInput.slice(0, 10)}...` : currentInput;
          // 创建新聊天时直接包含初始消息
          const newChat = await createNewChat(title, [message]);
          if (!newChat) {
            throw new Error('Failed to create new chat');
          }
          currentMessageId = message.id;
          chatId = newChat.id;
          // 创建成功后跳转到新聊天的路由
          navigate(`/chat/${newChat.id}`);
        } else {
          // 添加到现有聊天
          const addedMessage = await addMessage(currentInput, selectedModels, initialResults);
          if (!addedMessage) {
            throw new Error('Failed to add message');
          }
          currentMessageId = addedMessage.id;
          chatId = currentChat.id;
        }

        // 2. 为每个选中的模型生成图片
        const updatePromises = selectedModels.map(async ({ id, count, category }) => {
          const model = models.find(m => m.id === id);
          const modelName = model?.name || id;
          
          try {
            let response;
            // 根据模型类别调用不同的服务
            if (category === '豆包') {
              response = await serviceManager.generateImageWithDoubao({
                prompt: currentInput,
                count: count,
                model: id as any,
              });
            } else if (category === 'OpenAI') {
              response = await serviceManager.generateImageWithGPT4o({
                prompt: currentInput,
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

            // 检查响应是否有效
            if (!response || !response.results || response.results.length === 0) {
              throw new Error('Invalid response from service');
            }

            // 获取当前消息的最新状态
            const latestChat = await chatService.getChat(chatId);
            if (!latestChat) throw new Error('Chat not found');
            
            const currentMessage = latestChat.messages.find(msg => msg.id === currentMessageId);
            if (!currentMessage) throw new Error('Message not found');

            // 更新这个模型的结果，保持其他模型的状态不变
            const updatedResults = {
              content: '正在生成图片...',
              images: {
                ...currentMessage.results.images,
                [modelName]: response.results.map(result => ({
                  url: result.imageUrl || null,
                  error: !result.success ? '生成失败' : null,
                  errorMessage: result.error || '',
                  isGenerating: false
                }))
              }
            };

            await updateMessageResults(currentMessageId, updatedResults);
            return updatedResults;
          } catch (error) {
            console.error(`Error generating images for model ${id}:`, error);
            
            // 获取当前消息的最新状态
            const latestChat = await chatService.getChat(chatId);
            if (!latestChat) throw new Error('Chat not found');
            
            const currentMessage = latestChat.messages.find(msg => msg.id === currentMessageId);
            if (!currentMessage) throw new Error('Message not found');

            // 更新错误状态，保持其他模型的状态不变
            const errorResults = {
              content: '正在生成图片...',
              images: {
                ...currentMessage.results.images,
                [modelName]: [{
                  url: null,
                  error: '生成失败',
                  errorMessage: error instanceof Error ? error.message : '生成失败',
                  isGenerating: false
                }]
              }
            };
            await updateMessageResults(currentMessageId, errorResults);
            return errorResults;
          }
        });

        // 3. 等待所有图片生成完成
        await Promise.all(updatePromises);

        // 4. 获取最终状态
        const latestChat = await chatService.getChat(chatId);
        if (!latestChat) throw new Error('Chat not found');
        
        const currentMessage = latestChat.messages.find(msg => msg.id === currentMessageId);
        if (!currentMessage) throw new Error('Message not found');

        // 5. 更新最终状态，保持所有图片状态不变
        const finalResults = {
          content: '✅ 图片生成完成！',
          images: currentMessage.results.images
        };

        // 6. 更新数据库中的消息
        await updateMessageResults(currentMessageId, finalResults);

        // 7. 调用外部回调
        onSendMessage?.(currentInput, selectedModels);

      } catch (error) {
        console.error('Error in handleSubmit:', error);
        setInput(currentInput);
      } finally {
        setIsGenerating(false);
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

  // 处理标题编辑
  const handleTitleEdit = () => {
    if (currentChat) {
      setEditedTitle(currentChat.title);
      setIsEditingTitle(true);
    }
  };

  // 处理标题输入变化
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 13) {
      setEditedTitle(value);
    }
  };

  // 保存标题
  const handleTitleSave = async () => {
    if (!currentChat || !editedTitle.trim()) return;

    try {
      const updatedChat = await chatService.updateChat(currentChat.id, {
        title: editedTitle.trim()
      });
      
      if (updatedChat) {
        // 更新本地状态
        const updatedChats = chats.map(chat => 
          chat.id === currentChat.id ? updatedChat : chat
        );
        setChats(updatedChats);
        setCurrentChat(updatedChat);
      }
    } catch (error) {
      console.error('Error updating chat title:', error);
    } finally {
      setIsEditingTitle(false);
    }
  };

  // 取消编辑
  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  // 处理按键事件
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
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
            <SparklesIcon className="w-6 h-6 text-indigo-600 animate-bounce transform-gpu -translate-y-1/2" style={{animation: 'bounce 1s infinite'}} />
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
      {/* Chat Title - 只在有标题且用户已登录时显示 */}
      {user && currentChat?.title && (
        <div className="h-14 border-b border-gray-200 bg-white/50 backdrop-blur-sm flex items-center px-6 justify-center group">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 w-full max-w-md">
              <div className="flex-1 relative">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editedTitle}
                  onChange={handleTitleChange}
                  onKeyDown={handleTitleKeyDown}
                  className="w-full px-2 py-1 text-lg font-medium text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="输入新标题..."
                  maxLength={10}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {editedTitle.length}/13
                </div>
              </div>
              <button
                onClick={handleTitleSave}
                className="p-1 text-green-600 hover:text-green-700 transition-colors"
              >
                <CheckIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleTitleCancel}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-medium text-gray-900">
                {currentChat.title}
              </h1>
              <button
                onClick={handleTitleEdit}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 scrollbar-custom">
        {!user || !currentChat || !currentChat!.messages!.length ? (
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
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={user ? "输入提示词... (Enter 换行）" : "请先登录后再开始对话"}
                className="w-full max-h-[200px] py-3 pl-4 pr-12 text-sm text-gray-900 placeholder-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none overflow-hidden transition-all duration-200 ease-in-out"
                rows={1}
              />
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
