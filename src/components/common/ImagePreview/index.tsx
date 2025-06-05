import { FC, useState, useRef, useEffect } from 'react';
import { ArrowPathIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, XMarkIcon, HandThumbUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, useMotionValue, PanInfo, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/common/Modal';
import { useTranslation } from 'react-i18next';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ImagePreviewProps {
  imageUrl: string | null;
  onClose: () => void;
  alt?: string;
  colorPalette?: string[];
  userPrompt?: string;
  aiPrompt?: string;
  onAiPromptChange?: (prompt: string) => void;
  onDesignClick?: () => void;
}

interface FeedbackState {
  rating: number;
  reasons: string[];
  comment: string;
  otherReason: string;
}

export const ImagePreview: FC<ImagePreviewProps> = ({
  imageUrl,
  onClose,
  alt = 'Preview',
  colorPalette = ['#FF6B6B', '#FFD93D', '#4ECDC4', '#95E1D3', '#FF8B94'],
  userPrompt = '',
  aiPrompt = '',
  onAiPromptChange,
  onDesignClick,
}) => {
  const { t } = useTranslation();
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    rating: 0,
    reasons: [],
    comment: '',
    otherReason: ''
  });
  const [originalFeedbackState, setOriginalFeedbackState] = useState<FeedbackState>({
    rating: 0,
    reasons: [],
    comment: '',
    otherReason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);

  // 监听图片加载完成，获取实际尺寸
  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      const updateSize = () => {
        setImageSize({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      
      if (img.complete) {
        updateSize();
      } else {
        img.onload = updateSize;
      }
    }
  }, [imageUrl]);

  // Reset position and scale when image changes
  useEffect(() => {
    setScale(1);
    x.set(0);
    y.set(0);
  }, [imageUrl, x, y]);

  // 检查是否有修改
  useEffect(() => {
    const hasStateChanges = 
      feedbackState.rating !== originalFeedbackState.rating ||
      JSON.stringify(feedbackState.reasons.sort()) !== JSON.stringify(originalFeedbackState.reasons.sort()) ||
      feedbackState.comment.trim() !== originalFeedbackState.comment.trim() ||
      feedbackState.otherReason.trim() !== originalFeedbackState.otherReason.trim();
    
    setHasChanges(hasStateChanges);
  }, [feedbackState, originalFeedbackState]);

  if (!imageUrl) return null;

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.5, scale + delta), 4);
    setScale(newScale);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    x.set(0);
    y.set(0);
  };

  // 计算拖动边界
  const dragConstraints = {
    left: -1000,
    right: 1000,
    top: -1000,
    bottom: 1000
  };

  // 处理拖动开始和结束
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => {
    setIsDragging(false);
    
    if (!containerRef.current || !imageRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // 计算图片在缩放后的尺寸
    const scaledWidth = imageSize.width * scale;
    const scaledHeight = imageSize.height * scale;
    
    // 计算可拖动的范围
    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);
    
    // 获取当前位置
    const currentX = x.get();
    const currentY = y.get();
    
    // 调整位置到边界内
    const newX = Math.min(Math.max(currentX, -maxX), maxX);
    const newY = Math.min(Math.max(currentY, -maxY), maxY);
    
    // 使用动画过渡到新位置
    x.set(newX);
    y.set(newY);
  };

  // 计算图片容器的样式
  const getImageContainerStyle = () => {
    if (!imageSize.width || !imageSize.height) return {};
    
    const container = containerRef.current;
    if (!container) return {};
    
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // 计算图片的宽高比
    const imageRatio = imageSize.width / imageSize.height;
    const containerRatio = containerWidth / containerHeight;
    
    let width, height;
    
    if (imageRatio > containerRatio) {
      // 图片更宽，以容器宽度为基准
      width = containerWidth;
      height = width / imageRatio;
    } else {
      // 图片更高，以容器高度为基准
      height = containerHeight;
      width = height * imageRatio;
    }
    
    return {
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  // 处理取消
  const handleCancel = () => {
    setFeedbackState(originalFeedbackState);
    setHasChanges(false);
  };

  // 处理原因选择变化
  const handleReasonChange = (reason: string, checked: boolean) => {
    let newReasons = checked
      ? [...feedbackState.reasons, reason]
      : feedbackState.reasons.filter(r => r !== reason);
    
    // 如果取消选择"其他"，清空其他原因
    if (reason === t('feedback.reasons.options.other') && !checked) {
      setFeedbackState(prev => ({
        ...prev,
        reasons: newReasons,
        otherReason: ''
      }));
    } else {
      setFeedbackState(prev => ({
        ...prev,
        reasons: newReasons
      }));
    }
  };

  // 处理其他原因变化
  const handleOtherReasonChange = (value: string) => {
    setFeedbackState(prev => ({ ...prev, otherReason: value }));
  };

  // 处理评论变化
  const handleCommentChange = (value: string) => {
    setFeedbackState(prev => ({ ...prev, comment: value }));
  };

  const reasonOptions = [
    { key: 'goodQuality', value: t('feedback.reasons.options.goodQuality') },
    { key: 'meetsExpectations', value: t('feedback.reasons.options.meetsExpectations') },
    { key: 'creative', value: t('feedback.reasons.options.creative') },
    { key: 'detailed', value: t('feedback.reasons.options.detailed') },
    { key: 'styleMatch', value: t('feedback.reasons.options.styleMatch') },
    { key: 'composition', value: t('feedback.reasons.options.composition') },
    { key: 'other', value: t('feedback.reasons.options.other') },
  ];

  // 处理全选
  const handleSelectAll = () => {
    const standardOptions = reasonOptions
      .filter(option => option.key !== 'other')
      .map(option => option.value);
    
    // 如果当前已经全选，则取消全选
    if (areAllStandardOptionsSelected()) {
      // 保留"其他"选项的状态
      const otherOption = reasonOptions.find(option => option.key === 'other')?.value || '';
      const otherSelected = feedbackState.reasons.includes(otherOption);
      
      setFeedbackState(prev => ({
        ...prev,
        reasons: otherSelected ? [otherOption] : []
      }));
    } else {
      // 全选标准选项，同时保留"其他"选项的状态
      const otherOption = reasonOptions.find(option => option.key === 'other')?.value || '';
      const otherSelected = feedbackState.reasons.includes(otherOption);
      
      setFeedbackState(prev => ({
        ...prev,
        reasons: otherSelected ? [...standardOptions, otherOption] : standardOptions
      }));
    }
  };

  // 检查是否所有标准选项都被选中
  const areAllStandardOptionsSelected = () => {
    const standardOptions = reasonOptions
      .filter(option => option.key !== 'other')
      .map(option => option.value);
    
    return standardOptions.every(option => 
      feedbackState.reasons.includes(option)
    );
  };

  const handleCopy = (text: string, type: 'user' | 'ai') => {
    navigator.clipboard.writeText(text);
    toast.success(type === 'user' ? '用户提示词已复制' : 'AI提示词已复制');
  };

  const handleFeedbackSubmit = async () => {
    if (!imageUrl) return;

    setIsSubmitting(true);
    try {
      // TODO: 调用后端 API 保存反馈
      console.log('Feedback submitted:', {
        imageUrl,
        ...feedbackState
      });
      
      // 更新原始状态
      setOriginalFeedbackState({
        ...feedbackState,
        comment: feedbackState.comment.trim(),
        otherReason: feedbackState.otherReason.trim()
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={!!imageUrl}
      onClose={onClose}
      maxWidth="6xl"
      showCloseButton={false}
      className="!p-0 w-fit"
    >
      <div className="relative flex flex-col md:flex-row w-full h-fit h-[80vh] md:h-[80vh] bg-white dark:bg-gray-900">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Left side - Image preview */}
        <div 
          ref={containerRef}
          className="relative overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center aspect-square"
          onWheel={handleWheel}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]" />
          
          <motion.div
            className="flex items-center justify-center cursor-grab active:cursor-grabbing relative z-10"
            drag={true}
            dragConstraints={dragConstraints}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{
              x,
              y,
              scale,
              rotateY: isFlipped ? 180 : 0,
              ...getImageContainerStyle()
            }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt={alt}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </motion.div>

          {/* Image controls - Mobile optimized */}
          <div className="absolute bottom-4 left-1/2 z-[999] -translate-x-1/2 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-lg md:bottom-6 md:px-3">
            <button
              onClick={handleZoomOut}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-1 md:p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={scale <= 0.5}
            >
              <MagnifyingGlassMinusIcon className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              onClick={handleReset}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-1 md:p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowPathIcon className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              onClick={handleZoomIn}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-1 md:p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={scale >= 4}
            >
              <MagnifyingGlassPlusIcon className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-0.5 md:mx-1" />
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-1 md:p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Scale indicator - Mobile optimized */}
          <div className="absolute bottom-4 right-4 z-[999] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-600 dark:text-gray-300 text-xs md:text-sm px-2 py-0.5 md:px-2.5 md:py-1 rounded-full">
            {Math.round(scale * 100)}%
          </div>
        </div>

        {/* Right side - Image information */}
        <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-[40vh] md:h-auto">
          <div className="flex-1 overflow-y-auto">
            {/* Image Information Section */}
            <div className="p-4 md:p-5 lg:p-6 bg-white dark:bg-gray-900 dark:from-gray-800/50 dark:to-gray-900">
              {/* Color Palette */}
              <div className="mb-5">
                {colorPalette.length > 0 ? (
                  <div className="flex cursor-pointer bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-2xl overflow-hidden shadow-sm">
                    {colorPalette.map((color, index) => (
                      <div
                      key={index}
                      className="group relative flex-1 h-8 first:rounded-l-md last:rounded-r-md"
                    >
                      <div
                        className="absolute inset-0 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-800/50 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-900/50 transition-all duration-300"
                        style={{ backgroundColor: color }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/0 to-black/10 dark:to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[10px] font-medium text-white drop-shadow-lg bg-black/20 px-1.5 py-0.5 rounded-full">
                          {color}
                        </span>
                      </div>
                    </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-lg shadow-sm">
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center">{t('imagePreview.noColors')}</p>
                  </div>
                )}
              </div>

              {/* Combined Information Block */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-sm ring-1 ring-gray-200/30 dark:ring-gray-800/30 overflow-hidden">
                  {/* Prompts Section */}
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    {/* User Prompt */}
                    <div className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7V4h16v3M4 20v-3h16v3M12 4v16" />
                        </svg>
                        <h3 className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">{t('imagePreview.userPrompt')}</h3>
                      </div>
                      <div className="relative group">
                        <p className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-gray-500 dark:text-gray-400 rounded-2xl text-xs md:text-sm font-medium">
                          {userPrompt || t('imagePreview.noUserPrompt')}
                        </p>
                        {userPrompt && (
                          <motion.button
                            onClick={() => handleCopy(userPrompt, 'user')}
                            className="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-500/70 dark:text-gray-400/70 hover:bg-white/90 dark:hover:bg-gray-800/90 hover:text-gray-500 dark:hover:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <DocumentDuplicateIcon className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* AI Enhanced Prompt */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">{t('imagePreview.aiPrompt')}</h3>
                      </div>
                      <div className="relative group">
                        <p className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-gray-500 dark:text-gray-400 rounded-2xl text-xs md:text-sm font-medium">
                          {aiPrompt || t('imagePreview.noAiPrompt')}
                        </p>
                        {aiPrompt && (
                          <motion.button
                            onClick={() => handleCopy(aiPrompt, 'ai')}
                            className="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-500/70 dark:text-gray-400/70 hover:bg-white/90 dark:hover:bg-gray-800/90 hover:text-gray-500 dark:hover:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <DocumentDuplicateIcon className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Model Info Section */}
                  <div className="p-4 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-800/30 dark:to-gray-900/30">
                    <div className="space-y-3">
                      {/* Model */}
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400">{t('imagePreview.model')}</div>
                        <div className="text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-gradient-to-r from-indigo-50/90 to-indigo-100/90 dark:from-indigo-900/30 dark:to-indigo-800/30 px-2.5 py-1 rounded-md ring-1 ring-indigo-200/50 dark:ring-indigo-800/50">Stable Diffusion XL</div>
                      </div>
                      {/* Created Time */}
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400">{t('imagePreview.created')}</div>
                        <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-gradient-to-r from-emerald-50/90 to-emerald-100/90 dark:from-emerald-900/30 dark:to-emerald-800/30 px-2.5 py-1 rounded-md ring-1 ring-emerald-200/50 dark:ring-emerald-800/50">2024-03-21 14:30</div>
                      </div>
                      {/* Aspect Ratio */}
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400">{t('imagePreview.aspectRatio')}</div>
                        <div className="text-xs font-medium text-purple-700 dark:text-purple-300 bg-gradient-to-r from-purple-50/90 to-purple-100/90 dark:from-purple-900/30 dark:to-purple-800/30 px-2.5 py-1 rounded-md ring-1 ring-purple-200/50 dark:ring-purple-800/50">1:1</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            {imageUrl && (
              <div className="p-4 md:p-5 lg:p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-sm ring-1 ring-gray-200/30 dark:ring-gray-800/30 overflow-hidden">
                    {/* Modern Title Design with Collapse Button */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('imagePreview.feedback.title')}
                          </h3>
                        </div>
                        <button
                          onClick={() => setIsFeedbackExpanded(!isFeedbackExpanded)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                        >
                          <ChevronDownIcon 
                            className={`w-5 h-5 transform transition-transform duration-200 ${
                              isFeedbackExpanded ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>
                      </div>
                    </div>
                    <div className={`transition-all duration-300 ease-in-out ${
                      isFeedbackExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="p-4 space-y-4">
                        {/* 原因选择 */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('imagePreview.feedback.reasons.label')}
                            </label>
                            <button
                              onClick={handleSelectAll}
                              className={`text-xs md:text-sm px-2 py-1 rounded-lg transition-all duration-200 ${
                                areAllStandardOptionsSelected()
                                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                            >
                              {areAllStandardOptionsSelected() ? '取消全选' : '全选'}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {reasonOptions.map(({ key, value }) => (
                              <div key={key}>
                                <label
                                  className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors group"
                                >
                                  <input
                                    type="checkbox"
                                    checked={feedbackState.reasons.includes(value)}
                                    onChange={(e) => handleReasonChange(value, e.target.checked)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300 transition-colors">{value}</span>
                                </label>
                                {/* 其他选项的输入框 */}
                                {key === 'other' && feedbackState.reasons.includes(value) && (
                                  <div className="mt-2">
                                    <div className="relative">
                                      <input
                                        type="text"
                                        value={feedbackState.otherReason}
                                        onChange={(e) => handleOtherReasonChange(e.target.value.slice(0, 8))}
                                        placeholder={t('imagePreview.feedback.reasons.other.placeholder')}
                                        maxLength={8}
                                        className="w-full px-3 py-2 pr-16 text-xs md:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ease-in-out"
                                      />
                                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500">
                                          {t('imagePreview.feedback.reasons.other.characterCount', { count: feedbackState.otherReason.length })}
                                        </span>
                                        <button
                                          onClick={() => handleOtherReasonChange('')}
                                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                                        >
                                          <XMarkIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 文字反馈 */}
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('imagePreview.feedback.comment.label')}
                          </label>
                          <textarea
                            value={feedbackState.comment}
                            onChange={(e) => handleCommentChange(e.target.value)}
                            className="w-full px-3 py-2 text-xs md:text-sm text-gray-900 dark:text-gray-100 outline-none placeholder-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none ease-in-out"
                            rows={3}
                            placeholder={t('imagePreview.feedback.comment.placeholder')}
                          />
                        </div>

                        {/* 提交按钮 */}
                        <div className="flex justify-end gap-2">
                          {hasChanges && (
                            <button
                              onClick={handleCancel}
                              className="px-4 py-2 rounded-xl text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              {t('common.cancel')}
                            </button>
                          )}
                          <button
                            onClick={handleFeedbackSubmit}
                            disabled={!hasChanges || isSubmitting}
                            className={`px-4 py-2 rounded-xl text-xs md:text-sm text-white transition-all duration-200 ${
                              !hasChanges || isSubmitting
                                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:shadow-lg'
                            }`}
                          >
                            {isSubmitting ? t('imagePreview.feedback.submit.submitting') : t('common.save')}
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Feedback Status Tip */}
                    {!isFeedbackExpanded && (
                      <div className={`px-4 py-3 text-sm ${
                        hasFeedback 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                      }`}>
                        {hasFeedback 
                          ? '🥰 该图片已经进行过反馈，您可以再次修改！'
                          : '🔥 图片暂未获得反馈，我们期待您的评价~'
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Design button - Fixed at bottom */}
          <div className="flex-shrink-0 p-4 md:p-5 lg:p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <button
              onClick={onDesignClick}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-[1px] transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 dark:hover:shadow-purple-500/20"
            >
              <div className="relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-md font-medium text-white transition-all duration-300 group-hover:from-indigo-600 group-hover:to-purple-700">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
                {t('chat.enterDesign')}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
