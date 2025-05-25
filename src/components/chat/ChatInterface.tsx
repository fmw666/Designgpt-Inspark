import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ModelDrawer } from './ModelDrawer';
import { NewChatGuide } from '@/components/chat/NewChatGuide';
import { ImageModel, modelService } from '@/services/modelService';
import { serviceManager } from '@/services/serviceManager';
import { useChat } from '@/hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { ChatMessage, Message } from './ChatMessage';
import { Chat, chatService, ImageResult } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { eventBus } from '@/utils/eventBus';

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
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const { user, isLoading: isUserLoading, isInitialized: isUserInitialized } = useAuth();
  const { 
    chats, 
    currentChat, 
    switchChat, 
    isLoading,
    isInitialized: isChatInitialized,
    addMessage,
    updateMessageResults,
    createNewChat,
    setChats,
    setCurrentChat
  } = useChat();

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

  useEffect(() => {
    if (!isChatInitialized) {
      return;
    }
    if (isLoading) {
      return;
    }
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
        switchChat(null);
        // 跳转到路由 /chat/new
        navigate('/chat/new');
      }
    } else {
      switchChat(null);
      navigate('/chat/new');
    }

  }, [chats, currentChat, isLoading, chatId]);

  const scrollToBottom = () => {
    // 如果消息列表为空，则不滚动
    if (!currentChat || currentChat?.messages.length === 0) {
      setIsScrolling(false);
      return;
    }

    // 设置滚动状态，显示加载动画
    setIsScrolling(true);

    // 如果有图片正在加载，则等待加载完再滚动
    const images = currentChat?.messages.flatMap(msg => 
      Object.values(msg.results?.images || {}).flat()
    ).filter(img => img?.url) || [];

    if (images.length === 0) {
      setIsScrolling(false);
      return;
    }

    // 等待所有图片加载完成
    Promise.all(
      images.map(img => {
        if (!img.url) return Promise.resolve();
        return new Promise((resolve) => {
          const image = new Image();
          image.onload = resolve;
          image.onerror = resolve; // 即使加载失败也继续
          image.src = img.url as string;
        });
      })
    ).then(() => {
      // 所有图片加载完成后滚动
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          // 滚动完成后，延迟关闭加载状态
          setTimeout(() => {
            setIsScrolling(false);
          }, 500); // 等待滚动动画完成
        }
      }, 100);
    });
  };
  // 监听消息变化和聊天切换，立即滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, currentChat?.id]);

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

  // 添加页面关闭和刷新拦截
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 当正在生成或发送时显示提示
      if (isSending || isGenerating) {
        e.preventDefault();
        e.returnValue = '图片正在生成中，刷新页面将丢失生成进度，确定要离开吗？';
        return e.returnValue;
      }
    };

    // 处理页面关闭事件
    const handleUnload = () => {
      if (isSending || isGenerating) {
        return '图片正在生成中，离开页面将丢失生成进度，确定要离开吗？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [isSending, isGenerating]);

  // 处理提交前的认证检查
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 如果用户未登录，触发登录事件
    if (!user) {
      eventBus.emit('needSignIn');
      return;
    }

    if (input.trim() && selectedModels.length > 0) {
      setIsSending(true);
      const currentInput = input;

      try {
        // 准备初始消息结果
        const initialResults = {
          content: '🚀 正在生成图片...',
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
        let message: Message = {
          id: `msg_${Date.now()}`,
          content: currentInput,
          models: selectedModels,
          results: initialResults,
          createdAt: new Date().toISOString()
        };

        let chat: Chat | null;

        // 如果没有当前聊天，创建新聊天
        if (!currentChat) {
          // 使用用户输入作为标题，限制10个字符
          const title = currentInput.length > 10 ? `${currentInput.slice(0, 10)}...` : currentInput;
          // 创建新聊天时直接包含初始消息
          chat = await createNewChat(title, [message]);
          if (!chat) {
            throw new Error('Failed to create new chat');
          }
          // 创建成功后跳转到新聊天的路由
          navigate(`/chat/${chat.id}`);
        } else {
          // 添加到现有聊天
          try {
            await addMessage(message);
          } catch (error) {
            console.error('Error adding message:', error);
            throw error;
          }
          chat = currentChat;
        }

        // 消息已添加到聊天区域，现在可以清空输入框
        setInput('');
        setIsSending(false);

        // 开始生成图片
        setIsGenerating(true);

        // 2. 为每个选中的模型生成图片
        const updatePromises = selectedModels.map(async ({ id, count }) => {
          const model: ImageModel | undefined = modelService.getModelById(id);
          const modelName = model?.name || id;

          if (!model) {
            // 更新这个模型的结果，保持其他模型的状态不变
            const updatedResults = {
              content: '🚀 正在生成图片...',
              images: {
                ...message.results.images,
                [modelName]: Array(count).fill({
                  url: null,
                  error: '模型未找到',
                  errorMessage: '模型未找到',
                  isGenerating: false
                })
              }
            };

            message.results = updatedResults;
            // 立即保存到数据库
            await updateMessageResults(message.id, updatedResults, true);
            return updatedResults;
          }
          
          try {
            let response = await serviceManager.generateImages({
              chatId: message.id,
              prompt: currentInput,
              model: model,
              count: count,
            });

            // 检查响应是否有效
            if (!response || !response.results || response.results.length === 0) {
              throw new Error('Invalid response from service');
            }

            // 更新这个模型的结果，保持其他模型的状态不变
            const updatedResults = {
              content: '🚀 正在生成图片...',
              images: {
                ...message.results.images,
                [modelName]: response.results.map(result => ({
                  url: `https://inspark.oss-cn-shenzhen.aliyuncs.com/${result.results.url}` || null,
                  error: result.status === 'error' ? '生成失败' : null,
                  errorMessage: result.results.errorMessage || '',
                  isGenerating: false
                }))
              }
            };

            message.results = updatedResults;
            // 立即保存到数据库
            await updateMessageResults(message.id, updatedResults, true);
            return updatedResults;
          } catch (error) {
            console.error(`Error generating images for model ${id}:`, error);

            // 更新错误状态，保持其他模型的状态不变
            const errorResults = {
              content: '🚀 正在生成图片...',
              images: {
                ...message.results.images,
                [modelName]: [{
                  url: null,
                  error: '生成失败',
                  errorMessage: error instanceof Error ? error.message : '生成失败',
                  isGenerating: false
                }]
              }
            };
            message.results = errorResults;
            // 立即保存到数据库
            await updateMessageResults(message.id, errorResults, true);
            return errorResults;
          }
        });

        // 3. 等待所有图片生成完成
        await Promise.all(updatePromises);

        const errorCount = Object.values(message.results.images).map(image => image.filter(i => i.error).length).reduce((a, b) => a + b, 0);
        if (errorCount == 0) {
          message.results.content = `✅ 图片生成完成！`;
        } else if (errorCount < selectedModels.length) {
          message.results.content = `🚫 部分生成失败！`;
        } else {
          message.results.content = `❌ 全部生成失败！`;
        }

        // 5. 更新最终状态，保持所有图片状态不变
        const finalResults = {
          content: message.results.content,
          images: message.results.images
        };

        // 6. 更新数据库中的消息
        message.results = finalResults;
        await updateMessageResults(message.id, finalResults, true);

        // 7. 调用外部回调
        onSendMessage?.(currentInput, selectedModels);

      } catch (error) {
        console.error('Error in handleSubmit:', error);
        setInput(currentInput);
        setIsSending(false);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 如果按下 Ctrl + Enter，则换行
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      // 在光标位置插入换行符
      const newValue = value.substring(0, start) + '\n' + value.substring(end);
      setInput(newValue);
      
      // 设置新的光标位置
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      
      // 自动调整高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }
    // 如果按下 Enter，则提交表单
    if (e.key === 'Enter' && !e.ctrlKey) {
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

      <div className="flex-1 overflow-y-auto p-4 scrollbar-custom relative">
        {/* 加载动画遮罩 - 使用 fixed 定位 */}
        {isScrolling && (
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">正在加载消息...</span>
            </div>
          </div>
        )}

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
          disabled={isGenerating}
        />
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="relative flex items-center">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isGenerating 
                    ? "正在生成图片，请稍候..." 
                    : user 
                      ? "输入提示词... (Ctrl + Enter 换行）" 
                      : "请先登录后再开始对话"
                }
                disabled={isSending || isGenerating}
                className={`w-full max-h-[200px] py-3 pl-4 pr-12 text-sm text-gray-900 placeholder-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none overflow-hidden transition-all duration-200 ease-in-out ${
                  (isSending || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                rows={1}
              />
              <button
                type="submit"
                disabled={!input.trim() || selectedModels.length === 0 || isSending || isGenerating}
                className="absolute right-2 bottom-2 p-2 text-indigo-500 hover:text-indigo-600 disabled:text-indigo-400 disabled:cursor-not-allowed transition-colors duration-200 rounded-lg hover:bg-gray-100 disabled:hover:bg-transparent"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                ) : isGenerating ? (
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
                Enter 发送
              </span>
              <span className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Ctrl + Enter 换行
              </span>
              {selectedModels.length > 0 && (
                <span className="flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  已选择 {selectedModels.length} 个模型
                </span>
              )}
              {isGenerating && (
                <span className="flex items-center text-indigo-600">
                  <SparklesIcon className="h-4 w-4 mr-1 animate-pulse" />
                  正在生成图片...
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
