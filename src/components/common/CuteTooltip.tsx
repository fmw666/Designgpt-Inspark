import { FC, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CuteTooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const CuteTooltip: FC<CuteTooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${positionClasses[position]} z-50`}
          >
            <div className="bg-white rounded-lg shadow-lg p-2 text-sm text-gray-700 border border-primary-100">
              {content}
            </div>
            <div
              className={`absolute w-2 h-2 bg-white border border-primary-100 transform rotate-45 ${
                position === 'top'
                  ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-0 border-l-0'
                  : position === 'bottom'
                  ? 'top-[-4px] left-1/2 -translate-x-1/2 border-b-0 border-r-0'
                  : position === 'left'
                  ? 'right-[-4px] top-1/2 -translate-y-1/2 border-l-0 border-b-0'
                  : 'left-[-4px] top-1/2 -translate-y-1/2 border-r-0 border-t-0'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CuteTooltip; 