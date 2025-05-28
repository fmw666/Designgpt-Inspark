import { useState, useEffect } from 'react';
import { HandThumbUpIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { createPortal } from 'react-dom';

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

//   // 处理点击外部关闭弹窗
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       const modal = document.getElementById('feedback-modal');
//       if (modal && !modal.contains(e.target as Node) && feedbackState.isOpen) {
//         setFeedbackState(prev => ({ ...prev, isOpen: false }));
//       }
//     };

//     if (feedbackState.isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [feedbackState.isOpen]);

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
          {index + (isHoverHalf ? 0.5 : 1)} 星
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

  return (
    <>
      {/* 反馈按钮 */}
      <button
        onClick={openFeedback}
        className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
        title="提供反馈"
      >
        <HandThumbUpIcon className="w-5 h-5 text-indigo-600" />
      </button>

      {/* 反馈弹窗 - 使用 Portal 渲染到 body */}
      {feedbackState.isOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div 
            id="feedback-modal"
            className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">图片反馈</h3>
              <button
                onClick={() => setFeedbackState(prev => ({ ...prev, isOpen: false }))}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* 预览图片 */}
            {feedbackState.imageUrl && (
              <div className="mb-4">
                <img
                  src={feedbackState.imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* 评分 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                评分
              </label>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map(renderStar)}
                {/* 评分文字说明 */}
                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                  {feedbackState.rating > 0 ? (
                    <span className="text-yellow-500 dark:text-yellow-400 font-medium">
                      {feedbackState.rating} 星
                    </span>
                  ) : (
                    '请选择评分'
                  )}
                </span>
              </div>
            </div>

            {/* 原因选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                原因（可多选）
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  '图片质量好',
                  '符合预期',
                  '创意独特',
                  '细节丰富',
                  '风格合适',
                  '构图合理',
                  '其他'
                ].map((reason) => (
                  <div key={reason}>
                    <label
                      className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={feedbackState.reasons.includes(reason)}
                        onChange={(e) => handleReasonChange(reason, e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
                    </label>
                    {/* 其他选项的输入框 */}
                    {reason === '其他' && feedbackState.reasons.includes('其他') && (
                      <div className="mt-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={feedbackState.otherReason}
                            onChange={(e) => handleOtherReasonChange(e.target.value.slice(0, 8))}
                            placeholder="请输入其他原因..."
                            maxLength={8}
                            className="w-full px-3 py-2 pr-16 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ease-in-out"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500">{feedbackState.otherReason.length}/8</span>
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
                其他建议
              </label>
              <textarea
                value={feedbackState.comment}
                onChange={(e) => setFeedbackState(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none placeholder-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none ease-in-out"
                rows={3}
                placeholder="请输入您的建议..."
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
              >
                提交反馈
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
 