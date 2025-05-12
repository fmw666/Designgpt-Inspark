import { FC, useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { SparklesIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StandardResponse } from '@/services/libs/baseService';

export interface MessageImage {
  modelId: string;
  modelName: string;
  isLoading?: boolean;
  error?: boolean;
  errorMessage?: string;
  results: StandardResponse[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: MessageImage[];
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageClick = (url: string) => {
    setPreviewImage(url);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  return (
    <>
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`flex gap-4 max-w-3xl ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>

          {/* Message Content */}
          <div
            className={`flex flex-col space-y-2 ${
              isUser ? 'items-end' : 'items-start'
            }`}
          >
            {/* Text Content */}
            <div
              className={`rounded-lg px-4 py-2 ${
                isUser
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>

            {/* Images Grid */}
            {message.images && message.images.length > 0 && (
              <div className="w-full space-y-6">
                {message.images.map((imageGroup, groupIndex) => (
                  <div key={groupIndex} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-indigo-700">
                          {groupIndex + 1}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-700">
                        {imageGroup.modelName}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {imageGroup.isLoading ? (
                        <div className="col-span-2 flex items-center justify-center p-4">
                          <SparklesIcon className="h-8 w-8 text-indigo-500 animate-pulse" />
                        </div>
                      ) : imageGroup.error ? (
                        <div className="col-span-2 rounded-lg border border-red-200 bg-gradient-to-br from-red-50 to-red-100">
                          <div className="flex items-start gap-3 p-3">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-red-600 font-medium block mb-1">生成失败</span>
                              {imageGroup.errorMessage && (
                                <p className="text-xs text-red-500 whitespace-pre-wrap break-words">
                                  {imageGroup.errorMessage}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        imageGroup.results.map((result, imageIndex) => (
                          result.success ? (
                            <div
                              key={imageIndex}
                              className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer"
                              onClick={() => handleImageClick(result.imageUrl!)}
                            >
                              <img
                                src={result.imageUrl!}
                                alt={`Generated image ${imageIndex + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                          ) : (
                            <div
                              key={imageIndex}
                              className="col-span-2 rounded-lg border border-red-200 bg-gradient-to-br from-red-50 to-red-100"
                            >
                              <div className="flex items-start gap-3 p-3">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm text-red-600 font-medium block mb-1">错误！{result.error}</span>
                                  {result.text && (
                                    <p className="text-xs text-red-500 whitespace-pre-wrap break-words">
                                      检测到文字返回：<i>{result.text}</i>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={handleClosePreview}
        >
          <button
            onClick={handleClosePreview}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatMessage;
