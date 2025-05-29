import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

export const NewChatGuide: FC = () => {
  const { t } = useTranslation();
  const examples = t('chat.guide.tips.examples', { returnObjects: true }) as string[];

  return (
    <div className="h-full flex flex-col">
      {/* Guide content */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex-1 flex items-center justify-center mt-8 px-8 pt-16 pb-4"
        >
          <div className="max-w-2xl w-full">
            {/* Welcome message */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-block mb-4"
              >
                <SparklesIcon className="w-12 h-12 text-indigo-500" />
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                {t('chat.guide.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {t('chat.guide.subtitle')}
              </p>
            </div>

            {/* Usage tips */}
            <div className="bg-indigo-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-500 mb-4">
                {t('chat.guide.tips.title')}
              </h3>
              <ul className="space-y-3 text-indigo-700 dark:text-indigo-400">
                {examples.map((example: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-2" />
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}; 