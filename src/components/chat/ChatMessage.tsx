import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SparklesIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { getAvatarClasses, getAvatarSizeClasses } from '@/utils/avatar';
import { ImagePreview } from '@/components/common/ImagePreview';

interface Model {
  id: string;
  name: string;
  count: number;
}

interface ImageResult {
  id: string;
  url: string | null;
  text: string | null;
  error: string | null;
  errorMessage: string | null;
  isGenerating?: boolean;
}

interface Results {
  images: {
    [key: string]: ImageResult[];
  };
  content: string;
  isGenerating?: boolean;
}

export interface Message {
  id: string;
  models: Model[];
  content: string;
  results: Results;
  createdAt: string;
  userImage?: {
    url: string | null;
    alt?: string;
    referenceMessageId: string | null;
    referenceResultId: string | null;
  };
}

export interface SelectedImage {
  url: string | null;
  messageId: string | null;
  resultId: string | null;
}

interface ChatMessageProps {
  message: Message;
  userAvatar: string;
  onEnterDesign?: (image: SelectedImage) => void;
  onJumpToReference?: (messageId: string, resultId: string) => void;
  user?: {
    user_metadata?: {
      hide_model_info?: boolean;
    };
  };
}

const GENERATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

export const ChatMessage: FC<ChatMessageProps> = ({ 
  message, 
  userAvatar, 
  onEnterDesign,
  onJumpToReference,
  user
}) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  const handleJumpToReference = (messageId: string, resultId: string) => {
    onJumpToReference?.(messageId, resultId);
  };

  return (
    <>
      {/* Image preview modal */}
      <ImagePreview
        imageInfo={selectedImage && selectedImage.url ? {
          url: selectedImage.url || '',
          id: selectedImage.resultId || '',
          messageId: selectedImage.messageId || '',
          userPrompt: message.content,
          aiPrompt: '暂无',
          model: Object.keys(message.results.images)[0] || 'gpt-4o-image',
          createdAt: message.createdAt
        } : null}
        onClose={() => setSelectedImage(null)}
        alt="Message image preview"
        onDesignClick={() => {
          if (selectedImage) {
            onEnterDesign?.(selectedImage);
            setSelectedImage(null);
          }
        }}
      />

      <div className="flex flex-col mb-6">
        {/* User message */}
        <div className="flex justify-end p-3">
          <div className="flex items-start gap-3 max-w-3xl">
            <div className="flex-1 text-right">
              <div className="inline-block bg-indigo-600 text-white text-left rounded-lg px-4 py-2">
                <p className="text-sm">{message.content}</p>
              </div>
              {/* User message images */}
              {message.userImage?.url && (
                <div className="mt-3 flex flex-col items-end gap-2">
                  <div
                    className="group relative aspect-square w-48 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 cursor-pointer"
                    onClick={() => setSelectedImage({
                      url: message.userImage?.url || null,
                      messageId: message.userImage?.referenceMessageId || null,
                      resultId: message.userImage?.referenceResultId || null,
                    })}
                  >
                    <img
                      src={message.userImage.url}
                      alt={message.userImage.alt || 'User uploaded image'}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {message.userImage?.referenceMessageId && message.userImage?.referenceResultId && (
                      <button
                        onClick={() => handleJumpToReference(message.userImage?.referenceMessageId!, message.userImage?.referenceResultId!)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full transition-colors hover:bg-white dark:hover:bg-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        {t('chat.jumpToReference')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                message.userImage ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
              }`}>
                <div className={`${getAvatarClasses()} ${getAvatarSizeClasses('sm')}`}>
                  <span>{userAvatar}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI response */}
        <div className="flex justify-start p-3">
          <div className={`flex items-start gap-3 ${!(user?.user_metadata?.hide_model_info ?? false) ? 'max-w-3xl' : 'max-w-8xl'}`}>
            <div className="flex-shrink-0">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                message.userImage ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
              }`}>
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              {/* AI text response */}
              {message.results.content && (
                <div className="inline-block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 mb-3">
                  {message.userImage && (
                    <div className="mb-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      【{t('chat.input.designMode')}】
                    </div>
                  )}
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {message.results.content}
                    {(user?.user_metadata?.hide_model_info ?? false) && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({Object.values(message.results.images).flat().length} {t('chat.images')})
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* AI image results */}
              {(user?.user_metadata?.hide_model_info ?? false) ? (
                // 隐藏模型信息模式下的图片展示
                <div className="mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 min-w-[300px]">
                    {Object.values(message.results.images)
                      .flat()
                      .map((result, index) => {
                        const isTimedOut = result.isGenerating && 
                          (Date.now() - new Date(message.createdAt).getTime() > GENERATION_TIMEOUT);

                        return (
                          <div
                            key={index}
                            data-result-id={result.id}
                            className="group relative aspect-square min-w-[200px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-transparent cursor-pointer bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]"
                            onClick={() => setSelectedImage({
                              url: result.url,
                              messageId: message.id,
                              resultId: result.id,
                            })}
                          >
                            {result.isGenerating ? (
                              isTimedOut ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/30">
                                  <div className="flex flex-col items-center gap-2 p-4">
                                    <ClockIcon className="h-6 w-6 text-yellow-500" />
                                    <span className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
                                      {t('chat.generation.timeout')}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900">
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                      {t('common.generating')}
                                    </span>
                                  </div>
                                </div>
                              )
                            ) : result.error || result.errorMessage ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                                <div className="flex flex-col items-center gap-2 p-4 max-w-[90%] max-h-[90%] overflow-y-auto">
                                  <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                                  <div className="space-y-1 w-full text-left">
                                    <span className="text-sm text-red-600 text-center dark:text-red-400 font-medium block">
                                      {t('errors.generationFailed')}
                                    </span>
                                    <p className="text-xs text-red-500 dark:text-red-400 break-words">
                                      {result.errorMessage}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : result.url ? (
                              <img
                                src={result.url}
                                alt={`Generated image ${index + 1}`}
                                className="w-full h-full object-contain transition-transform group-hover:scale-105 cursor-pointer"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {t('common.loading')}
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                // 显示模型信息模式下的图片展示
                Object.entries(message.results.images).map(([modelId, results], index) => {
                  return (
                    <div key={index} className="mb-4">
                      {!message.userImage && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-500 dark:to-indigo-600 flex items-center justify-center shadow-sm">
                            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                              {index + 1}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                            <span className="text-indigo-600 dark:text-indigo-400">{modelId}</span>
                            <span className="text-gray-400 dark:text-gray-600">•</span>
                            <span className="text-gray-400 dark:text-gray-500">
                              {results.length} {t('chat.images')}
                            </span>
                          </h4>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 min-w-[300px]">
                        {results.map((result, index) => {
                          const isTimedOut = result.isGenerating && 
                            (Date.now() - new Date(message.createdAt).getTime() > GENERATION_TIMEOUT);

                          return (
                            <div
                              key={index}
                              data-result-id={result.id}
                              className="group relative aspect-square min-w-[200px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-transparent cursor-pointer bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]"
                              onClick={() => setSelectedImage({
                                url: result.url,
                                messageId: message.id,
                                resultId: result.id,
                              })}
                            >
                              {result.isGenerating ? (
                                isTimedOut ? (
                                  <div className="absolute inset-0 flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/30">
                                    <div className="flex flex-col items-center gap-2 p-4">
                                      <ClockIcon className="h-6 w-6 text-yellow-500" />
                                      <span className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
                                        {t('chat.generation.timeout')}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900">
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {t('common.generating')}
                                      </span>
                                    </div>
                                  </div>
                                )
                              ) : result.error || result.errorMessage ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                                  <div className="flex flex-col items-center gap-2 p-4 max-w-[90%] max-h-[90%] overflow-y-auto">
                                    <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                                    <div className="space-y-1 w-full text-left">
                                      <span className="text-sm text-red-600 text-center dark:text-red-400 font-medium block">
                                        {t('errors.generationFailed')}
                                      </span>
                                      <p className="text-xs text-red-500 dark:text-red-400 break-words">
                                        {result.errorMessage}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ) : result.url ? (
                                <img
                                  src={result.url}
                                  alt={`Generated image ${index + 1}`}
                                  className="w-full h-full object-contain transition-transform group-hover:scale-105 cursor-pointer"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('common.loading')}
                                  </span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
