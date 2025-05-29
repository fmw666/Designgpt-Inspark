import { FC } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, BellIcon, MoonIcon, GlobeAltIcon, Cog6ToothIcon, SunIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '@/styles/theme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useThemeStore();
  const { t, i18n } = useTranslation();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl">
                {/* 标题栏 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Cog6ToothIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      {t('settings.title')}
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* 内容区域 */}
                <div className="space-y-4">

                  {/* 主题设置 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {theme === 'light' ? (
                        <SunIcon className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <MoonIcon className="w-5 h-5 text-indigo-400" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.theme.title')}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{theme === 'light' ? t('settings.theme.light') : t('settings.theme.dark')}</div>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-gray-200 dark:bg-gray-700"
                      role="switch"
                      aria-checked={theme === 'dark'}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 语言设置 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <GlobeAltIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.language.title')}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {i18n.language === 'en' ? t('settings.language.en') : t('settings.language.zh')}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')}
                      className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      {t('common.change')}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
