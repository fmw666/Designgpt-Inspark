import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SparklesIcon, ExclamationCircleIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/solid';
import { ImageFeedback } from '@/components/feedback/ImageFeedback';
import { getAvatarClasses, getAvatarSizeClasses } from '@/utils/avatar';

interface Model {
  id: string;
  name: string;
  count: number;
}

interface ImageResult {
  url: string | null;
  error: string | null;
  errorMessage: string;
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
}

interface ChatMessageProps {
  message: Message;
  userAvatar: string;
}

const GENERATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

export const ChatMessage: FC<ChatMessageProps> = ({ message, userAvatar }) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Check if any image is still generating and has timed out
  const hasTimedOutImages = Object.values(message.results.images).some(results =>
    results.some(result => 
      result.isGenerating && 
      (Date.now() - new Date(message.createdAt).getTime() > GENERATION_TIMEOUT)
    )
  );

  return (
    <div className="flex flex-col mb-6">
      {/* User message */}
      <div className="flex justify-end p-3">
        <div className="flex items-start gap-3 max-w-3xl">
          <div className="flex-1 text-right">
            <div className="inline-block bg-indigo-600 text-white rounded-lg px-4 py-2">
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <div className={`${getAvatarClasses()} ${getAvatarSizeClasses('sm')}`}>
                <span>{userAvatar}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image preview modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* AI response */}
      <div className="flex justify-start p-3">
        <div className="flex items-start gap-3 max-w-3xl">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            {/* AI text response */}
            {message.results.content && (
              <div className="inline-block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 mb-3">
                <p className="text-sm text-gray-900 dark:text-gray-100">{message.results.content}</p>
              </div>
            )}

            {/* AI image results */}
            {Object.entries(message.results.images).map(([modelId, results], index) => (
              <div key={index} className="mb-4">
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
                <div className="grid grid-cols-2 gap-3 min-w-[300px]">
                  {results.map((result, index) => {
                    const isTimedOut = result.isGenerating && 
                      (Date.now() - new Date(message.createdAt).getTime() > GENERATION_TIMEOUT);

                    return (
                      <div
                        key={index}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
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
                          <>
                            <div
                              key={index}
                              className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 cursor-pointer"
                              onClick={() => setSelectedImage(result.url)}
                            >
                              <img
                                src={result.url}
                                alt={`Generated image ${index + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-pointer"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                            {/* Feedback buttons */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ImageFeedback imageUrl={result.url} modelName={modelId} />
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {t('common.loading')}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
