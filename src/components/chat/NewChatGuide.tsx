import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';

export const NewChatGuide: FC = () => {

  return (
    <div className="h-full flex flex-col">
      {/* 引导内容 */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex-1 flex items-center justify-center mt-8 px-8 pt-16 pb-4"
        >
          <div className="max-w-2xl w-full">
            {/* 欢迎信息 */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-block mb-4"
              >
                <SparklesIcon className="w-12 h-12 text-indigo-500" />
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                开始新的设计对话
              </h1>
              <p className="text-gray-600 text-lg">
                让我们开始一段创意之旅，探索无限可能
              </p>
            </div>

            {/* 使用提示 */}
            <div className="bg-indigo-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4">
                使用提示
              </h3>
              <ul className="space-y-3 text-indigo-700">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-2" />
                  一只可爱的熊猫在竹林中玩耍，水彩风格
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-2" />
                  一片樱花林，水彩风格，柔和的粉色和白色
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-2" />
                  一幅山水画，国画风格，云雾缭绕
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}; 