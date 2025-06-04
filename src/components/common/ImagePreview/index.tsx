import { FC, useState, useRef, useEffect } from 'react';
import { ArrowPathIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, XMarkIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
import { Modal } from '@/components/common/Modal';
import { useTranslation } from 'react-i18next';

interface ImagePreviewProps {
  imageUrl: string | null;
  onClose: () => void;
  alt?: string;
  tags?: string[];
  colorPalette?: string[];
  description?: string;
  onDescriptionChange?: (description: string) => void;
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
  tags = [],
  colorPalette = [],
  description = '',
  onDescriptionChange,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [hoverHalf, setHoverHalf] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

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
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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

  const handleFeedbackSubmit = async () => {
    if (!imageUrl) return;

    setIsSubmitting(true);
    try {
      // TODO: 调用后端 API 保存反馈
      console.log('Feedback submitted:', {
        imageUrl,
        ...feedbackState
      });
      
      // 清空反馈
      setFeedbackState({
        rating: 0,
        reasons: [],
        comment: '',
        otherReason: ''
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理评分变化
  const handleRatingChange = (starIndex: number, isHalf: boolean) => {
    const rating = starIndex + (isHalf ? 0.5 : 1);
    setFeedbackState(prev => ({ ...prev, rating }));
  };

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, starIndex: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = e.clientX - rect.left < rect.width / 2;
    setHoverRating(starIndex + 1);
    setHoverHalf(isHalf);
  };

  // 处理鼠标离开
  const handleMouseLeave = () => {
    setHoverRating(0);
    setHoverHalf(false);
  };

  // 处理点击
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, starIndex: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = e.clientX - rect.left < rect.width / 2;
    handleRatingChange(starIndex, isHalf);
  };

  // 处理其他原因变化
  const handleOtherReasonChange = (value: string) => {
    setFeedbackState(prev => ({ ...prev, otherReason: value }));
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

  const reasonOptions = [
    { key: 'goodQuality', value: t('feedback.reasons.options.goodQuality') },
    { key: 'meetsExpectations', value: t('feedback.reasons.options.meetsExpectations') },
    { key: 'creative', value: t('feedback.reasons.options.creative') },
    { key: 'detailed', value: t('feedback.reasons.options.detailed') },
    { key: 'styleMatch', value: t('feedback.reasons.options.styleMatch') },
    { key: 'composition', value: t('feedback.reasons.options.composition') },
    { key: 'other', value: t('feedback.reasons.options.other') },
  ];

  return (
    <Modal
      isOpen={!!imageUrl}
      onClose={onClose}
      maxWidth="6xl"
      showCloseButton={false}
      className="!p-0"
    >
      <div className="relative flex flex-col md:flex-row w-full h-[80vh] md:h-[80vh] bg-white dark:bg-gray-900">
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
          className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-black flex items-center justify-center min-h-[40vh] md:min-h-0"
          onWheel={handleWheel}
        >
          <motion.div
            className="flex items-center justify-center cursor-grab active:cursor-grabbing"
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-lg md:bottom-6 md:px-3">
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
          <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-600 dark:text-gray-300 text-xs md:text-sm px-2 py-0.5 md:px-2.5 md:py-1 rounded-full">
            {Math.round(scale * 100)}%
          </div>
        </div>

        {/* Right side - Image information */}
        <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-[40vh] md:h-auto">
          <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
            {/* Tags */}
            <div className="mb-3 md:mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h3>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs md:text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">No tags</p>
              )}
            </div>

            {/* Color palette */}
            <div className="mb-3 md:mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Palette</h3>
              {colorPalette.length > 0 ? (
                <div className="flex gap-2">
                  {colorPalette.map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 md:w-7 md:h-7 rounded-full shadow-lg ring-1 ring-gray-200 dark:ring-gray-800"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">No colors</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-3 md:mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange?.(e.target.value)}
                placeholder="Enter image description..."
                className="w-full h-24 md:h-32 p-2 md:p-3 text-xs md:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Feedback section */}
            {imageUrl && (
              <div className="mb-3 md:mb-4">
                <div className="space-y-3 md:space-y-4">
                  {/* 原因选择 */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('feedback.reasons.label')}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {reasonOptions.map(({ key, value }) => (
                        <div key={key}>
                          <label
                            className="flex items-center space-x-2 p-1.5 md:p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={feedbackState.reasons.includes(value)}
                              onChange={(e) => handleReasonChange(value, e.target.checked)}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">{value}</span>
                          </label>
                          {/* 其他选项的输入框 */}
                          {key === 'other' && feedbackState.reasons.includes(value) && (
                            <div className="mt-1.5 md:mt-2">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={feedbackState.otherReason}
                                  onChange={(e) => handleOtherReasonChange(e.target.value.slice(0, 8))}
                                  placeholder={t('feedback.reasons.other.placeholder')}
                                  maxLength={8}
                                  className="w-full px-2 md:px-3 py-1.5 md:py-2 pr-14 md:pr-16 text-xs md:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ease-in-out"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 md:gap-2">
                                  <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500">
                                    {t('feedback.reasons.other.characterCount', { count: feedbackState.otherReason.length })}
                                  </span>
                                  <button
                                    onClick={() => handleOtherReasonChange('')}
                                    className="p-0.5 md:p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
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
                      {t('feedback.comment.label')}
                    </label>
                    <textarea
                      value={feedbackState.comment}
                      onChange={(e) => setFeedbackState(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-gray-900 dark:text-gray-100 outline-none placeholder-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none ease-in-out"
                      rows={3}
                      placeholder={t('feedback.comment.placeholder')}
                    />
                  </div>

                  {/* 提交按钮 */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={feedbackState.rating === 0 || isSubmitting}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-xs md:text-sm text-white transition-colors ${
                        feedbackState.rating === 0 || isSubmitting
                          ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      }`}
                      title={feedbackState.rating === 0 ? t('feedback.submit.disabled') : undefined}
                    >
                      {isSubmitting ? t('common.submitting') : t('feedback.submit.button')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Design button - Fixed at bottom */}
          <div className="flex-shrink-0 p-3 md:p-4 lg:p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <button
              onClick={onDesignClick}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm md:text-base font-medium py-1.5 md:py-2 px-3 md:px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('chat.enterDesign')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}; 