import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoonIcon, GlobeAltIcon, SunIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '@/styles/theme';
import { Modal } from '@/components/common/Modal';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/authService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useThemeStore();
  const { t, i18n } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [isUpdatingModelInfo, setIsUpdatingModelInfo] = useState(false);

  const handleToggleModelInfo = async () => {
    if (isUpdatingModelInfo) return;
    
    setIsUpdatingModelInfo(true);
    try {
      const newValue = !(user?.user_metadata?.hide_model_info ?? false);
      const updatedUser = await authService.updateUserMetadata({
        ...user?.user_metadata,
        hide_model_info: newValue
      });
      setUser(updatedUser);
      toast.success(t('settings.modelInfo.updated'));
    } catch (error) {
      console.error('Error updating model info visibility:', error);
      toast.error(t('settings.modelInfo.updateFailed'));
    } finally {
      setIsUpdatingModelInfo(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.title')}
      maxWidth="md"
    >
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
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
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

        {/* 模型信息显示设置 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <InformationCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.modelInfo.title')}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {(user?.user_metadata?.hide_model_info ?? false) ? t('settings.modelInfo.hidden') : t('settings.modelInfo.visible')}
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleModelInfo}
            disabled={isUpdatingModelInfo}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              !(user?.user_metadata?.hide_model_info ?? false) ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            role="switch"
            aria-checked={!(user?.user_metadata?.hide_model_info ?? false)}
          >
            {isUpdatingModelInfo ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  !(user?.user_metadata?.hide_model_info ?? false) ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
