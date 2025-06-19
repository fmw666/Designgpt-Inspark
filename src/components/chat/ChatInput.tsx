import { FC, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { PaperAirplaneIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { SelectedModel } from '@/types/chat';
import { eventBus } from '@/utils/eventBus';
import { aiService, StatusData } from '@/services/aiService';
import { useNavigate } from 'react-router-dom';
import { Message } from '@/services/chatService';

interface ChatInputProps {
  isGenerating?: boolean;
  designImage?: string | null;
  onExitDesign?: () => void;
}

export const ChatInput: FC<ChatInputProps> = ({
  isGenerating,
  designImage,
  onExitDesign,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentChat, createNewChat, updateMessageResults, addMessage, setShouldScrollToBottom } = useChat();
  const [input, setInput] = useState('');
  const [selectedModels, setSelectedModels] = useState<SelectedModel[]>([]);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const isMobile = window.innerWidth < 768;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      eventBus.emit('needSignIn');
      return;
    }

    if (input.trim() && (designImage || user.meta_data?.hide_model_info)) {
      setIsSending(true);
      let firstResult = true;
      const currentInput = input;

      let chat = currentChat;
      if (!chat) {
        const title = currentInput.trim().slice(0, 10);
        chat = await createNewChat(title);
        if (!chat) {
          throw new Error('Failed to create new chat');
        }
        // 确保在 createNewChat 完成后再导航
        setTimeout(() => {
          navigate(`/chat/${chat!.uuid}`);
        }, 0);
      }

      // 如果有选中的模型，调用 text2img
      try {
        let currentMessage: Message | null = null;

        await aiService.text2img(
          {
            conversation_id: chat.uuid,
            content: input,
            model_group_id: "low"
          },
          (message: Message) => {
            // 处理消息更新
            console.log('Generation message:', message);
            currentMessage = message;
            addMessage(chat.uuid, message);
          },
          (status: StatusData) => {
            // 处理状态更新
            console.log('Generation status:', status);
            // 第一次发送消息时，设置 isSending 为 true
            if (firstResult) {
              setIsSending(false);
              setInput('');
              firstResult = false;
              setShouldScrollToBottom(true);
            }
            if (currentMessage) {
              // 更新消息状态
              updateMessageResults(chat.uuid, currentMessage.uuid!, status);
            }
          },
          () => {
            // 处理完成
            console.log('Generation complete');
            // 更新消息状态为完成
            setIsSending(false);
          },
          (error) => {
            // 处理错误
            console.error('Generation error:', error);
            // TODO: 更新消息状态为错误
          }
        );
      } catch (error) {
        console.error('Error calling text2img:', error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      const newValue = value.substring(0, start) + '\n' + value.substring(end);
      setInput(newValue);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }
    if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleDesignImageClick = () => {
    if (isMobile) {
      if (!showCloseButton) {
        setShowCloseButton(true);
        setTimeout(() => setShowCloseButton(false), 2000);
      } else {
        setShowCloseButton(false);
      }
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExitDesign!();
    setShowCloseButton(false);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="border-t border-primary-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800 backdrop-blur-sm p-4">
      {designImage && (
        <div 
          className="relative mb-4 cursor-pointer group"
          onClick={handleDesignImageClick}
          onMouseEnter={() => setShowCloseButton(true)}
          onMouseLeave={() => setShowCloseButton(false)}
        >
          <img
            src={designImage}
            alt="Design"
            className="w-full h-48 object-cover rounded-lg"
          />
          {showCloseButton && (
            <button
              onClick={handleCloseClick}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="relative">
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
          disabled={isGenerating || isSending || !input.trim()}
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
      </form>

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
              {!(user?.meta_data?.hide_model_info ?? false) && selectedModels.length > 0 && (
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
    </div>
  );
};

export default ChatInput;
