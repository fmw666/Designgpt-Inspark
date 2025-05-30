import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export const NewChatGuide: FC = () => {
  const { t } = useTranslation();
  const examples = t('chat.guide.tips.examples', { returnObjects: true }) as string[];

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('chat.guide.tips.copied'));
    } catch (err) {
      toast.error(t('chat.guide.tips.copyFailed'));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex items-center justify-center px-4 sm:px-8 pt-16 pb-4"
        >
          <div className="max-w-2xl w-full">
            {/* Welcome message */}
            <motion.div 
              variants={itemVariants}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className="inline-block mb-6"
              >
                <div className="relative">
                  <SparklesIcon className="w-16 h-16 text-indigo-500" />
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl"
                  />
                </div>
              </motion.div>
              <motion.h1 
                variants={itemVariants}
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
              >
                {t('chat.guide.title')}
              </motion.h1>
              <motion.p 
                variants={itemVariants}
                className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl"
              >
                {t('chat.guide.subtitle')}
              </motion.p>
            </motion.div>

            {/* Usage tips */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <LightBulbIcon className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('chat.guide.tips.title')}
                </h3>
              </div>
              <ul>
                {examples.map((example: string, index: number) => (
                  <motion.li
                    key={index}
                    variants={itemVariants}
                    className="flex items-center"
                  >
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mr-3" />
                    <button
                      onClick={() => handleCopy(example)}
                      className="text-left text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-3 py-2 -ml-3"
                      title={t('chat.guide.tips.clickToCopy')}
                    >
                      {example}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
