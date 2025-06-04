import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ModelDrawer } from './ModelDrawer';
import { NewChatGuide } from '@/components/chat/NewChatGuide';
import { ImageModel, modelService } from '@/services/modelService';
import { serviceManager } from '@/services/serviceManager';
import { useChat } from '@/hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { ChatMessage, Message, SelectedImage } from './ChatMessage';
import { Chat, chatService } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { eventBus } from '@/utils/eventBus';
import { getAvatarText } from '@/utils/avatar';
import { useTranslation } from 'react-i18next';
import { ImagePreview } from '@/components/common/ImagePreview';

interface SelectedModel {
  id: string;
  name: string;
  category: string;
  count: number;
}

interface DesignImage {
  url: string | null;
  alt?: string;
  referenceMessageId: string | null;
  referenceResultId: string | null;
}

interface ChatInterfaceProps {
  onSendMessage?: (message: string, models: SelectedModel[]) => void;
  chatId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, chatId }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [selectedModels, setSelectedModels] = useState<SelectedModel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const isMobile = window.innerWidth <= 768; // 添加移动端检测
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const [designImage, setDesignImage] = useState<DesignImage | null>(null);

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

    // 清空设计模式状态
    setDesignImage(null);

  }, [chats, currentChat, isLoading, chatId]);

  const scrollToBottom = () => {
    // 如果消息列表为空，则不滚动
    if (!currentChat || currentChat?.messages.length === 0) {
      setIsScrolling(false);
      setIsLoadingTimeout(false);
      return;
    }

    // 设置滚动状态，显示加载动画
    setIsScrolling(true);
    setIsLoadingTimeout(false);

    // 设置超时检测
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoadingTimeout(true);
    }, 10000); // 10秒超时

    // 如果有图片正在加载，则等待加载完再滚动
    const images = currentChat?.messages.flatMap(msg => 
      Object.values(msg.results?.images || {}).flat()
    ).filter(img => img?.url) || [];

    if (images.length === 0) {
      setIsScrolling(false);
      setIsLoadingTimeout(false);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
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
            setIsLoadingTimeout(false);
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
          }, 500); // 等待滚动动画完成
        }
      }, 100);
    });
  };

  // 添加刷新处理函数
  const handleRefresh = () => {
    setIsLoadingTimeout(false);
    scrollToBottom();
  };

  // 清理超时定时器
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // 监听消息变化和聊天切换，立即滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.id]);

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

  // 更新页面关闭和刷新拦截
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSending || isGenerating) {
        e.preventDefault();
        e.returnValue = t('chat.generation.leaveWarning');
        return e.returnValue;
      }
    };

    const handleUnload = () => {
      if (isSending || isGenerating) {
        return t('chat.generation.leaveWarning');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [isSending, isGenerating, t]);

  // 处理提交前的认证检查
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 如果用户未登录，触发登录事件
    if (!user) {
      eventBus.emit('needSignIn');
      return;
    }

    if (input.trim() && (selectedModels.length > 0 || designImage)) {
      setIsSending(true);
      const currentInput = input;

      try {
        // 准备初始消息结果
        const initialResults = {
          content: t('chat.generation.generating'),
          images: designImage 
            ? {
                // demo 图片
                'gpt-4o-image': [{
                  id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  url: designImage.url,
                  text: null,
                  error: null,
                  errorMessage: null,
                  isGenerating: false
                }]
              }
            : selectedModels.reduce((acc, model) => ({
            ...acc,
            [model.name]: Array(model.count).fill(null).map(() => ({
              id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              url: null,
              text: null,
              error: null,
              errorMessage: null,
              isGenerating: true
            }))
          }), {})
        };

        // 准备消息对象
        let message: Message = {
          id: `msg_${Date.now()}`,
          content: currentInput,
          models: designImage 
            ? [{ id: 'gpt-4o-image', name: 'gpt-4o-image', count: 1 }]
            : selectedModels,
          results: initialResults,
          createdAt: new Date().toISOString(),
          userImage: designImage ? {
            url: designImage.url,
            alt: designImage.alt || 'User uploaded image',
            referenceMessageId: designImage.referenceMessageId,
            referenceResultId: designImage.referenceResultId,
          } : undefined
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

        // 如果是设计模式，直接显示成功
        if (designImage) {
          message.results.content = t('chat.generation.success');
          await updateMessageResults(message.id, message.results, true);
          setIsGenerating(false);
          return;
        }

        // 开始生成图片
        setIsGenerating(true);
        scrollToBottom();

        // 2. 为每个选中的模型生成图片
        const updatePromises = selectedModels.map(async ({ id, count }) => {
          const model: ImageModel | undefined = modelService.getModelById(id);
          const modelName = model?.name || id;

          if (!model) {
            // 更新这个模型的结果，保持其他模型的状态不变
            const updatedResults = {
              content: t('chat.generation.generating'),
              images: {
                ...message.results.images,
                [modelName]: Array(count).fill(null).map(() => ({
                  id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  url: null,
                  text: null,
                  error: '模型未找到',
                  errorMessage: '模型未找到',
                  isGenerating: false
                }))
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
              content: t('chat.generation.generating'),
              images: {
                ...message.results.images,
                [modelName]: response.results.map((result, index) => ({
                  id: result.results.id || `img_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
                  url: result.results.url ? `https://inspark.oss-cn-shenzhen.aliyuncs.com/${result.results.url}` : null,
                  text: result.results.text || null,
                  error: result.status === 'error' ? '生成失败' : null,
                  errorMessage: result.results.errorMessage || null,
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
              content: t('chat.generation.generating'),
              images: {
                ...message.results.images,
                [modelName]: [{
                  id: `img_${Date.now()}_error_${Math.random().toString(36).substr(2, 9)}`,
                  url: null,
                  text: null,
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
          message.results.content = t('chat.generation.success');
        } else if (errorCount < selectedModels.length) {
          message.results.content = t('chat.generation.partialSuccess');
        } else {
          message.results.content = t('chat.generation.failed');
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

    // 如果标题没有变化，直接关闭编辑状态
    if (editedTitle.trim() === currentChat.title) {
      setIsEditingTitle(false);
      return;
    }

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
      // 发生错误时恢复原标题
      setEditedTitle(currentChat.title);
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

  // 处理进入设计模式
  const handleEnterDesign = (image: SelectedImage) => {
    setDesignImage({
      url: image.url || null,
      referenceMessageId: image.messageId || null,
      referenceResultId: image.resultId || null,
    });
    setSelectedModels([]); // 清空已选模型
  };

  // 处理退出设计模式
  const handleExitDesign = () => {
    setDesignImage(null);
  };

  // 处理图片区域点击
  const handleDesignImageClick = () => {
    if (isMobile) {
      if (!showCloseButton) {
        setShowCloseButton(true);
        // 2秒后自动隐藏关闭按钮
        setTimeout(() => setShowCloseButton(false), 2000);
      } else {
        setSelectedImage(designImage?.url || null);
        setShowCloseButton(false);
      }
    } else {
      setSelectedImage(designImage?.url || null);
    }
  };

  // 处理关闭按钮点击
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleExitDesign();
    setShowCloseButton(false);
  };

  const handleJumpToReference = (messageId: string, resultId: string) => {
    // 找到引用的消息
    const referenceMessage = currentChat?.messages?.find(msg => msg.id === messageId);
    if (!referenceMessage) return;

    // 直接找到并滚动到目标图片元素
    const resultElement = document.querySelector(`[data-result-id="${resultId}"]`);
    if (resultElement) {
      // 滚动到图片位置并添加高亮效果
      resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      resultElement.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2', 'z-10');
      
      // 2秒后移除高亮效果
      setTimeout(() => {
        resultElement.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2', 'z-10');
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white/50 dark:bg-gray-900 backdrop-blur-sm">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-200 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-bounce transform-gpu -translate-y-1/2" style={{animation: 'bounce 1s infinite'}} />
          </div>
        </div>

        <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">
          {t('chat.loading.title')}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {t('chat.loading.subtitle')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Image Preview Modal */}
      <ImagePreview
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
        alt="Image preview"
      />
      
      {/* Chat Title */}
      {user && currentChat?.title && (
        <div className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800 backdrop-blur-sm flex items-center px-6 justify-center group">
          <div className="relative w-full max-w-md">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 animate-fadeIn">
                <div className="flex-1 relative">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editedTitle}
                    onChange={handleTitleChange}
                    onKeyDown={handleTitleKeyDown}
                    className="w-full px-2 py-1 text-lg font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={t('chat.title.placeholder')}
                    maxLength={13}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 transition-opacity duration-200">
                    {t('chat.title.characterCount', { count: editedTitle.length })}
                  </div>
                </div>
                <button
                  onClick={handleTitleSave}
                  className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-500 transition-colors hover:bg-green-50 dark:hover:bg-green-900 rounded-lg"
                  title={t('common.save')}
                >
                  <CheckIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleTitleCancel}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg"
                  title={t('common.cancel')}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-lg">
                <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {currentChat.title}
                </h1>
                <button
                  onClick={handleTitleEdit}
                  className="p-1 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
                  title={t('chat.title.edit')}
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 relative bg-gray-50 dark:bg-gray-800">
        {/* Loading overlay */}
        {isScrolling && (
          <div className="fixed inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-200 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600 dark:text-gray-200">{t('chat.loading.loadingMessages')}</span>
              {isLoadingTimeout && (
                <button
                  onClick={handleRefresh}
                  className="mt-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-400 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors duration-200 flex items-center gap-2 animate-fadeIn"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('chat.loading.refresh')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        {!user || !currentChat || !currentChat!.messages!.length ? (
          <NewChatGuide />
        ) : (
          <>
            {currentChat?.messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                userAvatar={getAvatarText(user)}
                onEnterDesign={handleEnterDesign}
                onJumpToReference={handleJumpToReference}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-primary-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800 backdrop-blur-sm p-4">
        {!designImage ? (
        <ModelDrawer
          selectedModels={selectedModels}
          onModelChange={setSelectedModels}
          disabled={isGenerating}
        />
        ) : (
          <div className="flex items-center gap-3">
            <div 
              className="group relative flex items-center gap-3 cursor-pointer ml-3"
              onClick={handleDesignImageClick}
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-200 group-hover:shadow-md">
                <img
                  src={designImage.url || ''}
                  alt={designImage.alt || 'Design reference'}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('chat.input.designTitle', '已进入图片编辑模式')}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('chat.input.designModel', '默认使用 gpt-4o-image 模型')}
                </span>
              </div>
              <button
                onClick={handleCloseClick}
                className={`absolute -top-2 -right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-110 ${
                  isMobile 
                    ? showCloseButton 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-95'
                    : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <XMarkIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
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
                    ? t('chat.placeholderGenerating')
                    : user 
                      ? t('chat.placeholder')
                      : t('chat.placeholderLogin')
                }
                disabled={isSending || isGenerating}
                className={`w-full max-h-[200px] py-3 pl-4 pr-12 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none overflow-hidden ease-in-out ${
                  (isSending || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              rows={1}
            />
          <button
            type="submit"
                disabled={!input.trim() || (selectedModels.length === 0 && !designImage) || isSending || isGenerating}
                className="absolute right-2 bottom-2 p-2 text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-500 disabled:text-indigo-400 disabled:cursor-not-allowed transition-colors duration-200 rounded-lg disabled:hover:bg-transparent"
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

          {/* Bottom hints */}
          <div className="mt-2 flex items-center justify-between px-2">
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('chat.input.enterToSend')}
              </span>
              <span className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                {t('chat.input.ctrlEnterToNewLine')}
              </span>
              {designImage ? (
                <span className="flex items-center text-indigo-600 dark:text-indigo-400">
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  {t('chat.input.designMode', '图片编辑模式')}
                </span>
              ) : (
                <>
                  {selectedModels.length > 0 && (
                    <span className="flex items-center">
                      <SparklesIcon className="h-4 w-4 mr-1" />
                      {t('chat.input.selectedModels', { count: selectedModels.length })}
                </span>
              )}
              {isGenerating && (
                <span className="flex items-center text-indigo-600 dark:text-indigo-400">
                  <SparklesIcon className="h-4 w-4 mr-1 animate-pulse" />
                      {t('chat.input.generating')}
                </span>
                  )}
                </>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {input.length > 0 && t('chat.input.characterCount', { count: input.length })}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
