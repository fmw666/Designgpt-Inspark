import { useState, useEffect } from 'react';
import { HandThumbUpIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/common/Modal';

interface FeedbackState {
  isOpen: boolean;
  imageUrl: string | null;
  modelName: string;
  rating: number;
  reasons: string[];
  comment: string;
  otherReason: string;
}

interface ImageFeedbackProps {
  imageUrl: string;
  modelName: string;
}

export const ImageFeedback: React.FC<ImageFeedbackProps> = ({ imageUrl, modelName }) => {
  const { t } = useTranslation();
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    isOpen: false,
    imageUrl: null,
    modelName: '',
    rating: 0,
    reasons: [],
    comment: '',
    otherReason: ''
  });

  // 处理 ESC 键关闭弹窗
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && feedbackState.isOpen) {
        setFeedbackState(prev => ({ ...prev, isOpen: false }));
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [feedbackState.isOpen]);

  const openFeedback = () => {
    setFeedbackState({
      isOpen: true,
      imageUrl,
      modelName,
      rating: 0,
      reasons: [],
      comment: '',
      otherReason: ''
    });
  };

  const handleFeedbackSubmit = async () => {
    try {
      // TODO: 调用后端 API 保存反馈
      console.log('Feedback submitted:', feedbackState);
      
      // 关闭反馈弹窗
      setFeedbackState(prev => ({ ...prev, isOpen: false }));
      
      // TODO: 添加成功提示
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // 处理评分变化
  const handleRatingChange = (starIndex: number, isHalf: boolean) => {
    const rating = starIndex + (isHalf ? 0.5 : 1);
    setFeedbackState(prev => ({ ...prev, rating }));
  };

  // 处理鼠标悬停评分
  const [hoverRating, setHoverRating] = useState(0);
  const [hoverHalf, setHoverHalf] = useState(false);

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

  // 渲染星星
  const renderStar = (index: number) => {
    const currentRating = hoverRating || feedbackState.rating;
    const isHalfActive = currentRating === index + 0.5;
    const isFullActive = currentRating > index + 0.5;
    const isHovering = hoverRating > 0;
    const isHoverHalf = isHovering && hoverHalf && hoverRating - 1 === index;

    return (
      <button
        key={index}
        onClick={(e) => handleClick(e, index)}
        onMouseMove={(e) => handleMouseMove(e, index)}
        onMouseLeave={handleMouseLeave}
        className="group relative pr-1"
      >
        <div className="relative w-8 h-8">
          {/* 灰色背景星星 */}
          <svg
            className="w-8 h-8 text-gray-300"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          
          {/* 黄色星星 - 根据状态显示不同部分 */}
          {(isFullActive || isHalfActive || (isHovering && hoverRating > index)) && (
            <div className="absolute inset-0">
              <svg
                className={`w-8 h-8 text-yellow-400 transition-transform duration-200 group-hover:scale-110`}
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{
                  clipPath: (isHalfActive || isHoverHalf) ? 'inset(0 50% 0 0)' : 'none'
                }}
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
          )}
        </div>
        {/* 评分提示 */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {t('feedback.rating.star', { count: index + (isHoverHalf ? 0.5 : 1) })}
        </div>
      </button>
    );
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
    if (reason === '其他' && !checked) {
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
    <>
      {/* 反馈按钮 */}
      <button
        onClick={openFeedback}
        className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
        title={t('feedback.button.title')}
      >
        <HandThumbUpIcon className="w-5 h-5 text-indigo-600" />
      </button>

      {/* 反馈弹窗 */}
      <Modal
        isOpen={feedbackState.isOpen}
        onClose={() => setFeedbackState(prev => ({ ...prev, isOpen: false }))}
        title={t('feedback.title')}
        maxWidth="md"
      >
        {/* 预览图片 */}
        {feedbackState.imageUrl && (
          <div className="mb-4">
            <img
              src={feedbackState.imageUrl}
              alt={t('feedback.preview.alt')}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* 评分 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('feedback.rating.label')}
          </label>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map(renderStar)}
            {/* 评分文字说明 */}
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              {feedbackState.rating > 0 ? (
                <span className="text-yellow-500 dark:text-yellow-400 font-medium">
                  {t('feedback.rating.star', { count: feedbackState.rating })}
                </span>
              ) : (
                t('feedback.rating.placeholder')
              )}
            </span>
          </div>
        </div>

        {/* 原因选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('feedback.reasons.label')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {reasonOptions.map(({ key, value }) => (
              <div key={key}>
                <label
                  className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={feedbackState.reasons.includes(value)}
                    onChange={(e) => handleReasonChange(value, e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
                </label>
                {/* 其他选项的输入框 */}
                {key === 'other' && feedbackState.reasons.includes(value) && (
                  <div className="mt-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={feedbackState.otherReason}
                        onChange={(e) => handleOtherReasonChange(e.target.value.slice(0, 8))}
                        placeholder={t('feedback.reasons.other.placeholder')}
                        maxLength={8}
                        className="w-full px-3 py-2 pr-16 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ease-in-out"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {t('feedback.reasons.other.characterCount', { count: feedbackState.otherReason.length })}
                        </span>
                        <button
                          onClick={() => handleOtherReasonChange('')}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                        >
                          <XMarkIcon className="w-4 h-4" />
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('feedback.comment.label')}
          </label>
          <textarea
            value={feedbackState.comment}
            onChange={(e) => setFeedbackState(prev => ({ ...prev, comment: e.target.value }))}
            className="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none placeholder-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none ease-in-out"
            rows={3}
            placeholder={t('feedback.comment.placeholder')}
          />
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end">
          <button
            onClick={handleFeedbackSubmit}
            disabled={feedbackState.rating === 0}
            className={`px-4 py-2 rounded-2xl text-white transition-colors ${
              feedbackState.rating === 0
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
            title={feedbackState.rating === 0 ? t('feedback.submit.disabled') : undefined}
          >
            {t('feedback.submit.button')}
          </button>
        </div>
      </Modal>
    </>
  );
};
